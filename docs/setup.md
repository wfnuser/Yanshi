# Setup / 安装

## 1. Qwen 源码依赖

Yanshi 复用 Gateway 及两个浏览器音频/协议模块，不复制整套 Agent 实现。兼容性基线固定为：

`QwenAudio/qwen-audio-agent@f6dd0e3703d58e4941159c1be89447f3fcb5063a`

以下从 Yanshi 项目根执行，下载到独立第三方目录；不要在已有工作中的 Qwen 仓库强行 checkout：

```sh
git clone https://github.com/QwenAudio/qwen-audio-agent.git ../_vendor/voice-agents/qwen-audio-agent
git -C ../_vendor/voice-agents/qwen-audio-agent checkout f6dd0e3703d58e4941159c1be89447f3fcb5063a
npm ci --prefix ../_vendor/voice-agents/qwen-audio-agent --ignore-scripts
```

这里只运行 Node Gateway，不运行 Electron，不需要构建上游桌面应用。安装仍会解析上游 workspace 依赖，首次可能较慢。如果只运行 `npm run dev` / build，本应用只需要上游源码（SDK 的 zod 由 Yanshi 显式提供）；实时 Gateway 才需要它的服务端依赖。

在 Yanshi 的 `.env` 中设置：

```dotenv
QWEN_AUDIO_AGENT_DIR=../_vendor/voice-agents/qwen-audio-agent
DASHSCOPE_API_KEY=your-own-key
QWEN_AUDIO_REALTIME_PROVIDER=dashscope
QWEN_AUDIO_REALTIME_MODEL=qwen-audio-3.0-realtime-plus
```

已有兼容 checkout 时也可填写绝对路径。不会自动读取该 checkout 的 `.env`；自行在 Yanshi 配置 Key。不要把 Key 写进 `VITE_*` 变量或前端源码。Shell 显式设置优先于本项目 `.env`；Gateway 自身也可读取本项目 `.env.local` 和隔离的 `.runtime/config/config.env`，建议统一只使用 `.env`，避免多处配置。

其他版本/模型不是已验证兼容承诺；升级时同时核验 Gateway SDK、播放回执与音频取消协议。

## 2. 资产与本地语音

阅读 [第三方条款](../THIRD_PARTY_NOTICES.md) 后：

```sh
npm run assets -- --accept-third-party-terms
```

下载到被 Git 忽略的 `public/models/`、`public/vendor/` 与 `public/profile.json`。来源及 SHA256 在 `assets.lock.json`。校验失败时停止，不要盲目修改期望值；尤其 Cubism Core 官方 URL 没有版本号，若上游更新需人工审核。

可选：macOS 安装 ffmpeg 且具有 Tingting 声音后运行 `npm run demo-audio`，生成演示和插话测试 WAV。此步骤不调用云端。Windows/Linux 可提供自己的单声道 WAV；完整跨平台体验尚未系统验证。

## 3. 运行

- `npm run dev`：仅启动 UI，本地看人物/播放 WAV。没有 Gateway 时实时连接会失败。
- `npm start`：启动 UI 8785 + Gateway 8786，固定 loopback；后台执行关闭。
- Gateway 日志：`.runtime/gateway.log`；配置、状态、缓存、会话数据均在 `.runtime/`。
- 不使用代理：`AVATAR_HTTPS_PROXY=off npm start`。
- 指定代理：`AVATAR_HTTPS_PROXY=http://127.0.0.1:7890 npm start`。
- 未显式设置时沿用 HTTPS_PROXY，macOS 还会检查已启用的系统 HTTPS 代理；不更改系统配置。
- 端口占用时先关闭对应旧实例，不要杀掉不明进程。开发服务器不适合直接发布到公网。

## 4. 验证

| 命令 | 要求 | 是否可能计费 |
| --- | --- | --- |
| `npm test` | 本应用依赖 | 否 |
| `npm run build` | 配置 Qwen 源码路径 | 否 |
| `npm run test:audio` | macOS Chrome、默认生成的 WAV | 否 |
| `npm run test:ui` | UI 已启动、模型/口型素材及 WAV | 否 |
| `npm run test:realtime` | 完整服务、Key、默认插话 WAV | **是** |

浏览器脚本当前使用 macOS Chrome 安装路径。实时测试使用合成音频替代麦克风源，仍经过实际采集/重采样/Gateway/云端模型；不等于真人外放回声测试。证据保存到 `artifacts/`，分享前脱敏。

## 已知边界

- `reconnect: false`；断线后关闭麦克风，需手动重新连接。
- 未系统验证长时间驻留、低配设备、后台标签页、外放 AEC 或精确口型延迟。
- 辅助转录不代表所有文字都已播出；不要把生成结束当成播放结束。
- 无 Key 的本地演示仍依赖下载好的 Qwen 客户端源码与角色资产，不是完全零依赖应用。

## 隐私与本地数据

- 实时对话会将麦克风音频和输入文字发送给配置的模型服务；收音开启时可能持续发送静音 PCM，不保证安静等待免费。可静音或结束对话停止发送。
- API Key 仅放在本机配置中，不要提交或分享 `.env`、`.runtime/`、录音和未脱敏日志。
- Gateway 可能保存本机会话、记忆和日志。服务默认仅监听本机，不适合直接暴露到公网。
