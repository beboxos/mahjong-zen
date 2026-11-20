/* ui/hud — score défilant, IQ, matches, bannière Combo, tiroir. */
(function (MJ) {
  const $ = id => document.getElementById(id);
  const HUD = {
    shown: 0, target: 0, raf: 0,
    init() { this.el = { lvl: $('hudLevel'), score: $('hudScore'), match: $('hudMatches'), iq: $('hudIQ'), sg: $('scoreGlow'), ig: $('iqGlow'),
      banner: $('comboBanner'), text: $('comboText'), bar: $('comboBar'), tray: $('tray'), coinBox: $('coinBox'), coins: $('coinCount') }; },
    level(n) { this.el.lvl.textContent = n; },
    matches(n) { this.el.match.textContent = n; },
    iq(v, glow) { this.el.iq.textContent = v.toFixed(1); if (glow) this.glow(this.el.ig); },
    glow(g) { g.classList.remove('on'); void g.offsetWidth; g.classList.add('on'); },
    /** compteur défilant */
    score(v, instant) {
      this.target = v;
      if (instant) { this.shown = v; this.el.score.textContent = v; return; }
      this.glow(this.el.sg);
      cancelAnimationFrame(this.raf);
      const from = this.shown, t0 = performance.now(), dur = 500;
      const step = now => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        this.shown = Math.round(from + (this.target - from) * e);
        this.el.score.textContent = this.shown;
        if (k < 1) this.raf = requestAnimationFrame(step);
      };
      this.raf = requestAnimationFrame(step);
    },
    combo(n, frac) {
      const b = this.el.banner;
      const aura = $('aura'), stg = $('stage');
      if (n < 2) { b.classList.remove('on', 'rainbow'); this.el.tray.classList.remove('glow'); aura.classList.remove('on'); return; }
      stg.style.setProperty('--cc', MJ.VFX.comboColor(n));
      b.style.setProperty('--sc', (1 + Math.min(n, 20) * 0.01).toFixed(2));
      b.classList.toggle('rainbow', n >= 15);
      aura.style.setProperty('--ai', (Math.min(n, 20) / 20).toFixed(2)); aura.classList.toggle('on', n >= 3);
      const changed = this.el.text.textContent !== 'Combo x' + n;
      this.el.text.textContent = 'Combo x' + n;
      b.classList.add('on'); this.el.tray.classList.add('glow');
      if (changed) { b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); }
      this.el.bar.style.setProperty('--t', frac);
    },
    comboFrac(frac) { this.el.bar.style.setProperty('--t', Math.max(0, frac)); },
    coins(n, show) { this.el.coins.textContent = n; if (show) { this.el.coinBox.classList.add('show'); clearTimeout(this.ct); this.ct = setTimeout(() => this.el.coinBox.classList.remove('show'), 2600); } },
    badge(id, v) { $(id).textContent = v; $(id).parentElement.disabled = (v === 0); },
  };
  MJ.HUD = HUD;
})(window.MJ = window.MJ || {});
