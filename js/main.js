/* main — contrôleur : écrans, niveaux, modes Classic / Tray, combos, power-ups, persistance. */
(function (MJ) {
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const KEY = 'mahjong-zen-v1';
  const QUOTES = ['Outsmart this board, and you’re thinking like Da Vinci.', 'Calm hands, clear mind.', 'Every tile finds its twin.',
    'A quiet mind sees the whole board.', 'Patience is the sharpest strategy.', 'Breathe in. Match. Breathe out.',
    'The bamboo bends, but never breaks.', 'Small pairs, great harmony.'];
  const LEVELS = MJ.Levels.LEVEL_COUNT;

  /* ---------- Sauvegarde (localStorage, comme hexa-sort : try/catch, valeurs assainies) ---------- */
  const fresh = () => ({ level: 1, unlocked: 1, bestScore: 0, bestCombo: 0, mode: 'classic', sound: true, iq: 40, coins: 0, lastScore: 0, stars: {} });
  const num = (v, d, min = 0) => (Number.isFinite(+v) ? Math.max(min, +v) : d);
  function load() {
    const o = fresh();
    try {
      const r = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (r && typeof r === 'object') {
        o.level = Math.min(LEVELS, Math.floor(num(r.level, 1, 1))); o.unlocked = Math.min(LEVELS, Math.floor(num(r.unlocked, 1, 1)));
        o.bestScore = num(r.bestScore, 0); o.bestCombo = num(r.bestCombo, 0); o.iq = num(r.iq, 40); o.coins = Math.floor(num(r.coins, 0));
        o.lastScore = num(r.lastScore, 0); o.mode = r.mode === 'tray' ? 'tray' : 'classic'; o.sound = r.sound !== false;
        if (r.stars && typeof r.stars === 'object') o.stars = r.stars;
      }
    } catch (_) { /* stockage indisponible */ }
    return o;
  }
  const save = load();
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (_) { /* ignoré */ } };

  /* ---------- État ---------- */
  const S = { level: 1, board: null, cfg: null, sel: null, score: 0, combo: 0, maxCombo: 0, lastMatch: 0, tray: [], hist: [], hints: 3, shuffles: 3,
    hintsUsed: 0, undos: 0, t0: 0, busy: true, playing: false, iq0: 40, hintTimer: 0 };
  let K = 1;
  const stage = $('stage'), boardEl = $('board'), fxEl = $('fx'), trayEl = $('tray');
  const trayMode = () => save.mode === 'tray';

  function fit() {
    K = Math.min(innerWidth / 540, innerHeight / 960);
    stage.style.transform = `translate(${-270 * K}px, ${-480 * K}px) scale(${K})`;
    stage.style.borderRadius = innerWidth / innerHeight > 0.62 ? '28px' : '0';
  }
  addEventListener('resize', fit); fit();
  addEventListener('contextmenu', e => e.preventDefault());
  addEventListener('dblclick', e => e.preventDefault());

  const stageRect = el => {
    const s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { x: (r.left - s.left) / K, y: (r.top - s.top) / K, w: r.width / K, h: r.height / K };
  };
  let toastT = 0;
  function toast(msg, ms = 1700) { const t = $('toast'); t.textContent = msg; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), ms); }

  /* ---------- Mise en place d'un niveau ---------- */
  function setupLevel(n) {
    n = Math.max(1, Math.min(LEVELS, n));
    const { cfg, board } = MJ.Levels.build(n);
    Object.assign(S, { level: n, cfg, board, sel: null, score: 0, combo: 0, maxCombo: 0, lastMatch: 0, tray: [], hist: [], hints: 3, shuffles: 3,
      hintsUsed: 0, undos: 0, iq0: save.iq });
    save.level = n; persist();
    fxEl.innerHTML = '';
    document.body.classList.toggle('trayMode', trayMode()); document.body.classList.toggle('classic', !trayMode());
    MJ.TileView.build(board, boardEl);
    HUD.level(n); HUD.score(0, true); HUD.iq(save.iq); HUD.combo(0); HUD.coins(save.coins);
    HUD.badge('bShuffle', S.shuffles); HUD.badge('bHint', S.hints);
    updateMatches();
  }
  const HUD = MJ.HUD;

  async function deal() {
    const order = MJ.TileView.els; const board = S.board;
    MJ.TileView.refresh(board, null);
    const list = board.tiles.slice().sort((a, b) => a.z - b.z || a.y - b.y || a.x - b.x);
    const step = Math.min(30, 1100 / list.length);
    list.forEach((t, i) => setTimeout(() => { order.get(t.id).classList.remove('pre'); if (i % 2 === 0) MJ.Sfx.deal(); }, i * step));
    await wait(list.length * step + 450);
    // tuiles mystère déjà libres au départ : impossible par construction ; on met simplement à jour
    updateMatches();
  }
  async function showQuote() {
    $('quoteText').textContent = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    $('quote').classList.remove('hidden'); void $('quote').offsetWidth; $('quote').classList.add('show');
    await wait(1500);
    $('quote').classList.remove('show'); await wait(350); $('quote').classList.add('hidden');
  }
  async function enterLevel(n) {
    S.busy = true; S.playing = false;
    closePanel(); $('levelSel').classList.add('hidden'); $('home').classList.add('hidden');
    if (MJ.Shoji.isOpen()) await MJ.Shoji.close();
    setupLevel(n);
    await MJ.Shoji.open();
    showQuote(); await wait(900);
    await deal();
    S.busy = false; S.playing = true; S.t0 = performance.now();
    if (trayMode()) toast('Tray: tap a free tile, it slides in. Two identical = match!', 3600);
  }
  async function restart() {
    S.busy = true; S.playing = false; closePanel();
    setupLevel(S.level); await deal(); S.busy = false; S.playing = true; S.t0 = performance.now();
  }
  async function goHome() {
    S.playing = false; S.busy = true; closePanel();
    await MJ.Shoji.close();
    refreshHome(); $('home').classList.remove('hidden');
  }
  function refreshHome() {
    $('btnPlay').textContent = 'Level ' + save.level;
    $('homeCoins').textContent = save.coins;
    $('worldName').textContent = MJ.Levels.WORLDS[Math.floor((save.level - 1) / MJ.Levels.WORLD_SIZE) % MJ.Levels.WORLDS.length];
  }

  /* ---------- Compteurs ---------- */
  function matchCount() {
    const by = {}; S.board.free().forEach(t => by[t.type] = (by[t.type] || 0) + 1);
    return Object.values(by).reduce((s, c) => s + Math.floor(c / 2), 0);
  }
  function updateMatches() { HUD.matches(matchCount()); }
  const comboPts = c => [200, 240, 280, 320, 400, 600][Math.min(c - 1, 5)] + Math.max(0, c - 6) * 100;

  /* ---------- Historique (Undo illimité) ---------- */
  function pushHist() {
    S.hist.push({ b: S.board.snapshot(), score: S.score, iq: save.iq, coins: save.coins, tray: S.tray.map(x => x.tile.id) });
    if (S.hist.length > 600) S.hist.shift();
  }
  function syncAll() {
    for (const t of S.board.tiles) {
      const el = MJ.TileView.el(t);
      if (t.removed) { el.classList.add('gone'); continue; }
      if (el.classList.contains('gone')) {
        el.classList.remove('gone', 'vanish'); el.classList.add('pre');
        requestAnimationFrame(() => requestAnimationFrame(() => el.classList.remove('pre')));
      }
      MJ.TileView.face(t);
    }
    MJ.TileView.refresh(S.board, S.sel);
  }
  function undo() {
    if (S.busy || !S.playing) return;
    const h = S.hist.pop();
    if (!h) { toast('Nothing to undo'); return; }
    clearHint();
    S.board.restore(h.b); S.score = h.score; save.iq = h.iq; save.coins = h.coins; S.combo = 0; S.sel = null; S.undos++;
    S.tray.forEach(x => x.el.remove()); S.tray = [];
    h.tray.forEach(id => trayAdd(S.board.tiles[id], false));
    syncAll(); HUD.score(S.score, true); HUD.iq(save.iq); HUD.combo(0); HUD.coins(save.coins);
    updateMatches(); MJ.Sfx.tap(); persist();
  }

  /* ---------- Retrait de tuiles du plateau ---------- */
  function removeBoardTiles(list, instant) {
    const cracked = [];
    list.forEach(t => {
      cracked.push(...S.board.remove(t));
      const el = MJ.TileView.el(t);
      if (instant) el.classList.add('gone');
      else { el.classList.add('vanish'); setTimeout(() => { el.classList.add('gone'); el.classList.remove('vanish'); }, 200); }
    });
    const rev = S.board.reveal();
    if (rev.length) setTimeout(() => MJ.Sfx.flip(), 120);
    cracked.forEach(t => {
      const cap = MJ.TileView.el(t).querySelector('.stoneCap'), c = MJ.TileView.center(t);
      cap.classList.add('crack'); setTimeout(() => cap.classList.remove('crack'), 480);
      for (let i = 0; i < 6; i++) MJ.VFX.particle(c.x, c.y, 'spark', .5);
    });
    MJ.TileView.refresh(S.board, S.sel);
  }

  /* ---------- Score / combo / effets d'un match ---------- */
  function scoreMatch(type, centers) {
    const now = performance.now();
    S.combo = (S.combo > 0 && now - S.lastMatch <= 3500) ? S.combo + 1 : 1;
    S.lastMatch = now; S.maxCombo = Math.max(S.maxCombo, S.combo);
    const gold = type === 'gold';
    const pts = comboPts(S.combo) + (gold ? 500 : 0);
    const gain = Math.round((0.6 + 0.3 * Math.min(S.combo, 10)) * 10) / 10;
    S.score += pts; save.iq = Math.round((save.iq + gain) * 10) / 10;
    MJ.Sfx.match(S.combo);
    const mid = { x: (centers[0].x + centers[1].x) / 2, y: (centers[0].y + centers[1].y) / 2 };
    centers.forEach(c => MJ.VFX.burst(c.x, c.y, 16 + Math.min(S.combo, 12), 1 + Math.min(S.combo, 15) * .04));
    MJ.VFX.comboFx(S.combo, mid);
    MJ.VFX.text(mid.x, mid.y - 10, trayMode() ? '+' + gain.toFixed(1) : '+' + pts, S.combo >= 5 || gold ? 'gold' : '', 90 + S.combo * 4, 34 + Math.min(S.combo, 15) * 2.4);
    const sb = $('hudScore'); sb.classList.remove('bump'); void sb.offsetWidth; sb.classList.add('bump');
    if (gold) {
      save.coins += 10; MJ.Sfx.coin(.15); HUD.coins(save.coins, true);
      centers.forEach((c, i) => { for (let k = 0; k < 4; k++) MJ.VFX.coin(c.x, c.y, 40, 128, k * 70 + i * 40, () => MJ.Sfx.coin()); });
    }
    HUD.score(S.score); HUD.iq(save.iq, true); HUD.combo(S.combo, 1);
    if (S.combo >= 5 && S.combo % 5 === 0) {
      const lv = S.combo >= 15 ? 2 : S.combo >= 10 ? 1 : 0;
      setTimeout(() => { MJ.VFX.tier(lv); MJ.Sfx.tier(lv); }, 220);
    }
    if (S.combo > save.bestCombo) save.bestCombo = S.combo;
  }

  function afterMove() {
    S.sel = null; MJ.TileView.refresh(S.board, null); updateMatches(); persist();
    if (S.board.remaining().length === 0 && S.tray.length === 0) { win(); return; }
    if (!trayMode() && matchCount() === 0) {
      toast('No more matches — shuffling!');
      S.busy = true; setTimeout(() => { S.busy = false; shuffle(true); }, 900);
    }
  }

  /* ---------- Tap ---------- */
  boardEl.addEventListener('pointerdown', e => {
    const el = e.target.closest('.tile'); if (!el) return;
    e.preventDefault(); MJ.Sfx.init();
    if (S.busy || !S.playing) return;
    const t = S.board.tiles[+el.dataset.id];
    clearHint();
    if (!S.board.isFree(t)) {
      el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); MJ.Sfx.blocked(); return;
    }
    if (trayMode()) return tapTray(t);
    if (S.sel === t) { S.sel = null; MJ.TileView.refresh(S.board, null); return; }
    if (S.sel && S.sel.type === t.type) {
      const a = S.sel, b = t;
      pushHist();
      scoreMatch(a.type, [MJ.TileView.center(a), MJ.TileView.center(b)]);
      removeBoardTiles([a, b]); afterMove(); return;
    }
    S.sel = t; MJ.Sfx.tap(); MJ.TileView.refresh(S.board, t);
  });

  /* ---------- Mode tiroir 4 emplacements ---------- */
  function slotBox(i) { return stageRect(trayEl.children[i]); }
  function placeClone(clone, t, i, animate) {
    const s = slotBox(i), m = MJ.TileView.m, p = MJ.TileView.pos(t);
    const sc = Math.min(s.w * .94 / m.cw, s.h * .98 / m.ch);
    const tx = s.x + (s.w - m.cw * sc) / 2 - p.x, ty = s.y + (s.h - m.ch * sc) / 2 - p.y;
    clone.style.transition = animate ? '' : 'none';
    clone.style.transform = `translate(${tx}px, ${ty}px) scale(${sc})`;
  }
  function trayAdd(t, animate) {
    const src = MJ.TileView.el(t), clone = src.cloneNode(true), p = MJ.TileView.pos(t);
    clone.className = 'tile fly' + (t.type === 'gold' ? ' gold' : '');
    clone.style.left = p.x + 'px'; clone.style.top = p.y + 'px'; clone.style.transformOrigin = '0 0'; clone.style.zIndex = 999;
    clone.style.transform = 'none'; clone.style.transition = 'none';
    fxEl.appendChild(clone); void clone.offsetWidth;
    const entry = { tile: t, type: t.type, el: clone }; S.tray.push(entry);
    placeClone(clone, t, S.tray.length - 1, animate);
    return entry;
  }
  function tapTray(t) {
    S.busy = true; pushHist(); MJ.Sfx.tap();
    trayAdd(t, true);
    removeBoardTiles([t], true);
    updateMatches(); HUD.combo(S.combo, 1);
    setTimeout(checkTray, 360);
  }
  function checkTray() {
    let a = -1, b = -1;
    for (let i = 0; i < S.tray.length && a < 0; i++) for (let j = i + 1; j < S.tray.length; j++) if (S.tray[i].type === S.tray[j].type) { a = i; b = j; break; }
    if (a >= 0) {
      const A = S.tray[a], B = S.tray[b];
      const cs = [a, b].map(i => { const s = slotBox(i); return { x: s.x + s.w / 2, y: s.y + s.h / 2 }; });
      scoreMatch(A.type, cs);
      [A, B].forEach(x => { x.el.classList.add('vanish'); setTimeout(() => x.el.remove(), 220); });
      S.tray = S.tray.filter(x => x !== A && x !== B);
      S.tray.forEach((x, i) => placeClone(x.el, x.tile, i, true));
      S.busy = false; afterMove(); return;
    }
    S.busy = false;
    if (S.tray.length >= 4) lose();
  }

  /* ---------- Power-ups ---------- */
  function clearHint() { clearTimeout(S.hintTimer); MJ.TileView.clearHints(); S.tray.forEach(x => x.el.classList.remove('hint')); }
  function hint() {
    if (S.busy || !S.playing) return;
    if (S.hints <= 0) { toast('No hints left'); return; }
    clearHint();
    const free = S.board.free();
    let targets = null;
    if (trayMode()) {
      for (const x of S.tray) { const m = free.find(t => t.type === x.type); if (m) { targets = { tiles: [m], tray: [x] }; break; } }
    }
    if (!targets) {
      let best = -1;
      for (const [a, b] of S.board.pairs()) {
        const unlock = S.board.tiles.filter(t => !t.removed && (t.above.includes(a) || t.above.includes(b) || t.left.includes(a) || t.right.includes(b))).length;
        const sc = (a.z + b.z) * 10 + unlock;
        if (sc > best) { best = sc; targets = { tiles: trayMode() ? [a] : [a, b], tray: [] }; }
      }
    }
    if (!targets) { toast('No match available'); return; }
    S.hints--; S.hintsUsed++; HUD.badge('bHint', S.hints);
    targets.tiles.forEach(t => MJ.TileView.el(t).classList.add('hint'));
    targets.tray.forEach(x => x.el.classList.add('hint'));
    MJ.Sfx.tone(880, .2, 'sine', .2); MJ.Sfx.tone(1318, .3, 'sine', .15, .08);
    S.hintTimer = setTimeout(clearHint, 4500);
  }
  function shuffle(free) {
    if (S.busy && !free) return; if (!S.playing) return;
    if (!free) { if (S.shuffles <= 0) { toast('No shuffles left'); return; } S.shuffles--; HUD.badge('bShuffle', S.shuffles); }
    clearHint(); S.busy = true; S.sel = null; S.combo = 0; HUD.combo(0);
    const rem = S.board.remaining();
    rem.forEach((t, i) => { const el = MJ.TileView.el(t); el.style.animationDelay = (i * 6) + 'ms'; el.classList.add('shuf'); });
    MJ.Sfx.flip();
    setTimeout(() => {
      MJ.Generator.reshuffle(S.board, MJ.rng((Date.now() & 0xffffff) + 1));
      rem.forEach(t => MJ.TileView.face(t)); MJ.TileView.refresh(S.board, null); updateMatches();
    }, 300);
    setTimeout(() => { rem.forEach(t => { const el = MJ.TileView.el(t); el.classList.remove('shuf'); el.style.animationDelay = ''; }); S.busy = false; MJ.Sfx.tone(660, .2, 'sine', .15); }, 800 + rem.length * 6);
  }

  /* ---------- Victoire / défaite ---------- */
  const mmss = s => Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0');
  function win() {
    S.playing = false; S.busy = true;
    const secs = (performance.now() - S.t0) / 1000;
    const clean = S.hintsUsed + S.undos === 0;
    const stars = 1 + (S.maxCombo >= 6 ? 1 : 0) + (clean || secs < S.board.tiles.length * 2.2 ? 1 : 0);
    const gain = Math.round((save.iq - S.iq0) * 10) / 10;
    save.lastScore = S.score; save.bestScore = Math.max(save.bestScore, S.score);
    save.stars[S.level] = Math.max(save.stars[S.level] || 0, stars);
    save.unlocked = Math.min(LEVELS, Math.max(save.unlocked, S.level + 1));
    save.level = Math.min(LEVELS, S.level + 1); persist();
    MJ.Sfx.win(); MJ.VFX.confettiRain(120); MJ.VFX.fireworks(10); HUD.combo(0);
    setTimeout(() => showPanel(`<h2>Level ${S.level} clear!</h2><div class="stars">${'★'.repeat(stars)}<span class="off">${'★'.repeat(3 - stars)}</span></div>
      <div class="rows"><div>Score<b>${S.score}</b></div><div>IQ<b>+${gain.toFixed(1)} (${save.iq.toFixed(1)})</b></div><div>Best combo<b>x${S.maxCombo}</b></div><div>Time<b>${mmss(secs)}</b></div></div>
      <button class="btn" data-act="next">${S.level >= LEVELS ? 'Play again' : 'Next Level'}</button><button class="btn alt" data-act="home">Home</button>`), 1100);
  }
  function lose() {
    S.busy = true; MJ.Sfx.lose();
    setTimeout(() => showPanel(`<h2>Tray full!</h2><p style="font-size:22px;margin:6px 0 14px">No matching pair left in the tray.</p>
      <button class="btn" data-act="undoClose">Undo last move</button><button class="btn alt" data-act="restart">Retry level</button><button class="btn alt" data-act="home">Home</button>`), 500);
  }

  /* ---------- Fenêtres ---------- */
  const modal = $('modal'), panel = $('panel');
  function showPanel(html) { panel.innerHTML = html; modal.classList.remove('hidden'); }
  function closePanel() { modal.classList.add('hidden'); }
  function menuPanel(inGame) {
    showPanel(`<h2>Menu</h2>
      <div class="opt"><span>Sound</span><div class="seg"><button data-act="snd1" class="${save.sound ? 'on' : ''}">On</button><button data-act="snd0" class="${save.sound ? '' : 'on'}">Off</button></div></div>
      <div class="opt"><span>Mode</span><div class="seg"><button data-act="m-classic" class="${trayMode() ? '' : 'on'}">Classic</button><button data-act="m-tray" class="${trayMode() ? 'on' : ''}">Tray</button></div></div>
      <div style="font-size:16px;opacity:.75;margin:2px 0 6px">Best score ${save.bestScore} · Best combo x${save.bestCombo} · IQ ${save.iq.toFixed(1)}</div>
      <button class="btn" data-act="resume">Resume</button>${inGame ? '<button class="btn alt" data-act="restart">Restart level</button><button class="btn alt" data-act="home">Home</button>' : ''}`);
  }
  panel.addEventListener('click', e => {
    const b = e.target.closest('[data-act]'); if (!b) return;
    MJ.Sfx.init(); MJ.Sfx.tap();
    const a = b.dataset.act, inGame = !$('home').classList.contains('hidden') ? false : true;
    if (a === 'resume') closePanel();
    else if (a === 'snd1' || a === 'snd0') { save.sound = a === 'snd1'; MJ.Sfx.setMuted(!save.sound); persist(); menuPanel(inGame); }
    else if (a === 'm-classic' || a === 'm-tray') {
      const m = a === 'm-tray' ? 'tray' : 'classic';
      if (m !== save.mode) { save.mode = m; persist(); if (inGame) { restart(); return; } }
      menuPanel(inGame);
    }
    else if (a === 'restart') restart();
    else if (a === 'home') goHome();
    else if (a === 'next') enterLevel(S.level >= LEVELS ? 1 : S.level + 1);
    else if (a === 'undoClose') { closePanel(); S.busy = false; undo(); }
  });

  /* ---------- Sélection de niveau (600) ---------- */
  function buildLevels() {
    let h = '';
    const W = MJ.Levels.WORLD_SIZE;
    for (let w = 0; w * W < LEVELS; w++) {
      h += `<h3>${MJ.Levels.WORLDS[w % MJ.Levels.WORLDS.length]} · ${w * W + 1}–${Math.min(LEVELS, (w + 1) * W)}</h3><div class="lvlRow">`;
      for (let n = w * W + 1; n <= Math.min(LEVELS, (w + 1) * W); n++) {
        const lock = n > save.unlocked, st = save.stars[n] || 0;
        h += `<button class="lv${lock ? ' lock' : n === save.level ? ' cur' : ''}" data-n="${n}"${lock ? ' disabled' : ''}>${lock ? '🔒' : n}<span class="st">${'★'.repeat(st)}</span></button>`;
      }
      h += '</div>';
    }
    $('lvlGrid').innerHTML = h;
  }
  $('btnLevels').onclick = () => { MJ.Sfx.init(); MJ.Sfx.tap(); buildLevels(); $('levelSel').classList.remove('hidden');
    const cur = $('lvlGrid').querySelector('.cur'); if (cur) $('lvlGrid').scrollTop = cur.offsetTop - 260; };
  $('lvlClose').onclick = () => { MJ.Sfx.tap(); $('levelSel').classList.add('hidden'); };
  $('lvlGrid').addEventListener('click', e => { const b = e.target.closest('.lv'); if (!b || b.disabled) return; MJ.Sfx.init(); enterLevel(+b.dataset.n); });

  /* ---------- Boutons ---------- */
  $('btnPlay').onclick = () => { MJ.Sfx.init(); MJ.Sfx.tap(); enterLevel(save.level); };
  $('btnSettings').onclick = () => { MJ.Sfx.init(); menuPanel(false); };
  $('btnMenu').onclick = () => { MJ.Sfx.init(); if (S.busy && !S.playing) return; menuPanel(true); };
  $('btnBack').onclick = () => { MJ.Sfx.init(); MJ.Sfx.tap(); if (S.playing) goHome(); };
  $('btnShuffle').onclick = () => { MJ.Sfx.init(); shuffle(false); };
  $('btnHint').onclick = () => { MJ.Sfx.init(); hint(); };
  $('btnUndo').onclick = () => { MJ.Sfx.init(); undo(); };

  /* ---------- Boucle combo (fenêtre de 3,5 s) ---------- */
  setInterval(() => {
    if (S.combo > 0) {
      const f = 1 - (performance.now() - S.lastMatch) / 3500;
      if (f <= 0) { S.combo = 0; HUD.combo(0); } else HUD.comboFrac(f);
    }
  }, 80);

  /* ---------- Démarrage : chargement zen -> accueil ---------- */
  function boot() {
    HUD.init(); MJ.VFX.init(fxEl); MJ.Shoji.init($('shoji'));
    MJ.Sfx.setMuted(!save.sound);
    $('loadQuote').textContent = '“' + QUOTES[Math.floor(Math.random() * QUOTES.length)] + '”';
    let p = 0;
    const iv = setInterval(() => {
      p = Math.min(100, p + 7 + Math.random() * 9); $('loadBar').style.width = p + '%';
      if (p >= 100) { clearInterval(iv); setTimeout(() => { refreshHome(); $('home').classList.remove('hidden'); $('loading').classList.add('out'); setTimeout(() => $('loading').remove(), 700); }, 250); }
    }, 120);
  }
  window.MJdebug = { S, save, enterLevel, setupLevel, deal, shuffle, hint, undo, win };
  boot();
})(window.MJ);
