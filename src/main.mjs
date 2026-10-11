import './style.css';
import { LipDriver } from './lips.mjs';
import { PcmPlayback } from './playback.mjs';
import { GatewayClient } from '@qwen/shared/gateway/client-sdk.mjs';
import { createStreamingResampler, pcmBase64, decodePcm, createRealtimeAudioSendController } from '@qwen/web/src/realtime/audio.js';

const $ = id => document.getElementById(id);
const lip = new LipDriver(), rows = new Map();
let ctx, bus, analyser, vowelNode, player, avatar, pixi, client, micStream, micSource, capture;
let ready = false, muted = false, inputSuspended = false, inputRate = 16000, turnId = '';
let demoId = '', lastFrame = performance.now();
const stats = { inputPackets: 0, inputWhilePlaying: 0, outputPackets: 0, playbackClears: 0, droppedInput: 0, events: [] };
const resampler = createStreamingResampler();
function error(message) { $('error').textContent = message; $('error').hidden = !message; }
function record(event) {
  const copy = { at: new Date().toISOString(), ...event };
  delete copy.audio; delete copy.content;
  stats.events.push(copy); if (stats.events.length > 80) stats.events.shift();
}
function controls() {
  $('connect').disabled = !!client;
  $('disconnect').disabled = !client;
  $('mute').disabled = !ready;
  $('text-input').disabled = $('send').disabled = !ready;
  $('mute').textContent = muted ? '打开麦克风' : '麦克风静音';
  $('demo').disabled = !!client;
}
function send(event) {
  if (!client) return false;
  if (!event.type.startsWith('audio.')) record({ direction: 'out', ...event });
  return client.send(event);
}
function stopPlayback(reason) {
  player?.cancel(reason); demoId = '';
  lip.update({ playing: false });
}
async function audio() {
  if (!ctx) {
    ctx = new AudioContext(); bus = ctx.createGain(); analyser = ctx.createAnalyser(); analyser.fftSize = 1024;
    bus.connect(analyser); analyser.connect(ctx.destination);
    player = new PcmPlayback(ctx, bus, event => { if (!event.responseId.startsWith('demo-')) send(event); record(event); });
    // Receipts must keep working even when requestAnimationFrame is throttled.
    setInterval(() => player?.tick(), 20);
    try {
      const { createWLipSyncNode } = await import('wlipsync');
      const response = await fetch('/profile.json'); if (!response.ok) throw new Error('口型 profile 未下载');
      vowelNode = await createWLipSyncNode(ctx, await response.json()); bus.connect(vowelNode);
      $('lip-status').textContent = '本地元音分析已就绪 · 无额外 API 调用';
    } catch (e) {
      $('lip-mode').value = 'rms'; $('lip-mode').options[0].disabled = true;
      $('lip-status').textContent = `元音分析不可用，当前用音量开合：${e.message}`;
    }
  }
  await ctx.resume(); return ctx;
}
async function loadAvatar() {
  try {
    const PIXI = await import('pixi.js'); window.PIXI = PIXI;
    const { Live2DModel } = await import('pixi-live2d-display/cubism4');
    pixi = new PIXI.Application({ view: $('avatar'), backgroundAlpha: 0, antialias: true, autoDensity: true, resolution: Math.min(devicePixelRatio, 2) });
    avatar = await Live2DModel.from('/models/Hiyori/Hiyori.model3.json', { autoInteract: false });
    pixi.stage.addChild(avatar); avatar.anchor.set(.5, 1);
    const resize = () => {
      const stage = document.querySelector('.stage'); pixi.renderer.resize(stage.clientWidth, stage.clientHeight);
      avatar.scale.set(1); const natural = avatar.height;
      avatar.scale.set(stage.clientHeight * .96 / natural);
      avatar.position.set(stage.clientWidth * .59, stage.clientHeight + 36);
    };
    new ResizeObserver(resize).observe(document.querySelector('.stage')); resize();
    avatar.internalModel.on('beforeModelUpdate', () => {
      avatar.internalModel.coreModel.setParameterValueById('ParamMouthOpenY', lip.open);
      avatar.internalModel.coreModel.setParameterValueById('ParamMouthForm', lip.form);
    });
    $('avatar-loading').hidden = true;
  } catch (e) {
    $('avatar-loading').textContent = '人物尚未加载，请检查素材下载与 WebGL。';
    error(`Live2D：${e.message}`);
  }
}
function transcript(event) {
  const key = `${event.role}:${event.responseId || event.turnId || 'current'}`;
  let row = rows.get(key);
  if (!row) {
    $('empty')?.remove(); const element = document.createElement('article'); element.className = `message ${event.role}`;
    const title = document.createElement('strong'); title.textContent = event.role === 'user' ? '你' : 'Hiyori';
    const body = document.createElement('p'); element.append(title, body); $('messages').append(element);
    row = { element, body, text: '' }; rows.set(key, row);
  }
  if (event.type === 'transcript.discard') { row.element.remove(); rows.delete(key); return; }
  row.text = event.type === 'transcript.final' || event.replace ? event.content || '' : row.text + (event.content || '');
  row.body.textContent = row.text;
  $('messages').scrollTop = $('messages').scrollHeight;
}
function handle(event) {
  if (event.type !== 'audio.delta') record({ direction: 'in', ...event });
  if (event.type === 'voice.ready') { ready = true; inputRate = event.inputSampleRate || 16000; $('connection').textContent = '已连接 · 随时开口'; error(''); controls(); }
  if (event.type === 'voice.connection' && event.state === 'unavailable') { ready = false; controls(); error(event.message || '模型连接不可用，请结束后重试。'); }
  if (event.type === 'turn.started') turnId = event.turnId || '';
  if (event.type === 'input.suspend') { inputSuspended = true; send({ type: 'input.suspend.ack' }); }
  if (event.type === 'input.resume') inputSuspended = false;
  if (event.type === 'playback.clear' || (event.type === 'voice.state' && event.state === 'listening' && (!event.turnId || event.turnId === turnId))) {
    stats.playbackClears++; stopPlayback(event.reason || 'user_interruption');
  }
  if (event.type === 'audio.delta') { stats.outputPackets++; player.append(decodePcm(event.audio), event.sampleRate || 24000, event.responseId); }
  if (event.type === 'audio.done') player.done(event.responseId);
  if (event.type.startsWith('transcript.')) transcript(event);
  if (event.type === 'error') error(event.message || 'Gateway 返回错误');
}
async function connect() {
  if (client) return;
  $('connect').disabled = true; error(''); stopPlayback('connecting');
  try {
    await audio();
    micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    await ctx.audioWorklet.addModule('/mic-worklet.js');
    capture = new AudioWorkletNode(ctx, 'avatar-capture');
    micSource = ctx.createMediaStreamSource(micStream); micSource.connect(capture); capture.connect(ctx.destination);
    muted = false; inputSuspended = false; resampler.reset();
    client = new GatewayClient({
      url: `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/realtime?sessionId=avatar-${crypto.randomUUID()}`,
      createSocket: url => new WebSocket(url),
      clientType: 'web', clientLabel: 'Live2D 工作台', clientInstanceId: crypto.randomUUID(), reconnect: false,
      capabilities: ['input.audio', 'input.text', 'playback.receipts', 'session.heartbeat'],
      locale: 'zh-CN', timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      configure: () => ({ voiceEnabled: true, inputEnabled: true, outputEnabled: true, textOnly: false }),
      onEvent: handle,
      onStatus: status => {
        record({ type: 'connection', state: status.state });
        if (!['connected','ready'].includes(status.state)) ready = false;
        const label = { connecting: '正在连接…', connected: 'Gateway 已连接', ready: '正在连接语音模型…', unavailable: '连接失败', disconnected: '已断开' };
        $('connection').textContent = label[status.state] || status.state;
        if (status.state === 'unavailable' || status.state === 'disconnected') {
          const message = status.error?.message || (status.state === 'unavailable' ? '连接失败，请检查 Gateway 日志。' : '连接已中断，麦克风已关闭。');
          queueMicrotask(() => { disconnect(); error(message); });
        }
        controls();
      },
    });
    const sender = createRealtimeAudioSendController({ send, getBufferedAmount: () => client?.bufferedAmount || 0, onDrop: () => stats.droppedInput++ });
    capture.port.onmessage = ({ data }) => {
      // Input is never gated on output playback. The model detects interruption.
      if (!ready || muted || inputSuspended) return;
      const pcm = resampler.process(new Float32Array(data.samples), ctx.sampleRate, inputRate);
      if (pcm.length && sender.send({ type: 'audio.append', audio: pcmBase64(pcm) })) {
        stats.inputPackets++; if (player.playing) stats.inputWhilePlaying++;
      }
    };
    client.start(); controls();
  } catch (e) { disconnect(); error(`无法开始：${e.message}`); }
}
function disconnect() {
  ready = false; stopPlayback('disconnect'); const previous = client; client = null; previous?.stop();
  micStream?.getTracks().forEach(t => t.stop()); micStream = null;
  if (capture) { capture.port.onmessage = null; capture.disconnect(); capture = null; }
  micSource?.disconnect(); micSource = null; resampler.reset();
  $('connection').textContent = '未连接'; controls();
}
$('connect').onclick = connect;
$('disconnect').onclick = disconnect;
$('mute').onclick = () => {
  muted = !muted; micStream?.getAudioTracks().forEach(t => t.enabled = !muted); resampler.reset();
  send({ type: muted ? 'input.mute' : 'input.unmute' }); controls();
};
$('interrupt').onclick = () => { stopPlayback('manual_interrupt'); if (client) send({ type: 'interrupt' }); };
$('text-form').onsubmit = event => {
  event.preventDefault(); const text = $('text-input').value.trim();
  if (ready && text) { stopPlayback('text_input'); send({ type: 'text.message', text }); $('text-input').value = ''; }
};
$('demo').onclick = async () => {
  try {
    error(''); await audio(); stopPlayback('demo_restart');
    const response = await fetch('/audio/demo.wav'); if (!response.ok) throw new Error('请先运行 npm run assets 生成测试音频');
    const buffer = await ctx.decodeAudioData(await response.arrayBuffer());
    demoId = `demo-${crypto.randomUUID()}`; player.append(buffer.getChannelData(0), buffer.sampleRate, demoId); player.done(demoId);
  } catch (e) { error(e.message); }
};
const samples = new Float32Array(1024);
function frame(now) {
  const dt = (now - lastFrame) / 1000; lastFrame = now;
  let rms = 0;
  if (analyser) { analyser.getFloatTimeDomainData(samples); rms = Math.sqrt(samples.reduce((s, v) => s + v * v, 0) / samples.length); }
  lip.update({ rms, weights: vowelNode?.weights || {}, playing: !!player?.playing, mode: $('lip-mode').value, dt });
  $('mouth-meter').value = lip.open;
  $('speech-state').textContent = player?.playing ? '正在说话' : ready ? (muted ? '麦克风已静音' : '在听你说') : '安静待命';
  requestAnimationFrame(frame);
}
setInterval(() => { $('diagnostics').textContent = JSON.stringify({ inputPackets: stats.inputPackets, inputWhilePlaying: stats.inputWhilePlaying, outputPackets: stats.outputPackets, playbackClears: stats.playbackClears, droppedInput: stats.droppedInput, audioClock: ctx?.currentTime, mouth: lip.open, events: stats.events.slice(-8) }, null, 2); }, 1000);
window.addEventListener('pagehide', disconnect);
loadAvatar(); requestAnimationFrame(frame);
