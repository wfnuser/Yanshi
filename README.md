# Yanshi · 偃师

**A visible voice companion you can interrupt.**

可随时插话的 Live2D 语音伙伴，基于 Qwen-Audio-Agent。

Named after Yanshi, the legendary craftsman in the Liezi who created a lifelike automaton.

名字取自《列子》中制作逼真人偶的传奇工匠偃师。读作 **Yǎn Shī**。

## 现在能做什么

- 浏览器本地显示 Live2D 人物，嘴形跟随**实际播放的音频**。
- Qwen 实时语音对话：播放期间持续收音，支持语音插话和手动停播。
- 提供文字输入、辅助转录、麦克风静音和断开控制。
- wLipSync 元音辅助 / 音量开合两种口型，可用本地 WAV 独立测试。

**当前是 alpha demo，不是完整 Agent 平台。** 后台执行固定关闭（`AGENT_PROTOCOL=none`）；共享屏幕、文档教学、长期记忆产品界面和多后端接入均未实现。Hiyori 是第三方演示角色，不是 Yanshi 的自有品牌形象。

## 开始使用

需要 **Node.js 24.15+（已测 24.18）**、npm、Git、curl，以及支持 Web Audio / AudioWorklet / WebGL 的浏览器。当前完整验证平台是 macOS + Chrome。

```sh
git clone https://github.com/wfnuser/Yanshi.git
cd Yanshi
npm ci
cp .env.example .env
```

1. 按 [安装说明](docs/setup.md) 准备固定版本的 Qwen-Audio-Agent，在 `.env` 设置 `QWEN_AUDIO_AGENT_DIR`。本地演示也需要其客户端源码。
2. 阅读 [第三方许可说明](THIRD_PARTY_NOTICES.md)，确认接受后下载素材：

   ```sh
   npm run assets -- --accept-third-party-terms
   ```

3. 两种启动方式：

   | 方式 | 命令 | 说明 |
   | --- | --- | --- |
   | 只看人物 / 播放本地音频 | `npm run dev` | 不启动 Gateway，不需要 API Key；不要点击“开始对话” |
   | 实时语音对话 | `npm start` | 先在 `.env` 填写自己的 `DASHSCOPE_API_KEY`；云端调用可能计费 |

打开 **http://127.0.0.1:8785**。建议戴耳机；点击“开始对话”才申请麦克风。结束后释放麦克风与连接。

本地测试音频：macOS 安装 ffmpeg 后运行 `npm run demo-audio`；其他系统可自行提供有权使用的单声道 WAV 到 `public/audio/demo.wav`。没有 WAV 不影响实时对话。

## 它怎样工作

```text
麦克风 ──20 ms 音频块──→ Qwen-Audio-Agent Gateway ⇄ Qwen Realtime
                            ↓ 回复 / 取消事件
                      Web Audio 实际播放
                            ↓
                  本地口型分析 → Live2D
```

语音输入不因输出播放而关闭；收到取消事件后清队列、停声、闭嘴。Gateway 和 Yanshi 的运行状态分开保存，API Key 不发给浏览器。口型是轻量 MFCC/音量映射，**不是精确中文音素模型**，也尚未接入 Live2D MotionSync。

## 开发与维护

```sh
npm test       # 本地单元/配置测试，不调用模型
npm run build  # 需要已配置的 Qwen 客户端源码
```

浏览器测试、配置和常见问题见 [安装说明](docs/setup.md)；贡献方式见 [CONTRIBUTING.md](CONTRIBUTING.md)。

长期方向是**一起看资料、一起做事的可视化语音伙伴**。先做好一个场景，再考虑组件化；具体计划与未实现项见 [Roadmap](docs/roadmap.md)。

## 隐私与许可

- 实时会话会把麦克风音频 / 输入文字送到所配置的模型服务；安静时也可能持续发送 PCM，**不承诺免费待机**。
- `.env`、`.runtime/`、录音、测试截图与生成素材默认不入 Git。Gateway 可能在本机保存会话、记忆和日志，请勿直接分享整个目录。
- 服务默认只监听本机。当前开发服务器不是面向公网的安全部署方案。
- **Yanshi 自有代码：Apache-2.0。** Live2D Core、Hiyori、依赖库和云端服务不因此变成 Apache-2.0；素材不随仓库分发，详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

感谢 [Qwen-Audio-Agent](https://github.com/QwenAudio/qwen-audio-agent)、[Live2D](https://github.com/Live2D/CubismWebSamples)、[wLipSync](https://github.com/mrxz/wLipSync)、[PixiJS](https://github.com/pixijs/pixijs) 和 [pixi-live2d-display](https://github.com/guansss/pixi-live2d-display)。
