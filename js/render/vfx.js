/* render/vfx — particules (feuilles de bambou, sakura, étincelles, confettis), textes flottants,
 * pièces en Bézier, mascotte, paliers. Tout en éléments DOM animés via Web Animations API. */
(function (MJ) {
  const R = (a, b) => a + Math.random() * (b - a);
  const P = {
    fx: null,
    init(fx) { this.fx = fx; },

    node(cls, html, x, y, css) {
      const d = document.createElement('div');
      d.className = cls; if (html) d.innerHTML = html;
      d.style.left = x + 'px'; d.style.top = y + 'px';
      if (css) Object.assign(d.style, css);
      this.fx.appendChild(d); return d;
    },
    play(d, frames, opt) { const a = d.animate(frames, opt); a.onfinish = () => d.remove(); return a; },

    /** Particule balistique : positions échantillonnées (gravité douce) */
    particle(x, y, kind, power = 1) {
      const svg = kind === 'leaf' ? MJ.Symbols.leaf
        : kind === 'petal' ? '<svg viewBox="0 0 12 12"><path d="M6 0 Q12 3 9 11 Q6 9 3 11 Q0 3 6 0Z" fill="#F7A8C2"/><path d="M6 2 V9" stroke="#fff" stroke-opacity=".5"/></svg>'
        : kind === 'spark' ? '<svg viewBox="0 0 12 12"><path d="M6 0 L7.4 4.6 12 6 7.4 7.4 6 12 4.6 7.4 0 6 4.6 4.6Z" fill="#FFE047"/></svg>'
        : `<svg viewBox="0 0 12 12"><rect x="1" y="3" width="10" height="6" fill="${['#FFE047', '#fff', '#2CE84F', '#FF5C8A', '#3CC8FF'][Math.floor(Math.random() * 5)]}"/></svg>`;
      const d = this.node('fx-p', svg, x, y);
      const sc = kind === 'leaf' ? R(1.1, 1.8) : kind === 'petal' ? R(.8, 1.3) : R(.5, 1);
      if (kind === 'leaf') d.style.width = '30px';
      const a = R(0, Math.PI * 2), v = R(90, 280) * power, g = R(380, 620), life = R(700, 1300);
      const vx = Math.cos(a) * v, vy = Math.sin(a) * v - 140, spin = R(-540, 540), N = 12, fr = [];
      for (let i = 0; i <= N; i++) {
        const t = (i / N) * life / 1000;
        fr.push({ transform: `translate(${vx * t}px, ${vy * t + .5 * g * t * t}px) rotate(${spin * t}deg) scale(${sc * (1 - .25 * i / N)})`, opacity: i > N - 3 ? (N - i) / 3 : 1 });
      }
      this.play(d, fr, { duration: life, easing: 'linear' });
    },
    low: false, // « effets réduits » : posé par main.js
    burst(x, y, n = 18, power = 1) {
      if (this.low) n = Math.ceil(n * .3); else this.flash(x, y);
      for (let i = 0; i < n; i++) this.particle(x, y, ['leaf', 'petal', 'spark', 'spark'][i % 4], power);
    },
    flash(x, y) {
      const d = this.node('fx-flash', '', x, y);
      this.play(d, [{ opacity: 1, transform: 'scale(.3)' }, { opacity: .9, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(1.5)' }], { duration: 320, easing: 'ease-out' });
    },
    text(x, y, str, cls = '', dy = 90, size) {
      const d = this.node('fx-text ' + cls, str, x, y);
      if (size) d.style.fontSize = size + 'px';
      this.play(d, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.5)' }, { opacity: 1, transform: 'translate(-50%,-70%) scale(1.15)', offset: .18 },
        { opacity: 1, transform: `translate(-50%,calc(-50% - ${dy * .6}px)) scale(1)`, offset: .7 }, { opacity: 0, transform: `translate(-50%,calc(-50% - ${dy}px)) scale(.95)` }], { duration: 1000, easing: 'ease-out' });
    },
    /** Pièce d'or : courbe de Bézier quadratique vers (tx,ty) ; onEnd à l'arrivée */
    coin(x, y, tx, ty, delay = 0, onEnd) {
      const d = this.node('fx-coin coin', '', x - 13, y - 13);
      const cx = (x + tx) / 2 + R(-90, 90), cy = Math.min(y, ty) - R(40, 140), N = 16, fr = [];
      for (let i = 0; i <= N; i++) {
        const t = i / N, u = 1 - t;
        fr.push({ transform: `translate(${u * u * 0 + 2 * u * t * (cx - x) + t * t * (tx - x)}px, ${2 * u * t * (cy - y) + t * t * (ty - y)}px) scale(${1 + .3 * Math.sin(t * Math.PI)}) rotateY(${t * 720}deg)` });
      }
      const a = d.animate(fr, { duration: 750, delay, easing: 'ease-in', fill: 'backwards' });
      a.onfinish = () => { d.remove(); onEnd && onEnd(); };
    },
    confettiRain(n = 70) {
      if (this.low) n = Math.ceil(n * .2);
      for (let i = 0; i < n; i++) {
        setTimeout(() => {
          const x = R(10, 530), d = this.node('fx-p', '', x, -20);
          d.innerHTML = `<svg viewBox="0 0 12 12"><rect x="1" y="3" width="10" height="6" fill="${['#FFE047', '#FFC04A', '#fff', '#FF5C8A', '#3CC8FF', '#2CE84F'][i % 6]}"/></svg>`;
          const life = R(1600, 2600), sw = R(-60, 60);
          this.play(d, [{ transform: 'translate(0,0) rotate(0)' }, { transform: `translate(${sw}px, 500px) rotate(${R(300, 900)}deg)`, offset: .5 }, { transform: `translate(${-sw}px, 1000px) rotate(${R(600, 1400)}deg)` }], { duration: life, easing: 'ease-in' });
        }, i * 18);
      }
    },
    /* ===== Effets de combo : l'intensité monte avec la chaîne ===== */
    comboColor(c) { return c >= 15 ? '#FF5CD8' : c >= 10 ? '#3CD8FF' : c >= 5 ? '#FFE047' : '#2CE84F'; },
    shake(amp) {
      const g = document.getElementById('game');
      g.style.setProperty('--amp', amp); g.classList.remove('shake'); void g.offsetWidth; g.classList.add('shake');
      setTimeout(() => g.classList.remove('shake'), 360);
    },
    ring(x, y, scale, delay = 0, dur = 520) {
      const d = this.node('fx-ring', '', x, y);
      const a = d.animate([{ transform: 'scale(.2)', opacity: 1 }, { transform: `scale(${scale})`, opacity: 0 }], { duration: dur, delay, easing: 'cubic-bezier(.1,.7,.3,1)', fill: 'backwards' });
      a.onfinish = () => d.remove();
    },
    rays(x, y, dur = 800) {
      const d = this.node('fx-rays', '', x, y);
      this.play(d, [{ transform: 'scale(.3) rotate(0)', opacity: .9 }, { transform: 'scale(1.1) rotate(50deg)', opacity: 0 }], { duration: dur, easing: 'ease-out' });
    },
    screenFlash(x, y, strength = .5, dur = 380) {
      const d = this.node('fx-screen', '', 0, 0);
      d.style.background = `radial-gradient(circle at ${x}px ${y}px, #fff 0, var(--cc) 30%, transparent 68%)`;
      this.play(d, [{ opacity: strength }, { opacity: 0 }], { duration: dur, easing: 'ease-out' });
    },
    streaks(x, y, n, len) {
      for (let i = 0; i < n; i++) {
        const d = this.node('fx-streak', '', x, y), a = R(0, 360), L = R(len * .6, len);
        this.play(d, [{ transform: `rotate(${a}deg) translateX(20px) scaleX(.1)`, opacity: 1 }, { transform: `rotate(${a}deg) translateX(${L * .5}px) scaleX(1.2)`, opacity: 1, offset: .35 },
          { transform: `rotate(${a}deg) translateX(${L}px) scaleX(.2)`, opacity: 0 }], { duration: R(380, 600), easing: 'ease-out' });
      }
    },
    /** Escalade : plus le combo est haut, plus il y a d'ondes, rayons, traînées, flash et secousse */
    comboFx(combo, mid) {
      const lv = Math.min(combo, 20), stg = document.getElementById('stage');
      stg.style.setProperty('--cc', this.comboColor(combo));
      if (this.low) { // mode léger : une onde et quelques étincelles seulement
        this.ring(mid.x, mid.y, 3 + lv * .1);
        for (let i = 0; i < 3; i++) this.particle(mid.x, mid.y, 'spark', 1);
        return;
      }
      this.ring(mid.x, mid.y, 3 + lv * .15);
      if (lv >= 4) this.ring(mid.x, mid.y, 4.5 + lv * .2, 90);
      if (lv >= 9) this.ring(mid.x, mid.y, 6 + lv * .25, 180, 700);
      this.streaks(mid.x, mid.y, 6 + lv, 130 + lv * 9);
      for (let i = 0; i < Math.min(40, 4 + lv * 2); i++) this.particle(mid.x, mid.y, ['spark', 'spark', 'petal', 'leaf', 'confetti'][i % 5], 1.1 + lv * .05);
      if (lv >= 3) this.screenFlash(mid.x, mid.y, Math.min(.65, .22 + lv * .025));
      if (lv >= 5) this.rays(mid.x, mid.y, 600 + lv * 20);
      if (lv >= 3) this.shake(Math.min(13, 2 + lv * .6));
      const t = document.getElementById('table'); t.classList.remove('pulse'); void t.offsetWidth; t.classList.add('pulse');
    },
    fireworks(n = 9) {
      if (this.low) n = Math.min(n, 2);
      const cols = ['#FFE047', '#FF5CD8', '#3CD8FF', '#2CE84F', '#FF8A3C'];
      for (let i = 0; i < n; i++) setTimeout(() => {
        const x = R(80, 460), y = R(150, 520);
        document.getElementById('stage').style.setProperty('--cc', cols[i % cols.length]);
        this.ring(x, y, 5);
        if (!this.low) { this.streaks(x, y, 18, 170); this.screenFlash(x, y, .3, 300); }
        for (let k = 0; k < (this.low ? 8 : 22); k++) this.particle(x, y, k % 3 ? 'spark' : 'confetti', 1.3);
        MJ.Sfx && MJ.Sfx.clack(0, 1.4, .3);
      }, i * 260);
    },
    /** Palier Good / Great / Awesome + mascotte chibi */
    tier(level) {
      const T = [['Good!', '#5CFF7A', '#0a4d1a'], ['Great!', '#3CD8FF', '#073d6b'], ['Awesome!', '#FF5CD8', '#5a0a4a']][level];
      const d = this.node('fx-text fx-tier', T[0], 270, 330);
      d.style.color = T[1]; d.style.webkitTextStrokeColor = T[2];
      if (level === 2) d.style.background = 'linear-gradient(#FFF2A6,#FF5CD8)', d.style.webkitBackgroundClip = 'text', d.style.backgroundClip = 'text';
      this.play(d, [{ opacity: 0, transform: 'translate(-50%,-50%) scale(.3) rotate(-8deg)' }, { opacity: 1, transform: 'translate(-50%,-50%) scale(1.2) rotate(3deg)', offset: .25 },
        { opacity: 1, transform: 'translate(-50%,-50%) scale(1)', offset: .75 }, { opacity: 0, transform: 'translate(-50%,-90%) scale(1)' }], { duration: 1400, easing: 'ease-out' });
      const m = this.node('fx-mascot', MJ.Symbols.mascot, 0, 0); m.style.top = '178px';
      this.play(m, [{ transform: 'translateY(-140px) rotate(-12deg)' }, { transform: 'translateY(0) rotate(6deg)', offset: .3 }, { transform: 'translateY(-14px) rotate(-5deg)', offset: .5 },
        { transform: 'translateY(0) rotate(4deg)', offset: .7 }, { transform: 'translateY(-160px) rotate(0)' }], { duration: 1500, easing: 'cubic-bezier(.3,1.4,.5,1)' });
      document.getElementById('stage').style.setProperty('--cc', T[1]);
      if (this.low) { this.confettiRain(level ? 60 : 0); return; }
      this.screenFlash(270, 330, .6, 600); this.rays(270, 330, 1100); this.shake(8 + level * 3);
      this.ring(270, 330, 6, 0, 800); this.ring(270, 330, 9, 150, 900); this.streaks(270, 330, 24 + level * 10, 260);
      this.confettiRain(level === 2 ? 130 : level === 1 ? 90 : 45);
      if (level === 2) this.fireworks(5);
    },
  };
  MJ.VFX = P;
})(window.MJ = window.MJ || {});
