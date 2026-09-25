# @weibaohui/dsh-flow

[![DSH plugin](https://img.shields.io/badge/dsh-plugin-green)](https://github.com/topics/dsh-plugin)
[![npm version](https://img.shields.io/npm/v/@weibaohui/dsh-flow)](https://www.npmjs.com/package/@weibaohui/dsh-flow)

**执行流程图**：把当前会话的执行过程画成一张真正的流程图——椭圆是回合起止、菱形是审批决策、方框是用户/助手/工具动作，主链路沿脊柱用箭头串联；展开工具组时成员向右扇出 fork-join 分支再汇合回主链；重试、失败尝试、压缩等旁路事件挂右侧虚线分支。会话执行到哪，图就向下画到哪。另提供紧凑列表视图一键切换。

![三泳道流程图：上下文 / 助手·工具 / 用户](docs/overview.png)

![子代理扇形：并行派发，发散再收敛](docs/fan.png)

![双击子代理下钻到它自己的完整流程图](docs/drill.png)

![列表视图：紧凑扫读](docs/list.png)

## 核心功能

- **三泳道流程图（默认视图）**：上下文（注入类消息，左）/ 助手与工具（中，主链）/ 用户（右）三条垂直泳道带引导线，跨泳道的边用 S 形曲线连接；椭圆 = 回合起止、菱形 = 审批决策、方框 = 消息与动作
- **子代理扇形**：委派调用（`subagent` / `spawn_teammate` / `lead` 等）不论几个都在主链下方横向一字排开——发散边向下散开、收敛边汇回主链下一个节点；单个子代理也走直下直回的扇形，派发感始终一致。名册事件（`subagent/catalog`）不打断派发组的连续段，配对成功后在图上不再单独挂旁路
- **双击下钻**：委派节点经 `subagent/catalog` 名册配对到子会话（区间精确 + 顺序兜底），双击直接把视图切换成该子代理自己的完整流程图（成员框显示任务标签）；面包屑「← 返回主流程」或 Esc 返回；子代理再派子代理可逐级下钻。历史子会话不在内存时走磁盘兜底（只读解压 `~/.dsh/sessions` 的多帧 zstd 日志，按 mtime 缓存），状态标「静态（历史）」
- **fork-join 分支**：普通工具组展开后成员挂右列分支再汇合回主链；工具组默认全部展开，单击组框折叠
- **精确分类**：`source.kind ≠ 'user'` 的注入消息（system-reminder、runtime context、插件 notice…）归为「上下文」，不与真实用户输入混淆；筛选 chip 同步分桶
- **列表视图**：一键切换到紧凑列表（轨道 + 单行节点），适合扫文本
- **双击详情**：双击任意节点弹详情窗——seq、时间、turn/step、耗时、callId、token 用量、待办清单；正文超 400 字可一键加载全文（按 seq 单独取，不进主流）
- **实时生长**：宿主侧订阅 `session/event`（每次日志追加同步触发），经 SSE 推到浏览器逐条落地——不是定时轮询，是事件驱动的直播；运行中的工具节点脉冲，回合未收口时主链末端接「模型工作中…」幽灵节点
- **自动跟随**：停留在底部时新节点自动滚入视野；往上翻则不打扰，浮出「↓ 回到底部」pill 并累计新节点数
- **类型筛选**：用户 / 上下文 / 助手 / 工具 / 待办 / 事件 六桶 chip 过滤，与顺序正交
- **断线续传**：SSE 帧带 `id: <seq>`，EventSource 自动重连时经 `Last-Event-ID` 续传，先回补再直播，同 seq 客户端去重，不丢不重
- **只读安全**：全程只读会话日志（`ctx.sessions`），不写任何事件；API 走 `connection` 服务的 Host/Origin + 浏览器认证栅栏

## 安装

```bash
dsh plugin --profile web add @weibaohui/dsh-flow -w
```

装完重启 `dsh web` 即生效。入口：打开会话 → 顶部「执行流程」标签（Trajectory 右侧），自动锁定当前会话。

## 节点种类

| 节点 | 来源事件 | 展示 |
|------|---------|------|
| 回合分隔 | `turn/start` `turn/end` | 全宽 pill，含结束原因 |
| 用户 | `user/message` | 文本预览；注入类标「注入」chip（含来源插件） |
| 助手 | `assistant/message` | 文本预览 + 思考字数 / 工具数 / token 用量 / 已中断徽标 |
| 工具 | `tool/call` + `tool/result` | 工具名 + 参数摘要；运行中 → 完成/失败 + 耗时 |
| 审批 | `approval/asked` `approval/decided` | 等待审批 / 审批结果 |
| 重试 | `llm/retry` `llm/retry-started` | 虚线橙卡 + 原因 |
| 待办 | `todo/write` | 完成度 `done/total`，展开看清单 |
| 压缩 | `compaction/*` | 开始/摘要/结束/裁剪（含 token 数） |
| 其他 | `command/*` `subagent/descriptor` `tool-workflow/*` `goal/change` `assistant/attempt` | 摘要行 |

`request/header`、`system/message` 等结构/背景事件不进流程图。

## 实现说明

宿主侧把会话事件映射成紧凑节点（`mapEvent`，纯函数），三条输出路径共享同一份映射——全量 `GET /dsh-flow/api/flow`、SSE 回补段、`session/event` 直播——客户端以 seq 去重即可，不关心节点来自哪条路径。映射默认把正文截断到 400 字（附全文长度），全文经 `GET /dsh-flow/api/event?seq=` 按需补全。

## 版本兼容性

本插件与 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)（`@deepseek-ai/dsh`）的版本对应关系：

| 插件版本 | 适配 dsh 版本 | 备注 |
|---------|--------------|------|
| 0.1.0 | 0.1.7-rc.2 | 当前版本，已在 @deepseek-ai/dsh@0.1.7-rc.2 下验证运行 |

> **发版约定**：每次发布新版本时，请在上表追加一行，记录该插件版本实际验证所用的 `@deepseek-ai/dsh` 版本。`package.json` 的 `engines.dsh` 声明最低支持版本；本表记录实际验证版本，二者配合使用。
