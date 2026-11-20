/* engine/layouts — 14 gabarits de base + variantes (miroir / retournement) => des centaines de plateaux.
 * Coordonnées en DEMI-tuiles : une tuile occupe x..x+2, y..y+2 ; grille max 12 x 16 (6 colonnes x 8 lignes). */
(function (MJ) {
  const rect = (z, x, y, c, r) => {
    const a = [];
    for (let i = 0; i < c; i++) for (let j = 0; j < r; j++) a.push({ x: x + 2 * i, y: y + 2 * j, z });
    return a;
  };
  // rangées centrées : widths = nb de tuiles par rangée
  const rows = (z, y0, widths) => {
    const a = [];
    widths.forEach((w, j) => { for (let i = 0; i < w; i++) a.push({ x: 6 - w + 2 * i, y: y0 + 2 * j, z }); });
    return a;
  };
  const minus = (list, pts) => list.filter(t => !pts.some(p => p[0] === t.x && p[1] === t.y));

  const DEFS = [
    ['Pyramide', () => [...rect(0, 0, 0, 6, 6), ...rect(1, 2, 2, 4, 4), ...rect(2, 4, 4, 2, 2)]],
    ['Pagode', () => [...rows(0, 0, [2, 4, 6, 4, 6, 4, 2]), ...rows(1, 4, [4]), ...rows(1, 8, [4]), ...rows(2, 6, [2])]],
    ['Double Pilier', () => [...rect(0, 0, 0, 2, 7), ...rect(0, 8, 0, 2, 7), ...rect(0, 4, 4, 2, 3),
      ...rect(1, 1, 2, 1, 5), ...rect(1, 9, 2, 1, 5)]],
    ['Pont', () => [...rect(0, 0, 0, 6, 2), ...rect(0, 0, 10, 6, 2), ...rect(0, 4, 4, 2, 3),
      ...rect(1, 2, 0, 4, 1), ...rect(1, 2, 10, 4, 1), ...rect(1, 5, 4, 1, 3)]],
    ['Jardin', () => [...minus(rect(0, 0, 0, 6, 7), [[4, 6], [6, 6]]), ...rect(1, 2, 2, 4, 1), ...rect(1, 2, 10, 4, 1)]],
    ['Couronne', () => [...rect(0, 0, 6, 6, 4), ...rect(0, 0, 2, 1, 2), ...rect(0, 5, 0, 1, 3), ...rect(0, 10, 2, 1, 2),
      ...rect(1, 2, 8, 4, 1)]],
    ['Tortue', () => [...rows(0, 2, [2, 4, 6, 6, 6, 4, 2]), ...rect(1, 2, 4, 4, 3), ...rect(2, 4, 6, 2, 1), ...rect(0, 5, 0, 1, 1)]],
    ['Papillon', () => [...rect(0, 0, 0, 2, 4), ...rect(0, 0, 8, 2, 3), ...rect(0, 8, 0, 2, 4), ...rect(0, 8, 8, 2, 3),
      ...rect(0, 5, 0, 1, 7), ...rect(1, 5, 4, 1, 3)]],
    ['Croix', () => [...rect(0, 4, 0, 2, 7), ...rect(0, 0, 4, 2, 3), ...rect(0, 8, 4, 2, 3), ...rect(1, 4, 4, 2, 3), ...rect(2, 5, 6, 1, 1)]],
    ['Diamant', () => [...rows(0, 0, [2, 3, 4, 5, 4, 3, 2]), ...rows(1, 4, [3, 4, 3]), ...rows(2, 6, [2])]],
    ['Lanterne', () => [...rect(0, 2, 0, 4, 1), ...minus(rect(0, 0, 2, 6, 4), [[4, 4], [6, 6]]), ...rect(0, 2, 10, 4, 1),
      ...rect(1, 2, 2, 4, 4), ...rect(2, 4, 4, 2, 2)]],
    ['Forteresse', () => {
      const a = [];
      for (let i = 0; i < 6; i++) { a.push({ x: 2 * i, y: 0, z: 0 }, { x: 2 * i, y: 12, z: 0 }); }
      for (let j = 1; j < 6; j++) { a.push({ x: 0, y: 2 * j, z: 0 }, { x: 10, y: 2 * j, z: 0 }); }
      return [...a, ...rect(0, 4, 4, 2, 3), ...rect(1, 0, 0, 1, 1), ...rect(1, 10, 0, 1, 1), ...rect(1, 0, 12, 1, 1), ...rect(1, 10, 12, 1, 1),
        ...rect(1, 4, 4, 2, 3)];
    }],
    ['Jardin Zen', () => [...rect(0, 0, 0, 6, 7).filter((t, i) => (t.x / 2 + t.y / 2) % 2 === 0 || t.y === 0 || t.y === 12),
      ...rect(1, 1, 3, 2, 3), ...rect(1, 7, 3, 2, 3)]],
    ['Cascade', () => [...rows(0, 0, [2, 3, 4, 5, 6, 6, 6]), ...rows(1, 4, [2, 4, 4]), ...rows(2, 6, [2, 2])]],
    ['Lotus', () => [...rows(0, 2, [2, 4, 6, 6, 4, 2]), ...rows(1, 4, [2, 4, 4, 2]), ...rect(2, 4, 6, 2, 2), ...rect(0, 5, 0, 1, 1), ...rect(0, 5, 14 - 2, 1, 1)]],
  ];

  function normalize(slots, flipX, flipY) {
    const seen = new Set();
    let s = slots.filter(t => { const k = t.x + ',' + t.y + ',' + t.z; if (seen.has(k)) return false; seen.add(k); return true; });
    const mx = Math.max(...s.map(t => t.x)), my = Math.max(...s.map(t => t.y));
    s = s.map(t => ({ x: flipX ? mx - t.x : t.x, y: flipY ? my - t.y : t.y, z: t.z }));
    const minX = Math.min(...s.map(t => t.x)), minY = Math.min(...s.map(t => t.y));
    s = s.map(t => ({ x: t.x - minX, y: t.y - minY, z: t.z }));
    if (s.length % 2) { // nombre pair obligatoire : on retire la tuile la plus haute
      let k = 0; s.forEach((t, i) => { if (t.z >= s[k].z) k = i; });
      s.splice(k, 1);
    }
    return s;
  }

  MJ.Layouts = {
    count: DEFS.length,
    names: DEFS.map(d => d[0]),
    /** variant : 0..3 (bit0 = miroir horizontal, bit1 = miroir vertical) */
    build(index, variant = 0) {
      const d = DEFS[index % DEFS.length];
      return normalize(d[1](), !!(variant & 1), !!(variant & 2));
    },
  };
})(window.MJ = window.MJ || {});
