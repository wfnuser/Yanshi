import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

export function loadProjectEnv(root, env = process.env) {
  const path = resolve(root, '.env');
  if (!existsSync(path)) return;
  for (const [key, value] of Object.entries(parseEnv(readFileSync(path, 'utf8')))) {
    if (env[key] === undefined) env[key] = value;
  }
}

export function resolveQwen(root, env = process.env) {
  if (!env.QWEN_AUDIO_AGENT_DIR?.trim()) {
    throw new Error('Set QWEN_AUDIO_AGENT_DIR in .env to your Qwen-Audio-Agent checkout; see docs/setup.md.');
  }
  const qwen = resolve(root, env.QWEN_AUDIO_AGENT_DIR);
  for (const file of ['shared/gateway/client-sdk.mjs', 'web/src/realtime/audio.js', 'server/src/index.mjs']) {
    if (!existsSync(resolve(qwen, file))) throw new Error(`Missing ${file}. Install the pinned Qwen checkout: docs/setup.md.`);
  }
  return qwen;
}

export function gatewayEnvironment(root, qwen) {
  return {
    PORT: '8786', HOST: '127.0.0.1', AGENT_PROTOCOL: 'none',
    // Never load another checkout's .env or the user's default Qwen state.
    QWEN_AUDIO_AGENT_RUNTIME_ROOT: root,
    QWEN_AUDIO_AGENT_FRONTEND_PROMPT_DIR: resolve(qwen, 'config/frontend-agent'),
    QWEN_AUDIO_AGENT_ASSISTANT_PROFILE_PATH: resolve(qwen, 'config/frontend-agent/ASSISTANT.md'),
    QWAUDIO_CONFIG_DIR: resolve(root, '.runtime/config'),
    QWAUDIO_DATA_DIR: resolve(root, '.runtime/data'),
    QWAUDIO_STATE_DIR: resolve(root, '.runtime/state'),
    QWAUDIO_CACHE_DIR: resolve(root, '.runtime/cache'),
    QWEN_AUDIO_AGENT_ALLOWED_ORIGINS: 'http://127.0.0.1:8785,http://localhost:8785',
  };
}
