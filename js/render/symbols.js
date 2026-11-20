/* render/symbols — tous les motifs en SVG vectoriel (viewBox 100x133), générés par code. */
(function (MJ) {
  const BLUE = '#1B3F7A', ROYAL = '#1B4B8A', GREEN = '#1E7E45', RED = '#C92A2A', INK = '#1F2933';
  const FONT = `font-family="'Noto Serif CJK SC','Source Han Serif SC','Songti SC','SimSun','Microsoft YaHei',serif" font-weight="900" text-anchor="middle"`;
  const ch = (c, color, size = 84, y = 95) =>
    `<text x="50" y="${y}" font-size="${size}" fill="${color}" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" ${FONT}>${c}</text>`;

  /* ---------- Cercles ---------- */
  const ring = (x, y, r, c1, c2) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" stroke="${c1}" stroke-width="${r * 0.3}"/>` +
    `<circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="none" stroke="${c2}" stroke-width="${r * 0.2}"/>` +
    `<circle cx="${x}" cy="${y}" r="${r * 0.17}" fill="${c1}"/>`;
  const TONG = {
    2: [[50, 38], [50, 95]], 3: [[26, 30], [50, 66], [74, 102]],
    4: [[30, 40], [70, 40], [30, 93], [70, 93]], 5: [[30, 36], [70, 36], [50, 66], [30, 97], [70, 97]],
    6: [[32, 28], [68, 28], [32, 66], [68, 66], [32, 104], [68, 104]],
    7: [[26, 22], [50, 32], [74, 42], [32, 80], [68, 80], [32, 108], [68, 108]],
    8: [[34, 24], [66, 24], [34, 52], [66, 52], [34, 80], [66, 80], [34, 108], [66, 108]],
    9: [[24, 28], [50, 28], [76, 28], [24, 66], [50, 66], [76, 66], [24, 104], [50, 104], [76, 104]],
  };
  const TR = { 2: 20, 3: 17, 4: 18, 5: 16, 6: 16, 7: 14, 8: 13, 9: 12.5 };
  const tong = n => {
    if (n === 1) return `<circle cx="50" cy="66" r="40" fill="#fff" stroke="${GREEN}" stroke-width="9"/>` +
      `<circle cx="50" cy="66" r="27" fill="none" stroke="${RED}" stroke-width="8"/>` +
      `<circle cx="50" cy="66" r="13" fill="${ROYAL}"/><circle cx="50" cy="66" r="5" fill="#fff"/>` +
      [0, 60, 120, 180, 240, 300].map(a => `<circle cx="${50 + 34 * Math.cos(a * Math.PI / 180)}" cy="${66 + 34 * Math.sin(a * Math.PI / 180)}" r="2.6" fill="${a % 120 ? RED : ROYAL}" opacity=".0"/>`).join('');
    const cols = [ROYAL, GREEN, RED];
    return TONG[n].map(([x, y], i) => {
      const c = (n === 5 && i === 2) ? RED : cols[(i + (n === 5 ? 0 : 0)) % 3];
      return ring(x, y, TR[n], c, c === RED ? GREEN : c === GREEN ? RED : RED);
    }).join('');
  };

  /* ---------- Bambous ---------- */
  const stick = (x, y, w, h, c, acc) => {
    const n = Math.max(1, Math.round(h / 24));
    let s = `<rect x="${x - w / 2}" y="${y}" width="${w}" height="${h}" rx="${w / 2.2}" fill="${c}" stroke="#0e4d2a" stroke-width="1.4"/>`;
    s += `<rect x="${x - w / 2 + w * 0.18}" y="${y + 3}" width="${w * 0.2}" height="${h - 6}" rx="1.5" fill="#fff" opacity=".28"/>`;
    for (let i = 1; i <= n; i++) {
      const yy = y + (h * i) / (n + 1);
      s += `<rect x="${x - w / 2 - 1}" y="${yy - 2}" width="${w + 2}" height="4" rx="2" fill="${acc || '#fff'}"/>`;
    }
    return s;
  };
  const G = '#1D8348', RB = '#C82333', BB = '#1B5FB0';
  const bird = () =>
    `<path d="M22 100 Q12 118 30 122 Q40 108 46 96Z" fill="${GREEN}"/><path d="M30 100 Q24 124 44 126 Q48 110 52 98Z" fill="${BB}"/>` +
    `<ellipse cx="52" cy="76" rx="26" ry="30" fill="${BB}"/><ellipse cx="50" cy="86" rx="15" ry="18" fill="#F5F0D8"/>` +
    `<path d="M40 70 Q74 62 78 92 Q58 100 40 70Z" fill="#E8742A"/><path d="M48 76 Q68 74 70 90" fill="none" stroke="#FFE08A" stroke-width="3"/>` +
    `<circle cx="56" cy="40" r="15" fill="${RB}"/><path d="M62 24 q4 -12 12 -10 q-2 6 -4 12z M54 24 q-2 -12 -10 -12 q0 8 4 13z" fill="${G}"/>` +
    `<path d="M68 38 L86 44 L68 48Z" fill="#F2A31B"/><circle cx="60" cy="36" r="4.4" fill="#fff"/><circle cx="61" cy="36" r="2.2" fill="${INK}"/>` +
    `<path d="M44 104 l-2 22 M54 106 l0 20" stroke="#E8742A" stroke-width="3" stroke-linecap="round"/>`;
  const bamboo = n => {
    if (n === 1) return bird();
    const W = n >= 7 ? 11 : 13;
    const col = i => (i % 3 === 0 ? G : i % 3 === 1 ? BB : G);
    let s = '';
    const grid = (xs, ys, h, colorFn) => ys.forEach((y, r) => xs.forEach((x, c) => s += stick(x, y, W, h, colorFn(r, c, r * xs.length + c))));
    if (n === 2) { s += stick(50, 14, 14, 46, G, RB) + stick(50, 73, 14, 46, BB, RB); }
    else if (n === 3) { s += stick(50, 14, 14, 46, G, RB) + stick(33, 73, 14, 46, BB, RB) + stick(67, 73, 14, 46, G, RB); }
    else if (n === 4) grid([32, 68], [14, 73], 46, (r, c) => (r + c) % 2 ? BB : G);
    else if (n === 5) { grid([28, 72], [14, 73], 46, (r, c) => (r + c) % 2 ? BB : G); s += stick(50, 42, 14, 48, RB, '#fff'); }
    else if (n === 6) grid([26, 50, 74], [14, 73], 46, (r, c) => c === 1 ? RB : (r ? BB : G));
    else if (n === 7) { s += stick(50, 10, 13, 34, RB, '#fff'); grid([26, 50, 74], [54, 94], 34, (r, c) => c === 1 ? RB : (r ? BB : G)); s = s.replace(/^/, ''); }
    else if (n === 8) grid([22, 41, 59, 78], [14, 73], 46, (r, c) => (r + c) % 2 ? BB : G);
    else grid([26, 50, 74], [8, 49, 90], 36, (r, c) => (c === 1 ? RB : r === 1 ? BB : G));
    return s;
  };

  /* ---------- Dragons ---------- */
  const dragonW = () =>
    `<rect x="16" y="22" width="68" height="90" rx="9" fill="none" stroke="${GREEN}" stroke-width="7"/>` +
    `<rect x="27" y="33" width="46" height="68" rx="5" fill="none" stroke="${RED}" stroke-width="5"/>`;

  /* ---------- Fleurs ---------- */
  const rot = (a, cx, cy, inner) => `<g transform="rotate(${a} ${cx} ${cy})">${inner}</g>`;
  const stem = '<path d="M50 74 Q46 102 52 126" fill="none" stroke="#2E8B3E" stroke-width="5" stroke-linecap="round"/>';
  const leaf = (d, c = '#3FA652') => `<path d="${d}" fill="${c}" stroke="#1F6B2D" stroke-width="1.5"/>`;
  const FLOWERS = {
    f_sun: () => stem + leaf('M50 108 Q24 100 20 112 Q38 122 50 112Z') + leaf('M51 98 Q78 90 84 102 Q66 112 51 104Z') +
      Array.from({ length: 14 }, (_, i) => rot(i * 360 / 14, 50, 50, '<ellipse cx="50" cy="20" rx="6.4" ry="15" fill="#FFC21A" stroke="#E08A00" stroke-width="1.4"/>')).join('') +
      '<circle cx="50" cy="50" r="19" fill="#7A4116"/><circle cx="50" cy="50" r="12" fill="none" stroke="#A85F26" stroke-width="2.5" stroke-dasharray="2 4"/><circle cx="50" cy="50" r="5" fill="#A85F26"/>',
    f_tulip: () => stem + leaf('M50 128 Q22 112 24 82 Q44 96 50 128Z') + leaf('M52 128 Q80 108 78 78 Q56 94 52 128Z') +
      '<path d="M26 30 Q22 72 50 78 Q78 72 74 30 Q62 44 50 28 Q38 44 26 30Z" fill="#D32F2F" stroke="#8E1414" stroke-width="2"/>' +
      '<path d="M50 28 Q40 52 50 78 Q60 52 50 28Z" fill="#EA5A5A"/><path d="M26 30 Q34 56 50 78" fill="none" stroke="#fff" stroke-width="1.8" opacity=".5"/>',
    f_bell: () => '<path d="M22 126 Q20 40 56 26 Q74 20 82 34" fill="none" stroke="#2E8B3E" stroke-width="4.5" stroke-linecap="round"/>' +
      [[40, 44, 0], [58, 62, 14], [38, 86, -8]].map(([x, y, a]) => rot(a, x, y,
        `<path d="M${x - 14} ${y - 6} Q${x - 18} ${y + 26} ${x - 22} ${y + 28} Q${x} ${y + 36} ${x + 22} ${y + 28} Q${x + 18} ${y + 26} ${x + 14} ${y - 6}Q${x} ${y - 14} ${x - 14} ${y - 6}Z" fill="#3F6FD8" stroke="#1D3F9A" stroke-width="2"/>` +
        `<path d="M${x - 8} ${y} Q${x - 10} ${y + 20} ${x - 12} ${y + 24}" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>`)).join('') +
      leaf('M22 126 Q4 112 8 96 Q24 108 22 126Z'),
    f_hya: () => leaf('M50 128 Q24 108 28 84 Q46 100 50 128Z') + leaf('M52 128 Q78 108 74 84 Q56 100 52 128Z') +
      '<path d="M50 128 L50 40" stroke="#2E8B3E" stroke-width="5" stroke-linecap="round"/>' +
      [[50, 18, 8], [40, 30, 8], [60, 30, 8], [32, 44, 8.5], [50, 44, 8.5], [68, 44, 8.5], [26, 60, 9], [42, 60, 9], [58, 60, 9], [74, 60, 9], [34, 77, 9], [50, 77, 9], [66, 77, 9]]
        .map(([x, y, r], i) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${i % 2 ? '#8E4BC9' : '#7B3FB5'}" stroke="#4E2380" stroke-width="1.5"/><circle cx="${x}" cy="${y}" r="${r * 0.34}" fill="#E5CCFA"/>`).join(''),
    f_peony: () => leaf('M50 112 Q14 112 8 86 Q36 84 50 112Z') + leaf('M50 112 Q86 112 92 86 Q64 84 50 112Z') +
      Array.from({ length: 8 }, (_, i) => rot(i * 45, 50, 54, '<ellipse cx="50" cy="28" rx="14" ry="19" fill="#D62839" stroke="#8E1424" stroke-width="1.5"/>')).join('') +
      Array.from({ length: 6 }, (_, i) => rot(i * 60 + 20, 50, 54, '<ellipse cx="50" cy="38" rx="11" ry="14" fill="#E94B5E" stroke="#A8202F" stroke-width="1.3"/>')).join('') +
      Array.from({ length: 5 }, (_, i) => rot(i * 72, 50, 54, '<ellipse cx="50" cy="46" rx="7" ry="9" fill="#F4849A"/>')).join('') +
      '<circle cx="50" cy="54" r="6" fill="#FFD23F"/>',
    f_chry: () => stem.replace('M50 74', 'M50 84') + leaf('M50 112 Q24 108 18 90 Q40 90 50 112Z') +
      Array.from({ length: 24 }, (_, i) => rot(i * 15, 50, 52, '<ellipse cx="50" cy="19" rx="3.4" ry="19" fill="#F2B51E" stroke="#B87A00" stroke-width="1"/>')).join('') +
      Array.from({ length: 16 }, (_, i) => rot(i * 22.5 + 8, 50, 52, '<ellipse cx="50" cy="30" rx="3.4" ry="14" fill="#FFD84D" stroke="#C98A00" stroke-width="1"/>')).join('') +
      '<circle cx="50" cy="52" r="9" fill="#E8870E"/>',
    f_plum: () => '<path d="M6 120 Q40 106 70 112 Q86 116 96 100" fill="none" stroke="#5A2815" stroke-width="6" stroke-linecap="round"/>' +
      '<circle cx="50" cy="60" r="44" fill="#fff" opacity=".0"/>' +
      Array.from({ length: 5 }, (_, i) => rot(i * 72, 50, 60, '<circle cx="50" cy="31" r="17" fill="#D2273A" stroke="#8C1424" stroke-width="2"/>')).join('') +
      '<circle cx="50" cy="60" r="12" fill="#fff"/>' +
      Array.from({ length: 6 }, (_, i) => { const a = i * 60 * Math.PI / 180; return `<path d="M50 60 L${50 + 13 * Math.cos(a)} ${60 + 13 * Math.sin(a)}" stroke="#F2B51E" stroke-width="2"/><circle cx="${50 + 13 * Math.cos(a)}" cy="${60 + 13 * Math.sin(a)}" r="2.4" fill="#F2B51E"/>`; }).join(''),
  };

  /* ---------- Zodiaque & Opéra (silhouettes plates) ---------- */
  const eye = (x, y, r = 4) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff"/><circle cx="${x + 0.6}" cy="${y + 0.6}" r="${r * 0.5}" fill="${INK}"/>`;
  const W = '#fff';
  const ANIMALS = {
    z_ox: () => `<path d="M16 48 Q4 26 26 18 Q22 36 34 46Z M84 48 Q96 26 74 18 Q78 36 66 46Z" fill="#F6E7B4" stroke="#9A8545" stroke-width="2"/>` +
      `<ellipse cx="14" cy="64" rx="12" ry="7" fill="#2E8B57" transform="rotate(-20 14 64)"/><ellipse cx="86" cy="64" rx="12" ry="7" fill="#2E8B57" transform="rotate(20 86 64)"/>` +
      `<path d="M26 44 Q50 34 74 44 Q82 70 70 96 Q50 108 30 96 Q18 70 26 44Z" fill="#2E8B57"/>` +
      `<ellipse cx="50" cy="90" rx="22" ry="17" fill="#8FD3AC"/><circle cx="42" cy="90" r="3.6" fill="#1B5E3A"/><circle cx="58" cy="90" r="3.6" fill="#1B5E3A"/>` +
      eye(36, 62) + eye(64, 62) + `<path d="M40 48 Q50 44 60 48" fill="none" stroke="${W}" stroke-width="2.6" stroke-linecap="round"/><circle cx="50" cy="104" r="4.5" fill="#F2A31B" opacity="0"/>`,
    z_monkey: () => `<circle cx="14" cy="60" r="13" fill="#D9433A"/><circle cx="14" cy="60" r="7" fill="#F5C9A6"/><circle cx="86" cy="60" r="13" fill="#D9433A"/><circle cx="86" cy="60" r="7" fill="#F5C9A6"/>` +
      `<ellipse cx="50" cy="64" rx="34" ry="38" fill="#D9433A"/>` +
      `<path d="M50 52 Q34 40 28 58 Q26 80 38 90 Q50 100 62 90 Q74 80 72 58 Q66 40 50 52Z" fill="#F7D3B0"/>` +
      eye(40, 66, 4.4) + eye(60, 66, 4.4) + `<ellipse cx="50" cy="82" rx="5" ry="3.4" fill="#C0392B"/><path d="M38 90 Q50 100 62 90" fill="none" stroke="#8E1F14" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M40 38 Q50 30 60 38" fill="none" stroke="${W}" stroke-width="3" stroke-linecap="round"/>`,
    z_horse: () => `<path d="M30 14 L40 40 L22 36Z M52 12 L60 38 L44 38Z" fill="#C8372D"/>` +
      `<path d="M34 26 Q20 60 22 110 L40 124 Q36 90 48 70Z" fill="#7B1D16"/>` +
      `<path d="M38 30 Q70 20 76 56 Q80 84 70 112 Q54 128 38 112 Q30 80 38 30Z" fill="#C8372D"/>` +
      `<ellipse cx="58" cy="104" rx="19" ry="17" fill="#E5675A"/><circle cx="50" cy="106" r="3.4" fill="#7B1D16"/><circle cx="66" cy="104" r="3.4" fill="#7B1D16"/>` +
      eye(54, 58, 4.6) + `<path d="M46 40 Q58 32 70 42" fill="none" stroke="${W}" stroke-width="2.6" stroke-linecap="round"/><path d="M30 44 Q36 70 34 96" fill="none" stroke="${W}" stroke-width="2.4" stroke-dasharray="3 5" stroke-linecap="round"/>`,
    z_pig: () => `<path d="M20 52 Q6 36 22 24 Q34 30 36 46Z M80 52 Q94 36 78 24 Q66 30 64 46Z" fill="#3FA66B" stroke="#1E6B42" stroke-width="2"/>` +
      `<ellipse cx="50" cy="68" rx="38" ry="36" fill="#3FA66B"/>` +
      `<ellipse cx="50" cy="82" rx="22" ry="16" fill="#9ADDB6" stroke="#1E6B42" stroke-width="2"/><ellipse cx="42" cy="82" rx="3.6" ry="5.6" fill="#1E6B42"/><ellipse cx="58" cy="82" rx="3.6" ry="5.6" fill="#1E6B42"/>` +
      eye(32, 58, 4.6) + eye(68, 58, 4.6) + `<path d="M40 38 Q50 32 60 38" fill="none" stroke="${W}" stroke-width="3" stroke-linecap="round"/>`,
    z_rooster: () => `<circle cx="38" cy="22" r="10" fill="#B71C1C"/><circle cx="52" cy="16" r="11" fill="#D9332A"/><circle cx="66" cy="24" r="9" fill="#B71C1C"/>` +
      `<path d="M10 70 Q14 110 50 124 Q86 110 90 70 Q70 94 50 90 Q30 94 10 70Z" fill="#E8742A"/><path d="M26 98 Q50 112 74 98" fill="none" stroke="${W}" stroke-width="2.6" stroke-linecap="round"/>` +
      `<ellipse cx="50" cy="58" rx="28" ry="34" fill="#D9332A"/><path d="M44 80 Q38 102 50 104 Q62 102 56 80Z" fill="#B71C1C"/>` +
      `<path d="M72 54 L96 62 L72 72Z" fill="#F2A31B"/>` + eye(58, 48, 5) + `<path d="M36 64 Q46 72 56 64" fill="none" stroke="${W}" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`,
    z_tiger: () => `<circle cx="22" cy="34" r="14" fill="#23376B"/><circle cx="22" cy="34" r="7" fill="#F2A31B"/><circle cx="78" cy="34" r="14" fill="#23376B"/><circle cx="78" cy="34" r="7" fill="#F2A31B"/>` +
      `<ellipse cx="50" cy="68" rx="38" ry="38" fill="#23376B"/>` +
      `<path d="M50 36 v14 M42 38 v10 M58 38 v10" stroke="${W}" stroke-width="3.4" stroke-linecap="round"/>` +
      `<path d="M14 62 l12 4 M14 76 l12 -2 M86 62 l-12 4 M86 76 l-12 -2" stroke="${W}" stroke-width="3" stroke-linecap="round"/>` +
      `<ellipse cx="50" cy="86" rx="21" ry="16" fill="#E8EEF9"/><path d="M44 80 h12 l-6 8z" fill="#E86A6A"/><path d="M50 88 v6 M40 96 Q50 100 60 96" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>` +
      eye(36, 62, 4.6) + eye(64, 62, 4.6),
    o1: () => `<circle cx="22" cy="22" r="8" fill="#D9332A"/><circle cx="78" cy="22" r="8" fill="#D9332A"/><path d="M18 40 Q50 -2 82 40 Q50 30 18 40Z" fill="#F2B51E" stroke="#B87A00" stroke-width="2"/>` +
      `<ellipse cx="50" cy="76" rx="32" ry="40" fill="#FBE3C4" stroke="#8E5A2B" stroke-width="2"/>` +
      `<path d="M50 40 L60 56 L50 70 L40 56Z" fill="#D9332A"/><path d="M20 58 Q36 44 46 60 Q34 64 20 58Z M80 58 Q64 44 54 60 Q66 64 80 58Z" fill="${INK}"/>` +
      `<path d="M24 74 Q36 66 44 76 Q34 84 24 74Z M76 74 Q64 66 56 76 Q66 84 76 74Z" fill="#D9332A"/>` +
      `<ellipse cx="30" cy="92" rx="8" ry="5" fill="#F4849A" opacity=".8"/><ellipse cx="70" cy="92" rx="8" ry="5" fill="#F4849A" opacity=".8"/>` +
      `<path d="M42 100 Q50 108 58 100" fill="none" stroke="#B71C1C" stroke-width="4" stroke-linecap="round"/><path d="M34 80 q3 -3 6 0 M60 80 q3 -3 6 0" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`,
    o2: () => `<path d="M30 34 Q24 4 8 6 Q16 24 20 40Z M70 34 Q76 4 92 6 Q84 24 80 40Z" fill="#1E7E45" stroke="#0E4D2A" stroke-width="2"/>` +
      `<path d="M20 44 Q50 6 80 44 Q50 34 20 44Z" fill="#1B4B8A"/><circle cx="50" cy="26" r="7" fill="#F2B51E"/>` +
      `<ellipse cx="50" cy="78" rx="31" ry="38" fill="#F2F4F8" stroke="#1B3F7A" stroke-width="2.4"/>` +
      `<path d="M50 44 Q34 58 40 74 Q50 66 60 74 Q66 58 50 44Z" fill="#1B4B8A"/><path d="M18 62 Q32 50 44 64 Q32 66 18 62Z M82 62 Q68 50 56 64 Q68 66 82 62Z" fill="${INK}"/>` +
      `<path d="M30 84 q8 -10 16 0 M54 84 q8 -10 16 0" fill="none" stroke="${INK}" stroke-width="3.2" stroke-linecap="round"/>` +
      `<path d="M44 98 Q50 104 56 98" fill="none" stroke="${RED}" stroke-width="4" stroke-linecap="round"/><path d="M50 44 v12" stroke="${RED}" stroke-width="3"/>`,
  };

  const yuanbao = () =>
    `<path d="M10 52 Q50 24 90 52 Q84 90 50 100 Q16 90 10 52Z" fill="url(#gld)" stroke="#8A5A00" stroke-width="3"/>` +
    `<ellipse cx="50" cy="52" rx="27" ry="19" fill="#FFF2A6" stroke="#B87A00" stroke-width="2.4"/><ellipse cx="50" cy="52" rx="17" ry="11" fill="#F2B51E"/>` +
    `<path d="M10 52 Q4 36 18 32 Q22 44 30 48 M90 52 Q96 36 82 32 Q78 44 70 48" fill="none" stroke="#8A5A00" stroke-width="3" stroke-linecap="round"/>` +
    `<text x="50" y="58" font-size="16" fill="#8A5A00" ${FONT}>金</text>` +
    `<path d="M20 22 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3z M80 100 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" fill="#fff" class="sp"/>` +
    `<defs><linearGradient id="gld" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFE670"/><stop offset="1" stop-color="#DF9E1A"/></linearGradient></defs>`;

  const NUM = { 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九' };
  function inner(type) {
    const k = type[0], n = +type.slice(1);
    if (type === 'gold') return yuanbao();
    if (type === 'xi') return ch('囍', RED, 84, 98);
    if (k === 'm') return ch(NUM[n], BLUE, 84, 96);
    if (k === 't') return tong(n);
    if (k === 'b') return bamboo(n);
    if (type === 'dr') return ch('中', '#C92323', 84, 98);
    if (type === 'dg') return ch('發', '#1B7F46', 80, 97);
    if (type === 'dw') return dragonW();
    if (type === 'we') return ch('東', INK, 78, 96);
    if (type === 'ws') return ch('南', INK, 78, 96);
    if (type === 'ww') return ch('西', INK, 78, 96);
    if (type === 'wn') return ch('北', INK, 78, 96);
    if (FLOWERS[type]) return FLOWERS[type]();
    if (ANIMALS[type]) { // les têtes sont agrandies pour remplir 65-75 % de la face
      const sc = { z_ox: 1.32, z_monkey: 1.3, z_pig: 1.3, z_tiger: 1.28, z_rooster: 1.06, z_horse: 1.04, o1: 1.04, o2: 1.04 }[type] || 1;
      return `<g transform="translate(50 66) scale(${sc}) translate(-50 -66)">${ANIMALS[type]()}</g>`;
    }
    return '';
  }
  const cache = {};
  MJ.Symbols = {
    /** SVG complet d'une face */
    svg(type) { return cache[type] || (cache[type] = `<svg viewBox="0 0 100 133" preserveAspectRatio="xMidYMid meet" aria-hidden="true">${inner(type)}</svg>`); },
    /** dos « mystère » : feuilles de bambou gravées */
    back() {
      const leafP = (x, y, a, s) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})"><path d="M0 0 Q14 -10 32 0 Q14 10 0 0Z" fill="#B87A00" opacity=".55"/><path d="M0 0 L30 0" stroke="#FFE9A0" stroke-width="1.2" opacity=".7"/></g>`;
      return `<svg viewBox="0 0 100 133" aria-hidden="true"><path d="M50 128 Q46 70 56 8" fill="none" stroke="#B87A00" stroke-width="3.4" opacity=".6"/>` +
        [[52, 100, -40, 1.2], [50, 82, 215, 1.2], [53, 62, -35, 1.1], [52, 44, 210, 1.1], [55, 26, -30, 1], [34, 112, 200, .9], [66, 110, -20, .9]].map(a => leafP(...a)).join('') +
        `<rect x="9" y="9" width="82" height="115" rx="11" fill="none" stroke="#FFF0B0" stroke-width="2" opacity=".6"/></svg>`;
    },
    stone: `<svg viewBox="0 0 100 133" aria-hidden="true"><path d="M16 22 Q50 4 84 22 Q96 66 84 112 Q50 128 16 112 Q4 66 16 22Z" fill="#8B7D6B" stroke="#4E4538" stroke-width="3"/>` +
      `<path d="M30 34 Q50 24 70 34" fill="none" stroke="#B5A892" stroke-width="3" opacity=".6"/><path d="M50 30 L44 62 L56 78 L46 108" fill="none" stroke="#3A332A" stroke-width="3" stroke-linejoin="round"/></svg>`,
    mascot: `<svg viewBox="0 0 120 150" aria-hidden="true"><path d="M20 84 Q0 70 8 48" fill="none" stroke="#F2F4EF" stroke-width="9" stroke-linecap="round"/><path d="M100 84 Q120 70 112 48" fill="none" stroke="#F2F4EF" stroke-width="9" stroke-linecap="round"/>` +
      `<circle cx="8" cy="46" r="8" fill="#FAFAFA" stroke="#9BC3AB" stroke-width="2"/><circle cx="112" cy="46" r="8" fill="#FAFAFA" stroke="#9BC3AB" stroke-width="2"/>` +
      `<rect x="20" y="30" width="86" height="112" rx="18" fill="#247D4E"/><rect x="16" y="24" width="84" height="110" rx="18" fill="#FAFAFA" stroke="#CDEBD9" stroke-width="3"/>` +
      `<circle cx="42" cy="72" r="7" fill="#1F2933"/><circle cx="74" cy="72" r="7" fill="#1F2933"/><circle cx="44" cy="69" r="2.6" fill="#fff"/><circle cx="76" cy="69" r="2.6" fill="#fff"/>` +
      `<ellipse cx="30" cy="88" rx="8" ry="5" fill="#F4849A" opacity=".75"/><ellipse cx="86" cy="88" rx="8" ry="5" fill="#F4849A" opacity=".75"/>` +
      `<path d="M46 90 Q58 104 70 90Z" fill="#D93829"/><path d="M58 22 q-6 -16 6 -18 q10 2 4 18" fill="#3FA652" stroke="#1F6B2D" stroke-width="2"/></svg>`,
    leaf: `<svg viewBox="0 0 24 12"><path d="M0 6 Q9 -2 24 6 Q9 14 0 6Z" fill="#2E9E52"/><path d="M0 6 H22" stroke="#B9F0C6" stroke-width="1"/></svg>`,
  };
})(window.MJ = window.MJ || {});
