/* engine/levels — 600 niveaux déterministes (seed = n°). Difficulté progressive :
 * densité du plateau, types spéciaux, tuiles mystère, pierres, tuiles dorées. */
(function (MJ) {
  const T = MJ.Types = {
    // Caractères 2-9 + Double Bonheur, Cercles, Bambous, Dragons, Vents
    STANDARD: [...'23456789'].map(n => 'm' + n).concat(['xi'],
      [...'123456789'].map(n => 't' + n), [...'123456789'].map(n => 'b' + n),
      ['dr', 'dg', 'dw', 'we', 'ws', 'ww', 'wn']),
    SPECIAL: ['f_sun', 'f_tulip', 'f_bell', 'f_hya', 'f_peony', 'f_chry', 'f_plum',
      'z_ox', 'z_monkey', 'z_horse', 'z_pig', 'z_rooster', 'z_tiger', 'o1', 'o2'],
    GOLD: 'gold',
  };
  const LEVEL_COUNT = 600, WORLD_SIZE = 50;
  const WORLDS = ['Bambouseraie', 'Jardin de jade', 'Pagode du matin', 'Lac des lotus', 'Cerisiers en fleurs',
    'Montagne brumeuse', 'Pavillon d’or', 'Rivière céleste', 'Temple du dragon', 'Palais impérial',
    'Étang aux carpes', 'Route de la soie'];

  function config(n) {
    n = Math.max(1, Math.floor(n));
    const rnd = MJ.rng(n * 7919 + 13);
    const idx = n <= MJ.Layouts.count ? n - 1 : rnd.int(0, MJ.Layouts.count - 1);
    const variant = n <= MJ.Layouts.count ? 0 : rnd.int(0, 3);
    let slots = MJ.Layouts.build(idx, variant);

    // allègement des premiers niveaux : on retire des tuiles du dessus (paires)
    const density = Math.min(1, 0.84 + n * 0.02);
    let drop = Math.floor(slots.length * (1 - density) / 2) * 2;
    if (drop > 0) {
      const hasAbove = s => slots.some(o => o.z === s.z + 1 && Math.abs(o.x - s.x) < 2 && Math.abs(o.y - s.y) < 2);
      const cands = rnd.shuffle(slots.filter(s => s.z > 0 && !hasAbove(s)));
      const gone = new Set(cands.slice(0, drop));
      slots = slots.filter(s => !gone.has(s));
      if (slots.length % 2) slots.pop();
    }

    const P = slots.length / 2;
    const gold = n >= 2 ? (n >= 150 ? 3 : n >= 40 ? 2 : 1) : 0;
    const typeCount = Math.ceil((P - gold) / 2);
    const specialRatio = n < 3 ? 0 : Math.min(0.55, 0.12 + n / 220);
    const nSpecial = Math.min(T.SPECIAL.length, Math.round(typeCount * specialRatio));
    const std = rnd.shuffle(T.STANDARD.slice()), spc = rnd.shuffle(T.SPECIAL.slice());
    const types = spc.slice(0, nSpecial).concat(std.slice(0, typeCount - nSpecial));
    // si trop peu de types standards, complète avec les spéciaux restants
    for (let i = nSpecial; types.length < typeCount; i++) types.push(spc[i] || std[types.length]);
    const pairTypes = [];
    for (let i = 0; i < P - gold; i++) pairTypes.push(types[Math.floor(i / 2)]);
    for (let i = 0; i < gold; i++) pairTypes.push(T.GOLD);

    return {
      n, name: MJ.Layouts.names[idx % MJ.Layouts.count], world: WORLDS[Math.floor((n - 1) / WORLD_SIZE) % WORLDS.length],
      slots, pairTypes, seed: n * 7919 + 13,
      stones: n >= 6 ? Math.min(1 + Math.floor((n - 6) / 12), 8, Math.floor(P / 5)) : 0,
      hidden: n >= 3 ? Math.min(2 + Math.floor((n - 3) / 8), 10) : 0,
    };
  }

  /** Construit un plateau jouable pour le niveau n. */
  function build(n, salt = 0) {
    const cfg = config(n);
    const board = new MJ.Board(cfg.slots);
    const rnd = MJ.rng(cfg.seed + salt * 101);
    let ok = MJ.Generator.construct(board, cfg.pairTypes, rnd, { stones: cfg.stones, hidden: cfg.hidden });
    if (!ok) ok = MJ.Generator.construct(board, cfg.pairTypes, rnd, { stones: 0, hidden: cfg.hidden });
    if (!ok) throw new Error('Plateau impossible niveau ' + n);
    return { cfg, board };
  }

  MJ.Levels = { LEVEL_COUNT, WORLD_SIZE, WORLDS, config, build };
})(window.MJ = window.MJ || {});
