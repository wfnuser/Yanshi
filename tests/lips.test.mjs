import test from 'node:test';
import assert from 'node:assert/strict';
import { LipDriver } from '../src/lips.mjs';

test('silent or stopped playback closes the mouth even with stale phoneme weights', () => {
  const lip = new LipDriver();
  for (let i=0;i<20;i++) lip.update({rms:.15,weights:{A:1},playing:true,dt:1/60});
  assert.ok(lip.open > .3);
  lip.update({rms:0,weights:{A:1},playing:false,dt:1/60});
  assert.equal(lip.open,0);
});

test('vowels alter shape while RMS mode only opens the mouth', () => {
  const a=new LipDriver(), u=new LipDriver();
  for (let i=0;i<30;i++) {
    a.update({rms:.15,weights:{A:1},playing:true,dt:1/60});
    u.update({rms:.15,weights:{U:1},playing:true,dt:1/60});
  }
  assert.ok(a.open > u.open);
  assert.ok(a.form > u.form);
  const simple=new LipDriver();
  simple.update({rms:.15,weights:{U:1},playing:true,mode:'rms',dt:1});
  assert.equal(simple.form,0);
});

test('mouth values remain within model limits and reject invalid energy', () => {
  const lip=new LipDriver();
  lip.update({rms:10,weights:{A:1},playing:true,dt:1});
  assert.ok(lip.open <= 1 && lip.open >= 0);
  lip.update({rms:NaN,playing:false,dt:1});
  assert.equal(lip.open,0);
});
