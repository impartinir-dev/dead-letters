# DEAD LETTERS

*The murder mystery word search.* A mobile-first PWA styled as a vintage
detective casebook — **150 cases** across 3 volumes. Find the hidden words,
then catch the killer.

## Play

```bash
npm install
npm run generate   # regenerate the 150 case files → src/data/
npm run dev        # dev server
npm run build      # static build → dist/ (deployable anywhere)
npm run preview    # serve the production build
npm test           # validates all 150 cases (solvability, message fit, …)
npm run icons      # regenerate PWA icons
```

## The cases

Every case is a word search with a murder to solve. Four mechanics, mixed
across the case list:

| Mechanic    | Solve step |
|-------------|------------|
| **Dead letter**  | Leftover grid letters spell the answer — fill in the case file (killer / weapon / location) |
| **Suspect lineup** | Leftover letters spell a clue; pick the matching suspect from 4 cards |
| **Deduction**    | Each found word reveals evidence clearing a suspect/weapon/location — last one standing is guilty |
| **Confession**   | Leftover letters form a scrambled confession — arrange the tiles |

**Volumes:** I. Homicide 101 (8–10 grids, easy directions) → II. Cold Trails
(10–12, more directions, deduction unlocks) → III. Master Sleuth (12–14, all
8 directions, confessions, red-herring decoy words).

## How it's built

- **Vite + React + TypeScript**, hash router, no backend. Progress in
  `localStorage`. PWA (installable, fully offline) via `vite-plugin-pwa`.
- **Generator** (`src/generator/`): deterministic seeded RNG → word placement
  → decoy fill → exact-length leftover-message fitting (core clue + thematic
  padding). ~35 hand-authored themed word packs + name/weapon/location/trait
  pools.
- **Validation** (`tests/`): a brute-force solver proves every bank word is
  findable; leftover letters are verified to spell their message; lineups have
  exactly one matching suspect; elimination boards have unique solutions;
  anagram tiles match their phrase; all 150 titles are unique.
- Features: countdown timer, 3 hints per case, 2-minute challenge badge,
  daily case + streaks, best times, share results, false-accusation counter.

## Deploy

`npm run build` emits `dist/` — static files, `base: './'`, works under any
sub-path (GitHub Pages, Netlify, Vercel, itch.io, a folder on any host).
