# DEAD LETTERS

*The murder mystery word search.* A mobile-first PWA styled as a vintage
detective casebook — a **new case every day** plus an archive of **150 cases**
across 3 volumes. Meet the suspects, work the puzzle, catch the killer.

## Play

```bash
npm install
npm run generate   # regenerate the 150 case files → src/data/
npm run dev        # dev server
npm run build      # static build → dist/ (deployable anywhere)
npm run preview    # serve the production build
npm test           # validates all 150 cases + daily/share logic
npm run typecheck
npm run icons      # regenerate PWA icons
npm run og         # regenerate the 1200×630 social share image
```

## The cases

Every case has a victim, a theme (winery, jazz club, lighthouse, … 35 in all)
and a cast of **four suspects**, each with a one-line hook ("the sommelier Nora
publicly humiliated"). The killer is always one of them. Weapons and rooms come
from the theme, so a golf-course murder happens in the clubhouse with a nine
iron — never in a pantry.

Eight case modes, mixed across the casebook:

| Mode | How it plays |
|------|--------------|
| **Dead letter** | Word search. The leftover letters spell a clue that names the killer's *role* ("THE SOMMELIER HID THE CORKSCREW") — accuse the matching suspect and fill in any weapon/location blanks. |
| **Lineup** | Word search. The leftovers spell a trait ("THE KILLER IS LEFT-HANDED"); pick the one suspect card that matches. |
| **Evidence board** | Word search. Each word found reveals evidence clearing a suspect, weapon or room — the last of each standing is the answer. |
| **Confession** | Word search. The leftovers are a scrambled confession that names the killer — arrange the tiles. |
| **Cipher** | A substitution-cipher note that points at a suspect. Decode it, then accuse. |
| **Deduction** | Logic grid: clue cards pin down exactly one killer, weapon and room. |
| **Interrogation** | Four statements; everyone tells the truth except the killer. |
| **Timeline** | Order the night's events from witness clues. |

**Volumes:** I. Homicide 101 (8–10 grids, easy directions) → II. Cold Trails
(10–12, more directions) → III. Master Sleuth (12–14, all 8 directions,
red-herring decoy words).

**Daily case:** `#/daily` opens today's case. Daily #1 is `LAUNCH_DATE` in
`src/config.ts`; each local day adds one and walks a fixed shuffle of all 150
cases. Streaks, a countdown to midnight, and a spoiler-free Wordle-style share
card ("DEAD LETTERS #47 🔍 Solved in 2:14 · 1 hint · 0 false accusations").

## How it's built

- **Vite + React + TypeScript**, hash router, no backend. Progress in
  `localStorage`. PWA (installable, fully offline) via `vite-plugin-pwa`.
- **Generator** (`src/generator/`): deterministic seeded RNG → word placement
  → decoy fill → exact-length leftover messages (clue core + in-world padding
  phrases, never naming a wrong room/weapon/suspect). 35 hand-authored themes,
  each with its own words, rooms, weapons, suspect archetypes, padding phrases,
  intros and titles; ~220 surnames (none used more than 4 times).
- **Validation** (`tests/`): a brute-force solver proves every bank word is
  findable; leftover letters spell their message; every clue points at the
  killer and no one else; lineups/deductions/interrogations/timelines have
  unique solutions; stories stay inside their theme; no filler padding; share
  text never leaks an answer.
- **Accessibility:** the grid is keyboard-playable (arrow keys, Enter to start
  and end a selection, Escape to cancel) with ARIA grid semantics and a live
  region announcing finds.
- **Legal / ads:** Impressum and Datenschutzerklärung pages (`#/impressum`,
  `#/datenschutz`) with placeholders to fill in. Ad slots and the consent gate
  are scaffolded but off — see `src/config.ts` and `src/lib/consent.ts`.

## Deploy

`npm run build` emits `dist/` — static files, `base: './'`, works under any
sub-path (GitHub Pages, Netlify, Vercel, itch.io, a folder on any host). Set
`VITE_SITE_URL` in `.env` to the public URL so social cards get absolute image
links.
