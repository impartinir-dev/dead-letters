import type { Rng } from './rng'
import { mulberry32, seedFor, pick, pickN, int, shuffle } from './rng'
import {
  THEMES, PLACE_TITLE_TEMPLATES, CASE_TITLE_TEMPLATES, type Theme,
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

/** Casebook-wide state that keeps the 150 cases varied. */
export interface GenContext {
  /** themes used by the last few cases (skipped) */
  recentThemes: ReadonlySet<string>
  usedTitles: ReadonlySet<string>
  /** surnames that already appear SURNAME_CAP times */
  blockedSurnames: ReadonlySet<string>
  /** how often each intro template (by text) has been used */
  introUses: ReadonlyMap<string, number>
}

export const SURNAME_CAP = 4

/** The theme's least-used intro (ties broken by the rng), filled in. */
function pickIntro(rng: Rng, theme: Theme, a: Atoms, uses: ReadonlyMap<string, number>): string {
  const min = Math.min(...theme.intros.map((t) => uses.get(t) ?? 0))
  const tpl = pick(rng, theme.intros.filter((t) => (uses.get(t) ?? 0) === min))
  return tpl.replaceAll('{victim}', a.victim).replaceAll('{first}', a.victim.split(' ')[0])
}

/**
 * Generate one case. `salt` bumps the seed on collisions so the whole
 * 150-case run stays deterministic. Returns null if all attempts fail.
 */
export function generateCase(id: number, salt: number, ctx: Partial<GenContext> = {}): CaseFile | null {
  const recentThemes = ctx.recentThemes ?? new Set<string>()
  const usedTitles = ctx.usedTitles ?? new Set<string>()
  const introUses = ctx.introUses ?? new Map<string, number>()
  const vol = volumeOf(id)
  const idx = id - (vol - 1) * 50
  const mechanic = MECH_MAP[PATTERNS[vol][(id - 1) % 10]]
  const size = sizeFor(vol, idx)
  const dirs = DIRS_BY_VOL[vol]

  for (let attempt = 0; attempt < 300; attempt++) {
    const rng = mulberry32(seedFor(id, attempt + salt * 100_003))

    const available = THEMES.filter((t) => !recentThemes.has(t.id))
    const theme: Theme = pick(rng, available.length ? available : THEMES)
    const atoms = makeAtoms(rng, theme, ctx.blockedSurnames)

    const isWS = WORD_SEARCH_MECHANICS.includes(mechanic)
    let grid: string[] = []
    let words: string[] = []
    let placements: CaseFile['placements'] = []
    let payload: CaseFile['payload'] | null = null

    if (isWS) {
      const wc = wordCount(rng, vol)
      // bank/decoy words never spell a cast member's role (clues refer to roles)
      const roles = atoms.suspects.map((s) => s.role.toUpperCase().replace(/[^A-Z]/g, ''))
      const usable = (w: string) => w.length <= size && !roles.some((r) => w.includes(r) || r.includes(w))
      const themeWords = theme.words.filter(usable)
      words = pickN(rng, themeWords, wc)
      const filler = shuffle(rng, CRIME_FILLER.filter(usable))
      for (const w of filler) {
        if (words.length >= wc) break
        if (!words.includes(w)) words.push(w)
      }

      const placed = placeWords(rng, words, size, size, dirs)
      if (!placed) continue

      // decoy words (red herrings hidden but not in the bank)
      const decoyPool = [
        ...theme.words.filter((w) => !words.includes(w) && usable(w)),
        ...CRIME_FILLER.filter((w) => !words.includes(w) && usable(w)),
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
      suspects: atoms.suspects,
      killer: atoms.killer,
      weapon: atoms.weapon,
      location: atoms.location,
      motive: atoms.motive,
      flavor: pickIntro(rng, theme, atoms, introUses),
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
  const surnameUses = new Map<string, number>()
  const blockedSurnames = new Set<string>()
  const introUses = new Map<string, number>()

  for (let id = 1; id <= count; id++) {
    let c: CaseFile | null = null
    for (let salt = 0; salt < 50 && !c; salt++) {
      c = generateCase(id, salt, { recentThemes, usedTitles, blockedSurnames, introUses })
      if (c && usedTitles.has(c.title)) c = null
    }
    if (!c) throw new Error(`failed to generate case ${id}`)

    for (const name of [c.victim, ...c.suspects.map((s) => s.name)]) {
      const s = name.split(' ').slice(1).join(' ').toUpperCase()
      const n = (surnameUses.get(s) ?? 0) + 1
      surnameUses.set(s, n)
      if (n >= SURNAME_CAP) blockedSurnames.add(s)
    }
    const theme = THEMES.find((t) => t.id === c.themeId)!
    const first = c.victim.split(' ')[0]
    const intro = theme.intros.find(
      (t) => t.replaceAll('{victim}', c!.victim).replaceAll('{first}', first) === c!.flavor,
    )!
    introUses.set(intro, (introUses.get(intro) ?? 0) + 1)
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
