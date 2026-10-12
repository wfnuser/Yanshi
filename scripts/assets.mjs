import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { requireAssetConsent, verifyAsset } from './asset-policy.mjs';

const root = resolve(import.meta.dirname, '..');
requireAssetConsent(process.argv.slice(2));
const manifest = JSON.parse(await readFile(resolve(root, 'assets.lock.json'), 'utf8'));
for (const asset of manifest.assets) {
  const dest = resolve(root, 'public', asset.path);
  let data;
  try { data = await readFile(dest); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (data) {
    verifyAsset(data, asset.sha256);
    console.log('Verified cached asset:', asset.path);
    continue;
  }
  data = execFileSync('curl', ['--fail', '--location', '--retry', '2', '--max-time', '60', asset.url], { maxBuffer: 16 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  verifyAsset(data, asset.sha256);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, data);
  console.log('Downloaded verified asset:', asset.path);
}
console.log('Assets ready. Optional local speech: npm run demo-audio (macOS + ffmpeg).');
