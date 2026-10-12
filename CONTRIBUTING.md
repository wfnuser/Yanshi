# Contributing

Yanshi is an early, focused demo. Small, reproducible improvements are welcome.

1. Follow [setup](docs/setup.md), use the pinned Qwen checkout, and keep secrets local.
2. Run `npm test` and `npm run build` before submitting changes.
3. Add a regression test for changes to playback, cancellation, configuration or microphone handling.
4. For UI changes, test desktop and narrow layouts; for audio changes, report browser and device.

Bug reports should include the commit, OS/browser/Node versions, reproduction steps and
redacted errors. Do not upload API keys, private conversations, whole `.runtime/` directories
or third-party model assets. Synthetic audio is preferred for reproducible reports.

Discuss new backends, renderers or major product changes in an issue first. We intend to
keep the Qwen adapter small rather than fork its agent runtime. See [roadmap](docs/roadmap.md).

Contributions must be yours to submit and compatible with Apache-2.0; third-party additions
must retain their own notices. No contribution grants rights to Live2D assets or voices.
