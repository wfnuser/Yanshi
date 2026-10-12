import test from 'node:test';
import assert from 'node:assert/strict';
import * as policy from '../scripts/asset-policy.mjs';
test('asset downloads require explicit third-party terms acknowledgement', () => {
  assert.equal(typeof policy.requireAssetConsent, 'function');
  assert.throws(() => policy.requireAssetConsent([]), /accept-third-party-terms/);
  assert.doesNotThrow(() => policy.requireAssetConsent(['--accept-third-party-terms']));
});
test('changed asset bytes are rejected rather than silently installed', () => {
  assert.equal(typeof policy.verifyAsset, 'function');
  const digest = 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad';
  assert.doesNotThrow(() => policy.verifyAsset(Buffer.from('abc'), digest));
  assert.throws(() => policy.verifyAsset(Buffer.from('changed'), digest), /checksum/i);
});
