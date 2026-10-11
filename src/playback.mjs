export class PcmPlayback {
  constructor(context, destination, send = () => {}) {
    this.context = context; this.destination = destination; this.send = send;
    this.sources = new Set(); this.responses = new Map(); this.cancelled = new Set(); this.cursor = 0;
  }
  append(samples, sampleRate, responseId) {
    if (!samples.length || !responseId || this.cancelled.has(responseId)) return;
    let response = this.responses.get(responseId);
    if (!response) {
      response = { responseId, count: 0, started: false, done: false, at: Infinity };
      this.responses.set(responseId, response);
    }
    const buffer = this.context.createBuffer(1, samples.length, sampleRate);
    buffer.copyToChannel(samples, 0);
    const source = this.context.createBufferSource(); source.buffer = buffer;
    source.connect(this.destination);
    const at = Math.max(this.context.currentTime + .02, this.cursor);
    this.cursor = at + buffer.duration; response.at = Math.min(response.at, at); response.count++;
    const entry = { source, response, at, end: this.cursor }; this.sources.add(entry);
    source.onended = () => {
      if (!this.sources.delete(entry)) return;
      this.tick(); response.count--; source.disconnect(); this.finish(response);
    };
    source.start(at);
  }
  tick() {
    if (this.context.state !== 'running') return;
    for (const r of this.responses.values()) {
      if (!r.started && this.context.currentTime >= r.at) {
        r.started = true; this.send({ type: 'playback.started', responseId: r.responseId });
      }
    }
  }
  done(responseId) {
    const r = this.responses.get(responseId);
    if (r) { r.done = true; this.finish(r); }
  }
  finish(r) {
    if (r.done && !r.count && this.responses.has(r.responseId)) {
      this.responses.delete(r.responseId);
      this.send({ type: 'playback.ended', responseId: r.responseId });
    }
  }
  cancel(reason = 'interrupted') {
    for (const r of this.responses.values()) {
      this.cancelled.add(r.responseId);
      this.send({ type: 'playback.cancelled', responseId: r.responseId, reason });
    }
    this.responses.clear();
    const entries = [...this.sources]; this.sources.clear();
    for (const { source } of entries) { source.onended = null; source.stop(); source.disconnect(); }
    this.cursor = this.context.currentTime;
  }
  get playing() {
    return this.context.state === 'running' && [...this.sources].some(e => this.context.currentTime >= e.at && this.context.currentTime < e.end);
  }
}
