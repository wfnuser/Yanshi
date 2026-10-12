# Yanshi · 偃师

一个基于 [Qwen-Audio-Agent](https://github.com/QwenAudio/qwen-audio-agent) + Live2D 的数字人 demo，支持实时语音对话、插话和音频驱动口型。

名字取自《列子》中的工匠偃师（Yǎn Shī）。

## 配置与启动

需要 **Node.js 24.15+**、npm、Git 和 curl；目前在 macOS + Chrome 上验证。

```sh
git clone https://github.com/wfnuser/Yanshi.git
cd Yanshi
npm ci
cp .env.example .env
```

按 [安装说明](docs/setup.md#1-qwen-源码依赖) 下载固定版本的 Qwen-Audio-Agent，然后编辑本项目的 `.env`：

```dotenv
QWEN_AUDIO_AGENT_DIR=../_vendor/voice-agents/qwen-audio-agent
DASHSCOPE_API_KEY=your-own-key
QWEN_AUDIO_REALTIME_PROVIDER=dashscope
QWEN_AUDIO_REALTIME_MODEL=qwen-audio-3.0-realtime-plus
```

阅读并接受 [第三方素材条款](THIRD_PARTY_NOTICES.md) 后，下载 Live2D 素材并启动：

```sh
npm run assets -- --accept-third-party-terms
npm start
```

打开 **http://127.0.0.1:8785**，点击“开始对话”并允许麦克风。建议戴耳机；实时模型调用可能计费。当前 demo 未启用后台任务执行。

仅展示人物、播放本地音频可用 `npm run dev`，不需要 API Key。依赖安装、可选测试音频、代理和开发测试见 [安装说明](docs/setup.md)。

## 许可

自有代码采用 [Apache-2.0](LICENSE)。Live2D Core、Hiyori 等第三方素材不随仓库分发，遵循各自许可，详见 [第三方说明](THIRD_PARTY_NOTICES.md)。
