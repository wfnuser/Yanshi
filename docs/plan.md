# 实现计划

Goal: Live2D 口型演示及 Qwen-Audio-Agent 全双工客户端。
Architecture: 浏览器分析播放音频，官方 Gateway 管理模型会话；各自独立生命周期。
Spec: docs/design.md

- [ ] 下载固定官方示例资产与口型 profile，生成普通话 WAV。
- [ ] 实现可测的嘴形平滑与 PCM 播放取消逻辑；测试静音归零和取消后的回执。
- [ ] 创建人物舞台、两档口型、演示音频、转录和连接控件。
- [ ] 使用官方 Gateway SDK、AudioWorklet 接入实时音频，保留播放回执。
- [ ] 启动真实 Gateway；在浏览器测试渲染、测试音频、实时回复和插话，保存证据。
- [ ] 记录来源、启动方法、验证结果与限制，git 保存代码。
