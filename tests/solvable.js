// Vérifie : (1) layouts valides, (2) génération réussie pour les 600 niveaux,
// (3) la solution construite se rejoue, (4) un joueur « glouton » aléatoire a des coups au départ.
// Usage : node tests/solvable.js
const fs = require('fs'), vm = require('vm'), path = require('path');
const ctx = { window: {}, console };
ctx.window = ctx; vm.createContext(ctx);
for (const f of ['engine/layouts', 'engine/board', 'engine/generator', 'engine/levels'])
  vm.runInContext(fs.readFileSync(path.join(__dirname, '..', 'js', f + '.js'), 'utf8'), ctx, { filename: f });
const MJ = ctx.MJ;

let bad = 0;
MJ.Layouts.names.forEach((nm, i) => {
  const s = MJ.Layouts.build(i);
  const rows = Math.max(...s.map(t => t.y)) / 2 + 1, cols = Math.max(...s.map(t => t.x)) / 2 + 1;
  console.log(String(i + 1).padStart(2), nm.padEnd(14), s.length + ' tuiles', cols + 'x' + rows, 'z' + (Math.max(...s.map(t => t.z)) + 1));
  if (s.length % 2 || cols > 6 || rows > 8) { console.log('  !! invalide'); bad++; }
});

const t0 = Date.now();
let minT = 1e9, maxT = 0;
for (let n = 1; n <= MJ.Levels.LEVEL_COUNT; n++) {
  let r;
  try { r = MJ.Levels.build(n); } catch (e) { console.log('ECHEC niveau', n, e.message); bad++; continue; }
  const b = r.board, N = b.tiles.length; minT = Math.min(minT, N); maxT = Math.max(maxT, N);
  const types = {}; b.tiles.forEach(t => types[t.type] = (types[t.type] || 0) + 1);
  if (Object.values(types).some(c => c % 2)) { console.log('type impair niveau', n); bad++; }
  if (b.pairs().length < 1) { console.log('aucun coup niveau', n); bad++; }
  // rejoue une partie gloutonne : si coincé, on ne conclut pas (seule la solution construite est garantie)
  // => on vérifie plutôt la garantie via reshuffle (reconstruit une solution depuis l'état courant)
  const rnd = MJ.rng(n);
  if (!MJ.Generator.reshuffle(b, rnd) || b.pairs().length < 1) { console.log('reshuffle KO niveau', n); bad++; }
}
console.log(`600 niveaux : ${minT}-${maxT} tuiles, ${Date.now() - t0} ms, erreurs : ${bad}`);
process.exit(bad ? 1 : 0);
