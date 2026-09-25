import type { Rng } from './rng'
import { mulberry32, seedFor, pick, pickN, int, shuffle } from './rng'
import {
  THEMES, FLAVOR_TEMPLATES, PLACE_TITLE_TEMPLATES, CASE_TITLE_TEMPLATES, type Theme,
} from './themes'
import { DIRS, placeWords, leftoverCells, finalizeGrid, canPlace, fits, put, type Grid } from './grid'
import { makeAtoms, buildPayload, type Atoms } from './mechanics'
import { buildMode } from './modes'
import { CRIME_FILLER } from './pools'
import { WORD_SEARCH_MECHANICS, type CaseFile, type CaseIndexEntry, type Mechanic } from './types'

/* Per-volume mechanic patterns (indexed by (id-1) % 10).
 * A=leftovers B=lineup C=elimination D=anagram  (word-search family)
 * E=cryptogram F=deduction G=interrogation H=timeline
 * Totals across 150: A30 B15 C20 D15 E25 F15 G15 H15 — ~53% word search. */
const PATTERNS: Record<number, string> = {
  1: 'AAEBAGAHEG',
  2: 'CEBFCHAECD',
  3: 'DFGCAHBFED',
}
const MECH_MAP: Record<string, Mechanic> = {
  A: 'leftovers',
  B: 'lineup',
  C: 'elimination',
  D: 'anagram',
  E: 'cryptogram',
  F: 'deduction',
  G: 'interrogation',
  H: 'timeline',
}

const DIRS_BY_VOL: Record<number, string[]> = {
  1: ['E', 'S', 'SE'],
  2: ['E', 'S', 'SE', 'W', 'N', 'SW', 'NE'],
  3: ['E', 'S', 'SE', 'W', 'N', 'SW', 'NE', 'NW'],
}

const ALL_DIRS = Object.keys(DIRS)

function volumeOf(id: number): 1 | 2 | 3 {
  return id <= 50 ? 1 : id <= 100 ? 2 : 3
}

function sizeFor(vol: number, idx: number): number {
  const base = vol === 1 ? 8 : vol === 2 ? 10 : 12
  return base + (idx <= 17 ? 0 : idx <= 34 ? 1 : 2)
}

function wordCount(rng: Rng, vol: number): number {
  return vol === 1 ? int(rng, 10, 12) : vol === 2 ? int(rng, 12, 15) : int(rng, 15, 18)
}

/** Leftover budget per word-search mechanic — decoy words consume cells beyond this. */
const LEFTOVER_TARGET: Record<string, number> = {
  leftovers: 64,
  lineup: 40,
  elimination: 40,
  anagram: 44,
}

/** Greedily hide extra (decoy, non-bank) words until leftovers <= target. */
function placeDecoys(rng: Rng, grid: Grid, size: number, pool: string[], target: number): void {
  let misses = 0
  const decoyDirs = ALL_DIRS
  while (leftoverCells(grid, size).length > target && misses < 25) {
    const word = pick(rng, pool)
    if (word.length < 4 || word.length > size) { misses++; continue }
    let placed = false
    for (let t = 0; t < 60 && !placed; t++) {
      const d = pick(rng, decoyDirs)
      const { dr, dc } = DIRS[d]
      const r = Math.floor(rng() * size)
      const c = Math.floor(rng() * size)
      if (fits(word.length, r, c, dr, dc, size, size) && canPlace(grid, word, r, c, dr, dc)) {
        put(grid, word, r, c, dr, dc)
        placed = true
      }
    }
    if (!placed) misses++
  }
}

const capWords = (s: string) => s.replace(/\b\w/g, (ch) => ch.toUpperCase())

/**
 * Titles come from the theme: its hand-written titles first, then place-based
 * templates, then theme-neutral victim/motive templates. Already-used titles
 * are skipped so the 150-case run stays unique without reseeding.
 */
function pickTitle(rng: Rng, theme: Theme, a: Atoms, used: ReadonlySet<string>): string | null {
  const fresh = (xs: string[]) => xs.filter((t) => !used.has(t))
  const own = fresh([
    ...theme.titles,
    ...PLACE_TITLE_TEMPLATES.map((t) => t.replaceAll('{place}', capWords(theme.place))),
  ])
  const fallback = fresh(
    CASE_TITLE_TEMPLATES.map((t) =>
      t.replaceAll('{victim}', a.victim).replaceAll('{motive}', a.motive),
    ),
  )
  if (own.length && (rng() < 0.8 || !fallback.length)) return pick(rng, own)
  return fallback.length ? pick(rng, fallback) : null
}

function fillFlavor(tpl: string, a: Atoms, place: string): string {
  return tpl
    .replaceAll('{victim}', a.victim)
    .replaceAll('{place}', place)
    .replaceAll('{weapon}', a.weapon.toLowerCase())
    .replaceAll('{location}', a.location.toLowerCase())
}

/**
 * Generate one case. `salt` bumps the seed on title collisions so the whole
 * 150-case run stays deterministic. Returns null if all attempts fail.
 */
export function generateCase(
  id: number, salt: number, recentThemes: Set<string>, usedTitles: ReadonlySet<string> = new Set(),
): CaseFile | null {
  const vol = volumeOf(id)
  const idx = id - (vol - 1) * 50
  const mechanic = MECH_MAP[PATTERNS[vol][(id - 1) % 10]]
  const size = sizeFor(vol, idx)
  const dirs = DIRS_BY_VOL[vol]

  for (let attempt = 0; attempt < 300; attempt++) {
    const rng = mulberry32(seedFor(id, attempt + salt * 100_003))

    const available = THEMES.filter((t) => !recentThemes.has(t.id))
    const theme: Theme = pick(rng, available.length ? available : THEMES)
    const atoms = makeAtoms(rng, theme)

    const isWS = WORD_SEARCH_MECHANICS.includes(mechanic)
    let grid: string[] = []
    let words: string[] = []
    let placements: CaseFile['placements'] = []
    let payload: CaseFile['payload'] | null = null

    if (isWS) {
      const wc = wordCount(rng, vol)
      const themeWords = theme.words.filter((w) => w.length <= size)
      words = pickN(rng, themeWords, wc)
      const filler = shuffle(rng, CRIME_FILLER.filter((w) => w.length <= size))
      for (const w of filler) {
        if (words.length >= wc) break
        if (!words.includes(w)) words.push(w)
      }

      const placed = placeWords(rng, words, size, size, dirs)
      if (!placed) continue

      // decoy words (red herrings hidden but not in the bank)
      const decoyPool = [
        ...theme.words.filter((w) => !words.includes(w) && w.length <= size),
        ...CRIME_FILLER.filter((w) => !words.includes(w) && w.length <= size),
      ]
      placeDecoys(rng, placed.grid, size, decoyPool, LEFTOVER_TARGET[mechanic])

      const cells = leftoverCells(placed.grid, size)
      const built = buildPayload(mechanic, rng, cells.length, cells, atoms, words, theme)
      if (!built || built.fill.length !== cells.length) continue
      grid = finalizeGrid(placed.grid, size, cells, built.fill)
      placements = placed.placements
      payload = built.payload
    } else {
      payload = buildMode(mechanic, rng, atoms, vol, theme)
      if (!payload) continue
    }

    const title = pickTitle(rng, theme, atoms, usedTitles)
    if (!title) continue

    return {
      id,
      volume: vol,
      title,
      themeId: theme.id,
      mechanic,
      rows: isWS ? size : 0,
      cols: isWS ? size : 0,
      grid,
      words,
      victim: atoms.victim,
      killer: atoms.killer,
      weapon: atoms.weapon,
      location: atoms.location,
      motive: atoms.motive,
      flavor: fillFlavor(pick(rng, FLAVOR_TEMPLATES), atoms, theme.place),
      parSeconds: isWS
        ? Math.round(25 + words.length * 6 + size * size * 0.35)
        : int(rng, 60, 110),
      placements,
      payload,
    }
  }
  return null
}

export function generateAll(count = 150): { cases: CaseFile[]; index: CaseIndexEntry[] } {
  const cases: CaseFile[] = []
  const usedTitles = new Set<string>()
  const recentThemes = new Set<string>()
  const themeQueue: string[] = []

  for (let id = 1; id <= count; id++) {
    let c: CaseFile | null = null
    for (let salt = 0; salt < 50 && !c; salt++) {
      c = generateCase(id, salt, recentThemes, usedTitles)
      if (c && usedTitles.has(c.title)) c = null
    }
    if (!c) throw new Error(`failed to generate case ${id}`)

    usedTitles.add(c.title)
    themeQueue.push(c.themeId)
    recentThemes.clear()
    for (const t of themeQueue.slice(-6)) recentThemes.add(t)
    cases.push(c)
  }

  const index = cases.map((c) => ({
    id: c.id,
    volume: c.volume,
    title: c.title,
    mechanic: c.mechanic,
    rows: c.rows,
    wordCount: c.words.length,
  }))
  return { cases, index }
}
