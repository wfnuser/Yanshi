class Capture extends AudioWorkletProcessor {
  constructor() {
    super(); this.packet = new Float32Array(Math.round(sampleRate * .02)); this.offset = 0;
  }
  process(inputs, outputs) {
    for (const channels of outputs) for (const channel of channels) channel.fill(0);
    const samples = inputs[0]?.[0];
    if (!samples) return true;
    for (const value of samples) {
      this.packet[this.offset++] = value;
      if (this.offset === this.packet.length) {
        this.port.postMessage({ samples: this.packet.buffer }, [this.packet.buffer]);
        this.packet = new Float32Array(Math.round(sampleRate * .02)); this.offset = 0;
      }
    }
    return true;
  }
}
registerProcessor('avatar-capture', Capture);
