# Direction / 长期方向

**Yanshi（偃师）希望成为一起看资料、一起做事的可视化语音伙伴。**
目前只是可运行的 Live2D + Qwen 实时语音 alpha；下面未勾选内容均未实现，
没有发布日期或维护 SLA 承诺。

## 当前

- [x] 本地 Live2D 渲染、播放音频驱动嘴形。
- [x] 播放期间收音；取消播放、播放回执、麦克风生命周期。
- [x] 明确配置、固定依赖基线、第三方资产校验与独立许可。
- [x] 自有代码 Apache-2.0；单元测试与构建验证入口。

## 优先：让陌生人也能稳定使用

- [ ] 新机器安装反馈；跨平台音频测试、错误说明。
- [ ] 真人回声、弱网、长稳测试；公开条件一致的延迟/资源数据。
- [ ] 隐私、日志清理与持续收音费用提示的产品化。
- [ ] 授权清晰的自有默认角色；评估 MotionSync，不预设效果更好。

## 下一步：只打通一个使用场景

- [ ] 共同阅读课程 HTML / 文档：选区、引用和角色关注点对应。
- [ ] 复用 Qwen 的后台 Agent：真实进度、权限、产物展示。
- [ ] 分开“停止播报”“取消工作”“修改需求”，不靠人物动画冒充任务状态。

之后再评估 VRM、其他语音 runtime、宿主 SDK。先有第二个真实接入，
再抽象通用组件；不同时建设陪伴平台、教学产品和插件市场。

## 相关项目与取舍

- [AIRI](https://github.com/moeru-ai/airi)：角色陪伴和跨端生态。
- [Open-LLM-VTuber](https://github.com/Open-LLM-VTuber/Open-LLM-VTuber)：语音人物、本地部署与配置体验。
- [OpenAvatarChat](https://github.com/HumanAIGC-Engineering/OpenAvatarChat)：数字人和实时交互集成。
- [Qwen-Audio-Agent](https://github.com/QwenAudio/qwen-audio-agent)：本项目复用的语音/Agent 底座。

这些项目已有重叠能力。Yanshi 不声称“首个全双工数字人”或未经实测的性能优势；
候选差异是小而清楚的客户端、可靠打断与具体学习/工作闭环，仍需用户验证。
