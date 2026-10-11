import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

test('capture emits independent 20ms PCM packets and never loops microphone into speakers', () => {
  let Processor; const packets=[];
  vm.runInNewContext(readFileSync(new URL('../public/mic-worklet.js', import.meta.url), 'utf8'), {
    sampleRate:48000, Float32Array,
    AudioWorkletProcessor:class { port={postMessage(message){ packets.push(message); }}; },
    registerProcessor(name, cls){Processor=cls;},
  });
  const processor=new Processor();
  for(let i=0;i<15;i++) {
    const output=new Float32Array(128).fill(1);
    assert.equal(processor.process([[new Float32Array(128).fill(.25)]],[[output]]),true);
    assert.ok(output.every(x=>x===0));
  }
  assert.equal(packets.length,2);
  assert.equal(packets[0].samples.byteLength,960*4);
  assert.ok(new Float32Array(packets[0].samples).every(x=>x===.25));
});
