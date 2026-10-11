import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1360, height: 950 } });
const errors = []; page.on('pageerror', e => errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:8785');
  await page.waitForFunction(() => document.getElementById('avatar-loading').hidden, { timeout: 30000 });
  await mkdir('artifacts', { recursive: true });
  await page.screenshot({ path: 'artifacts/avatar-idle.png', fullPage: true });
  await page.getByRole('button', { name: '播放测试音频' }).click();
  await page.waitForFunction(() => document.getElementById('mouth-meter').value > .1);
  await page.screenshot({ path: 'artifacts/avatar-speaking.png', fullPage: true });
  const local = await page.locator('#lip-status').innerText();
  assert.match(local, /本地元音分析已就绪/);
  await page.getByRole('button', { name: '停下，听我说' }).click();
  await page.waitForFunction(() => document.getElementById('mouth-meter').value === 0);
  assert.deepEqual(errors, []);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'artifacts/avatar-mobile.png', fullPage: true });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await writeFile('artifacts/browser-ui.json', JSON.stringify({ passed: true, date: new Date().toISOString(), browser: browser.version(), local, errors }, null, 2));
  console.log('Live2D rendering, local vowel analysis, demo lips, stop and mobile layout passed.');
} catch (e) {
  console.error('Page errors:', errors); console.error('UI error:', await page.locator('#error').innerText({ timeout: 1000 }).catch(() => 'Page unavailable'));
  await page.screenshot({ path: 'artifacts/ui-failure.png', fullPage: true }); throw e;
} finally { await browser.close(); }
