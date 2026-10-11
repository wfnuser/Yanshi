import test from 'node:test';
import assert from 'node:assert/strict';
import { configuredProxy, withProxy } from '../scripts/proxy.mjs';

test('proxy selection respects opt-out, explicit config and enabled system proxy', () => {
  const system = '  HTTPSEnable : 1\n  HTTPSProxy : 127.0.0.1\n  HTTPSPort : 7890\n';
  assert.equal(configuredProxy({}, system), 'http://127.0.0.1:7890');
  assert.equal(configuredProxy({ AVATAR_HTTPS_PROXY: 'off' }, system), null);
  assert.equal(configuredProxy({ HTTPS_PROXY: 'http://localhost:8080' }, system), 'http://localhost:8080/');
  assert.equal(configuredProxy({}, system.replace('Enable : 1', 'Enable : 0')), null);
});

test('provider adapter preserves headers and explicit agents, never proxies localhost', () => {
  class Socket { constructor(url, options) { this.options = options; } }
  const agent = {}, ownAgent = {}, headers = { Authorization: 'test-only' };
  const Adapter = withProxy(Socket, agent);
  assert.deepEqual(new Adapter('wss://example.org', { headers }).options, { headers, agent });
  assert.equal(new Adapter('wss://example.org', { agent: ownAgent }).options.agent, ownAgent);
  assert.equal(new Adapter('ws://localhost:8786').options.agent, undefined);
});
