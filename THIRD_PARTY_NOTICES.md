# Third-party components and assets

Yanshi original code is Copyright 2026 Yanshi contributors, licensed under Apache-2.0.
This does **not** relicense third-party assets, dependencies, voices or services.

| Component | Source / terms | Distribution here |
| --- | --- | --- |
| Qwen-Audio-Agent | [Apache-2.0](https://github.com/QwenAudio/qwen-audio-agent/blob/f6dd0e3703d58e4941159c1be89447f3fcb5063a/LICENSE) | Separate pinned checkout; not vendored |
| PixiJS | [MIT](https://github.com/pixijs/pixijs) | npm dependency |
| pixi-live2d-display | [MIT](https://github.com/guansss/pixi-live2d-display) | npm dependency; does not license Cubism Core |
| wLipSync / example profile | [MIT](https://github.com/mrxz/wLipSync/blob/177f3ac4095dbad81be0a800a8c6f975abe4ae04/LICENSE) | npm WASM package; profile downloaded separately |
| Cubism Core | [Live2D SDK terms](https://www.live2d.com/en/sdk/license/) | Proprietary runtime downloaded separately; not Apache-2.0 |
| Hiyori Momose / 桃瀬ひより | [Live2D sample model terms](https://www.live2d.com/eula/live2d-sample-model-terms_en.html) and [sample repository license](https://github.com/Live2D/CubismWebSamples/blob/b1de66b0b1f1cb881d95fb6158622aeb6a2827bd/LICENSE.md) | © Live2D Inc.; downloaded separately; not Yanshi's own character |
| Qwen voice/model service | Provider's service terms and account permissions | User supplies credentials; no model weights or voice license granted |

Read and accept the applicable SDK and sample-model terms before running the asset downloader.
The download flag acknowledges those terms; it is not a commercial publication license.
Before distributing a built app, check Live2D's publication requirements and any applicable
Expandable Application classification with Live2D. A source-code license is not a substitute.

The repository tracks only source URLs and checksums in `assets.lock.json`, not models,
textures, Core, generated speech, recordings or screenshots. The downloader saves upstream
license notices alongside local assets. If you distribute bundles containing npm dependencies,
retain their applicable copyright/license notices as well.

Development dependency licenses are available in their installed packages. This file identifies
the main integration boundaries; it does not claim to replace every dependency's license.
