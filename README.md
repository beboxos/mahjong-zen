# Mahjong Zen — Mahjong Solitaire 2.5D (HTML / CSS / JS)

Jeu mobile-first 9:16, 100 % HTML + CSS + SVG inline + JS (aucune dépendance, aucun build, hors ligne).

**Lancer** : ouvrir `index.html` (ou `python -m http.server 8765` puis http://localhost:8765).
**Tester le moteur** : `node tests/solvable.js` (valide les 15 gabarits et la génération des 600 niveaux).

## Structure
| Dossier | Rôle |
|---|---|
| `js/engine/layouts.js` | 15 gabarits (Pyramide, Pagode, Double Pilier, Pont, Jardin, Couronne, Tortue, Papillon, Croix, Diamant, Lanterne, Forteresse, Jardin Zen, Cascade, Lotus) + 4 variantes miroir |
| `js/engine/board.js` | règle de tuile libre, pierres, tuiles mystère, RNG mulberry32 |
| `js/engine/generator.js` | construction inverse (solvabilité garantie) + mélange garanti |
| `js/engine/levels.js` | 600 niveaux déterministes, difficulté progressive |
| `js/render/` | `symbols` (SVG), `tiles` (DOM 2.5D), `vfx` (particules), `shoji` (portes) |
| `js/audio/sfx.js` | audio procédural Web Audio |
| `js/ui/hud.js`, `js/main.js` | HUD, écrans, modes Classic / Tray, power-ups, sauvegarde |

## Notes
- Scène logique 540×960 mise à l'échelle (`--k`) ; sur desktop, cadre 9:16 à coins arrondis.
- Les caractères (二…九, 中, 發, 東…) utilisent une police CJK du système ; le reste est du SVG pur.
- Sauvegarde : `localStorage` clé `mahjong-zen-v1` (niveau, déblocage, étoiles, score, IQ, combo, mode, son).
- Conventions reprises de `hexa-sort` : RNG mulberry32, module audio, sauvegarde try/catch, grille de niveaux par mondes de 50.
