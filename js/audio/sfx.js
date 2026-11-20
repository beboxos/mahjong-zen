/* audio/sfx — audio 100 % procédural (Web Audio), même structure que hexa-sort : init sur geste, bus master, bruit partagé. */
(function (MJ) {
  const PENTA = [0, 2, 4, 7, 9];
  const Sfx = {
    ctx: null, master: null, noise: null, muted: false,
    init() {
      if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      const c = this.ctx = new AC();
      this.master = c.createGain(); this.master.gain.value = 0.6;
      // petite réverbe : écho filtré
      const d = c.createDelay(); d.delayTime.value = 0.13;
      const fb = c.createGain(); fb.gain.value = 0.28;
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
      this.master.connect(c.destination);
      this.master.connect(d); d.connect(lp); lp.connect(fb); fb.connect(d); lp.connect(c.destination);
      this.noise = c.createBuffer(1, c.sampleRate, c.sampleRate);
      const a = this.noise.getChannelData(0);
      for (let i = 0; i < a.length; i++) a[i] = Math.random() * 2 - 1;
    },
    ok() { return this.ctx && !this.muted && this.ctx.state !== 'closed'; },
    tone(freq, dur, type = 'sine', gain = .2, when = 0, endFreq = null) {
      if (!this.ok()) return;
      const c = this.ctx, t = c.currentTime + when, o = c.createOscillator(), g = c.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (endFreq) o.frequency.exponentialRampToValueAtTime(endFreq, t + dur);
      g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(gain, t + .008); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      o.connect(g).connect(this.master); o.start(t); o.stop(t + dur + .05);
    },
    hit(freq, q, dur, gain, when = 0, type = 'bandpass') {
      if (!this.ok()) return;
      const c = this.ctx, t = c.currentTime + when, s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = this.noise; f.type = type; f.frequency.value = freq; f.Q.value = q;
      g.gain.setValueAtTime(gain, t); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
      s.connect(f).connect(g).connect(this.master); s.start(t, Math.random() * .5); s.stop(t + dur + .02);
    },
    /** claquement sec ivoire / bois */
    clack(when = 0, pitch = 1, gain = .5) {
      this.hit(2400 * pitch, 3, .045, gain, when);
      this.hit(900 * pitch, 2, .07, gain * .7, when);
      this.tone(1200 * pitch, .05, 'sine', gain * .25, when, 600 * pitch);
    },
    tap() { this.clack(0, 1.1, .45); },
    blocked() { this.tone(110, .11, 'sine', .35, 0, 70); this.hit(300, 1, .06, .25); },
    /** marimba / guzheng : fondamentale + harmonique, hauteur selon le combo */
    note(combo, when = 0) {
      const i = Math.min(Math.max(combo - 1, 0), 14), semi = PENTA[i % 5] + 12 * Math.floor(i / 5);
      const f = 523.25 * Math.pow(2, semi / 12);
      this.tone(f, .55, 'sine', .3, when); this.tone(f * 4, .14, 'sine', .09, when);
      this.tone(f * 2, .4, 'triangle', .11, when);
    },
    match(combo) { this.clack(0, 1, .5); this.clack(.07, 1.15, .5); this.note(combo, .13); },
    flip() { this.hit(1800, .8, .22, .22, 0, 'highpass'); this.tone(420, .16, 'sine', .1, 0, 780); },
    coin(when = 0) { this.tone(1568, .16, 'square', .06, when); this.tone(2093, .3, 'sine', .14, when + .06); },
    door() { this.hit(500, .6, .9, .22, 0, 'lowpass'); this.hit(2200, .7, .5, .06, .1, 'bandpass'); },
    deal() { this.clack(0, 1.3 + Math.random() * .3, .16); },
    arpeggio(notes = [0, 4, 7, 12, 16, 19], step = .09) {
      notes.forEach((n, i) => { const f = 523.25 * Math.pow(2, n / 12); this.tone(f, .6, 'sine', .22, i * step); this.tone(f * 2, .3, 'triangle', .07, i * step); });
    },
    tier(l) { this.arpeggio(l === 0 ? [0, 4, 7, 12] : l === 1 ? [0, 4, 7, 12, 16] : [0, 4, 7, 12, 16, 19, 24], .08); },
    win() { this.arpeggio([0, 4, 7, 12, 16, 19, 24, 28], .11); },
    lose() { this.tone(300, .5, 'sawtooth', .12, 0, 120); },
    setMuted(m) { this.muted = m; },
  };
  MJ.Sfx = Sfx;
})(window.MJ = window.MJ || {});
