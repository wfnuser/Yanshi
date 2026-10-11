# 当前进展（2026-10-11）

## 已验证

- Live2D 官方 Hiyori 在桌面与 390px 手机布局正常显示。模型固定上游 `b1de66b0b1f1cb881d95fb6158622aeb6a2827bd`；各资产来源、大小、SHA256 在 `artifacts/assets.json`。
- 本机 Tingting 生成 14.135708 秒中文 WAV；wLipSync 本地 MFCC/WASM 元音辅助驱动嘴形，停止后嘴形归零；也可切换音量开合对照。
- 9 项 Node 测试通过；Chrome 真实 Web Audio 解码、取消静音与回执测试通过；UI 渲染与移动布局验证通过。构建成功，npm audit 报告 0 项漏洞。
- 真实 Qwen Realtime（已配置 `qwen-audio-3.0-realtime-plus`）连接成功。使用正常客户端 AudioWorklet、重采样、WebSocket 路径注入本地合成 PCM，不伪造 Gateway 事件：助手介绍太阳系期间，送入“等一下，先停下，请只回答好的”。旧回复收到原生取消；新回复为“好的。”，有实际播放完成回执。
- 完整插话验证轨迹：416 个输入包、24 个输出包；输出播放期间仍发送了 169 个输入包；无背压丢包。结束时嘴形为 0。包数不是对话轮数，也不是性能基准。
- 证据：`artifacts/browser-audio.json`、`browser-ui.json`、`realtime-barge-in.json` 与对应截图。早期失败记录保留，不把连接失败算通过。

## 本轮修正

1. 恢复网络后安装素材与依赖；Vite ES2022 配置支持 wLipSync 顶层 await。
2. 代理保留浏览器 Host，使官方 Gateway 同源校验正常工作，没有关闭安全校验。
3. 官方冻结 Gateway 沿用旧 node_modules，缺少 yaml/qrcode；从本应用依赖解析，不改第三方源码或旧服务。
4. Node WebSocket 未沿用系统代理导致连接超时。仅该 Gateway 的 realtime provider 接入显式代理 Agent，复用已有本机代理；不改系统网络设置。
5. 插话早期 ASR 会暂时携带前一轮 ID。客户端不再让这类 partial 覆盖已经 final 的历史文本。

## 使用与边界

- `npm start` 同时启动独立 Gateway 8786 与工作台 8785；只有点击“开始对话”才获取真人麦克风并连接云端。“结束对话”释放麦克风与连接。
- 口型分析本地执行，无额外口型 API；不是精确中文音素/唇读模型。真人噪声、回声、听感与长时间使用未做系统评测，建议戴耳机。
- Qwen-Audio-Agent 固定 `f6dd0e3703d58e4941159c1be89447f3fcb5063a`，初版 backend=none，只做实时语音人物工作台，不执行代码或后台任务。
- 当前收音启用时连续发送 PCM，包括安静时段；不能据此声称等待免费。静音或结束后停止发送。
- 素材仅用于本地演示；Hiyori、Cubism Core 与其他组件遵循独立许可，商业发布前须核对。
