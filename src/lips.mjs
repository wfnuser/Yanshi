export class LipDriver {
  open = 0;
  form = 0;
  update({ rms = 0, weights = {}, playing = false, mode = 'vowel', dt = 1 / 60 } = {}) {
    if (!playing || !Number.isFinite(rms)) {
      this.open = this.form = 0;
      return { open: 0, form: 0 };
    }
    const energy = Math.min(1, Math.max(0, (rms - .008) * 7));
    let opening = 1, shape = 0;
    if (mode === 'vowel') {
      const vowels = Object.entries({ A: [1, .3], I: [.4, 1], U: [.4, -1], E: [.7, .7], O: [.8, -.7] });
      const total = vowels.reduce((sum, [v]) => sum + Math.max(0, Number(weights[v]) || 0), 0);
      if (total > .01) {
        opening = shape = 0;
        for (const [v, [o, f]] of vowels) {
          const w = Math.max(0, Number(weights[v]) || 0) / total;
          opening += o * w; shape += f * w;
        }
      }
    }
    const smoothing = 1 - Math.exp(-Math.max(0, Math.min(Number(dt) || 0, 1)) / .045);
    this.open += (energy * opening - this.open) * smoothing;
    this.form = mode === 'rms' ? 0 : this.form + (shape * energy - this.form) * smoothing;
    return { open: this.open, form: this.form };
  }
}
