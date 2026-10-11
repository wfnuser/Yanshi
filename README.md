# 在听 · Live2D 语音工作台

本地 Live2D 人物 + 播放音频驱动嘴形 + Qwen-Audio-Agent 实时语音客户端。

**本地人物、中文测试音频、真实 Qwen 回复与语音插话已通过浏览器验证。** 详见 `docs/progress.md`。真人麦克风的回声与主观口型效果仍请实际试听。

## 启动

Node 24、macOS `say`（Tingting）与 ffmpeg；本机已有官方 Qwen-Audio-Agent 冻结仓库及其已配置 DashScope 凭据。

```sh
npm install
npm run assets
npm test
npm start
```

界面：http://127.0.0.1:8785；独立 Gateway：http://127.0.0.1:8786。
Gateway 日志 `.runtime/gateway.log`，配置/数据也在 `.runtime/`，不覆盖原服务。
冻结 Gateway 缺失的 `yaml` / `qrcode` 由本应用独立依赖补齐，不修改共享安装。Gateway 的实时 WebSocket 复用已有 HTTPS_PROXY 或 macOS 已启用的 HTTPS 代理；只影响这个进程，不更改系统设置。可用 `AVATAR_HTTPS_PROXY=http://127.0.0.1:7890 npm start` 指定，或 `AVATAR_HTTPS_PROXY=off npm start` 禁用。

`npm run demo-audio` 可独立、离线生成 `public/audio/demo.wav`。点击“播放测试音频”不调用云端；点击“开始对话”才申请麦克风并连接云端；结束后停止麦克风和会话。建议使用耳机。

`npm run test:audio` 在本机 Chrome 中验证真实 WAV 解码、播放能量驱动嘴形、取消后输出静音及回执，不调用云端。它不等同于人物渲染或真实通话测试。可通过 `PLAYWRIGHT_MODULE` 指定已有 Playwright 的绝对模块路径。

服务启动后：`npm run test:ui` 验证人物、嘴形、停止与手机布局；`npm run test:realtime` 会真实调用已配置的 Qwen API，用本地合成语音作为麦克风输入，验证在播放期间插话、原生取消和新回复播放完成。它不会采集真人麦克风，调用可能计费。测试证据保存在 `artifacts/`。

## 实现边界

- wLipSync 为浏览器本地 WASM/MFCC 元音匹配，不需要 GPU，不是神经网络精确唇形模型。提供音量开合对照。
- 嘴形读取实际 Web Audio 播放支路；收音不驱动嘴形。停止播放会清空队列并立即闭嘴。
- 麦克风 AudioWorklet 按 20 ms 分块，通过官方流式重采样和背压控制送至 Gateway，输出期间不关输入。
- 复用官方 GatewayClient 协议，处理播放开始、完成、取消回执。原生插话事件清空播放队列；也可手动打断。
- 初版 `AGENT_PROTOCOL=none`：验证语音互动，不启用代码执行后端。没有改动官方仓库。
- 角色素材、SDK 和模型语音为各自独立许可。Hiyori 来自 Live2D 官方示例；Cubism Core 不是本项目自行授权的开源库，发布/商业使用前应核对官方条款。

## 来源

- [Live2D Cubism Web Samples / Hiyori](https://github.com/Live2D/CubismWebSamples)；下载记录包含上游 SHA 与每个文件哈希。
- [Live2D Cubism SDK 许可](https://www.live2d.com/en/sdk/license/)
- [wLipSync](https://github.com/mrxz/wLipSync)
- [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)
- [Qwen-Audio-Agent](https://github.com/QwenAudio/qwen-audio-agent)，本机冻结 `f6dd0e3703d58e4941159c1be89447f3fcb5063a`。

音频和运行日志默认不进 git，避免把对话或凭据提交到仓库。
