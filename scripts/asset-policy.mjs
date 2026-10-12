import { createHash } from 'node:crypto';

export function requireAssetConsent(args) {
  if (!args.includes('--accept-third-party-terms')) {
    throw new Error('Read THIRD_PARTY_NOTICES.md, then run npm run assets -- --accept-third-party-terms. These assets are NOT Apache-2.0.');
  }
}

export function verifyAsset(data, expected) {
  if (createHash('sha256').update(data).digest('hex') !== expected) {
    throw new Error('Asset checksum mismatch; stop and review the upstream source before updating assets.lock.json.');
  }
}
