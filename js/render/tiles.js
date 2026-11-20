/* render/tiles — tuiles DOM/CSS : géométrie 2.5D, états (libre / bloquée / sélectionnée / hint / mystère / dorée / pierre). */
(function (MJ) {
  const AREA = { x: 27, y: 182, w: 486, h: 624 }; // 5% de marge, 19% -> 84% de la hauteur

  const View = {
    root: null, els: new Map(), m: null,

    /** Calcule la taille des tuiles pour que le plateau soit le plus grand possible. */
    metrics(board) {
      const tiles = board.tiles;
      const cols = (Math.max(...tiles.map(t => t.x)) + 2) / 2, rows = (Math.max(...tiles.map(t => t.y)) + 2) / 2;
      const maxZ = Math.max(...tiles.map(t => t.z));
      // cellule = face (80x106 pour 86 de large) + épaisseur 6 à droite / 9 en bas
      const U = 86;
      const cw = Math.min(AREA.w / (cols + maxZ * 5 / U), AREA.h / (rows * 115 / U + maxZ * 6 / U), 92);
      const s = cw / U;
      const fw = 80 * s, fh = 106.5 * s, tr = 6 * s, tb = 9 * s;
      const ch = fh + tb;
      const bw = cols * cw + maxZ * 5 * s, bh = rows * ch + maxZ * 6 * s;
      return { cw, ch, fw, fh, tr, tb, s, rad: fw * 0.13,
        ox: AREA.x + (AREA.w - bw) / 2 + maxZ * 5 * s, oy: AREA.y + (AREA.h - bh) / 2 + maxZ * 6 * s };
    },
    pos(t) {
      const m = this.m;
      return { x: m.ox + t.x * m.cw / 2 - 5 * m.s * t.z, y: m.oy + t.y * m.ch / 2 - 6 * m.s * t.z };
    },

    /** Crée tous les éléments (cachés pour la distribution en cascade). */
    build(board, root) {
      this.root = root; root.innerHTML = ''; this.els.clear();
      const m = this.m = this.metrics(board);
      const st = root.parentElement.style; // variables CSS partagées avec #fx (tuiles volantes)
      st.setProperty('--cw', m.cw + 'px'); st.setProperty('--ch', m.ch + 'px'); st.setProperty('--fw', m.fw + 'px');
      st.setProperty('--fh', m.fh + 'px'); st.setProperty('--rad', m.rad + 'px'); st.setProperty('--s', m.s);
      const order = board.tiles.slice().sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
      for (const t of order) {
        const el = document.createElement('div');
        el.className = 'tile pre';
        el.dataset.id = t.id;
        const p = this.pos(t);
        el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; el.style.zIndex = t.z * 1000 + t.y * 20 + t.x;
        el.innerHTML = '<div class="base"></div><div class="face"><div class="front"></div><div class="back"></div></div><div class="stoneCap"></div>';
        el.querySelector('.back').innerHTML = MJ.Symbols.back();
        el.querySelector('.stoneCap').innerHTML = MJ.Symbols.stone;
        root.appendChild(el);
        this.els.set(t.id, el);
        this.face(t);
      }
      return order;
    },

    face(t) {
      const el = this.els.get(t.id);
      el.querySelector('.front').innerHTML = MJ.Symbols.svg(t.type);
      el.classList.toggle('gold', t.type === 'gold');
    },
    /** Applique les classes d'état d'après le plateau. */
    refresh(board, sel) {
      for (const t of board.tiles) {
        const el = this.els.get(t.id);
        if (t.removed) continue;
        const free = board.isFree(t);
        el.classList.toggle('blocked', !free);
        el.classList.toggle('mystery', t.hidden);
        el.classList.toggle('stoned', t.stone);
        el.classList.toggle('selected', sel === t);
      }
    },
    center(t) { const p = this.pos(t), m = this.m; return { x: p.x + m.fw / 2, y: p.y + m.fh / 2 }; },
    el(t) { return this.els.get(t.id); },
    clearHints() { this.els.forEach(e => e.classList.remove('hint')); },
  };
  MJ.TileView = View;
})(window.MJ = window.MJ || {});
