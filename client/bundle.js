/* Generated from client/index.js by scripts/build-client.mjs — do not edit by hand.
 * Regenerate with: npm run build:client
 */
window.__ModuleLoader__.load({
  id: "@weibaohui/dsh-flow",
  factory: (require) => {
    var module = { exports: {} }
    var exports = module.exports
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" })
    var React = require("react")
    /**
     * dsh-flow — Browser half.
     *
     * 会话视图标签「执行流程」：把当前会话画成一条纵向决策链路——默认只显示
     * 骨架：每个节点一行（类型 chip + 一行摘要 + 耗时/用量徽标），连续的工具
     * 调用折叠成一个工具组；回合边界是全宽 pill。双击节点弹出详情（全文按需
     * 经 /event 补全）。SSE 跟随宿主 session/event 实时追加：会话执行到哪，
     * 链路就向下画到哪；停留在底部自动跟随，往上翻浮出「回到底部」。
     *
     * 节点构建是纯函数（applyEventToNodes / reduceEvents / groupNodes /
     * nodeLine，挂在 __internals 便于 node 侧测试）：tool/result 按 callId 并回
     * tool/call 节点，同 seq 重复事件由调用方以 seqRef 去重。
     */

    let __React = null
    try { __React = require('react') } catch {}
    if (!__React || typeof __React.createElement !== 'function') {
      __React = {
        createElement(type, props, ...kids) {
          return { type, props: props || {}, kids: kids.flat(9) }
        },
        useState(init) { const v = [typeof init === 'function' ? init() : init]; return [v[0], x => { v[0] = typeof x === 'function' ? x(v[0]) : x }] },
        useEffect() {}, useMemo(fn) { return fn() }, useRef(v = null) { return { current: v } },
      }
    }
    const { createElement: h, useState, useEffect, useMemo, useRef } = __React

    function ensureStyles() {
      if (typeof document === 'undefined' || document.getElementById('fw-styles')) return
      const holder = document.createElement('div')
      holder.id = 'fw-styles'
      holder.style.display = 'none'
      holder.innerHTML = STYLE
      document.head.appendChild(holder)
    }

    // ── Locale ───────────────────────────────────────────────────────────────

    const NS = 'dshFlow'

    const ZH = {
      title: '执行流程',
      pickSession: '在会话顶部标签打开以查看执行流程',
      statusConnecting: '连接中…',
      statusLive: '实时',
      statusRetry: '重连中…',
      statusError: '连接失败',
      statusStatic: '静态（历史）',
      refresh: '刷新',
      nodesCount: '{n} 个节点',
      busyTag: '执行中',
      ghostWorking: '模型工作中…',
      backToBottom: '回到底部',
      newNodes: '{n} 条新节点',
      filterLabel: '筛选',
      kindUser: '用户',
      kindContext: '上下文',
      kindAssistant: '助手',
      kindTool: '工具',
      kindTodo: '待办',
      kindEvent: '事件',
      turnStart: '回合 {n} 开始',
      turnEnd: '回合 {n} 结束',
      injected: '注入',
      thinkingBadge: '思考 {n} 字',
      interruptedBadge: '已中断',
      runningBadge: '运行中',
      emptyText: '（无文本）',
      assistantDecision: '发起 {n} 个工具调用',
      attemptNode: '一次未产出消息的模型尝试（失败 / 重试 / 取消）',
      approvalAsked: '等待审批',
      approvalDecided: '审批结果',
      retryWaiting: '模型请求失败，等待重试',
      retryStarted: '重试后开始新请求',
      compactionStart: '上下文压缩开始',
      compactionSummary: '压缩摘要',
      compactionEnd: '压缩结束',
      compactionPrune: '裁剪了 {n} 条历史（≈{tokens} token）',
      commandRun: '命令执行',
      commandDone: '命令完成',
      subagentNode: '子代理',
      workflowRunStart: '工作流开始',
      workflowRunEnd: '工作流结束',
      workflowAgentStart: '工作流代理开始',
      workflowAgentEnd: '工作流代理结束',
      goalNode: '目标变更',
      todoNode: '待办更新',
      toolGroup: '{n} 个工具调用',
      viewChart: '流程图',
      viewList: '列表',
      dblclickHint: '双击查看详情',
      drillHint: '双击进入子代理流程',
      backToMain: '返回主流程',
      detailTitle: '节点详情',
      close: '关闭',
      loadFull: '加载全文',
      loading: '加载中…',
      emptyFlow: '该会话还没有可展示的执行事件',
      loadFailed: '加载失败',
      metaSeq: 'seq {seq}',
      metaDuration: '耗时 {d}',
      metaCallId: 'callId {id}',
      metaUsage: '输入 {input} / 输出 {output}{cache}',
      metaStatus: '状态 {s}',
      statusDone: '完成',
      statusError: '失败',
      statusRunning: '运行中',
    }

    const EN = {
      title: 'Flow',
      pickSession: 'Open a conversation tab to watch its execution flow',
      statusConnecting: 'connecting…',
      statusLive: 'live',
      statusRetry: 'reconnecting…',
      statusError: 'disconnected',
      statusStatic: 'static (history)',
      refresh: 'Refresh',
      nodesCount: '{n} nodes',
      busyTag: 'running',
      ghostWorking: 'Model is working…',
      backToBottom: 'Back to bottom',
      newNodes: '{n} new',
      filterLabel: 'Filter',
      kindUser: 'User',
      kindContext: 'Context',
      kindAssistant: 'Assistant',
      kindTool: 'Tools',
      kindTodo: 'Todos',
      kindEvent: 'Events',
      turnStart: 'Turn {n} started',
      turnEnd: 'Turn {n} ended',
      injected: 'injected',
      thinkingBadge: '{n} chars of thinking',
      interruptedBadge: 'interrupted',
      runningBadge: 'running',
      emptyText: '(no text)',
      assistantDecision: 'dispatched {n} tool calls',
      attemptNode: 'A model attempt that produced no message (failed / retried / cancelled)',
      approvalAsked: 'Approval requested',
      approvalDecided: 'Approval decided',
      retryWaiting: 'Model request failed, waiting to retry',
      retryStarted: 'Retrying request',
      compactionStart: 'Compaction started',
      compactionSummary: 'Compaction summary',
      compactionEnd: 'Compaction ended',
      compactionPrune: 'Pruned {n} entries (≈{tokens} tokens)',
      commandRun: 'Command running',
      commandDone: 'Command done',
      subagentNode: 'Subagent',
      workflowRunStart: 'Workflow started',
      workflowRunEnd: 'Workflow ended',
      workflowAgentStart: 'Workflow agent started',
      workflowAgentEnd: 'Workflow agent ended',
      goalNode: 'Goal changed',
      todoNode: 'Todos updated',
      toolGroup: '{n} tool calls',
      viewChart: 'Chart',
      viewList: 'List',
      dblclickHint: 'Double-click for details',
      drillHint: 'Double-click to open subagent flow',
      backToMain: 'Back to main flow',
      detailTitle: 'Node detail',
      close: 'Close',
      loadFull: 'Load full text',
      loading: 'Loading…',
      emptyFlow: 'No execution events in this session yet',
      loadFailed: 'Failed to load',
      metaSeq: 'seq {seq}',
      metaDuration: 'took {d}',
      metaCallId: 'callId {id}',
      metaUsage: 'in {input} / out {output}{cache}',
      metaStatus: 'status {s}',
      statusDone: 'done',
      statusError: 'failed',
      statusRunning: 'running',
    }

    // ── 纯函数：事件流 → 节点流 ──────────────────────────────────────────────

    const API = '/dsh-flow/api'
    const LINE_CAP = 90

    /**
     * 追加/合并一个映射事件到节点数组（返回新数组）。
     * tool-result 按 callId 并回最近的 tool 节点；同 seq 的结果补丁幂等。
     */
    function applyEventToNodes(nodes, ev) {
      if (ev === null || typeof ev !== 'object') return nodes
      switch (ev.k) {
        case 'tool-call':
          return [...nodes, {
            id: 's' + ev.seq, seq: ev.seq, kind: 'tool', status: 'running',
            name: ev.name, summary: ev.summary, callId: ev.callId,
            time: ev.time, turn: ev.turn, step: ev.step,
          }]
        case 'tool-result': {
          let idx = -1
          for (let i = nodes.length - 1; i >= 0; i--) {
            const n = nodes[i]
            if (n.kind === 'tool' && n.callId === ev.callId) { idx = i; break }
          }
          if (idx === -1) {
            return [...nodes, {
              id: 's' + ev.seq, seq: ev.seq, kind: 'tool', status: ev.ok === false ? 'error' : 'done',
              name: undefined, summary: undefined, callId: ev.callId,
              text: ev.text, chars: ev.chars, errorReason: ev.errorReason, errorName: ev.errorName,
              time: ev.time, turn: ev.turn, step: ev.step, resultSeq: ev.seq, orphan: true,
            }]
          }
          const target = nodes[idx]
          if (target.resultSeq !== undefined && target.resultSeq >= ev.seq) return nodes
          const patched = {
            ...target,
            status: ev.ok === false ? 'error' : 'done',
            text: ev.text, chars: ev.chars,
            errorReason: ev.errorReason, errorName: ev.errorName,
            durationMs: typeof ev.time === 'number' && typeof target.time === 'number' ? Math.max(0, ev.time - target.time) : undefined,
            resultSeq: ev.seq,
          }
          return [...nodes.slice(0, idx), patched, ...nodes.slice(idx + 1)]
        }
        case 'turn':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'turn', phase: ev.phase, turnNum: ev.turn, reason: ev.reason, time: ev.time }]
        case 'user':
          // 注入类消息（source.kind ≠ 'user'：system-reminder、runtime context、插件
          // notice…）不是用户输入，单分一类「上下文」，泳道与筛选都与用户分开
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: ev.injected ? 'context' : 'user', text: ev.text, chars: ev.chars, injected: ev.injected, sourceKind: ev.sourceKind, sourceForm: ev.sourceForm, sourcePlugin: ev.sourcePlugin, time: ev.time }]
        case 'assistant':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'assistant', text: ev.text, chars: ev.chars, reasoningChars: ev.reasoningChars, toolCalls: ev.toolCalls, interrupted: ev.interrupted, usage: ev.usage, time: ev.time }]
        case 'attempt':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'attempt', time: ev.time }]
        case 'approval':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'approval', phase: ev.phase, summary: ev.summary, time: ev.time }]
        case 'retry':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'retry', phase: ev.phase, summary: ev.summary, time: ev.time }]
        case 'todo':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'todo', items: ev.items, done: ev.done, total: ev.total, time: ev.time }]
        case 'compaction':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'compaction', phase: ev.phase, summary: ev.summary, prunedTokens: ev.prunedTokens, prunedNodes: ev.prunedNodes, time: ev.time }]
        case 'command':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'command', phase: ev.phase, summary: ev.summary, time: ev.time }]
        case 'subagent':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'subagent', summary: ev.summary, childId: ev.childId, mode: ev.mode, time: ev.time }]
        case 'workflow':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'workflow', phase: ev.phase, summary: ev.summary, time: ev.time }]
        case 'goal':
          return [...nodes, { id: 's' + ev.seq, seq: ev.seq, kind: 'goal', summary: ev.summary, time: ev.time }]
        default:
          return nodes
      }
    }

    /** 全量事件折成节点流；busy = 存在未收口的 turn。 */
    function reduceEvents(events) {
      let nodes = []
      let busy = false
      let maxSeq = -1
      for (const ev of events || []) {
        if (ev && typeof ev.seq === 'number' && ev.seq > maxSeq) maxSeq = ev.seq
        if (ev && ev.k === 'turn') busy = ev.phase === 'start'
        nodes = applyEventToNodes(nodes, ev)
      }
      return { nodes, busy, maxSeq }
    }

    /** 筛选类别：六个桶，与筛选 chip 一一对应。 */
    function nodeCategory(node) {
      switch (node.kind) {
        case 'user': return 'user'
        case 'context': return 'context'
        case 'assistant': return 'assistant'
        case 'tool': return 'tool'
        case 'todo': return 'todo'
        default: return 'event'
      }
    }

    /**
     * 骨架折叠：连续的工具节点折成一个工具组（{ group: true, members }），
     * 其余节点原样保留。子代理名册事件（subagent/catalog）是创建元数据，不打断
     * 工具组的连续段——暂存后在组结束时补回原位，保证并行派发的 N 个调用始终
     * 折进同一个组（扇形才完整）。渲染层纯函数，不改数据。
     */
    function groupNodes(nodes) {
      const out = []
      let pendingCatalogs = []
      const flushCatalogs = () => {
        for (const c of pendingCatalogs) out.push(c)
        pendingCatalogs = []
      }
      for (const node of nodes) {
        const isCatalog = node.kind === 'subagent' && node.childId
        if (isCatalog) { pendingCatalogs.push(node); continue }
        const last = out[out.length - 1]
        if (node.kind === 'tool' && last && last.group === true) {
          last.members.push(node)
        } else if (node.kind === 'tool') {
          out.push({ group: true, id: 'g' + node.id, members: [node] })
        } else {
          flushCatalogs()
          out.push(node)
        }
      }
      flushCatalogs()
      return out
    }

    const firstLine = (text) => {
      if (typeof text !== 'string' || text === '') return ''
      const line = text.split('\n')[0]
      return line.length > LINE_CAP ? line.slice(0, LINE_CAP) + '…' : line
    }

    /** 节点的一行骨架文案（不含 chip/徽标）。 */
    function nodeLine(node, t) {
      switch (node.kind) {
        case 'user':
        case 'context':
          return firstLine(node.text) || t('emptyText')
        case 'assistant':
          if (node.text) return firstLine(node.text)
          if (node.toolCalls) return t('assistantDecision', { n: node.toolCalls })
          return t('emptyText')
        case 'tool':
          return node.summary || ''
        case 'todo':
          return t('todoNode') + ' ' + (node.done || 0) + '/' + (node.total || 0)
        case 'approval':
          return (node.phase === 'asked' ? t('approvalAsked') : t('approvalDecided')) + (node.summary ? ' · ' + node.summary : '')
        case 'retry':
          return (node.phase === 'started' ? t('retryStarted') : t('retryWaiting')) + (node.summary ? ' · ' + node.summary : '')
        case 'compaction':
          if (node.phase === 'start') return t('compactionStart')
          if (node.phase === 'summary') return t('compactionSummary') + (node.summary ? ' · ' + firstLine(node.summary) : '')
          if (node.phase === 'prune') return t('compactionPrune', { n: node.prunedNodes || 0, tokens: formatNum(node.prunedTokens) })
          return t('compactionEnd')
        case 'command':
          return (node.phase === 'done' ? t('commandDone') : t('commandRun')) + (node.summary ? ' · ' + node.summary : '')
        case 'subagent':
          return t('subagentNode') + (node.summary ? ' · ' + node.summary : '')
        case 'workflow': {
          const label = node.phase === 'run-start' ? t('workflowRunStart')
            : node.phase === 'run-end' ? t('workflowRunEnd')
            : node.phase === 'agent-start' ? t('workflowAgentStart') : t('workflowAgentEnd')
          return label + (node.summary ? ' · ' + node.summary : '')
        }
        case 'goal':
          return t('goalNode') + (node.summary ? ' · ' + node.summary : '')
        case 'attempt':
          return t('attemptNode')
        default:
          return ''
      }
    }

    /** 工具组的一行摘要：名字计数（read ×2 · write ×1）。 */
    function toolGroupLine(members) {
      const tally = new Map()
      for (const m of members) {
        const name = m.name || '?'
        tally.set(name, (tally.get(name) || 0) + 1)
      }
      return [...tally.entries()].map(([name, n]) => (n > 1 ? name + ' ×' + n : name)).join(' · ')
    }

    // ── 流程图布局 ───────────────────────────────────────────────────────────
    // 四条垂直泳道按「转移频率」排布，让流向单调、交叉最少：
    //   上下文 | 用户 | 助手（主链）| 工具
    // 回合开始时从左向右单调推进（注入 → 提问 → 助手），随后助手↔工具在右侧相邻
    // 两列来回——相邻泳道短弧线，不再左右横穿。
    // 展开的工具组是「铁路侧线」：成员在工具泳道纵向串联，组框一条边引入、末成员
    // 一条边汇回主链；子代理委派组保持横向发散-收敛扇形；重试/压缩等旁路挂在
    // 工具泳道右侧。
    const CHART = {
      laneCtxX: 100, laneUserX: 280, spineX: 460, laneToolX: 640,
      boxH: 34,
      ovalW: 160, ovalEndW: 220, ovalH: 32, diamondW: 150, diamondH: 44,
      rowGap: 22, turnGap: 28,
      memberH: 30, memberGap: 10,
      sideX: 780, sideW: 170, sideH: 30, sideGap: 6,
      fanGapX: 12, fanDrop: 64,
      padTop: 34, padBottom: 24,
    }
    const SIDE_KINDS = new Set(['retry', 'attempt', 'compaction', 'command', 'subagent', 'workflow', 'goal'])

    /** 泳道中心线：上下文靠左、用户次左、助手居中、工具靠右。 */
    function laneXFor(kind) {
      if (kind === 'context') return CHART.laneCtxX
      if (kind === 'user') return CHART.laneUserX
      return CHART.spineX
    }

    // ── 节点宽度自适应 ───────────────────────────────────────────────────────
    // 按内容估算像素宽（CJK 全宽 ≈ fontSize，ASCII ≈ 0.56×fontSize），夹紧在
    // 泳道安全区内：行高 56 > 框高 34，相邻泳道节点纵向天然错开，宽些也不相撞。
    const CJK_RE = /[\u2e80-\u9fff\uff00-\uffef\uf900-\ufaff]/
    function estTextWidth(text, fontSize = 12.5) {
      let w = 0
      for (const ch of String(text || '')) w += CJK_RE.test(ch) ? fontSize : fontSize * 0.56
      return w
    }
    // 布局是纯函数、不依赖 locale 注入——宽度估算用内置中文表即可（只差几个像素）
    const tWidth = (key, vars) => {
      let out = ZH[key] ?? key
      if (vars) for (const [k, v] of Object.entries(vars)) out = out.split('{' + k + '}').join(String(v))
      return out
    }

    /** 主链方框宽度：内容（行文本 + chip + 徽标）+ 固定装饰，140–210 夹紧。 */
    function nodeWidth(item) {
      const isGroup = item.group === true
      const line = isGroup ? toolGroupLine(item.members) : nodeLine(item, tWidth)
      let w = estTextWidth(line, 12.5) + 48 // 圆点 + chip 底 + padding
      if (isGroup) w += 78 // 「N 个工具调用」chip + caret
      else if (item.kind === 'assistant') w += (item.reasoningChars ? 92 : 0) + (item.usage ? 96 : 0) + (item.interrupted ? 58 : 0)
      else if (item.kind === 'todo') w += 26
      else if (item.kind === 'user' || item.kind === 'context') w += 14
      return Math.round(Math.min(Math.max(140, w), 210))
    }

    /** 成员框宽度：子代理标签或「名字 · 摘要」+ 圆点 + 耗时徽标，150–250 夹紧。 */
    function memberWidth(m) {
      const line = m.childLabel || (m.name + (m.summary ? ' · ' + m.summary : ''))
      let w = estTextWidth(line, 11.5) + 54 // 圆点 + padding
      if (m.durationMs !== undefined) w += 52
      if (m.childId) w += 24
      if (m.status === 'error') w += 30
      return Math.round(Math.min(Math.max(150, w), 250))
    }

    /** 委派工具名：subagent（dsh-tool-subagent 默认名）/ lead（agent-team）/
     *  spawn_teammate / spawn_agent（agent-team 并行拉起成员）/ agent / task。 */
    function isDelegationTool(name) {
      return typeof name === 'string' && /^(subagent|lead|agent|task|spawn_teammate|spawn_agent)$/i.test(name)
    }

    /** 子代理组：工具组成员全是委派调用（哪怕只有 1 个）——走发散-收敛扇形。 */
    function isDelegationGroup(item) {
      return item.group === true && item.members.length >= 1 && item.members.every((m) => isDelegationTool(m.name))
    }

    // ── 工具配色 ─────────────────────────────────────────────────────────────
    // 委派（子代理）固定紫色 265；普通工具按名字 djb2 哈希出稳定色相，避开紫色
    // 邻域（245–289）保持委派独占。同一工具在任何会话里颜色一致。
    const DELEGATION_HUE = 265
    function toolHue(name) {
      if (typeof name !== 'string' || name === '') return DELEGATION_HUE
      if (isDelegationTool(name)) return DELEGATION_HUE
      let h = 0
      for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0
      let hue = h % 360
      if (hue >= 245 && hue <= 289) hue = (hue + 110) % 360
      return hue
    }
    const toolColor = (name) => `hsl(${toolHue(name)},62%,46%)`

    /** 组框配色：全同工具→该工具色；全是委派→委派紫；混合→中性灰紫。 */
    function groupColor(group) {
      const names = new Set(group.members.map((m) => m.name))
      if (names.size === 1) return toolColor([...names][0])
      if (group.members.every((m) => isDelegationTool(m.name))) return toolColor('subagent')
      return 'hsl(265,20%,55%)'
    }

    /**
     * 把 subagent/catalog 名册配对到委派工具节点（写上 childId/childLabel）。
     * 先精确段：catalog 的 seq 落在某次调用的 (seq, resultSeq] 区间内且唯一；
     * 剩余（并行爆发段，catalog 与调用密集交错）按创建顺序配对——catalog 的
     * 追加顺序就是子代理的创建顺序。纯函数：无名册或无委派调用时原样返回。
     */
    function attachChildren(nodes) {
      const catalogs = []
      for (const n of nodes) {
        if (n.kind === 'subagent' && n.childId) catalogs.push({ seq: n.seq, childId: n.childId, label: n.summary })
      }
      if (catalogs.length === 0) return nodes
      const calls = nodes
        .filter((n) => n.kind === 'tool' && isDelegationTool(n.name))
        .sort((a, b) => a.seq - b.seq)
      if (calls.length === 0) return nodes
      const byId = new Map()
      const usedCats = new Set()
      for (const call of calls) {
        const hits = catalogs.filter((c) => !usedCats.has(c) && c.seq > call.seq && (call.resultSeq === undefined || c.seq <= call.resultSeq))
        if (hits.length === 1) { byId.set(call.id, hits[0]); usedCats.add(hits[0]) }
      }
      const restCalls = calls.filter((c) => !byId.has(c.id))
      const restCats = catalogs.filter((c) => !usedCats.has(c)).sort((a, b) => a.seq - b.seq)
      restCats.forEach((cat, i) => { if (restCalls[i]) byId.set(restCalls[i].id, cat) })
      if (byId.size === 0) return nodes
      // 配对成功的名册节点标记 paired：流程图上不再单独挂旁路（成员框已带标签），减少重复
      return nodes.map((n) => {
        if (byId.has(n.id)) return { ...n, childId: byId.get(n.id).childId, childLabel: byId.get(n.id).label }
        if (n.kind === 'subagent' && n.childId && [...byId.values()].some((c) => c.childId === n.childId)) return { ...n, paired: true }
        return n
      })
    }

    /**
     * 布局：items（groupNodes 之后）→ { pos: Map(id → {x,y,w,h,shape,item}),
     * edges: [{x1,y1,x2,y2,kind,hue?}], width, height, fanGroups }。纯函数。
     * kind 取值：spine（主链）/ fork / chain / join（工具侧线）/ fanfork /
     * fanjoin（子代理扇形）/ retry / attempt / compaction / …（虚线旁路）。
     */
    function layoutFlow(items, openGroups) {
      const pos = new Map()
      const spine = []
      const sides = []
      const fans = []        // 展开的子代理组（供边生成）
      const sidings = []     // 展开的普通工具组（铁路侧线）
      const anchorSlots = new Map()
      let y = CHART.padTop
      let lastSpineId = null
      let maxFanRight = 0

      for (const item of items) {
        const isGroup = item.group === true
        const kind = isGroup ? 'tool-group' : item.kind
        if (SIDE_KINDS.has(kind)) {
          // 已配对到扇形成员的名册节点不再挂旁路（标签已在成员框上），避免重复连线
          if (kind === 'subagent' && item.childId && item.paired) continue
          const slot = anchorSlots.get(lastSpineId) || 0
          anchorSlots.set(lastSpineId, slot + 1)
          sides.push({ item, anchorId: lastSpineId, slot })
          continue
        }
        const shape = kind === 'turn' ? 'oval' : kind === 'approval' ? 'diamond' : 'box'
        const w = shape === 'oval' ? (item.phase === 'end' ? CHART.ovalEndW : CHART.ovalW) : shape === 'diamond' ? CHART.diamondW : nodeWidth(item)
        const hgt = shape === 'oval' ? CHART.ovalH : shape === 'diamond' ? CHART.diamondH : CHART.boxH
        // 回合与决策在主泳道；用户/上下文各走自己的泳道
        const laneX = shape === 'box' ? laneXFor(kind) : CHART.spineX
        pos.set(item.id, { x: laneX - w / 2, y, w, h: hgt, shape, item })
        spine.push(item.id)
        y += hgt
        if (isGroup && openGroups.has(item.id)) {
          const ms = item.members
          if (isDelegationGroup(item)) {
            // 子代理扇形：成员在主链下方横向一排（各自自适应宽），向下发散
            const widths = ms.map(memberWidth)
            const rowW = widths.reduce((a, b) => a + b, 0) + (ms.length - 1) * CHART.fanGapX
            let fx = Math.max(12, CHART.spineX - rowW / 2)
            const fanY = y + CHART.fanDrop
            ms.forEach((m, i) => {
              pos.set(m.id, { x: fx, y: fanY, w: widths[i], h: CHART.memberH, shape: 'member', item: m })
              fx += widths[i] + CHART.fanGapX
            })
            maxFanRight = Math.max(maxFanRight, Math.max(12, CHART.spineX - rowW / 2) + rowW)
            fans.push(item.id)
            y = fanY + CHART.memberH + 12
          } else {
            // 铁路侧线：成员在工具泳道纵向串联（各自自适应宽、泳道居中）
            ms.forEach((m, i) => {
              const mw = memberWidth(m)
              pos.set(m.id, { x: CHART.laneToolX - mw / 2, y: y + 6 + i * (CHART.memberH + CHART.memberGap), w: mw, h: CHART.memberH, shape: 'member', item: m })
            })
            sidings.push(item.id)
            y += 6 + ms.length * CHART.memberH + Math.max(0, ms.length - 1) * CHART.memberGap + 12
          }
        }
        y += kind === 'turn' ? CHART.turnGap : CHART.rowGap
        lastSpineId = item.id
      }

      for (const { item, anchorId, slot } of sides) {
        const anchor = pos.get(anchorId)
        pos.set(item.id, {
          x: CHART.sideX, y: (anchor ? anchor.y : CHART.padTop) + slot * (CHART.sideH + CHART.sideGap),
          w: CHART.sideW, h: CHART.sideH, shape: 'side', item,
        })
      }

      const fanSet = new Set(fans)
      const sidingSet = new Set(sidings)
      const edges = []
      // 主链：相邻脊柱节点串联；展开的组（扇形/侧线）区间不画直线——流向由分支表达
      for (let i = 1; i < spine.length; i++) {
        const prevItem = pos.get(spine[i - 1]).item
        if (fanSet.has(prevItem.id) || sidingSet.has(prevItem.id)) continue
        const a = pos.get(spine[i - 1])
        const b = pos.get(spine[i])
        edges.push({
          x1: a.x + a.w / 2, y1: a.y + a.h,
          x2: b.x + b.w / 2, y2: b.y,
          kind: 'spine',
        })
      }
      for (const item of items) {
        if (item.group !== true || !openGroups.has(item.id)) continue
        const g = pos.get(item.id)
        const idx = spine.indexOf(item.id)
        const next = idx >= 0 && idx + 1 < spine.length ? pos.get(spine[idx + 1]) : null
        if (fanSet.has(item.id)) {
          // 发散：组框底中 → 各子代理顶中；收敛：各子代理底中 → 下一脊柱节点顶中
          const gx = g.x + g.w / 2
          for (const m of item.members) {
            const p = pos.get(m.id)
            const mx = p.x + p.w / 2
            edges.push({ x1: gx, y1: g.y + g.h, x2: mx, y2: p.y, kind: 'fanfork', hue: toolHue(m.name) })
            edges.push({
              x1: mx, y1: p.y + p.h,
              x2: next ? next.x + next.w / 2 : gx, y2: next ? next.y : p.y + p.h + 28,
              kind: 'fanjoin', hue: toolHue(m.name),
            })
          }
          continue
        }
        // 铁路侧线：组框右缘 → 首成员顶中；成员间在工具泳道内垂直串联；
        // 末成员底中 → 下一脊柱节点顶中。边色随各成员工具。
        const first = pos.get(item.members[0].id)
        const last = pos.get(item.members[item.members.length - 1].id)
        edges.push({
          x1: g.x + g.w, y1: g.y + g.h / 2,
          x2: CHART.laneToolX, y2: first.y,
          kind: 'fork', hue: toolHue(item.members[0].name),
        })
        for (let i = 1; i < item.members.length; i++) {
          const prev = pos.get(item.members[i - 1].id)
          const cur = pos.get(item.members[i].id)
          edges.push({
            x1: CHART.laneToolX, y1: prev.y + prev.h,
            x2: CHART.laneToolX, y2: cur.y,
            kind: 'chain', hue: toolHue(item.members[i].name),
          })
        }
        edges.push({
          x1: CHART.laneToolX, y1: last.y + last.h,
          x2: next ? next.x + next.w / 2 : g.x + g.w / 2,
          y2: next ? next.y : last.y + last.h + 28,
          kind: 'join', hue: toolHue(item.members[item.members.length - 1].name),
        })
      }
      // 旁路：锚点右边 → 旁路框左边（虚线，工具泳道右侧）
      for (const { item, anchorId } of sides) {
        const a = pos.get(anchorId)
        const p = pos.get(item.id)
        if (a) edges.push({ x1: a.x + a.w, y1: a.y + a.h / 2, x2: p.x, y2: p.y + p.h / 2, kind: item.kind })
      }

      return { pos, edges, width: Math.max(CHART.sideX + CHART.sideW + 40, maxFanRight + 16), height: y + CHART.padBottom, fanGroups: fans }
    }

    /**
     * 边的 SVG 路径。EDGE_STYLE 一键切换：
     *   'quad'   —— 单弯普通曲线（Q 二次曲线，圆角拐弯：主链先竖后横，侧线先横后竖）
     *   'line'   —— 直线直连
     *   'bezier' —— 三次贝塞尔（双弯 S 曲线）
     */
    const EDGE_STYLE = 'quad'
    function edgePath(e, style = EDGE_STYLE) {
      if (e.x1 === e.x2) return `M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`
      if (style === 'line') return `M ${e.x1} ${e.y1} L ${e.x2} ${e.y2}`
      if (style === 'bezier') {
        if (e.kind === 'spine' || e.kind === 'fanfork' || e.kind === 'fanjoin') {
          const d = Math.max(24, Math.min(90, Math.abs(e.y2 - e.y1) / 2))
          return `M ${e.x1} ${e.y1} C ${e.x1} ${e.y1 + d}, ${e.x2} ${e.y2 - d}, ${e.x2} ${e.y2}`
        }
        const mx = Math.max(40, Math.abs(e.x2 - e.x1) / 2)
        return `M ${e.x1} ${e.y1} C ${e.x1 + mx} ${e.y1}, ${e.x2 - mx} ${e.y2}, ${e.x2} ${e.y2}`
      }
      // quad：单弯普通曲线。主链/扇形先竖直下行再圆弧拐向目标；侧线先横出再拐下。
      const verticalFirst = e.kind === 'spine' || e.kind === 'fanfork' || e.kind === 'fanjoin'
      const cx = verticalFirst ? e.x1 : e.x2
      const cy = verticalFirst ? e.y2 : e.y1
      return `M ${e.x1} ${e.y1} Q ${cx} ${cy} ${e.x2} ${e.y2}`
    }

    const formatNum = (n) => Number.isFinite(n) ? n.toLocaleString('en-US') : '-'

    function formatDuration(ms) {
      if (!Number.isFinite(ms)) return ''
      if (ms < 1000) return Math.round(ms) + ' ms'
      if (ms < 60000) return (ms / 1000).toFixed(1) + ' s'
      const m = Math.floor(ms / 60000)
      return m + ' min ' + Math.round((ms - m * 60000) / 1000) + ' s'
    }

    function formatClock(ts) {
      if (!Number.isFinite(ts)) return ''
      try { return new Date(ts).toLocaleTimeString([], { hour12: false }) } catch { return '' }
    }

    function formatDateTime(ts) {
      if (!Number.isFinite(ts)) return ''
      try { return new Date(ts).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' }) } catch { return new Date(ts).toLocaleString() }
    }

    async function getJson(url) {
      const r = await fetch(url)
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        throw new Error(body.error || 'HTTP ' + r.status)
      }
      return r.json()
    }

    // ── 样式（dsh 设计令牌，明暗自适应）──────────────────────────────────────

    const STYLE = `<style>
    .fw-page,.fw-page *{box-sizing:border-box}
    .fw-page{position:relative;display:flex;flex-direction:column;gap:12px;padding:16px 20px;min-width:0;color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family);font-size:var(--dsw-font-sm-14,14px)}
    .fw-toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .fw-spacer{flex:1}
    .fw-label{color:var(--dsw-alias-label-secondary);font-size:12.5px;white-space:nowrap}
    .fw-stats{display:flex;gap:10px;align-items:center;flex-wrap:wrap;color:var(--dsw-alias-label-secondary);font-size:12.5px}
    .fw-status{display:inline-flex;align-items:center;gap:6px;padding:2px 10px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);font-size:11.5px;color:var(--dsw-alias-label-secondary);white-space:nowrap}
    .fw-status .dot{width:7px;height:7px;border-radius:50%;background:var(--dsw-alias-label-tertiary)}
    .fw-status.live .dot{background:var(--dsw-alias-state-success-primary);animation:fw-pulse 1.6s ease-in-out infinite}
    .fw-status.retry .dot{background:hsl(38,92%,45%)}
    .fw-status.error .dot{background:var(--dsw-alias-state-error-primary)}
    .fw-badge{display:inline-flex;align-items:center;padding:0 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px;white-space:nowrap}
    .fw-badge.busy{color:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary)}
    .fw-badge.err{color:var(--dsw-alias-state-error-primary);border-color:var(--dsw-alias-state-error-primary)}
    .fw-badge.ok{color:var(--dsw-alias-state-success-primary);border-color:var(--dsw-alias-state-success-primary)}
    .fw-filters{display:inline-flex;gap:4px;align-items:center;flex-wrap:wrap}
    .fw-filters.filtering .fw-filterbtn:not(.on){opacity:.45}
    .fw-filterbtn{display:inline-flex;align-items:center;gap:5px;padding:2px 10px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11.5px;cursor:pointer;font-family:var(--dsw-font-family);white-space:nowrap}
    .fw-filterbtn:hover{border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}
    .fw-filterbtn.on{color:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary);font-weight:600}
    .fw-filtercount{font-size:10px;opacity:.7}
    .fw-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;min-height:30px;padding:5px 14px;border-radius:8px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);font-size:12.5px;font-weight:500;cursor:pointer;font-family:var(--dsw-font-family);white-space:nowrap}
    .fw-btn:hover{border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}
    /* 决策链轨道：左侧竖线 + 每节点一个彩色节点圆点，行间箭头由竖线承担 */
    .fw-list{position:relative;display:flex;flex-direction:column;gap:5px;padding-left:32px}
    .fw-list::before{content:'';position:absolute;left:11px;top:8px;bottom:8px;width:2px;background:var(--dsw-alias-border-l2);border-radius:1px}
    .fw-node{position:relative}
    .fw-node .rail-dot{position:absolute;left:-27px;top:11px;width:10px;height:10px;border-radius:50%;border:2px solid var(--dsw-alias-bg-layer-1);background:var(--dsw-alias-label-tertiary);z-index:1}
    .fw-node .rail-arrow{position:absolute;left:-24px;top:-4px;width:0;height:0;border-left:4px solid transparent;border-right:4px solid transparent;border-top:5px solid var(--dsw-alias-border-l2);z-index:1}
    .fw-node.running .rail-dot{animation:fw-pulse 1.2s ease-in-out infinite}
    @keyframes fw-pulse{0%,100%{opacity:1}50%{opacity:.35}}
    .fw-card{border:1px solid var(--dsw-alias-border-l1);border-left:3px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-layer-1);padding:4px 10px;min-height:30px;display:flex;align-items:center;cursor:pointer;user-select:none}
    .fw-card:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l2)}
    .fw-card-head{display:flex;gap:8px;align-items:center;min-width:0;width:100%;flex-wrap:nowrap}
    .fw-chip{display:inline-flex;align-items:center;padding:0 8px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);font-size:11px;line-height:18px;white-space:nowrap;flex:none}
    .fw-line{color:var(--dsw-alias-label-primary);font-size:12.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;flex:0 1 auto}
    .fw-line.dim{color:var(--dsw-alias-label-tertiary)}
    .fw-time{margin-left:auto;color:var(--dsw-alias-label-tertiary);font-size:11px;flex:none}
    .fw-badges{display:inline-flex;gap:5px;align-items:center;flex:none}
    .fw-node.user .rail-dot{background:var(--dsw-alias-state-business-primary)}
    .fw-node.user .fw-card{border-left-color:var(--dsw-alias-state-business-primary)}
    .fw-node.context .rail-dot{background:var(--dsw-alias-label-tertiary)}
    .fw-node.context .fw-card{border-left-color:var(--dsw-alias-label-tertiary);border-left-style:dashed}
    .fw-node.context .fw-line{color:var(--dsw-alias-label-secondary)}
    .fw-node.assistant .rail-dot{background:var(--dsw-alias-state-success-primary)}
    .fw-node.assistant .fw-card{border-left-color:var(--dsw-alias-state-success-primary)}
    .fw-node.tool .rail-dot{background:hsl(265,60%,52%)}
    .fw-node.tool .fw-card{border-left-color:hsl(265,60%,52%)}
    .fw-node.tool.error .rail-dot,.fw-node.tool.error .fw-card{border-color:var(--dsw-alias-state-error-primary)}
    .fw-node.tool.error .rail-dot{background:var(--dsw-alias-state-error-primary)}
    .fw-node.todo .rail-dot{background:hsl(175,65%,38%)}
    .fw-node.todo .fw-card{border-left-color:hsl(175,65%,38%)}
    .fw-node.approval .rail-dot{background:hsl(38,92%,45%)}
    .fw-node.approval .fw-card{border-left-color:hsl(38,92%,45%)}
    .fw-node.retry .rail-dot{background:hsl(20,85%,50%)}
    .fw-node.retry .fw-card{border-left-color:hsl(20,85%,50%);border-left-style:dashed}
    .fw-node.compaction .rail-dot{background:var(--dsw-alias-label-tertiary)}
    .fw-node.compaction .fw-card{border-left-color:var(--dsw-alias-label-tertiary)}
    .fw-node.attempt .rail-dot{background:var(--dsw-alias-state-error-primary)}
    .fw-node.attempt .fw-card{border-left-color:var(--dsw-alias-state-error-primary);opacity:.75}
    .fw-node.event .rail-dot{background:hsl(210,15%,55%)}
    .fw-node.event .fw-card{border-left-color:hsl(210,15%,55%)}
    .fw-turn{position:relative;display:flex;justify-content:center;padding:4px 0}
    .fw-turn-pill{display:inline-flex;align-items:center;gap:8px;padding:3px 14px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:12px;white-space:nowrap}
    .fw-turn-pill .fw-turn-time{color:var(--dsw-alias-label-tertiary);font-size:11px}
    /* 工具组：折叠时一行摘要；展开后成员缩进挂在子轨道上 */
    .fw-node.tool-group .fw-card{border-left-color:hsl(265,60%,52%)}
    .fw-node.tool-group.has-error .fw-card{border-left-color:var(--dsw-alias-state-error-primary)}
    .fw-group-members{margin:4px 0 4px 18px;padding-left:14px;border-left:2px solid var(--dsw-alias-border-l2);display:flex;flex-direction:column;gap:4px}
    .fw-group-members .fw-node .rail-dot,.fw-group-members .fw-node .rail-arrow{display:none}
    .fw-caret{display:inline-flex;transition:transform .15s ease;color:var(--dsw-alias-label-tertiary);font-size:10px;flex:none}
    .fw-caret.open{transform:rotate(90deg)}
    .fw-ghost .fw-card{border-style:dashed;background:transparent;cursor:default}
    .fw-ghost .rail-dot{background:var(--dsw-alias-state-business-primary);animation:fw-pulse 1.2s ease-in-out infinite}
    .fw-ghost-text{color:var(--dsw-alias-label-secondary);font-size:12.5px;display:inline-flex;align-items:center;gap:8px}
    .fw-back-bottom{position:fixed;right:28px;bottom:28px;z-index:20;display:inline-flex;align-items:center;gap:8px;padding:8px 16px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font-size:12.5px;cursor:pointer;box-shadow:var(--dsw-shadow-lv2);font-family:var(--dsw-font-family)}
    .fw-back-bottom:hover{border-color:var(--dsw-alias-border-l3)}
    .fw-back-bottom .nudge{background:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-label-primary-inverted,#fff);border-radius:999px;padding:0 8px;font-size:11px}
    .fw-empty{border:1px dashed var(--dsw-alias-border-l2);border-radius:12px;padding:36px 20px;text-align:center;color:var(--dsw-alias-label-secondary)}
    .fw-loading{padding:36px;text-align:center;color:var(--dsw-alias-label-secondary)}
    .fw-hint{color:var(--dsw-alias-state-error-primary);font-size:12.5px}
    /* 详情弹窗 */
    .fw-dlg-backdrop{position:fixed;inset:0;z-index:30;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:24px}
    .fw-dlg{background:var(--dsw-alias-bg-layer-2);border:1px solid var(--dsw-alias-border-l2);border-radius:14px;min-width:380px;max-width:760px;max-width:min(760px,92vw);max-height:84vh;overflow:auto;padding:18px;box-shadow:var(--dsw-shadow-lv3);color:var(--dsw-alias-label-primary);font-family:var(--dsw-font-family)}
    .fw-dlg h3{margin:0 0 12px;font-size:15px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
    .fw-dlg-sub{font-size:12px;color:var(--dsw-alias-label-secondary);font-weight:400;max-width:60%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .fw-dlg-meta{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
    .fw-dlg-text{white-space:pre-wrap;word-break:break-word;font-size:12.5px;line-height:1.6;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);padding:12px;max-height:50vh;overflow:auto}
    .fw-dlg-foot{display:flex;gap:8px;justify-content:flex-end;margin-top:14px}
    .fw-todo-list{display:flex;flex-direction:column;gap:3px;font-size:12.5px}
    .fw-todo-item{display:flex;gap:7px;align-items:baseline;color:var(--dsw-alias-label-secondary)}
    .fw-todo-item.completed{color:var(--dsw-alias-label-tertiary);text-decoration:line-through}
    .fw-todo-item.in_progress{color:var(--dsw-alias-label-primary)}
    .fw-todo-icon{flex:none;font-size:11px}
    /* 流程图 */
    .fw-chart-wrap{overflow-x:auto;min-width:0}
    .fw-chart{position:relative;margin:0 auto}
    .fw-chart-edges{position:absolute;left:0;top:0;pointer-events:none;overflow:visible}
    .fw-edge{fill:none;stroke:var(--dsw-alias-border-l3,rgba(128,128,128,.6));stroke-width:1.5}
    .fw-edge.spine{stroke:var(--dsw-alias-border-l3,rgba(128,128,128,.7))}
    .fw-edge.fork,.fw-edge.join,.fw-edge.fanfork,.fw-edge.fanjoin,.fw-edge.chain{stroke-width:1.8}
    .fw-edge.retry{stroke:hsl(20,85%,50%);stroke-dasharray:5 4}
    .fw-edge.attempt{stroke:var(--dsw-alias-state-error-primary);stroke-dasharray:5 4}
    .fw-edge.subagent{stroke:hsl(265,60%,52%);stroke-dasharray:5 4}
    .fw-edge.side,.fw-edge.compaction,.fw-edge.command,.fw-edge.workflow,.fw-edge.goal{stroke:var(--dsw-alias-label-tertiary);stroke-dasharray:5 4}
    .fc-node{position:absolute;display:flex;align-items:center;justify-content:center;cursor:pointer;user-select:none}
    .fc-box{min-width:0;padding:0 10px;border:1px solid var(--dsw-alias-border-l2);border-left-width:3px;border-radius:9px;background:var(--dsw-alias-bg-layer-1);justify-content:flex-start;gap:7px}
    .fc-box:hover{background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l3)}
    .fc-box .fw-line{font-size:12px}
    .fc-oval{border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:12px;gap:6px;padding:0 14px}
    .fc-diamond{clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);background:var(--dsw-alias-bg-layer-2);color:hsl(38,92%,40%);font-size:11.5px;font-weight:600;flex-direction:column;line-height:1.1;text-align:center;padding:0 18%;filter:drop-shadow(0 0 1px var(--dsw-alias-border-l3))}
    .fc-member{min-width:0;padding:0 8px;border:1px solid hsl(265,60%,52%);border-radius:7px;background:var(--dsw-alias-bg-layer-1);justify-content:flex-start;gap:6px;font-size:11.5px}
    .fc-member.error{border-color:var(--dsw-alias-state-error-primary)}
    .fc-member.running{border-style:dashed;animation:fw-pulse 1.2s ease-in-out infinite}
    .fc-side{min-width:0;padding:0 10px;border:1px dashed var(--dsw-alias-label-tertiary);border-radius:7px;background:transparent;color:var(--dsw-alias-label-secondary);font-size:11.5px;justify-content:flex-start;gap:6px}
    .fc-side.retry{border-color:hsl(20,85%,50%);color:hsl(20,85%,50%)}
    .fc-side.attempt{border-color:var(--dsw-alias-state-error-primary);color:var(--dsw-alias-state-error-primary)}
    .fc-node .fw-chip{font-size:10.5px;line-height:16px;padding:0 6px}
    .fc-ghost{border:1px dashed var(--dsw-alias-state-business-primary);border-radius:9px;color:var(--dsw-alias-label-secondary);font-size:12px;background:transparent;animation:fw-pulse 1.6s ease-in-out infinite}
    .fc-dot{width:7px;height:7px;border-radius:50%;flex:none}
    .fc-viewbtn.on{color:var(--dsw-alias-state-business-primary);border-color:var(--dsw-alias-state-business-primary);font-weight:600}
    .fw-lane{stroke:var(--dsw-alias-border-l1);stroke-dasharray:2 6;stroke-width:1}
    .fw-edge.fanfork,.fw-edge.fanjoin{stroke-width:1.8}
    .fw-crumbs{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
    .fc-member.has-child{font-weight:600}
    /* 工具栏吸顶：长图滚动时筛选/视图/刷新始终可达 */
    .fw-head{position:sticky;top:0;z-index:9;display:flex;flex-direction:column;gap:8px;padding:8px 0 10px;background:var(--dsw-alias-bg-layer-1);border-bottom:1px solid var(--dsw-alias-border-l1);margin:-8px 0 4px}
    /* 泳道列头 chips（画布正上方，与泳道同坐标系） */
    .fw-lanebar{position:relative;height:26px;margin:0 auto}
    .fw-lanebar-chip{position:absolute;transform:translateX(-50%);top:0;padding:1px 12px;border-radius:999px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-secondary);font-size:11px;white-space:nowrap}
    /* 上下文节点视觉降级：背景噪音退一步，主链更突出 */
    .fc-box.context{opacity:.72}
    .fc-box.context:hover{opacity:1}
    /* hover 微提升 */
    .fc-node{transition:transform .12s ease}
    .fc-node:hover{transform:translateY(-1px)}
    .fc-box:hover{box-shadow:var(--dsw-shadow-lv1,0 2px 8px rgba(0,0,0,.14))}
    /* 回合椭圆强化：开始=主色描边，结束=灰，带图标与耗时 */
    .fc-oval{font-weight:600;gap:6px;white-space:nowrap;overflow:hidden}
    .fc-oval.turn-start{border-color:var(--dsw-alias-state-business-primary);color:var(--dsw-alias-state-business-primary)}
    .fc-oval.turn-end{border-color:var(--dsw-alias-border-l3)}
    .fc-turn-icon{font-size:8px;opacity:.7}
    .fc-turn-dur{color:var(--dsw-alias-label-tertiary);font-size:11px;font-weight:400}
    </style>`

    // ── 节点渲染 ─────────────────────────────────────────────────────────────

    const STATUS_DOT = h('span', { className: 'dot' })

    function ConnectionStatus({ status, t }) {
      const cls = status === 'live' ? 'live' : status === 'error' ? 'error' : status === 'retry' ? 'retry' : ''
      const label = status === 'live' ? t('statusLive')
        : status === 'error' ? t('statusError')
        : status === 'retry' ? t('statusRetry')
        : status === 'static' ? t('statusStatic')
        : t('statusConnecting')
      return h('span', { className: 'fw-status ' + cls }, STATUS_DOT, label)
    }

    const KIND_CLASS = {
      user: 'user', context: 'context', assistant: 'assistant', tool: 'tool', todo: 'todo',
      approval: 'approval', retry: 'retry', compaction: 'compaction', attempt: 'attempt',
    }

    function nodeClass(node) {
      if (node.kind === 'tool') return 'fw-node tool ' + node.status + (node.status === 'running' ? ' running' : '')
      return 'fw-node ' + (KIND_CLASS[node.kind] || 'event')
    }

    /** 节点行内徽标：耗时 / 状态 / 用量 / 思考 / 中断。 */
    function NodeBadges({ node, t }) {
      const out = []
      if (node.kind === 'tool') {
        if (node.status === 'running') out.push(h('span', { key: 'r', className: 'fw-badge busy' }, t('runningBadge')))
        if (node.status === 'done' && node.durationMs !== undefined) out.push(h('span', { key: 'd', className: 'fw-badge ok' }, formatDuration(node.durationMs)))
        if (node.status === 'error') out.push(h('span', { key: 'e', className: 'fw-badge err' }, node.errorReason || node.errorName || 'error'))
      }
      if (node.kind === 'assistant') {
        if (node.reasoningChars) out.push(h('span', { key: 'th', className: 'fw-badge' }, t('thinkingBadge', { n: formatNum(node.reasoningChars) })))
        if (node.interrupted) out.push(h('span', { key: 'i', className: 'fw-badge err' }, t('interruptedBadge')))
        if (node.usage) out.push(h('span', { key: 'u', className: 'fw-badge' }, '↑' + formatNum(node.usage.input) + ' ↓' + formatNum(node.usage.output)))
      }
      if (node.kind === 'context' && (node.sourcePlugin || node.sourceKind)) out.push(h('span', { key: 'inj', className: 'fw-badge', title: [node.sourceKind, node.sourceForm, node.sourcePlugin].filter(Boolean).join(' · ') }, node.sourcePlugin || node.sourceKind))
      return out.length > 0 ? h('span', { className: 'fw-badges' }, ...out) : null
    }

    /** 节点的 chip 文案：工具显示工具名，其余显示类型名。 */
    function nodeChip(node, t) {
      if (node.kind === 'tool') return node.name || t('kindTool')
      const key = { user: 'kindUser', context: 'kindContext', assistant: 'kindAssistant', todo: 'kindTodo' }[node.kind]
      return key ? t(key) : null
    }

    /** 单行骨架节点。双击弹详情；回合边界是全宽 pill，不走卡片。 */
    function NodeView({ node, t, onDetail }) {
      if (node.kind === 'turn') {
        return h('div', { className: 'fw-turn' },
          h('span', { className: 'fw-turn-pill' },
            node.phase === 'start' ? t('turnStart', { n: node.turnNum }) : t('turnEnd', { n: node.turnNum }),
            node.reason && h('span', null, '· ' + node.reason),
            h('span', { className: 'fw-turn-time' }, formatClock(node.time))))
      }
      const chip = nodeChip(node, t)
      const line = nodeLine(node, t)
      const accent = node.kind === 'tool' && node.status !== 'error' ? toolColor(node.name) : undefined
      return h('div', { className: nodeClass(node) },
        h('span', { className: 'rail-arrow' }),
        h('span', { className: 'rail-dot', style: accent ? { background: accent } : undefined }),
        h('div', {
          className: 'fw-card', title: t('dblclickHint'),
          style: accent ? { borderLeftColor: accent } : undefined,
          onDoubleClick: () => onDetail(node),
        },
          h('div', { className: 'fw-card-head' },
            chip && h('span', { className: 'fw-chip' }, chip),
            line && h('span', { className: 'fw-line' + (line === t('emptyText') ? ' dim' : ''), title: line }, line),
            h(NodeBadges, { node, t }),
            h('span', { className: 'fw-time' }, formatClock(node.time)))))
    }

    /** 工具组：折叠一行（计数 + 名字 tally + 状态汇总），单击展开成员。 */
    function ToolGroup({ group, t, open, onToggle, onDetail }) {
      const members = group.members
      const running = members.filter((m) => m.status === 'running').length
      const failed = members.filter((m) => m.status === 'error').length
      const totalMs = members.reduce((sum, m) => sum + (m.durationMs || 0), 0)
      const accent = failed > 0 ? undefined : groupColor(group)
      return h('div', { className: 'fw-node tool-group' + (failed > 0 ? ' has-error' : '') + (running > 0 ? ' running' : '') },
        h('span', { className: 'rail-arrow' }),
        h('span', { className: 'rail-dot', style: { background: failed > 0 ? 'var(--dsw-alias-state-error-primary)' : accent } }),
        h('div', { className: 'fw-card', style: accent ? { borderLeftColor: accent } : undefined, onClick: onToggle },
          h('div', { className: 'fw-card-head' },
            h('span', { className: 'fw-caret' + (open ? ' open' : '') }, '▶'),
            h('span', { className: 'fw-chip' }, t('toolGroup', { n: members.length })),
            h('span', { className: 'fw-line', title: toolGroupLine(members) }, toolGroupLine(members)),
            h('span', { className: 'fw-badges' },
              running > 0 && h('span', { className: 'fw-badge busy' }, t('runningBadge') + ' ' + running),
              failed > 0 && h('span', { className: 'fw-badge err' }, '✕ ' + failed),
              running === 0 && totalMs > 0 && h('span', { className: 'fw-badge ok' }, formatDuration(totalMs))),
            h('span', { className: 'fw-time' }, formatClock(members[members.length - 1].time)))),
        open && h('div', { className: 'fw-group-members' },
          members.map((m) => h(NodeView, { key: m.id, node: m, t, onDetail }))))
    }

    // ── 流程图渲染 ───────────────────────────────────────────────────────────

    /** 图上的单个节点图形（椭圆/菱形/方框/组成员/旁路框）。 */
    function ChartNode({ p, open, turnDurations, t, onToggleGroup, onDetail }) {
      const item = p.item
      const isGroup = item.group === true
      const kind = isGroup ? 'tool-group' : item.kind
      const style = { left: p.x, top: p.y, width: p.w, height: p.h }
      const turnDurationMs = kind === 'turn' && item.phase === 'end' ? turnDurations?.get(item.turnNum) : undefined
      const common = { className: '', style, onDoubleClick: () => !isGroup && onDetail(item), title: t('dblclickHint') }

      if (p.shape === 'oval') {
        const isStart = item.phase === 'start'
        return h('div', { ...common, className: 'fc-node fc-oval ' + (isStart ? 'turn-start' : 'turn-end'), title: !isStart && item.reason ? item.reason : common.title },
          h('span', { className: 'fc-turn-icon' }, isStart ? '▶' : '■'),
          isStart ? t('turnStart', { n: item.turnNum }) : t('turnEnd', { n: item.turnNum }),
          !isStart && turnDurationMs !== undefined && h('span', { className: 'fc-turn-dur' }, formatDuration(turnDurationMs)))
      }
      if (p.shape === 'diamond') {
        return h('div', { ...common, className: 'fc-node fc-diamond' },
          item.phase === 'asked' ? t('approvalAsked') : t('approvalDecided'))
      }
      if (p.shape === 'member') {
        const hueColor = toolColor(item.name)
        const memberLine = item.childLabel || (item.name + (item.summary ? ' · ' + item.summary : ''))
        const err = item.status === 'error'
        return h('div', { ...common, className: 'fc-node fc-member' + (item.childId ? ' has-child' : '') + (err ? ' error' : item.status === 'running' ? ' running' : ''),
          style: { ...style, borderColor: err ? undefined : hueColor },
          title: item.childId ? t('drillHint') : memberLine },
          h('span', { className: 'fc-dot', style: { background: err ? 'var(--dsw-alias-state-error-primary)' : item.status === 'running' ? 'hsl(38,92%,45%)' : hueColor } }),
          h('span', { className: 'fw-line', title: item.childId ? t('drillHint') : memberLine }, memberLine),
          item.childId && h('span', { className: 'fw-badge' }, '›'),
          item.durationMs !== undefined && h('span', { className: 'fw-badge ok' }, formatDuration(item.durationMs)),
          err && h('span', { className: 'fw-badge err' }, '✕'))
      }
      if (p.shape === 'side') {
        return h('div', { ...common, className: 'fc-node fc-side ' + kind },
          h('span', { className: 'fw-line', title: nodeLine(item, t) }, nodeLine(item, t)))
      }
      // 脊柱方框：消息 / 待办 / 工具组（工具组按成员工具取色，子代理组紫色）
      const dotColor = isGroup ? groupColor(item)
        : kind === 'user' ? 'var(--dsw-alias-state-business-primary)'
        : kind === 'context' ? 'var(--dsw-alias-label-tertiary)'
        : kind === 'assistant' ? 'var(--dsw-alias-state-success-primary)'
        : kind === 'todo' ? 'hsl(175,65%,38%)' : 'hsl(265,60%,52%)'
      const line = isGroup ? toolGroupLine(item.members) : nodeLine(item, t)
      const badges = []
      if (isGroup) {
        const failed = item.members.filter((m) => m.status === 'error').length
        const running = item.members.filter((m) => m.status === 'running').length
        const totalMs = item.members.reduce((s, m) => s + (m.durationMs || 0), 0)
        if (failed > 0) badges.push(h('span', { key: 'f', className: 'fw-badge err' }, '✕ ' + failed))
        if (running > 0) badges.push(h('span', { key: 'r', className: 'fw-badge busy' }, t('runningBadge') + ' ' + running))
        if (running === 0 && totalMs > 0) badges.push(h('span', { key: 'd', className: 'fw-badge ok' }, formatDuration(totalMs)))
      } else if (kind === 'assistant') {
        if (item.reasoningChars) badges.push(h('span', { key: 'th', className: 'fw-badge' }, t('thinkingBadge', { n: formatNum(item.reasoningChars) })))
        if (item.usage) badges.push(h('span', { key: 'u', className: 'fw-badge' }, '↑' + formatNum(item.usage.input) + ' ↓' + formatNum(item.usage.output)))
        if (item.interrupted) badges.push(h('span', { key: 'i', className: 'fw-badge err' }, t('interruptedBadge')))
      }
      return h('div', {
        ...common,
        className: 'fc-node fc-box ' + (isGroup ? 'tool-group' : kind),
        style: { ...style, borderLeftColor: dotColor },
        onClick: isGroup ? () => onToggleGroup(item.id) : undefined,
      },
        h('span', { className: 'fc-dot', style: { background: dotColor } }),
        isGroup && h('span', { className: 'fw-caret' + (open ? ' open' : '') }, '▶'),
        h('span', { className: 'fw-chip' }, isGroup ? t('toolGroup', { n: item.members.length }) : (nodeChip(item, t) || kind)),
        line && h('span', { className: 'fw-line' + (line === t('emptyText') ? ' dim' : ''), title: line }, line),
        ...badges)
    }

    function ChartView({ items, openGroups, t, onToggleGroup, onDetail, showGhost, bottomRef }) {
      const { pos, edges, width, height } = useMemo(() => layoutFlow(items, openGroups), [items, openGroups])
      // 回合耗时：turn/start 与 turn/end 按回合数配对
      const turnDurations = useMemo(() => {
        const starts = new Map()
        const out = new Map()
        for (const item of items) {
          if (item.group === true || item.kind !== 'turn') continue
          if (item.phase === 'start') starts.set(item.turnNum, item.time)
          else if (item.phase === 'end' && starts.has(item.turnNum) && Number.isFinite(item.time)) {
            out.set(item.turnNum, Math.max(0, item.time - starts.get(item.turnNum)))
          }
        }
        return out
      }, [items])
      const ghostH = showGhost ? 54 : 0
      const totalH = height + ghostH
      // 幽灵节点接在最后一个脊柱节点下面
      const spineIds = [...pos.values()].filter((p) => p.shape !== 'side' && p.shape !== 'member')
      const lastSpine = spineIds.length > 0 ? spineIds[spineIds.length - 1] : null
      const ghostEdge = showGhost && lastSpine
        ? { x1: lastSpine.x + lastSpine.w / 2, y1: lastSpine.y + lastSpine.h, x2: CHART.spineX, y2: height + 6, kind: 'spine' }
        : null
      const lanes = [
        { x: CHART.laneCtxX, label: t('kindContext') },
        { x: CHART.laneUserX, label: t('kindUser') },
        { x: CHART.spineX, label: t('kindAssistant') },
        { x: CHART.laneToolX, label: t('kindTool') },
      ]
      return h('div', { className: 'fw-chart-wrap' },
        // 泳道列头：sticky，滚动长图时始终可见（与画布同宽同坐标系）
        h('div', { className: 'fw-lanebar', style: { width, minWidth: '100%' } },
          lanes.map((lane) => h('span', { key: lane.x, className: 'fw-lanebar-chip', style: { left: lane.x } }, lane.label))),
        h('div', { className: 'fw-chart', style: { width, height: totalH, minWidth: '100%' } },
          h('svg', { className: 'fw-chart-edges', width, height: totalH },
            h('defs', null,
              // context-stroke：箭头头自动跟随各边的 stroke（工具按名取色、委派紫色）
              h('marker', { id: 'fw-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 6.5, markerHeight: 6.5, orient: 'auto-start-reverse' },
                h('path', { d: 'M0,0 L10,5 L0,10 z', fill: 'context-stroke' }))),
            // 泳道引导线
            lanes.map((lane) => h('line', { key: 'lane' + lane.x, x1: lane.x, y1: CHART.padTop - 12, x2: lane.x, y2: height, className: 'fw-lane' })),
            edges.map((e, i) => h('path', {
              key: i, d: edgePath(e), className: 'fw-edge ' + e.kind,
              style: e.hue !== undefined ? { stroke: `hsl(${e.hue},62%,46%)` } : undefined,
              markerEnd: 'url(#fw-arrow)',
            })),
            ghostEdge && h('path', { d: edgePath(ghostEdge), className: 'fw-edge spine', strokeDasharray: '4 4', markerEnd: 'url(#fw-arrow)' })),
          [...pos.values()].map((p) => h(ChartNode, { key: p.item.id, p, open: p.item.group === true && openGroups.has(p.item.id), turnDurations, t, onToggleGroup, onDetail })),
          showGhost && h('div', {
            className: 'fc-node fc-ghost',
            style: { left: CHART.spineX - CHART.boxW / 2, top: height + 6, width: CHART.boxW, height: 34 },
          }, t('ghostWorking')),
          h('div', { ref: bottomRef, style: { position: 'absolute', top: totalH - 1, height: '1px', width: '1px' } })))
    }

    // ── 详情弹窗（双击）──────────────────────────────────────────────────────

    function DetailModal({ node, t, fullText, loadingFull, onLoadFull, onClose }) {
      if (!node) return null
      const text = fullText !== undefined ? fullText : node.text
      const chars = node.chars
      const truncated = typeof text === 'string' && typeof chars === 'number' && chars > text.length
      const meta = []
      meta.push(h('span', { key: 'seq', className: 'fw-badge' }, t('metaSeq', { seq: node.seq })))
      meta.push(h('span', { key: 'time', className: 'fw-badge' }, formatDateTime(node.time)))
      if (node.turn !== undefined) meta.push(h('span', { key: 'turn', className: 'fw-badge' }, 'turn ' + node.turn + (node.step !== undefined ? ' · step ' + node.step : '')))
      if (node.kind === 'tool') {
        meta.push(h('span', { key: 'st', className: 'fw-badge ' + (node.status === 'error' ? 'err' : node.status === 'done' ? 'ok' : 'busy') },
          t('metaStatus', { s: node.status === 'error' ? t('statusError') : node.status === 'done' ? t('statusDone') : t('statusRunning') })))
        if (node.durationMs !== undefined) meta.push(h('span', { key: 'd', className: 'fw-badge' }, t('metaDuration', { d: formatDuration(node.durationMs) })))
        if (node.callId) meta.push(h('span', { key: 'c', className: 'fw-badge', title: node.callId }, t('metaCallId', { id: String(node.callId).slice(-8) })))
      }
      if (node.kind === 'assistant' && node.usage) {
        meta.push(h('span', { key: 'u', className: 'fw-badge' }, t('metaUsage', {
          input: formatNum(node.usage.input), output: formatNum(node.usage.output),
          cache: node.usage.cacheRead ? ' / cache ' + formatNum(node.usage.cacheRead) : '',
        })))
      }
      return h('div', { className: 'fw-dlg-backdrop', onClick: onClose },
        h('div', { className: 'fw-dlg', onClick: (e) => e.stopPropagation() },
          h('h3', null, t('detailTitle'),
            h('span', { className: 'fw-dlg-sub' }, node.childLabel || node.name || nodeLine(node, t)),
            h(NodeBadges, { node, t })),
          h('div', { className: 'fw-dlg-meta' }, ...meta),
          node.kind === 'todo' && Array.isArray(node.items) && h('div', { className: 'fw-dlg-text', style: { border: 'none', padding: 0, background: 'transparent' } },
            h('div', { className: 'fw-todo-list' },
              node.items.map((item, i) => h('div', { key: i, className: 'fw-todo-item ' + item.s },
                h('span', { className: 'fw-todo-icon' }, item.s === 'completed' ? '☑' : item.s === 'in_progress' ? '◐' : '☐'),
                h('span', null, item.c))))),
          node.kind !== 'todo' && h('div', { className: 'fw-dlg-text' },
            text || node.summary || t('emptyText')),
          h('div', { className: 'fw-dlg-foot' },
            truncated && h('button', { className: 'fw-btn', disabled: loadingFull, onClick: () => onLoadFull(node) },
              loadingFull ? t('loading') : t('loadFull') + ` (${formatNum(chars)})`),
            h('button', { className: 'fw-btn', onClick: onClose }, t('close')))))
    }

    // ── 页面 ────────────────────────────────────────────────────────────────

    const CATEGORIES = ['user', 'context', 'assistant', 'tool', 'todo', 'event']

    function FlowPage({ t, fixedSessionId }) {
      useEffect(ensureStyles, [])
      const [nodes, setNodes] = useState([])
      const [busy, setBusy] = useState(false)
      const [status, setStatus] = useState('idle')
      const [error, setError] = useState(null)
      const [hidden, setHidden] = useState(() => new Set())
      const [viewMode, setViewMode] = useState('chart')
      // 工具组默认展开（fork-join 分支直接可见）；状态只记用户手动折叠的组
      const [closedGroups, setClosedGroups] = useState(() => new Set())
      const [stick, setStick] = useState(true)
      const [newCount, setNewCount] = useState(0)
      const [detail, setDetail] = useState(null)
      const [path, setPath] = useState([]) // 下钻栈：[{ id, label }]，栈顶是当前显示的子代理会话
      const [detailFull, setDetailFull] = useState(undefined)
      const [fullLoading, setFullLoading] = useState(false)
      const bottomRef = useRef(null)
      const stickRef = useRef(true)
      const seqRef = useRef(-1)
      const sourceRef = useRef(null)

      // 下钻：栈顶优先；切换会话（fixedSessionId 变化）时清空下钻栈
      const currentId = path.length > 0 ? path[path.length - 1].id : fixedSessionId
      useEffect(() => { setPath([]) }, [fixedSessionId])

      const openNode = (node) => {
        if (node && node.childId) {
          setPath((p) => [...p, { id: node.childId, label: node.childLabel || node.summary || node.name || node.childId }])
          return
        }
        setDetail(node || null)
        setDetailFull(undefined)
      }
      const popPath = () => setPath((p) => p.slice(0, -1))

      // Escape 返回上一层
      useEffect(() => {
        if (path.length === 0 || typeof window === 'undefined') return undefined
        const onKey = (e) => { if (e.key === 'Escape') popPath() }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
      }, [path.length])

      const applyIncoming = (ev) => {
        if (ev && typeof ev.seq === 'number') {
          if (ev.seq <= seqRef.current) return
          seqRef.current = ev.seq
        }
        if (ev && ev.k === 'turn') setBusy(ev.phase === 'start')
        setNodes((prev) => applyEventToNodes(prev, ev))
        if (!stickRef.current) setNewCount((n) => n + 1)
      }

      const openStream = (id) => {
        try { if (sourceRef.current) sourceRef.current.close() } catch {}
        if (typeof EventSource === 'undefined') { setStatus('error'); return }
        const es = new EventSource(API + '/stream?session=' + encodeURIComponent(id) + '&after=' + (seqRef.current + 1))
        sourceRef.current = es
        es.onopen = () => setStatus('live')
        es.onmessage = (msg) => { try { applyIncoming(JSON.parse(msg.data)) } catch {} }
        // EventSource 自动重连；readyState 2 (CLOSED) 说明服务端 404 等硬失败
        es.onerror = () => setStatus(es.readyState === 2 ? 'error' : 'retry')
      }

      const loadAll = (id) => {
        setStatus('connecting')
        setError(null)
        getJson(API + '/flow?session=' + encodeURIComponent(id))
          .then((d) => {
            const reduced = reduceEvents(d.events)
            seqRef.current = reduced.maxSeq
            setNodes(reduced.nodes)
            setBusy(d.busy)
            setClosedGroups(new Set())
            setDetail(null)
            // 磁盘历史会话（static）没有直播流；内存活跃会话开 SSE
            if (d.static) setStatus('static')
            else openStream(id)
          })
          .catch((e) => { setError(e.message); setStatus('error') })
      }

      useEffect(() => {
        if (!currentId) return undefined
        seqRef.current = -1
        setNodes([])
        setBusy(false)
        setDetail(null)
        loadAll(currentId)
        return () => { try { if (sourceRef.current) sourceRef.current.close() } catch {} }
      }, [currentId])

      // 跟随滚动：停留在底部时新节点落地自动滚到底；离开底部则不打扰。
      // 用底部锚点的视口坐标判断「是否在底部」，与具体哪个祖先滚动容器无关。
      useEffect(() => {
        if (stickRef.current && bottomRef.current) {
          try { bottomRef.current.scrollIntoView({ block: 'end' }) } catch {}
        }
      }, [nodes, busy])

      useEffect(() => {
        const onScroll = () => {
          const el = bottomRef.current
          if (!el) return
          const rect = el.getBoundingClientRect()
          const atBottom = rect.bottom <= (typeof window !== 'undefined' ? window.innerHeight : 800) + 100
          stickRef.current = atBottom
          setStick(atBottom)
          if (atBottom) setNewCount(0)
        }
        if (typeof window !== 'undefined') {
          window.addEventListener('scroll', onScroll, true)
          return () => window.removeEventListener('scroll', onScroll, true)
        }
        return undefined
      }, [])

      const jumpToBottom = () => {
        stickRef.current = true
        setStick(true)
        setNewCount(0)
        try { bottomRef.current && bottomRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' }) } catch {}
      }

      const toggleGroup = (id) => setClosedGroups((prev) => {
        const next = new Set(prev)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        return next
      })

      const openDetail = (node) => { setDetail(node); setDetailFull(undefined) }

      // 详情里按需补全文：user/assistant/context 用自身 seq，tool 用 result 的 seq
      const loadFull = (node) => {
        const seq = node.kind === 'tool' ? node.resultSeq : node.seq
        if (typeof seq !== 'number' || !currentId) return
        setFullLoading(true)
        getJson(API + '/event?session=' + encodeURIComponent(currentId) + '&seq=' + seq)
          .then((full) => {
            setDetailFull(full.text)
            setNodes((prev) => prev.map((n) => (n.id === node.id ? { ...n, text: full.text, chars: full.chars } : n)))
            setDetail((cur) => (cur && cur.id === node.id ? { ...cur, text: full.text, chars: full.chars } : cur))
          })
          .catch(() => {})
          .finally(() => setFullLoading(false))
      }

      // 名册配对：委派调用节点拿到 childId/childLabel（双击下钻的依据）
      const displayNodes = useMemo(() => attachChildren(nodes), [nodes])
      const visible = useMemo(() => (hidden.size === 0 ? displayNodes : displayNodes.filter((n) => !hidden.has(nodeCategory(n)))), [displayNodes, hidden])
      const items = useMemo(() => groupNodes(visible), [visible])
      // 默认全部展开：openGroups = 所有组 − 用户手动折叠的组
      const openGroups = useMemo(() => new Set(items.filter((i) => i.group === true && !closedGroups.has(i.id)).map((i) => i.id)), [items, closedGroups])

      const categoryCounts = useMemo(() => {
        const counts = new Map()
        for (const n of nodes) {
          const c = nodeCategory(n)
          counts.set(c, (counts.get(c) || 0) + 1)
        }
        return CATEGORIES.filter((c) => counts.has(c)).map((c) => ({ cat: c, count: counts.get(c) }))
      }, [nodes])

      const toggleFilter = (cat) => setHidden((prev) => {
        const next = new Set(prev)
        if (next.has(cat)) next.delete(cat)
        else next.add(cat)
        return next
      })

      const lastNode = visible.length > 0 ? visible[visible.length - 1] : null
      const showGhost = busy && !(lastNode && lastNode.kind === 'tool' && lastNode.status === 'running')

      return h('div', { className: 'fw-page' },
        h('div', { className: 'fw-head' },
          h('div', { className: 'fw-toolbar' },
            h(ConnectionStatus, { status, t }),
            h('span', { className: 'fw-stats' }, t('nodesCount', { n: visible.length })),
            busy && h('span', { className: 'fw-badge busy' }, t('busyTag')),
            h('span', { className: 'fw-spacer' }),
            h('span', { className: 'fw-filters' },
              h('button', { className: 'fw-filterbtn fc-viewbtn' + (viewMode === 'chart' ? ' on' : ''), onClick: () => setViewMode('chart') }, t('viewChart')),
              h('button', { className: 'fw-filterbtn fc-viewbtn' + (viewMode === 'list' ? ' on' : ''), onClick: () => setViewMode('list') }, t('viewList'))),
            h('button', { className: 'fw-btn', onClick: () => currentId && loadAll(currentId), title: t('refresh') }, t('refresh'))),
          categoryCounts.length > 0 && h('div', { className: 'fw-toolbar' },
            h('span', { className: 'fw-label' }, t('filterLabel')),
            h('span', { className: 'fw-filters' + (hidden.size > 0 ? ' filtering' : '') },
              categoryCounts.map(({ cat, count }) =>
                h('button', {
                  key: cat,
                  className: 'fw-filterbtn' + (hidden.has(cat) ? '' : ' on'),
                  onClick: () => toggleFilter(cat),
                }, t('kind' + cat[0].toUpperCase() + cat.slice(1)), h('span', { className: 'fw-filtercount' }, count)))))),
        error && h('div', { className: 'fw-hint' }, t('loadFailed') + ': ' + error),
        path.length > 0 && h('div', { className: 'fw-crumbs' },
          h('button', { className: 'fw-btn', onClick: popPath }, '← ' + t('backToMain')),
          h('span', { className: 'fw-label' }, [t('title'), ...path.map((p) => p.label)].join(' / '))),
        !fixedSessionId && h('div', { className: 'fw-empty' }, t('pickSession')),
        fixedSessionId && status === 'connecting' && nodes.length === 0 && h('div', { className: 'fw-loading' }, t('loading')),
        fixedSessionId && nodes.length === 0 && status !== 'connecting' && !error && h('div', { className: 'fw-empty' }, t('emptyFlow')),
        fixedSessionId && (viewMode === 'chart'
          ? h(ChartView, { items, openGroups, t, onToggleGroup: toggleGroup, onDetail: openNode, showGhost, bottomRef })
          : h('div', { className: 'fw-list' },
              items.map((item) => item.group === true
                ? h(ToolGroup, { key: item.id, group: item, t, open: openGroups.has(item.id), onToggle: () => toggleGroup(item.id), onDetail: openNode })
                : h(NodeView, { key: item.id, node: item, t, onDetail: openNode })),
              showGhost && h('div', { className: 'fw-node ghost fw-ghost', key: 'ghost' },
                h('span', { className: 'rail-dot' }),
                h('div', { className: 'fw-card' }, h('span', { className: 'fw-ghost-text' }, t('ghostWorking')))),
              h('div', { key: 'bottom', ref: bottomRef, style: { height: '1px' } }))),
        !stick && h('button', { className: 'fw-back-bottom', onClick: jumpToBottom },
          '↓ ' + t('backToBottom'),
          newCount > 0 && h('span', { className: 'nudge' }, t('newNodes', { n: newCount }))),
        detail && h(DetailModal, { node: detail, t, fullText: detailFull, loadingFull: fullLoading, onLoadFull: loadFull, onClose: () => setDetail(null) }))
    }

    // ── Plugin plane contract ────────────────────────────────────────────────

    const CLIENT_NAME = '@weibaohui/dsh-flow'

    module.exports = {
      name: CLIENT_NAME,
      inject: ['slots', 'locale'],
      __internals: { NS, ZH, EN, applyEventToNodes, reduceEvents, nodeCategory, nodeLine, groupNodes, toolGroupLine, layoutFlow, edgePath, isDelegationTool, isDelegationGroup, attachChildren, toolHue, toolColor, groupColor, estTextWidth, nodeWidth, memberWidth, laneXFor, CHART, formatDuration, formatClock },
      __boot(container, opts = {}) {
        ensureStyles()
        const t = opts.t || ((key, vars) => {
          let out = EN[key] ?? key
          if (vars) for (const [k, v] of Object.entries(vars)) out = out.split('{' + k + '}').join(String(v))
          return out
        })
        const root = require('react-dom/client').createRoot(container)
        root.render(h(FlowPage, { t }))
        return root
      },
      apply(ctx) {
        let t = (key, vars) => {
          let out = EN[key] ?? key
          if (vars) for (const [k, v] of Object.entries(vars)) out = out.split('{' + k + '}').join(String(v))
          return out
        }
        try {
          if (ctx.locale && typeof ctx.locale.register === 'function') {
            ctx.locale.register(NS, 'zh', ZH)
            ctx.locale.register(NS, 'en', EN)
            const bound = typeof ctx.locale.bind === 'function' ? ctx.locale.bind(NS) : null
            if (bound) t = (key, vars) => {
              let out = bound(key) || key
              if (vars) for (const [k, v] of Object.entries(vars)) out = out.split('{' + k + '}').join(String(v))
              return out
            }
          }
        } catch (e) { try { console.error('[dsh-flow] locale init:', e) } catch {} }
        // 会话视图标签：order 15 排在 Chat(0)/Trajectory(10) 之后、Context(20) 之前
        ctx.effect(() => {
          try {
            ctx.slots.inject('conversation.view', () => ctx.slots.register({
              name: 'conversation.view',
              id: CLIENT_NAME,
              order: 15,
              locale: NS,
              label: () => t('title'),
            }, function FlowViewSlot(props) {
              return h(FlowPage, { t, fixedSessionId: props && props.sessionId })
            }))
          } catch (e) { (globalThis.__fwErrors = globalThis.__fwErrors || []).push('conversation.view:' + (e && e.message)); throw e }
        }, 'dsh-flow: conversation view tab')
      },
    }

    return module.exports
  }
})
