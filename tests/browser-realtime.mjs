import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage({ viewport: { width: 1360, height: 950 } });
const trace = [], errors = [];
page.on('pageerror', e => errors.push(e.message));
page.on('websocket', socket => {
  if (!socket.url().includes('/api/realtime')) return;
  for (const direction of ['framesent', 'framereceived']) socket.on(direction, ({ payload }) => {
    try {
      const event = JSON.parse(String(payload));
      if (event.type === 'audio.delta' || event.type === 'input_audio_buffer.append' || event.type === 'audio.append') return;
      trace.push({ time: Date.now(), direction, ...event });
    } catch {}
  });
});
// Inject only the microphone source, not Gateway messages or response events.
// The normal client capture worklet/resampler/websocket carry this real PCM.
await page.addInitScript(() => {
  navigator.mediaDevices.getUserMedia = async () => {
    const context = new AudioContext(); await context.resume();
    const destination = context.createMediaStreamDestination();
    const oscillator = context.createOscillator(), gain = context.createGain(); gain.gain.value = 0;
    oscillator.connect(gain).connect(destination); oscillator.start();
    window.testSpeak = async () => {
      const buffer = await context.decodeAudioData(await (await fetch('/audio/interrupt.wav')).arrayBuffer());
      const source = context.createBufferSource(); source.buffer = buffer; source.connect(destination); source.start();
      return { duration: buffer.duration, at: Date.now() };
    };
    return destination.stream;
  };
});
await mkdir('artifacts', { recursive: true });
try {
  await page.goto('http://127.0.0.1:8785');
  await page.getByRole('button', { name: '开始对话' }).click();
  await page.waitForFunction(() => !document.getElementById('text-input').disabled, null, { timeout: 45000 });
  await page.locator('#text-input').fill('请用中文详细介绍太阳系的八大行星，至少讲两分钟，从水星开始，每个行星都介绍几个特点。直接开始介绍。');
  await page.getByRole('button', { name: '发送', exact: true }).click();
  await page.waitForFunction(() => document.getElementById('mouth-meter').value > .1, null, { timeout: 45000 });
  await page.waitForTimeout(1000);
  const before = JSON.parse(await page.locator('#diagnostics').textContent());
  const injected = await page.evaluate(() => window.testSpeak());
  await page.waitForFunction(old => JSON.parse(document.getElementById('diagnostics').textContent).playbackClears > old, before.playbackClears, { timeout: 20000 });
  // Wait for the NEW spoken response to actually finish, not just ASR or a
  // response-created event. We must not disconnect while "好的" is queued.
  await page.waitForFunction(() => document.querySelector('#messages').textContent.includes('好的。'), null, { timeout: 30000 });
  const responseDeadline = Date.now() + 30000;
  while (!trace.some(e => e.time > injected.at && e.type === 'playback.ended')) {
    if (Date.now() > responseDeadline) throw new Error('No completed spoken reply after interruption');
    await page.waitForTimeout(200);
  }
  await page.waitForTimeout(1100);
  const after = JSON.parse(await page.locator('#diagnostics').textContent());
  const transcript = await page.locator('#messages').innerText();
  await page.screenshot({ path: 'artifacts/realtime-barge-in.png', fullPage: true });
  await page.getByRole('button', { name: '结束对话' }).click();
  const result = { date: new Date().toISOString(), browser: browser.version(), injected, before, after, transcript, trace, errors };
  await writeFile('artifacts/realtime-barge-in.json', JSON.stringify(result, null, 2));
  assert.ok(after.outputPackets > 0, 'Qwen must emit real audio');
  assert.ok(after.inputWhilePlaying > 0, 'microphone PCM must continue while output plays');
  assert.ok(trace.some(e => e.time >= injected.at && e.type === 'playback.cancelled'), 'native interruption must cancel actual playback');
  assert.match(transcript, /等一下|先停下|停下|好的/);
  assert.match(transcript, /请用中文详细介绍太阳系/);
  assert.ok(trace.some(e => e.time > injected.at && e.type === 'transcript.final' && e.role === 'assistant' && /好的/.test(e.content)), 'model must respond to spoken request');
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: true, before, after, transcript }, null, 2));
} catch (e) {
  const uiError = await page.locator('#error').innerText({ timeout: 1000 }).catch(() => 'Page unavailable');
  console.error(uiError, errors);
  await writeFile('artifacts/realtime-failure.json', JSON.stringify({ message: e.message, uiError, trace, errors }, null, 2));
  await page.screenshot({ path: 'artifacts/realtime-failure.png', fullPage: true }).catch(() => {});
  throw e;
} finally {
  await page.getByRole('button', { name: '结束对话' }).click({ timeout: 1000 }).catch(() => {});
  await browser.close();
}
