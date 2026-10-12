# Yanshi · 偃师

A digital avatar demo built with [Qwen-Audio-Agent](https://github.com/QwenAudio/qwen-audio-agent) and Live2D, with real-time voice chat, interruption support, and audio-driven lip sync.

Named after Yanshi, the legendary craftsman in the *Liezi* who created a lifelike automaton.

## Quick start

Requires **Node.js 24.15+**, npm, Git, and curl. Tested on macOS with Chrome.

### 1. Install Yanshi

```sh
git clone https://github.com/wfnuser/Yanshi.git
cd Yanshi
npm ci
cp .env.example .env
```

### 2. Install Qwen-Audio-Agent

Run these commands from the Yanshi directory. Use a fresh checkout; the pinned revision is the tested version.

```sh
git clone https://github.com/QwenAudio/qwen-audio-agent.git ../_vendor/voice-agents/qwen-audio-agent
git -C ../_vendor/voice-agents/qwen-audio-agent checkout f6dd0e3703d58e4941159c1be89447f3fcb5063a
npm ci --prefix ../_vendor/voice-agents/qwen-audio-agent --ignore-scripts
```

### 3. Configure

Edit Yanshi's `.env` and replace `your-own-key` with your DashScope API key:

```dotenv
QWEN_AUDIO_AGENT_DIR=../_vendor/voice-agents/qwen-audio-agent
DASHSCOPE_API_KEY=your-own-key
QWEN_AUDIO_REALTIME_PROVIDER=dashscope
QWEN_AUDIO_REALTIME_MODEL=qwen-audio-3.0-realtime-plus
```

If Qwen-Audio-Agent is installed elsewhere, change `QWEN_AUDIO_AGENT_DIR` accordingly. Do not commit your API key.

### 4. Download assets and run

Review the [third-party terms](THIRD_PARTY_NOTICES.md) before running the asset download command:

```sh
npm run assets -- --accept-third-party-terms
npm start
```

Open [http://127.0.0.1:8785](http://127.0.0.1:8785). Click **开始对话** (Start conversation) and allow microphone access. Headphones are recommended. Cloud API usage may incur charges.

This demo runs voice chat only; backend task execution is disabled. For the avatar UI without live chat, use `npm run dev` instead; no API key is needed, but the Qwen source and Live2D assets are still required.

See the [setup guide (Chinese)](docs/setup.md) for proxy settings, optional test audio, and development commands.

## License

Our code is licensed under [Apache-2.0](LICENSE). Live2D Core, Hiyori, and other third-party assets are not bundled and remain subject to their [own licenses](THIRD_PARTY_NOTICES.md).
