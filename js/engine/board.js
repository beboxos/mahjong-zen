/* engine/board — règles de tuile libre, pierres, tuiles mystère, RNG déterministe. */
(function (MJ) {
  /** mulberry32 (même générateur que hexa-sort) : niveaux reproductibles. */
  MJ.rng = function (seed) {
    let s = seed | 0;
    const f = () => {
      s = (s + 0x6D2B79F5) | 0;
      let t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    f.int = (a, b) => a + Math.floor(f() * (b - a + 1));
    f.shuffle = arr => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(f() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
    return f;
  };

  const overlap = (a, b) => Math.abs(a.x - b.x) < 2 && Math.abs(a.y - b.y) < 2;

  class Board {
    constructor(slots) {
      this.tiles = slots.map((s, i) => ({ id: i, x: s.x, y: s.y, z: s.z, type: null, removed: false, stone: false, hidden: false }));
      for (const t of this.tiles) {
        t.above = this.tiles.filter(o => o.z === t.z + 1 && overlap(o, t));
        t.left = this.tiles.filter(o => o.z === t.z && o.x === t.x - 2 && Math.abs(o.y - t.y) < 2);
        t.right = this.tiles.filter(o => o.z === t.z && o.x === t.x + 2 && Math.abs(o.y - t.y) < 2);
        t.adj = this.tiles.filter(o => o !== t && o.z === t.z &&
          ((Math.abs(o.x - t.x) === 2 && Math.abs(o.y - t.y) < 2) || (Math.abs(o.y - t.y) === 2 && Math.abs(o.x - t.x) < 2)));
      }
    }
    /** libre géométriquement : rien au-dessus, et un côté dégagé */
    geoFree(t) {
      if (t.removed) return false;
      if (t.above.some(o => !o.removed)) return false;
      return !t.left.some(o => !o.removed) || !t.right.some(o => !o.removed);
    }
    /** jouable : libre, sans pierre, face visible */
    isFree(t) { return !t.removed && !t.stone && !t.hidden && this.geoFree(t); }
    free() { return this.tiles.filter(t => this.isFree(t)); }
    remaining() { return this.tiles.filter(t => !t.removed); }
    /** paires jouables, groupées par type */
    pairs() {
      const by = {};
      for (const t of this.free()) (by[t.type] = by[t.type] || []).push(t);
      const out = [];
      for (const k in by) { const l = by[k]; for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) out.push([l[i], l[j]]); }
      return out;
    }
    /** retire une tuile ; renvoie les pierres brisées */
    remove(t) {
      t.removed = true;
      const cracked = [];
      for (const n of t.adj) if (!n.removed && n.stone) { n.stone = false; cracked.push(n); }
      return cracked;
    }
    /** tuiles mystère devenues libres => retournées */
    reveal() {
      const r = [];
      for (const t of this.tiles) if (!t.removed && t.hidden && this.geoFree(t)) { t.hidden = false; r.push(t); }
      return r;
    }
    snapshot() { return this.tiles.map(t => [t.type, t.removed, t.stone, t.hidden]); }
    restore(s) { s.forEach((v, i) => { const t = this.tiles[i]; t.type = v[0]; t.removed = v[1]; t.stone = v[2]; t.hidden = v[3]; }); }
  }
  MJ.Board = Board;
})(window.MJ = window.MJ || {});
