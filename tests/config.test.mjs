import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve, dirname } from 'node:path';

// Catch accidental reliance on the author's other checkouts or credentials.
import * as config from '../scripts/config.mjs';
function fixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), 'yanshi-config-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}
test('loads only the project env file and preserves explicit shell settings', t => {
  assert.equal(typeof config.loadProjectEnv, 'function');
  const root = fixture(t), env = { DASHSCOPE_API_KEY: 'shell-test-value' };
  writeFileSync(resolve(root, '.env'), 'DASHSCOPE_API_KEY=file-test-value\nQWEN_AUDIO_AGENT_DIR=../upstream\n');
  config.loadProjectEnv(root, env);
  assert.equal(env.DASHSCOPE_API_KEY, 'shell-test-value');
  assert.equal(env.QWEN_AUDIO_AGENT_DIR, '../upstream');
});
test('missing local env is allowed and does not read sibling credentials', t => {
  assert.equal(typeof config.loadProjectEnv, 'function');
  const root = fixture(t), env = {};
  writeFileSync(resolve(root, '.env.local'), 'DASHSCOPE_API_KEY=not-selected\n');
  config.loadProjectEnv(root, env);
  assert.deepEqual(env, {});
});
test('resolves an explicit checkout and rejects missing SDK files with setup advice', t => {
  assert.equal(typeof config.resolveQwen, 'function');
  const root = fixture(t);
  assert.throws(() => config.resolveQwen(root, {}), /QWEN_AUDIO_AGENT_DIR/);
  assert.throws(() => config.resolveQwen(root, { QWEN_AUDIO_AGENT_DIR: './qwen' }), /setup|install|安装/i);
  for (const path of ['shared/gateway/client-sdk.mjs', 'web/src/realtime/audio.js', 'server/src/index.mjs']) {
    const file = resolve(root, 'qwen', path); mkdirSync(dirname(file), { recursive: true }); writeFileSync(file, '');
  }
  assert.equal(config.resolveQwen(root, { QWEN_AUDIO_AGENT_DIR: './qwen' }), resolve(root, 'qwen'));
});
test('embedded runtime stays inside Yanshi and cannot pick up upstream env files', t => {
  assert.equal(typeof config.gatewayEnvironment, 'function');
  const root = fixture(t), upstream = resolve(root, 'upstream');
  const env = config.gatewayEnvironment(root, upstream);
  assert.equal(env.QWEN_AUDIO_AGENT_RUNTIME_ROOT, root);
  assert.equal(env.QWAUDIO_CONFIG_DIR, resolve(root, '.runtime/config'));
  assert.equal(env.QWEN_AUDIO_AGENT_FRONTEND_PROMPT_DIR, resolve(upstream, 'config/frontend-agent'));
  assert.equal(env.AGENT_PROTOCOL, 'none');
  assert.equal(env.HOST, '127.0.0.1');
});
