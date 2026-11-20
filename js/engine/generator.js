/* engine/generator — CONSTRUCTION INVERSE : on retire des paires libres du gabarit jusqu'à le vider,
 * en attribuant à chaque paire un type. La séquence de retraits EST une solution complète garantie
 * (les pierres et tuiles mystère suivent exactement les mêmes règles que le jeu). */
(function (MJ) {
  /** Attribue les types ; pairTypes = liste de types (chacun utilisé pour UNE paire). */
  function construct(board, pairTypes, rnd, opts) {
    const T = board.tiles;
    const stones = opts.stones || 0, hiddenN = opts.hidden || 0;
    for (let attempt = 0; attempt < 400; attempt++) {
      const useStones = attempt < 250 ? stones : 0;
      for (const t of T) { t.removed = false; t.stone = false; t.hidden = false; t.type = null; }
      // pierres : tuiles voisines d'au moins une autre, au sol de préférence
      const cand = rnd.shuffle(T.filter(t => t.adj.length > 0));
      for (let i = 0; i < useStones && i < cand.length; i++) cand[i].stone = true;
      const initStone = T.map(t => t.stone);
      const pairs = rnd.shuffle(pairTypes.slice());
      let ok = true;
      for (let n = T.length / 2; n > 0; n--) {
        const free = T.filter(t => board.isFreeSim ? board.isFreeSim(t) : (!t.removed && !t.stone && board.geoFree(t)));
        if (free.length < 2) { ok = false; break; }
        // on préfère les tuiles hautes : la partie reste équilibrée entre couches
        const a = free.splice(rnd.int(0, free.length - 1), 1)[0];
        const b = free.splice(rnd.int(0, free.length - 1), 1)[0];
        const type = pairs.pop();
        a.type = type; b.type = type;
        board.remove(a); board.remove(b);
      }
      if (!ok) continue;
      // retour à l'état initial
      T.forEach((t, i) => { t.removed = false; t.stone = initStone[i]; });
      // tuiles mystère : couvertes au départ, sans pierre
      const covered = rnd.shuffle(T.filter(t => !board.geoFree(t) && !t.stone));
      for (let i = 0; i < hiddenN && i < covered.length; i++) covered[i].hidden = true;
      return true;
    }
    return false;
  }

  /** Mélange garanti jouable : reconstruit les types sur les tuiles restantes (multiset conservé). */
  function reshuffle(board, rnd) {
    const rem = board.remaining();
    const counts = {};
    rem.forEach(t => counts[t.type] = (counts[t.type] || 0) + 1);
    const pairTypes = [];
    let odd = false;
    for (const k in counts) { for (let i = 0; i < Math.floor(counts[k] / 2); i++) pairTypes.push(k); if (counts[k] % 2) odd = true; }
    const snap = board.snapshot();
    // sous-plateau : seules les tuiles restantes comptent (les retirées sont ignorées par geoFree)
    if (!odd) {
      const saved = rem.map(t => ({ t, stone: t.stone, hidden: t.hidden }));
      const T = board.tiles, gone = T.filter(t => t.removed);
      // simulation sur les restantes uniquement
      for (let attempt = 0; attempt < 300; attempt++) {
        rem.forEach(t => { t.removed = false; t.type = null; t.stone = saved.find(s => s.t === t).stone; });
        const pairs = rnd.shuffle(pairTypes.slice());
        let ok = true;
        for (let n = rem.length / 2; n > 0; n--) {
          const free = rem.filter(t => !t.removed && !t.stone && board.geoFree(t));
          if (free.length < 2) { ok = false; break; }
          const a = free.splice(rnd.int(0, free.length - 1), 1)[0];
          const b = free.splice(rnd.int(0, free.length - 1), 1)[0];
          const type = pairs.pop(); a.type = type; b.type = type;
          board.remove(a); board.remove(b);
        }
        if (ok) {
          saved.forEach(s => { s.t.removed = false; s.t.stone = s.stone; s.t.hidden = s.hidden; });
          gone.forEach(t => { t.removed = true; });
          return true;
        }
      }
      board.restore(snap);
    }
    // repli (tiroir ou impair) : mélange aléatoire avec >= 2 paires libres
    const types = rem.map(t => t.type);
    for (let attempt = 0; attempt < 500; attempt++) {
      rnd.shuffle(types);
      rem.forEach((t, i) => t.type = types[i]);
      if (board.pairs().length >= 2) return true;
    }
    board.restore(snap);
    return false;
  }

  MJ.Generator = { construct, reshuffle };
})(window.MJ = window.MJ || {});
