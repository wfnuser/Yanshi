import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
const root = resolve(import.meta.dirname, '..');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const server = createServer(async (req, res) => {
  if (req.url === '/') { res.setHeader('Content-Type', 'text/html'); res.end('<!doctype html><title>Audio integration test</title>'); return; }
  const path = resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
  if (!path.startsWith(root + '/')) { res.writeHead(403); res.end(); return; }
  try {
    const data = await readFile(path);
    res.setHeader('Content-Type', extname(path) === '.mjs' ? 'text/javascript' : 'audio/wav'); res.end(data);
  } catch { res.writeHead(404); res.end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
let browser;
try {
  browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${server.address().port}`);
  const result = await page.evaluate(async () => {
    const { PcmPlayback } = await import('/src/playback.mjs');
    const { LipDriver } = await import('/src/lips.mjs');
    const ctx = new AudioContext(); await ctx.resume();
    const bus = ctx.createGain(), analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
    bus.connect(analyser); analyser.connect(ctx.destination);
    const events = [], player = new PcmPlayback(ctx, bus, event => events.push(event)), lip = new LipDriver();
    const buffer = await ctx.decodeAudioData(await (await fetch('/public/audio/demo.wav')).arrayBuffer());
    const timer = setInterval(() => player.tick(), 10);
    player.append(buffer.getChannelData(0), buffer.sampleRate, 'demo'); player.done('demo');
    const samples = new Float32Array(1024), measures = [];
    for (let i = 0; i < 100; i++) {
      await new Promise(r => setTimeout(r, 20));
      analyser.getFloatTimeDomainData(samples);
      const rms = Math.sqrt(samples.reduce((sum, x) => sum + x*x, 0) / samples.length);
      lip.update({ rms, playing: player.playing, mode: 'rms', dt: .02 });
      measures.push({ time: ctx.currentTime, rms, mouth: lip.open, playing: player.playing });
    }
    player.cancel('test_interruption'); lip.update({ playing: player.playing });
    await new Promise(r => setTimeout(r, 100)); analyser.getFloatTimeDomainData(samples);
    const finalEnergy = Math.sqrt(samples.reduce((sum, x) => sum + x*x, 0) / samples.length);
    clearInterval(timer); await ctx.close();
    return { duration: buffer.duration, decodedSampleRate: buffer.sampleRate, events, measures, finalEnergy, finalMouth: lip.open };
  });
  assert.ok(result.duration > 14 && result.duration < 15);
  assert.ok(Math.max(...result.measures.map(x => x.rms)) > .01, 'real decoded audio must reach output analyser');
  assert.ok(Math.max(...result.measures.map(x => x.mouth)) > .1, 'real sound must open mouth');
  assert.equal(result.finalMouth, 0); assert.ok(result.finalEnergy < .0001, 'cancel must silence the real Web Audio graph');
  assert.deepEqual(result.events.map(e => e.type), ['playback.started', 'playback.cancelled']);
  await mkdir(resolve(root, 'artifacts'), { recursive: true });
  await writeFile(resolve(root, 'artifacts/browser-audio.json'), JSON.stringify({ date: new Date().toISOString(), browser: browser.version(), ...result }, null, 2));
  console.log(JSON.stringify({ passed: true, browser: browser.version(), duration: result.duration, peakMouth: Math.max(...result.measures.map(x => x.mouth)), finalEnergy: result.finalEnergy, events: result.events }, null, 2));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
