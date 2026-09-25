import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const host = require('../src/index.js')
const client = require('../client/index.js')
const { mapEvent, blocksText, truncate, summarizeToolArguments, sessionBusy, projectFlow, decodeSessionLog, diskEventsOf } = host.__internals
const { applyEventToNodes, reduceEvents, nodeCategory, formatDuration, groupNodes, nodeLine, toolGroupLine, layoutFlow, edgePath, isDelegationTool, isDelegationGroup, attachChildren, laneXFor, toolHue, toolColor, groupColor, CHART } = client.__internals
const tzh = (key, vars) => {
  let out = client.__internals.ZH[key] ?? key
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split('{' + k + '}').join(String(v))
  return out
}

// ── 样例事件（与 dsh-session 日志形状一致的最小集）────────────────────────

const ev = (seq, type, data) => ({ seq, time: 1700000000000 + seq * 100, type, data })
const SAMPLE = [
  ev(0, 'turn/start', { turn: 1 }),
  ev(1, 'user/message', { turn: 1, content: [{ type: 'text', text: '帮我看下仓库结构' }], source: { kind: 'user' } }),
  ev(2, 'assistant/message', {
    turn: 1, step: 1,
    message: { role: 'assistant', content: [{ type: 'reasoning', text: '先想想' }, { type: 'text', text: '好的，我来看一下。' }] },
    usage: { inputTokens: 120, outputTokens: 30 },
  }),
  ev(3, 'tool/call', { turn: 1, step: 1, callId: 'c1', name: 'Bash', arguments: '{"command":"ls -la","timeout":120000}' }),
  ev(4, 'tool/result', { turn: 1, step: 1, message: { role: 'tool', toolCallId: 'c1', content: [{ type: 'tool-result', content: [{ type: 'text', text: 'total 3 files' }] }] } }),
  ev(5, 'assistant/message', { turn: 1, step: 2, message: { role: 'assistant', content: [{ type: 'text', text: '仓库有 3 个文件。' }] }, usage: { inputTokens: 200, outputTokens: 12 } }),
  ev(6, 'turn/end', { turn: 1, reason: { kind: 'completed' } }),
]

// ── 宿主：纯映射 ─────────────────────────────────────────────────────────

test('blocksText extracts text from known block shapes', () => {
  assert.equal(blocksText([{ type: 'text', text: 'a' }, { type: 'reasoning', text: 'b' }]), 'a\nb')
  assert.equal(blocksText([{ type: 'tool-result', content: [{ type: 'text', text: 'out' }] }]), 'out')
  assert.equal(blocksText([{ type: 'image', url: 'x' }]), '')
  assert.equal(blocksText(undefined), '')
})

test('truncate keeps full text under cap and reports real length over cap', () => {
  assert.deepEqual(truncate('abc'), { text: 'abc', chars: 3 })
  const long = 'x'.repeat(500)
  const r = truncate(long)
  assert.equal(r.chars, 500)
  assert.equal(r.text.length, 401) // 400 + …
  assert.ok(r.text.endsWith('…'))
})

test('summarizeToolArguments picks priority keys and survives broken JSON', () => {
  assert.equal(summarizeToolArguments('{"command":"ls -la","timeout":1}'), 'command: ls -la')
  assert.equal(summarizeToolArguments('{"file_path":"/tmp/a.ts"}'), 'file_path: /tmp/a.ts')
  assert.equal(summarizeToolArguments('{"foo":1}'), '{"foo":1}')
  assert.equal(summarizeToolArguments('{"command":"' + 'y'.repeat(200) + '"}').length, 9 + 120 + 1)
  assert.equal(summarizeToolArguments('{"command": "broken'), '{"command": "broken')
  assert.equal(summarizeToolArguments(''), '')
  assert.equal(summarizeToolArguments(undefined), '')
  // todo 整表参数给完成度而不是原始 JSON
  assert.equal(summarizeToolArguments('{"todos":[{"content":"a","status":"completed"},{"content":"b","status":"pending"}]}'), 'todos: 1/2 项')
})

test('mapEvent maps turn boundaries with reason kind', () => {
  assert.deepEqual(mapEvent(SAMPLE[0]), { seq: 0, time: SAMPLE[0].time, turn: 1, step: undefined, k: 'turn', phase: 'start' })
  const end = mapEvent(SAMPLE[6])
  assert.equal(end.k, 'turn')
  assert.equal(end.phase, 'end')
  assert.equal(end.reason, 'completed')
})

test('mapEvent maps user message and detects injected source', () => {
  const user = mapEvent(SAMPLE[1])
  assert.equal(user.k, 'user')
  assert.equal(user.text, '帮我看下仓库结构')
  assert.equal(user.injected, false)
  const injected = mapEvent(ev(9, 'user/message', { content: [{ type: 'text', text: 'notice' }], source: { kind: 'plugin', plugin: '@weibaohui/context-razor', form: 'notice' } }))
  assert.equal(injected.injected, true)
  assert.equal(injected.sourcePlugin, '@weibaohui/context-razor')
})

test('mapEvent maps assistant message with usage/reasoning and strips empties', () => {
  const a = mapEvent(SAMPLE[2])
  assert.equal(a.k, 'assistant')
  assert.equal(a.text, '好的，我来看一下。')
  assert.equal(a.reasoningChars, 3)
  assert.deepEqual(a.usage, { input: 120, output: 30, cacheRead: undefined })
  const noReasoning = mapEvent(SAMPLE[5])
  assert.equal(noReasoning.reasoningChars, undefined)
})

test('mapEvent maps tool call/result pair; result ok comes from isError', () => {
  const call = mapEvent(SAMPLE[3])
  assert.equal(call.k, 'tool-call')
  assert.equal(call.name, 'Bash')
  assert.equal(call.summary, 'command: ls -la')
  const result = mapEvent(SAMPLE[4])
  assert.equal(result.k, 'tool-result')
  assert.equal(result.callId, 'c1')
  assert.equal(result.ok, true)
  assert.equal(result.text, 'total 3 files')
  const failed = mapEvent(ev(10, 'tool/result', {
    message: { role: 'tool', toolCallId: 'c2', isError: true, content: [{ type: 'text', text: 'boom' }] },
    error: { name: 'Error', code: 'ENOENT', reason: '文件不存在' },
  }))
  assert.equal(failed.ok, false)
  assert.equal(failed.errorReason, '文件不存在')
  // callId 兼容 source.callId 形状
  const legacy = mapEvent(ev(11, 'tool/result', { message: { role: 'tool', source: { callId: 'c9' }, content: [] } }))
  assert.equal(legacy.callId, 'c9')
})

test('mapEvent maps todo/approval/retry/compaction and skips background events', () => {
  const todo = mapEvent(ev(1, 'todo/write', { todos: [{ content: '读代码', status: 'completed' }, { content: '写代码', status: 'in_progress' }] }))
  assert.equal(todo.k, 'todo')
  assert.equal(todo.done, 1)
  assert.equal(todo.total, 2)
  assert.equal(todo.items[1].s, 'in_progress')

  assert.equal(mapEvent(ev(2, 'approval/asked', { id: 'a1', toolName: 'Bash' })).summary, 'Bash')
  assert.equal(mapEvent(ev(3, 'llm/retry', { reason: 'server_error' })).k, 'retry')
  const prune = mapEvent(ev(4, 'compaction/prune', { shadowedSeqs: [1, 2, 3], shadowedTokenCount: 456 }))
  assert.equal(prune.phase, 'prune')
  assert.equal(prune.prunedNodes, 3)
  assert.equal(prune.prunedTokens, 456)

  assert.equal(mapEvent(ev(5, 'request/header', { header: {} })), null)
  assert.equal(mapEvent(ev(6, 'system/message', { message: {} })), null)
  assert.equal(mapEvent(null), null)
})

test('mapEvent full mode disables truncation', () => {
  const long = 'z'.repeat(500)
  const event = ev(1, 'user/message', { content: [{ type: 'text', text: long }], source: { kind: 'user' } })
  assert.equal(mapEvent(event).chars, 500)
  assert.equal(mapEvent(event).text.length, 401)
  assert.equal(mapEvent(event, { full: true }).text.length, 500)
})

test('sessionBusy detects an open turn bracket; projectFlow skips null mappings', () => {
  const busy = { events: [ev(0, 'turn/start', { turn: 1 })] }
  const idle = { events: SAMPLE }
  assert.equal(sessionBusy(busy), true)
  assert.equal(sessionBusy(idle), false)
  const mixed = [...SAMPLE, ev(7, 'request/header', { header: {} })]
  assert.equal(projectFlow(mixed).length, SAMPLE.length)
})

// ── 宿主：磁盘会话日志（子代理下钻兜底）──────────────────────────────────

test('mapEvent maps subagent/catalog with childId and label', () => {
  const cat = mapEvent(ev(9, 'subagent/catalog', { version: 0, childId: 'child-9', childCreatedAt: 1, mode: 'continuable', label: '校对 block-01' }))
  assert.equal(cat.k, 'subagent')
  assert.equal(cat.childId, 'child-9')
  assert.equal(cat.summary, '校对 block-01')
  assert.equal(cat.mode, 'continuable')
  // descriptor 的 label 是顶层字段
  const desc = mapEvent(ev(10, 'subagent/descriptor', { version: 3, mode: 'continuable', provider: 'spawn', label: 'Maps the monorepo structure' }))
  assert.equal(desc.summary, 'Maps the monorepo structure')
})

test('decodeSessionLog decodes multi-frame zstd and skips torn tails', () => {
  const { zstdCompressSync } = require('node:zlib')
  const frame1 = zstdCompressSync(Buffer.from('{"type":"session","version":4,"id":"x"}\n' + JSON.stringify(ev(0, 'turn/start', { turn: 1 })) + '\n'))
  const frame2 = zstdCompressSync(Buffer.from(JSON.stringify(ev(1, 'user/message', { content: [{ type: 'text', text: 'hi' }], source: { kind: 'user' } })) + '\n'))
  const torn = Buffer.from([0x28, 0xb5, 0x2f, 0xfd, 0x01, 0x02]) // 坏帧
  const events = decodeSessionLog(Buffer.concat([frame1, torn, frame2]))
  assert.equal(events.length, 2)
  assert.equal(events[0].type, 'turn/start')
  assert.equal(events[1].type, 'user/message')
  assert.equal(decodeSessionLog(Buffer.alloc(0)).length, 0)
})

test('diskEventsOf reads a session from a fixture DSH_HOME and rejects traversal', () => {
  const { zstdCompressSync } = require('node:zlib')
  const { mkdtempSync, mkdirSync, writeFileSync } = require('node:fs')
  const { join } = require('node:path')
  const { tmpdir } = require('node:os')
  const home = mkdtempSync(join(tmpdir(), 'dsh-flow-test-'))
  const dir = join(home, 'sessions', '--ws--', 'child-xyz')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'session.v4.jsonl.zstd'), zstdCompressSync(Buffer.from(JSON.stringify(ev(0, 'turn/start', { turn: 1 })) + '\n')))
  const old = process.env.DSH_HOME
  process.env.DSH_HOME = home
  try {
    const events = diskEventsOf('child-xyz')
    assert.equal(events.length, 1)
    assert.equal(events[0].type, 'turn/start')
    assert.equal(diskEventsOf('not-here'), null)
    assert.equal(diskEventsOf('../..'), null)
    assert.equal(diskEventsOf(''), null)
  } finally {
    if (old === undefined) delete process.env.DSH_HOME
    else process.env.DSH_HOME = old
  }
})

// ── 客户端：节点流构建 ───────────────────────────────────────────────────

test('applyEventToNodes merges tool-result into its call node with duration', () => {
  const mapped = SAMPLE.map((e) => mapEvent(e)).filter(Boolean)
  let nodes = []
  for (const m of mapped) nodes = applyEventToNodes(nodes, m)
  // 7 个事件 → 6 个节点（result 并入 call）
  assert.equal(nodes.length, 6)
  const tool = nodes.find((n) => n.kind === 'tool')
  assert.equal(tool.status, 'done')
  assert.equal(tool.text, 'total 3 files')
  assert.equal(tool.durationMs, 100)
  assert.equal(tool.resultSeq, 4)
  // 重复补丁幂等
  assert.equal(applyEventToNodes(nodes, mapped[4]), nodes)
})

test('applyEventToNodes keeps orphan results and marks errors', () => {
  const orphan = mapEvent(ev(3, 'tool/result', { message: { role: 'tool', toolCallId: 'cx', isError: true, content: [{ type: 'text', text: 'bad' }] } }))
  const nodes = applyEventToNodes([], orphan)
  assert.equal(nodes.length, 1)
  assert.equal(nodes[0].status, 'error')
  assert.equal(nodes[0].orphan, true)
})

test('injected user messages become kind context, real input stays user', () => {
  const real = applyEventToNodes([], mapEvent(ev(1, 'user/message', { content: [{ type: 'text', text: 'hi' }], source: { kind: 'user' } })))
  assert.equal(real[0].kind, 'user')
  const reminder = applyEventToNodes([], mapEvent(ev(2, 'user/message', { content: [{ type: 'text', text: '<system-reminder>' }], source: { kind: 'system', form: 'reminder' } })))
  assert.equal(reminder[0].kind, 'context')
  assert.equal(nodeCategory(reminder[0]), 'context')
  assert.equal(nodeLine(reminder[0], tzh), '<system-reminder>')
})

test('reduceEvents derives busy from turn brackets and tracks maxSeq', () => {
  const mapped = SAMPLE.map((e) => mapEvent(e)).filter(Boolean)
  const done = reduceEvents(mapped)
  assert.equal(done.busy, false)
  assert.equal(done.maxSeq, 6)
  assert.equal(done.nodes.length, 6)
  const open = reduceEvents(mapped.slice(0, 3))
  assert.equal(open.busy, true)
})

test('nodeCategory buckets into the five filter chips', () => {
  assert.equal(nodeCategory({ kind: 'user' }), 'user')
  assert.equal(nodeCategory({ kind: 'assistant' }), 'assistant')
  assert.equal(nodeCategory({ kind: 'tool' }), 'tool')
  assert.equal(nodeCategory({ kind: 'todo' }), 'todo')
  assert.equal(nodeCategory({ kind: 'turn' }), 'event')
  assert.equal(nodeCategory({ kind: 'approval' }), 'event')
  assert.equal(nodeCategory({ kind: 'attempt' }), 'event')
})

test('formatDuration scales ms → s → min', () => {
  assert.equal(formatDuration(326), '326 ms')
  assert.equal(formatDuration(4200), '4.2 s')
  assert.equal(formatDuration(65000), '1 min 5 s')
  assert.equal(formatDuration(undefined), '')
})

// ── 客户端：骨架折叠与单行摘要 ───────────────────────────────────────────

const toolNode = (id, name, status = 'done') => ({ id: 's' + id, seq: id, kind: 'tool', name, status, summary: name + ' 摘要' })

test('groupNodes folds consecutive tool nodes into one group', () => {
  const user = { id: 's1', seq: 1, kind: 'user', text: 'hi' }
  const nodes = [user, toolNode(2, 'read'), toolNode(3, 'write'), toolNode(4, 'read'), { id: 's5', seq: 5, kind: 'assistant', text: 'done' }, toolNode(6, 'bash')]
  const grouped = groupNodes(nodes)
  assert.equal(grouped.length, 4)
  assert.equal(grouped[0], user)
  assert.equal(grouped[1].group, true)
  assert.equal(grouped[1].members.length, 3)
  assert.equal(grouped[1].id, 'gs2')
  assert.equal(grouped[3].group, true)
  assert.equal(grouped[3].members.length, 1)
  // 空输入与非工具序列原样通过
  assert.deepEqual(groupNodes([]), [])
  assert.equal(groupNodes([user]).length, 1)
})

test('groupNodes keeps parallel spawn calls in one group across catalog events', () => {
  const cat = (seq, childId) => ({ id: 's' + seq, seq, kind: 'subagent', childId, summary: 'child' })
  const nodes = [toolNode(1, 'spawn_teammate'), cat(2, 'c1'), toolNode(3, 'spawn_teammate'), cat(4, 'c2'), toolNode(5, 'spawn_teammate'), cat(6, 'c3'), { id: 's7', seq: 7, kind: 'assistant', text: 'done' }]
  const grouped = groupNodes(nodes)
  // 三个 spawn 折进同一组；名册补在组后、助手前
  assert.equal(grouped[0].group, true)
  assert.equal(grouped[0].members.length, 3)
  assert.equal(grouped[1].childId, 'c1')
  assert.equal(grouped[3].childId, 'c3')
  assert.equal(grouped[4].kind, 'assistant')
})

test('toolGroupLine tallies tool names', () => {
  assert.equal(toolGroupLine([toolNode(1, 'read'), toolNode(2, 'read'), toolNode(3, 'bash')]), 'read ×2 · bash')
  assert.equal(toolGroupLine([toolNode(1, 'write')]), 'write')
})

test('nodeLine renders one-line skeleton text per kind', () => {
  assert.equal(nodeLine({ kind: 'user', text: '第一行\n第二行' }, tzh), '第一行')
  assert.equal(nodeLine({ kind: 'user', text: '' }, tzh), '（无文本）')
  assert.equal(nodeLine({ kind: 'assistant', text: '', toolCalls: 3 }, tzh), '发起 3 个工具调用')
  assert.equal(nodeLine({ kind: 'tool', summary: 'command: ls' }, tzh), 'command: ls')
  assert.equal(nodeLine({ kind: 'todo', done: 2, total: 5 }, tzh), '待办更新 2/5')
  assert.equal(nodeLine({ kind: 'approval', phase: 'asked', summary: 'Bash' }, tzh), '等待审批 · Bash')
  assert.equal(nodeLine({ kind: 'compaction', phase: 'prune', prunedNodes: 4, prunedTokens: 99 }, tzh), '裁剪了 4 条历史（≈99 token）')
  assert.equal(nodeLine({ kind: 'attempt' }, tzh).includes('模型尝试'), true)
  const long = 'x'.repeat(120)
  assert.equal(nodeLine({ kind: 'user', text: long }, tzh).length, 91)
})

// ── 客户端：流程图布局 ───────────────────────────────────────────────────

test('layoutFlow lays spine nodes top-down with shapes, lanes and chain edges', () => {
  const items = [
    { id: 'a', kind: 'turn', phase: 'start', turnNum: 1 },
    { id: 'b', kind: 'user', text: 'hi' },
    { id: 'x', kind: 'context', text: '<system-reminder>' },
    { id: 'c', kind: 'approval', phase: 'asked' },
    { id: 'd', kind: 'assistant', text: 'ok' },
    { id: 'e', kind: 'turn', phase: 'end', turnNum: 1 },
  ]
  const { pos, edges } = layoutFlow(items, new Set())
  assert.equal(pos.get('a').shape, 'oval')
  assert.equal(pos.get('c').shape, 'diamond')
  assert.equal(pos.get('b').shape, 'box')
  // 泳道：用户靠右、上下文靠左、助手/审批/回合居中
  const cx = (id) => pos.get(id).x + pos.get(id).w / 2
  assert.equal(cx('a'), CHART.spineX)
  assert.equal(cx('b'), CHART.laneUserX)
  assert.equal(cx('x'), CHART.laneCtxX)
  assert.equal(cx('c'), CHART.spineX)
  assert.equal(cx('d'), CHART.spineX)
  // y 严格递增
  const ys = ['a', 'b', 'x', 'c', 'd', 'e'].map((id) => pos.get(id).y)
  for (let i = 1; i < ys.length; i++) assert.ok(ys[i] > ys[i - 1])
  // 主链 5 条边；跨泳道的边是纵向贝塞尔（含 C），同泳道是直线
  const spineEdges = edges.filter((e) => e.kind === 'spine')
  assert.equal(spineEdges.length, 5)
  const cross = spineEdges.find((e) => e.x1 !== e.x2)
  assert.match(edgePath(cross), /^M .+ C /)
  const straight = spineEdges.find((e) => e.x1 === e.x2)
  assert.match(edgePath(straight), /^M .+ L /)
})

test('layoutFlow fans parallel subagent delegations out in one row and converges', () => {
  const group = { group: true, id: 'gs1', members: [toolNode(1, 'subagent'), toolNode(2, 'subagent'), toolNode(3, 'subagent')] }
  const items = [
    { id: 'u', kind: 'user', text: 'go' },
    group,
    { id: 'a', kind: 'assistant', text: 'done' },
  ]
  assert.equal(isDelegationGroup(group), true)
  const open = layoutFlow(items, new Set(['gs1']))
  // 成员横向一排：同 y、x 递增、整体以主泳道居中
  const xs = [1, 2, 3].map((i) => open.pos.get('s' + i))
  assert.equal(xs[0].y, xs[1].y)
  assert.equal(xs[1].y, xs[2].y)
  assert.ok(xs[0].x < xs[1].x && xs[1].x < xs[2].x)
  const rowMid = (xs[0].x + xs[2].x + xs[2].w) / 2
  assert.ok(Math.abs(rowMid - CHART.spineX) < 0.01)
  // 发散 3 条 + 收敛 3 条，收敛到下一个脊柱节点顶中
  assert.equal(open.edges.filter((e) => e.kind === 'fanfork').length, 3)
  const joins = open.edges.filter((e) => e.kind === 'fanjoin')
  assert.equal(joins.length, 3)
  const a = open.pos.get('a')
  assert.equal(joins[0].x2, a.x + a.w / 2)
  assert.equal(joins[0].y2, a.y)
  // 扇形区间不画主链直线：主链边只剩 a→？（u→组 保留，组→a 被扇形取代）
  assert.equal(open.edges.filter((e) => e.kind === 'spine').length, 1)
  // 混合组（不全是委派）不走扇形；单个委派调用也走扇形（发散-收敛）
  const mixed = { group: true, id: 'gs2', members: [toolNode(4, 'subagent'), toolNode(5, 'read')] }
  assert.equal(isDelegationGroup(mixed), false)
  const single = { group: true, id: 'gs3', members: [toolNode(6, 'spawn_teammate')] }
  assert.equal(isDelegationGroup(single), true)
  const singleLayout = layoutFlow([{ id: 'u', kind: 'user', text: 'x' }, single, { id: 'a', kind: 'assistant', text: 'y' }], new Set(['gs3']))
  assert.equal(singleLayout.edges.filter((e) => e.kind === 'fanfork').length, 1)
  assert.equal(singleLayout.edges.filter((e) => e.kind === 'fanjoin').length, 1)
  // 单子代理居中于主泳道
  const m = singleLayout.pos.get('s6')
  assert.ok(Math.abs(m.x + m.w / 2 - CHART.spineX) < 0.01)
})

test('paired catalog nodes are not drawn as side branches; unpaired stay', () => {
  const nodes = attachChildren([
    { id: 's10', seq: 10, kind: 'tool', name: 'spawn_teammate', status: 'done', resultSeq: 30 },
    { id: 's11', seq: 11, kind: 'tool', name: 'spawn_teammate', status: 'done', resultSeq: 31 },
    { id: 's20', seq: 20, kind: 'subagent', childId: 'child-1', summary: '一' },
    { id: 's21', seq: 21, kind: 'subagent', childId: 'child-2', summary: '二' },
    { id: 's22', seq: 22, kind: 'subagent', childId: 'child-3', summary: '未配对' },
  ])
  assert.equal(nodes.find((n) => n.id === 's20').paired, true)
  assert.equal(nodes.find((n) => n.id === 's22').paired, undefined)
  const items = [{ id: 'u', kind: 'user', text: 'go' }, ...nodes]
  const { pos } = layoutFlow(items, new Set())
  assert.equal(pos.has('s20'), false) // 已配对 → 不挂旁路
  assert.equal(pos.has('s22'), true)  // 未配对 → 保留旁路（可双击下钻）
  assert.equal(pos.get('s22').shape, 'side')
})

test('isDelegationTool matches dsh subagent tool names', () => {
  assert.equal(isDelegationTool('subagent'), true)
  assert.equal(isDelegationTool('lead'), true)
  assert.equal(isDelegationTool('Agent'), true)
  assert.equal(isDelegationTool('spawn_teammate'), true)
  assert.equal(isDelegationTool('bash'), false)
  assert.equal(isDelegationTool('read'), false)
  assert.equal(isDelegationTool('wait_agent'), false)
  assert.equal(isDelegationTool(undefined), false)
})

test('toolHue is stable per name, reserves violet for delegations', () => {
  assert.equal(toolHue('bash'), toolHue('bash')) // 稳定
  assert.notEqual(toolHue('bash'), toolHue('read')) // 不同工具不同色（大概率）
  assert.equal(toolHue('subagent'), 265)
  assert.equal(toolHue('spawn_teammate'), 265)
  assert.equal(toolHue(undefined), 265)
  // 普通工具避开紫色邻域
  for (const name of ['bash', 'read', 'write', 'edit', 'grep', 'todo_write', 'present', 'skill']) {
    const hue = toolHue(name)
    assert.ok(hue < 245 || hue > 289, `${name} hue ${hue} should avoid the violet band`)
  }
  assert.equal(toolColor('bash'), `hsl(${toolHue('bash')},62%,46%)`)
})

test('groupColor: single-tool group takes its hue, delegation group violet, mixed neutral', () => {
  const same = { group: true, id: 'g1', members: [toolNode(1, 'read'), toolNode(2, 'read')] }
  assert.equal(groupColor(same), toolColor('read'))
  const delegation = { group: true, id: 'g2', members: [toolNode(3, 'spawn_teammate'), toolNode(4, 'spawn_teammate')] }
  assert.equal(groupColor(delegation), 'hsl(265,62%,46%)')
  const mixed = { group: true, id: 'g3', members: [toolNode(5, 'read'), toolNode(6, 'bash')] }
  assert.equal(groupColor(mixed), 'hsl(265,20%,55%)')
})

test('layoutFlow colors fork/join edges with each member tool hue', () => {
  const group = { group: true, id: 'gs1', members: [toolNode(1, 'read'), toolNode(2, 'bash')] }
  const items = [{ id: 'u', kind: 'user', text: 'go' }, group, { id: 'a', kind: 'assistant', text: 'done' }]
  const open = layoutFlow(items, new Set(['gs1']))
  const forks = open.edges.filter((e) => e.kind === 'fork')
  assert.equal(forks.length, 2)
  assert.equal(forks[0].hue, toolHue('read'))
  assert.equal(forks[1].hue, toolHue('bash'))
  // 扇形边也带委派紫
  const fan = { group: true, id: 'gs9', members: [toolNode(7, 'subagent'), toolNode(8, 'subagent')] }
  const fanLayout = layoutFlow([{ id: 'u', kind: 'user', text: 'x' }, fan, { id: 'a', kind: 'assistant', text: 'y' }], new Set(['gs9']))
  assert.ok(fanLayout.edges.filter((e) => e.kind === 'fanfork').every((e) => e.hue === 265))
})

test('attachChildren pairs catalog entries to delegation calls', () => {
  const { attachChildren } = client.__internals
  // 串行：catalog 落在各自调用的 (seq, resultSeq] 区间内，精确配对
  const serial = [
    { id: 's1', seq: 1, kind: 'tool', name: 'spawn_teammate', status: 'done', resultSeq: 4 },
    { id: 's2', seq: 2, kind: 'subagent', childId: 'child-a', summary: '任务 A' },
    { id: 's5', seq: 5, kind: 'tool', name: 'spawn_teammate', status: 'done', resultSeq: 8 },
    { id: 's6', seq: 6, kind: 'subagent', childId: 'child-b', summary: '任务 B' },
  ]
  const out = attachChildren(serial)
  assert.equal(out[0].childId, 'child-a')
  assert.equal(out[0].childLabel, '任务 A')
  assert.equal(out[2].childId, 'child-b')

  // 并行爆发：catalog 全部落在两个调用区间重叠处，退化为按创建顺序配对
  const burst = [
    { id: 's10', seq: 10, kind: 'tool', name: 'spawn_teammate', status: 'done', resultSeq: 30 },
    { id: 's11', seq: 11, kind: 'tool', name: 'spawn_teammate', status: 'done', resultSeq: 31 },
    { id: 's20', seq: 20, kind: 'subagent', childId: 'child-1', summary: '一' },
    { id: 's21', seq: 21, kind: 'subagent', childId: 'child-2', summary: '二' },
  ]
  const burstOut = attachChildren(burst)
  assert.equal(burstOut[0].childId, 'child-1')
  assert.equal(burstOut[1].childId, 'child-2')

  // 无名册 / 无委派调用：原样返回（引用不变）
  const plain = [{ id: 's1', seq: 1, kind: 'tool', name: 'bash' }]
  assert.equal(attachChildren(plain), plain)
  const noCalls = [{ id: 's2', seq: 2, kind: 'subagent', childId: 'c', summary: 'x' }]
  assert.equal(attachChildren(noCalls), noCalls)
})

test('layoutFlow fans expanded tool groups out and joins back', () => {
  const group = { group: true, id: 'gs1', members: [toolNode(1, 'read'), toolNode(2, 'write')] }
  const items = [
    { id: 'u', kind: 'user', text: 'go' },
    group,
    { id: 'a', kind: 'assistant', text: 'done' },
  ]
  const collapsed = layoutFlow(items, new Set())
  assert.equal(collapsed.pos.has('s1'), false) // 折叠时成员不布局
  const open = layoutFlow(items, new Set(['gs1']))
  assert.equal(open.pos.get('s1').shape, 'member')
  assert.equal(open.pos.get('s1').x, CHART.branchX)
  assert.ok(open.pos.get('s2').y > open.pos.get('s1').y)
  const forks = open.edges.filter((e) => e.kind === 'fork')
  const joins = open.edges.filter((e) => e.kind === 'join')
  assert.equal(forks.length, 2)
  assert.equal(joins.length, 2)
  // join 回到下一个脊柱节点（assistant 方框右缘）
  const a = open.pos.get('a')
  assert.equal(joins[0].x2, a.x + a.w)
  assert.equal(joins[0].y2, a.y + a.h / 2)
  // 展开的组撑高了画布
  assert.ok(open.height > collapsed.height)
})

test('layoutFlow hangs side events on dashed branches off the spine', () => {
  const items = [
    { id: 'a', kind: 'assistant', text: 'try' },
    { id: 'r', kind: 'retry', phase: 'waiting', summary: 'server_error' },
    { id: 't', kind: 'attempt' },
    { id: 'b', kind: 'assistant', text: 'recovered' },
  ]
  const { pos, edges } = layoutFlow(items, new Set())
  assert.equal(pos.get('r').shape, 'side')
  assert.equal(pos.get('r').x, CHART.sideX)
  // 同锚点的两个旁路向下堆叠
  assert.ok(pos.get('t').y > pos.get('r').y)
  const sideEdges = edges.filter((e) => e.kind === 'retry' || e.kind === 'attempt')
  assert.equal(sideEdges.length, 2)
  assert.equal(sideEdges[0].x1, pos.get('a').x + pos.get('a').w)
  // 旁路不进脊柱链：spine 边只有 a→b 一条
  assert.equal(edges.filter((e) => e.kind === 'spine').length, 1)
})

// ── 宿主：HTTP / SSE 路由（fake ctx 桩）──────────────────────────────────

function makeHost() {
  const session = { id: 's1', header: { cwd: '/tmp' }, events: SAMPLE }
  const routes = []
  const listeners = []
  const ctx = {
    sessions: { get: (id) => (id === 's1' ? session : undefined), list: () => [session] },
    webServer: { register: (route) => { routes.push(route); return () => {} } },
    connection: { requestRejection: () => undefined },
    on: (name, fn) => { listeners.push({ name, fn }); return () => {} },
    effect: (fn) => fn(),
    logger: { warn: () => {} },
  }
  host.apply(ctx)
  assert.equal(routes.length, 1)
  return { session, route: routes[0], listeners }
}

function mockRes() {
  return {
    status: undefined,
    headers: undefined,
    body: '',
    writeHead(status, headers) { this.status = status; this.headers = headers },
    write(chunk) { this.body += chunk },
    end(chunk) { if (chunk) this.body += chunk; this.ended = true },
  }
}

test('GET /flow returns the full projection with busy flag', async () => {
  const { route } = makeHost()
  const res = mockRes()
  await route.handler({ method: 'GET', url: '/dsh-flow/api/flow?session=s1', headers: {}, on: () => {} }, res)
  assert.equal(res.status, 200)
  const body = JSON.parse(res.body)
  assert.equal(body.id, 's1')
  assert.equal(body.busy, false)
  assert.equal(body.events.length, 7)
  assert.equal(body.events[3].k, 'tool-call')
})

test('GET /flow 404s unknown sessions and honors the auth fence', async () => {
  const { route } = makeHost()
  const missing = mockRes()
  await route.handler({ method: 'GET', url: '/dsh-flow/api/flow?session=nope', headers: {}, on: () => {} }, missing)
  assert.equal(missing.status, 404)

  // 信任栅栏：connection 拒绝时直接短路，不进任何路由逻辑
  const routes2 = []
  const ctx = {
    sessions: { get: () => { throw new Error('must not reach sessions') } },
    webServer: { register: (route) => { routes2.push(route); return () => {} } },
    connection: { requestRejection: () => 403 },
    on: () => () => {},
    effect: (fn) => fn(),
    logger: { warn: () => {} },
  }
  host.apply(ctx)
  const denied = mockRes()
  await routes2[0].handler({ method: 'GET', url: '/dsh-flow/api/flow?session=s1', headers: {}, on: () => {} }, denied)
  assert.equal(denied.status, 403)
})

test('GET /stream replays mapped events with seq ids and goes live on session/event', async () => {
  const { session, route, listeners } = makeHost()
  const req = new EventEmitter()
  req.method = 'GET'
  req.url = '/dsh-flow/api/stream?session=s1&after=5'
  req.headers = {}
  const res = mockRes()
  await route.handler(req, res)
  try {
    assert.equal(res.status, 200)
    assert.match(res.headers['Content-Type'], /text\/event-stream/)
    // 回补只覆盖 after 之后的 seq（5、6），帧带 id: <seq>
    assert.match(res.body, /^retry: 3000\n\n/)
    assert.ok(res.body.includes('id: 5\ndata:'))
    assert.ok(res.body.includes('id: 6\ndata:'))
    assert.ok(!res.body.includes('id: 4\ndata:'))

    // 直播：session/event 订阅扇出同形映射
    const sub = listeners.find((l) => l.name === 'session/event')
    assert.ok(sub, 'session/event subscription registered')
    const live = ev(7, 'tool/call', { turn: 2, step: 1, callId: 'c7', name: 'Read', arguments: '{"file_path":"/a.ts"}' })
    sub.fn(session, live)
    assert.ok(res.body.includes('id: 7\ndata:'))
    assert.ok(res.body.includes('"k":"tool-call"'))
    assert.ok(res.body.includes('"name":"Read"'))
    // 不映射的事件不扇出
    const before = res.body.length
    sub.fn(session, ev(8, 'request/header', { header: {} }))
    assert.equal(res.body.length, before)
  } finally {
    req.emit('close')
  }
})

test('GET /stream honors Last-Event-ID when after is absent', async () => {
  const { route } = makeHost()
  const req = new EventEmitter()
  req.method = 'GET'
  req.url = '/dsh-flow/api/stream?session=s1'
  req.headers = { 'last-event-id': '5' }
  const res = mockRes()
  await route.handler(req, res)
  try {
    assert.ok(res.body.includes('id: 6\ndata:'))
    assert.ok(!res.body.includes('id: 5\ndata:'))
  } finally {
    req.emit('close')
  }
})

test('GET /event returns untruncated text for one seq', async () => {
  const { route } = makeHost()
  const res = mockRes()
  await route.handler({ method: 'GET', url: '/dsh-flow/api/event?session=s1&seq=1', headers: {}, on: () => {} }, res)
  assert.equal(res.status, 200)
  const body = JSON.parse(res.body)
  assert.equal(body.k, 'user')
  assert.equal(body.text, '帮我看下仓库结构')
  // 非流程事件（被 mapEvent 跳过的类型）返回 404
  const session2 = { id: 's2', header: {}, events: [ev(0, 'request/header', { header: {} })] }
  const routes = []
  const ctx = {
    sessions: { get: (id) => (id === 's2' ? session2 : undefined), list: () => [session2] },
    webServer: { register: (route) => { routes.push(route); return () => {} } },
    connection: { requestRejection: () => undefined },
    on: () => () => {},
    effect: (fn) => fn(),
    logger: { warn: () => {} },
  }
  host.apply(ctx)
  const res2 = mockRes()
  await routes[0].handler({ method: 'GET', url: '/dsh-flow/api/event?session=s2&seq=0', headers: {}, on: () => {} }, res2)
  assert.equal(res2.status, 404)
})
