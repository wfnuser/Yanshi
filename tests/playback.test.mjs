import test from 'node:test';
import assert from 'node:assert/strict';
import { PcmPlayback } from '../src/playback.mjs';

// Web Audio is unavailable in Node: this clock/source double exposes the real
// browser callbacks; scheduling and receipt decisions remain production code.
function fixture() {
  const events = [], nodes = [];
  const ctx = { currentTime: 0, state: 'running',
    createBuffer(channels, length, rate) { return { duration: length / rate, copyToChannel() {} }; },
    createBufferSource() {
      const source = { connect() {}, disconnect() {}, start(at) { this.at = at; },
        stop() { this.stopped = true; this.onended?.(); } };
      nodes.push(source); return source;
    },
  };
  return { ctx, events, nodes, player: new PcmPlayback(ctx, {}, event => events.push(event)) };
}

test('reports started at playback time, not when audio arrives; done waits for playback', () => {
  const { player, ctx, events, nodes } = fixture();
  player.append(new Float32Array(2400), 24000, 'one');
  player.done('one');
  assert.equal(events.length, 0);
  ctx.currentTime = .03; player.tick();
  assert.equal(events[0]?.type, 'playback.started');
  assert.equal(player.playing, true);
  nodes[0].onended();
  assert.deepEqual(events.map(e => e.type), ['playback.started', 'playback.ended']);
  assert.equal(player.playing, false);
});

test('cancel stops queued sources and suppresses delayed chunks from the cancelled response', () => {
  const { player, events, nodes } = fixture();
  player.append(new Float32Array(2400), 24000, 'old');
  player.append(new Float32Array(2400), 24000, 'old');
  player.cancel('user_interrupt');
  assert.equal(nodes.length, 2);
  assert.ok(nodes.every(s => s.stopped));
  assert.deepEqual(events.map(e => e.type), ['playback.cancelled']);
  player.append(new Float32Array(2400), 24000, 'old');
  assert.equal(nodes.length, 2);
  player.append(new Float32Array(2400), 24000, 'new');
  assert.equal(nodes.length, 3);
});

test('temporary network gap does not end a response before audio.done arrives', () => {
  const { player, events, nodes, ctx } = fixture();
  player.append(new Float32Array(2400), 24000, 'one');
  ctx.currentTime = .03; player.tick(); nodes[0].onended();
  assert.equal(events.length, 1);
  player.append(new Float32Array(2400), 24000, 'one');
  player.done('one'); nodes[1].onended();
  assert.deepEqual(events.map(e => e.type), ['playback.started', 'playback.ended']);
});
