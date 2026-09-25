/**
 * dsh-flow — Host half.
 *
 * 执行流程图：把当前会话的事件日志实时投影成一条纵向节点流（回合 → 用户 →
 * 助手 → 工具调用/结果 → 审批/重试/压缩……），浏览器端经 SSE 跟随
 * `session/event` 逐条追加——会话执行到哪，流程图就画到哪。
 *
 * 数据全部是宿主内存里的会话日志（ctx.sessions），只读不写：
 *   GET /dsh-flow/api/flow?session=           全量投影（首次加载 / 手动刷新）
 *   GET /dsh-flow/api/stream?session=&after=  SSE 实时流（先回补 after 之后
 *                                             的事件，再跟随 session/event 直播；
 *                                             消息带 id: <seq>，EventSource 断线
 *                                             重连时经 Last-Event-ID 自动续传）
 *   GET /dsh-flow/api/event?session=&seq=     单条全文（节点展开时按需补全）
 *
 * 映射是纯函数（mapEvent）：同一事件在全量、回补、直播三条路径上产出同一个
 * 节点，客户端以 seq 去重即可，无需关心事件来自哪条路径。
 */

const { homedir } = require('node:os')
const { join } = require('node:path')
const { readdirSync, statSync, readFileSync } = require('node:fs')
const { zstdDecompressSync } = require('node:zlib')

// ── 磁盘会话日志读取（历史子代理下钻用）──────────────────────────────────
// dsh 持久化是「多帧 zstd JSONL」：每追加一批事件压一个独立帧拼接
// （dsh-session-persistence-jsonl 的 NodePrivateZstdFrameDecoder 同款事实），
// 尾部可能有撕裂帧（进程崩溃写一半）——逐帧扫魔数切开解，坏帧跳过。
const ZSTD_MAGIC = [0x28, 0xb5, 0x2f, 0xfd]

function decodeSessionLog(buf) {
  const offsets = []
  for (let i = 0; i + 4 <= buf.length; i++) {
    if (buf[i] === ZSTD_MAGIC[0] && buf[i + 1] === ZSTD_MAGIC[1] && buf[i + 2] === ZSTD_MAGIC[2] && buf[i + 3] === ZSTD_MAGIC[3]) offsets.push(i)
    else if (buf[i] >= 0x50 && buf[i] <= 0x5f && buf[i + 1] === 0x2a && buf[i + 2] === 0x4d && buf[i + 3] === 0x18) offsets.push(i) // skippable frame
  }
  const events = []
  for (let i = 0; i < offsets.length; i++) {
    const start = offsets[i]
    const end = i + 1 < offsets.length ? offsets[i + 1] : buf.length
    if (buf[start] >= 0x50 && buf[start] <= 0x5f && buf[start + 1] === 0x2a) continue // skippable 帧无事件
    let text
    try { text = zstdDecompressSync(buf.subarray(start, end)).toString('utf8') } catch { continue } // 撕裂尾帧
    for (const line of text.split('\n')) {
      if (!line) continue
      try {
        const e = JSON.parse(line)
        if (e && typeof e.type === 'string' && typeof e.seq === 'number') events.push(e)
      } catch { /* 半行 */ }
    }
  }
  return events
}

const DISK_CACHE_CAP = 20
const diskCache = new Map() // file → { mtimeMs, events }

/** 会话 id 防路径穿越：只允许字母数字与 ._- */
const SAFE_ID = /^[A-Za-z0-9._-]+$/

/**
 * 磁盘兜底：会话不在内存（历史子代理已卸载）时，从 ~/.dsh/sessions/<工作区>/<id>/
 * 下的 session.vN.jsonl.zstd 读事件（取最高版本）。命中按 mtime 缓存；找不到返回 null。
 */
function diskEventsOf(id) {
  if (!SAFE_ID.test(id)) return null
  const home = process.env.DSH_HOME || join(homedir(), '.dsh')
  const root = join(home, 'sessions')
  let workspaces
  try { workspaces = readdirSync(root) } catch { return null }
  for (const ws of workspaces) {
    const dir = join(root, ws, id)
    let file = null
    try {
      const candidates = readdirSync(dir).filter((f) => /^session\.v\d+\.jsonl\.zstd$/.test(f))
      if (candidates.length === 0) continue
      candidates.sort((a, b) => Number(b.match(/v(\d+)/)[1]) - Number(a.match(/v(\d+)/)[1]))
      file = join(dir, candidates[0])
    } catch { continue }
    try {
      const mtimeMs = statSync(file).mtimeMs
      const cached = diskCache.get(file)
      if (cached && cached.mtimeMs === mtimeMs) return cached.events
      const events = decodeSessionLog(readFileSync(file))
      if (diskCache.size >= DISK_CACHE_CAP) diskCache.clear()
      diskCache.set(file, { mtimeMs, events })
      return events
    } catch { return null }
  }
  return null
}

// ── 文本提取 ─────────────────────────────────────────────────────────────
// ContentBlock 是 merge-extensible 联合：已知块取 text，tool-result 递归，
// 未知块保守跳过（与 context-razor 同口径）。
function blockText(block) {
  if (block === null || typeof block !== 'object') return ''
  if (block.type === 'text' || block.type === 'reasoning') return typeof block.text === 'string' ? block.text : ''
  if (block.type === 'tool-result') return (Array.isArray(block.content) ? block.content : []).map(blockText).join('\n')
  return ''
}
function blocksText(blocks) {
  return Array.isArray(blocks) ? blocks.map(blockText).filter(Boolean).join('\n') : ''
}

const PREVIEW_CAP = 400
const SUMMARY_CAP = 120

/** 预览截断：返回 { text, chars }，chars 永远是全文长度（客户端据此显示「共 N 字符」）。 */
function truncate(text, cap = PREVIEW_CAP) {
  const chars = typeof text === 'string' ? text.length : 0
  if (chars <= cap) return { text: text || '', chars }
  return { text: text.slice(0, cap) + '…', chars }
}

// 工具参数摘要的优先键：挑一个最能说明这次调用在干嘛的字段展示。
const ARG_SUMMARY_KEYS = ['command', 'file_path', 'path', 'pattern', 'query', 'url', 'prompt', 'description', 'title', 'skill', 'question', 'content']

/** tool/call 的 arguments 是模型产出的原始 JSON 串：解析后挑代表字段，兜底截断原文。 */
function summarizeToolArguments(raw) {
  if (typeof raw !== 'string' || raw === '') return ''
  let parsed = null
  try { parsed = JSON.parse(raw) } catch { /* 半截 JSON 也照常吃 */ }
  if (parsed !== null && typeof parsed === 'object') {
    // 整表替换型参数的专门摘要：todo 清单给完成度，免得刷一排原始 JSON
    if (Array.isArray(parsed.todos)) {
      const done = parsed.todos.filter((i) => i && i.status === 'completed').length
      return `todos: ${done}/${parsed.todos.length} 项`
    }
    for (const key of ARG_SUMMARY_KEYS) {
      const value = parsed[key]
      if (typeof value === 'string' && value !== '') {
        const oneLine = value.split('\n')[0]
        return key + ': ' + (oneLine.length > SUMMARY_CAP ? oneLine.slice(0, SUMMARY_CAP) + '…' : oneLine)
      }
      if (typeof value === 'number' || typeof value === 'boolean') return key + ': ' + String(value)
    }
    const compact = JSON.stringify(parsed)
    return compact.length > SUMMARY_CAP ? compact.slice(0, SUMMARY_CAP) + '…' : compact
  }
  const oneLine = raw.split('\n')[0]
  return oneLine.length > SUMMARY_CAP ? oneLine.slice(0, SUMMARY_CAP) + '…' : oneLine
}

/** 形状不完全固定的杂类事件：按优先键挑一个摘要，兜底 JSON 截断。 */
function pickSummary(data, keys) {
  if (data === null || typeof data !== 'object') return ''
  for (const key of keys) {
    const value = data[key]
    if (typeof value === 'string' && value !== '') {
      const oneLine = value.split('\n')[0]
      return oneLine.length > SUMMARY_CAP ? oneLine.slice(0, SUMMARY_CAP) + '…' : oneLine
    }
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  }
  try {
    const compact = JSON.stringify(data)
    return compact.length > SUMMARY_CAP ? compact.slice(0, SUMMARY_CAP) + '…' : compact
  } catch { return '' }
}

const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : undefined)

/**
 * 会话事件 → 流程节点（紧凑、JSON 安全）。返回 null 表示该事件不进流程图
 * （request/header、system/message 等结构/背景事件）。`opts.full` 关闭截断，
 * 供单条全文接口使用。
 *
 * 节点种类（ev.k）：
 *   turn / user / assistant / attempt / tool-call / tool-result / approval /
 *   retry / todo / compaction / command / subagent / workflow / goal
 */
function mapEvent(event, opts) {
  if (event === null || typeof event !== 'object') return null
  const full = !!(opts && opts.full)
  const data = event.data && typeof event.data === 'object' ? event.data : {}
  const base = { seq: event.seq, time: event.time, turn: num(data.turn), step: num(data.step) }
  switch (event.type) {
    case 'turn/start':
      return { ...base, k: 'turn', phase: 'start' }
    case 'turn/end':
      return { ...base, k: 'turn', phase: 'end', reason: data.reason && typeof data.reason === 'object' ? data.reason.kind : undefined }

    case 'user/message': {
      const text = blocksText(data.content)
      const source = data.source && typeof data.source === 'object' ? data.source : undefined
      const injected = !!(source && source.kind && source.kind !== 'user')
      return {
        ...base, k: 'user',
        ...(full ? { text, chars: text.length } : truncate(text)),
        injected,
        sourceKind: source ? source.kind : undefined,
        sourceForm: source ? source.form : undefined,
        sourcePlugin: source ? source.plugin : undefined,
      }
    }

    case 'assistant/message': {
      const blocks = data.message && Array.isArray(data.message.content) ? data.message.content : []
      const text = blocks.filter((b) => b && b.type === 'text').map(blockText).filter(Boolean).join('\n')
      const reasoningChars = blocks
        .filter((b) => b && b.type === 'reasoning')
        .reduce((sum, b) => sum + blockText(b).length, 0)
      const toolCalls = blocks.filter((b) => b && b.type === 'tool-call').length
      const usage = data.usage && typeof data.usage === 'object' ? data.usage : undefined
      return {
        ...base, k: 'assistant',
        ...(full ? { text, chars: text.length } : truncate(text)),
        reasoningChars: reasoningChars > 0 ? reasoningChars : undefined,
        toolCalls: toolCalls > 0 ? toolCalls : undefined,
        interrupted: data.interrupted === true || undefined,
        usage: usage
          ? { input: num(usage.inputTokens), output: num(usage.outputTokens), cacheRead: num(usage.cacheReadTokens) }
          : undefined,
      }
    }

    case 'assistant/attempt':
      // 一次未产出 surface 消息的模型尝试（失败/重试/取消），画成暗色节点
      return { ...base, k: 'attempt' }

    case 'tool/call':
      return { ...base, k: 'tool-call', callId: data.callId, name: data.name, summary: summarizeToolArguments(data.arguments) }

    case 'tool/result': {
      const message = data.message && typeof data.message === 'object' ? data.message : {}
      const callId = message.toolCallId || (message.source && message.source.callId)
      const text = blocksText(message.content)
      const error = data.error && typeof data.error === 'object' ? data.error : undefined
      return {
        ...base, k: 'tool-result', callId,
        ok: message.isError !== true,
        ...(full ? { text, chars: text.length } : truncate(text)),
        errorName: error ? error.name : undefined,
        errorReason: error ? error.reason : undefined,
      }
    }

    case 'approval/asked':
      return { ...base, k: 'approval', phase: 'asked', summary: pickSummary(data, ['toolName', 'tool', 'name', 'command', 'question', 'title', 'summary', 'message']) }
    case 'approval/decided':
      return { ...base, k: 'approval', phase: 'decided', summary: pickSummary(data, ['decision', 'outcome', 'choice', 'reason', 'summary']) }

    case 'llm/retry':
      return { ...base, k: 'retry', phase: 'waiting', summary: pickSummary(data, ['reason', 'statusMessage', 'provider', 'error']) }
    case 'llm/retry-started':
      return { ...base, k: 'retry', phase: 'started', summary: pickSummary(data, ['provider', 'reason']) }

    case 'todo/write': {
      const todos = Array.isArray(data.todos) ? data.todos : []
      const items = todos.slice(0, 50).map((item) => ({
        c: truncate(item && item.content, 80).text,
        s: item && typeof item.status === 'string' ? item.status : 'pending',
      }))
      return {
        ...base, k: 'todo', items,
        done: items.filter((i) => i.s === 'completed').length,
        total: todos.length,
      }
    }

    case 'compaction/start':
      return { ...base, k: 'compaction', phase: 'start' }
    case 'compaction/summary':
      return { ...base, k: 'compaction', phase: 'summary', summary: pickSummary(data, ['summary', 'text']) }
    case 'compaction/end':
      return { ...base, k: 'compaction', phase: 'end' }
    case 'compaction/prune':
      return { ...base, k: 'compaction', phase: 'prune', prunedTokens: num(data.shadowedTokenCount), prunedNodes: Array.isArray(data.shadowedSeqs) ? data.shadowedSeqs.length : undefined }

    case 'command/run':
      return { ...base, k: 'command', phase: 'run', summary: pickSummary(data, ['command', 'name', 'input']) }
    case 'command/done':
      return { ...base, k: 'command', phase: 'done', summary: pickSummary(data, ['command', 'name', 'status']) }

    case 'subagent/descriptor':
      // label 是顶层字段（{ version, mode: 'continuable', label }）
      return { ...base, k: 'subagent', summary: pickSummary(data, ['label', 'name', 'description', 'agentType', 'type', 'prompt']) }
    case 'subagent/catalog':
      // 父会话的子代理名册：childId 即子会话 id（establishCatalogChild 写 child.id），
      // label 是创建时的任务描述——客户端按此把委派调用配对到可下钻的子会话
      return { ...base, k: 'subagent', childId: data.childId, summary: typeof data.label === 'string' ? data.label : undefined, mode: data.mode }

    case 'tool-workflow/run-start':
      return { ...base, k: 'workflow', phase: 'run-start', summary: pickSummary(data, ['name', 'title', 'workflow']) }
    case 'tool-workflow/run-end':
      return { ...base, k: 'workflow', phase: 'run-end', summary: pickSummary(data, ['name', 'status', 'title']) }
    case 'tool-workflow/agent-start':
      return { ...base, k: 'workflow', phase: 'agent-start', summary: pickSummary(data, ['name', 'agent', 'title']) }
    case 'tool-workflow/agent-end':
      return { ...base, k: 'workflow', phase: 'agent-end', summary: pickSummary(data, ['name', 'agent', 'status']) }

    case 'goal/change':
      return { ...base, k: 'goal', summary: pickSummary(data, ['goal', 'title', 'status', 'summary']) }

    default:
      return null
  }
}

// ── 会话读取（与 context-razor 同款兼容：0.1.5 起 events 属性换成快照方法）──
function eventsOf(session) {
  if (typeof session.snapshotEvents === 'function') return session.snapshotEvents()
  return Array.isArray(session.events) ? session.events : []
}

/** 会话是否有未收口的 turn（turn/start 与 turn/end 的 seq 括号比较）。 */
function sessionBusyEvents(events) {
  let lastStart = -1
  let lastEnd = -1
  for (const event of events) {
    if (event.type === 'turn/start') lastStart = event.seq
    else if (event.type === 'turn/end') lastEnd = event.seq
  }
  return lastStart > lastEnd
}

function sessionBusy(session) {
  return sessionBusyEvents(eventsOf(session))
}

/** 全量投影：整段日志映射成节点流（skip null）。 */
function projectFlow(events) {
  const out = []
  for (const event of events) {
    const mapped = mapEvent(event)
    if (mapped !== null) out.push(mapped)
  }
  return out
}

module.exports = {
  name: 'dsh-flow',
  inject: ['sessions', 'webServer', 'connection'],
  __internals: { mapEvent, blocksText, truncate, summarizeToolArguments, pickSummary, sessionBusy, sessionBusyEvents, projectFlow, eventsOf, decodeSessionLog, diskEventsOf, PREVIEW_CAP },

  apply(ctx) {
    // sessionId → Set<res>：直播订阅者。事件追加时同步扇出；写失败仅丢弃该客户端。
    const sseBySession = new Map()

    const publish = (sessionId, mapped) => {
      const subs = sseBySession.get(sessionId)
      if (subs === undefined || subs.size === 0) return
      const frame = `id: ${mapped.seq}\ndata: ${JSON.stringify(mapped)}\n\n`
      for (const res of subs) {
        try { res.write(frame) } catch { subs.delete(res) }
      }
    }

    ctx.effect(() => {
      const disposeSubscription = ctx.on('session/event', (session, event) => {
        try {
          const sessionId = session && session.id
          if (typeof sessionId !== 'string' || sseBySession.size === 0) return
          const mapped = mapEvent(event)
          if (mapped === null) return
          publish(sessionId, mapped)
        } catch { /* 事件分发绝不能把宿主带崩 */ }
      })

      const disposeRoute = ctx.webServer.register({
        kind: 'prefix',
        path: '/dsh-flow/api',
        handler: async (req, res) => {
          // 与其它 host 路由一致的信任栅栏：connection 服务的 Host/Origin
          // 检查加浏览器认证，防止本机任意网页跨站读会话内容。
          const rejection = ctx.connection.requestRejection(req)
          if (rejection !== undefined) {
            res.writeHead(rejection)
            res.end()
            return
          }
          try {
            const url = new URL(req.url || '/', 'http://dsh.local')
            const apiPath = url.pathname.replace(/\/+$/, '')
            const query = url.searchParams

            const sendJson = (status, payload) => {
              res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify(payload))
            }
            const fail = (status, error) => sendJson(status, { error })
            // 事件来源：内存活跃会话优先，磁盘历史兜底（子代理下钻）
            const resolveEvents = (id) => {
              const session = ctx.sessions.get(id)
              if (session !== undefined) return { session, events: eventsOf(session), live: true }
              const events = diskEventsOf(id)
              return events !== null ? { events, live: false } : null
            }

            // GET /dsh-flow/api/flow?session= → 全量投影
            if (req.method === 'GET' && apiPath.endsWith('/dsh-flow/api/flow')) {
              const resolved = resolveEvents(query.get('session') || '')
              if (resolved === null) { fail(404, 'session not found'); return }
              sendJson(200, {
                id: query.get('session') || '',
                cwd: resolved.session && resolved.session.header && resolved.session.header.cwd,
                busy: sessionBusyEvents(resolved.events),
                static: !resolved.live,
                events: projectFlow(resolved.events),
              })
              return
            }

            // GET /dsh-flow/api/event?session=&seq= → 单条全文（不截断）
            if (req.method === 'GET' && apiPath.endsWith('/dsh-flow/api/event')) {
              const resolved = resolveEvents(query.get('session') || '')
              if (resolved === null) { fail(404, 'session not found'); return }
              const seq = Number(query.get('seq'))
              if (!Number.isSafeInteger(seq) || seq < 0) { fail(400, 'bad seq'); return }
              const event = resolved.events.find((candidate) => candidate.seq === seq)
              if (event === undefined) { fail(404, 'event not found'); return }
              const mapped = mapEvent(event, { full: true })
              if (mapped === null) { fail(404, 'event not on flow'); return }
              sendJson(200, mapped)
              return
            }

            // GET /dsh-flow/api/stream?session=&after= → SSE 直播（仅内存活跃会话；
            // 磁盘历史会话是静态的，客户端拿到 static:true 就不开流）
            if (req.method === 'GET' && apiPath.endsWith('/dsh-flow/api/stream')) {
              const session = ctx.sessions.get(query.get('session') || '')
              if (session === undefined) { fail(404, 'session not found or not live'); return }
              const sessionId = session.id
              // 回补起点：query.after 优先；EventSource 自动重连带 Last-Event-ID。
              // 注意 query 缺失时 get 返回 null 而 Number(null) === 0，必须先判存在性。
              const afterRaw = query.get('after')
              const afterParam = afterRaw === null || afterRaw === '' ? NaN : Number(afterRaw)
              const lastEventId = Number(req.headers['last-event-id'])
              const after = Number.isSafeInteger(afterParam) && afterParam >= 0
                ? afterParam
                : Number.isSafeInteger(lastEventId) && lastEventId >= 0 ? lastEventId + 1 : 0

              res.writeHead(200, {
                'Content-Type': 'text/event-stream; charset=utf-8',
                'Cache-Control': 'no-cache, no-transform',
                Connection: 'keep-alive',
                'X-Accel-Buffering': 'no',
              })
              res.write('retry: 3000\n\n')
              // 先回补（与直播同一份 mapEvent，客户端按 seq 去重），再挂进订阅集
              for (const event of eventsOf(session)) {
                if (event.seq < after) continue
                const mapped = mapEvent(event)
                if (mapped === null) continue
                res.write(`id: ${mapped.seq}\ndata: ${JSON.stringify(mapped)}\n\n`)
              }
              let subs = sseBySession.get(sessionId)
              if (subs === undefined) {
                subs = new Set()
                sseBySession.set(sessionId, subs)
              }
              subs.add(res)
              const heartbeat = setInterval(() => { try { res.write(': ping\n\n') } catch {} }, 25000)
              req.on('close', () => {
                clearInterval(heartbeat)
                const bucket = sseBySession.get(sessionId)
                if (bucket !== undefined) {
                  bucket.delete(res)
                  if (bucket.size === 0) sseBySession.delete(sessionId)
                }
              })
              return
            }

            fail(404, `no route for ${req.method} ${apiPath}`)
          } catch (e) {
            try {
              res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' })
              res.end(JSON.stringify({ error: (e && e.message) || 'internal error' }))
            } catch { /* res 可能已部分写出 */ }
          }
        },
      })

      return () => {
        try { disposeSubscription() } catch {}
        try { if (typeof disposeRoute === 'function') disposeRoute() } catch {}
        for (const subs of sseBySession.values()) {
          for (const res of subs) { try { res.end() } catch {} }
        }
        sseBySession.clear()
      }
    }, 'dsh-flow: live flow api')
  },
}
