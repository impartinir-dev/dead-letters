import type { Rng } from './rng'
import { pick, pickN, shuffle, chance } from './rng'
import { fitMessage } from './message'
import {
  FIRST_NAMES, SURNAMES, MOTIVES,
  TRAIT_VALUES, CLUE_TEXT, ELIM_NOTES, ELIM_MESSAGES,
  CONFESSIONS, CONFESSION_PADS,
  type TraitDim,
} from './pools'
import type {
  Mechanic, Payload, LeftoverPayload, LineupPayload,
  EliminationPayload, AnagramPayload, Suspect, ElimItem,
} from './types'
import type { Theme } from './themes'

export interface Atoms {
  victim: string
  killer: string
  weapon: string
  location: string
  motive: string
}

export const squash = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '')
export const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b[a-z]/g, (ch) => ch.toUpperCase())

/** Weapon and location are drawn only from the theme's own pools. */
export function makeAtoms(rng: Rng, theme: Theme): Atoms {
  const firsts = pickN(rng, FIRST_NAMES, 2)
  const lasts = pickN(rng, SURNAMES, 2)
  return {
    victim: titleCase(`${firsts[0]} ${lasts[0]}`),
    killer: titleCase(`${firsts[1]} ${lasts[1]}`),
    weapon: pick(rng, theme.weapons),
    location: pick(rng, theme.rooms),
    motive: titleCase(pick(rng, MOTIVES)),
  }
}

/* ------------------------------ leftovers ------------------------------ */

type Blank = 'killer' | 'weapon' | 'location'

function leftoverCores(blanks: Blank[], a: Atoms): string[] {
  const K = squash(a.killer), W = squash(a.weapon), L = squash(a.location), V = squash(a.victim)
  const has = (b: Blank) => blanks.includes(b)
  if (has('weapon') && has('location'))
    return [
      `ITWAS${K}WITHTHE${W}INTHE${L}`,
      `${K}KILLED${V}WITHTHE${W}INTHE${L}`,
      `THEKILLERIS${K}THEWEAPONWASTHE${W}THELOCATIONWASTHE${L}`,
      `${K}INTHE${L}WITHTHE${W}`,
    ]
  if (has('weapon'))
    return [
      `ITWAS${K}WITHTHE${W}`,
      `${K}DIDITWITHTHE${W}`,
      `THEKILLERIS${K}THEWEAPONWASTHE${W}`,
      `THEWEAPONWASTHE${W}ANDTHEKILLERIS${K}`,
    ]
  if (has('location'))
    return [
      `ITWAS${K}INTHE${L}`,
      `${K}DIDITINTHE${L}`,
      `THEKILLERIS${K}THESCENEWASTHE${L}`,
    ]
  return [
    `THEKILLERIS${K}`,
    `ITWAS${K}`,
    `${K}DIDIT`,
    `MURDERER${K}`,
    `THEMURDERERIS${K}`,
    `ITWAS${K}ALLALONG`,
  ]
}

function buildLeftovers(rng: Rng, L: number, messageCells: number[], a: Atoms): LeftoverPayload | null {
  const canonical: Blank[][] = [
    ['killer', 'weapon', 'location'],
    ['killer', 'location'],
    ['killer', 'weapon'],
    ['killer'],
  ]
  const order = chance(rng, 0.55) ? canonical : shuffle(rng, canonical)
  for (const blanks of order) {
    const message = fitMessage(rng, leftoverCores(blanks, a), L)
    if (message) {
      const ord: Record<Blank, number> = { killer: 0, weapon: 1, location: 2 }
      return {
        kind: 'leftovers',
        message,
        blanks: blanks.slice().sort((x, y) => ord[x] - ord[y]),
        messageCells,
      }
    }
  }
  return null
}

/* -------------------------------- lineup ------------------------------- */

const DIMS = Object.keys(TRAIT_VALUES) as TraitDim[]

function buildLineup(rng: Rng, L: number, messageCells: number[], a: Atoms): LineupPayload | null {
  const dim = pick(rng, DIMS)
  const value = pick(rng, TRAIT_VALUES[dim])
  const clue = CLUE_TEXT[dim][value]
  const message = fitMessage(rng, [clue.msg], L)
  if (!message) return null

  const randTraits = (over: Partial<Suspect['traits']>): Suspect['traits'] => ({
    hair: pick(rng, TRAIT_VALUES.hair),
    hand: pick(rng, TRAIT_VALUES.hand),
    accessory: pick(rng, TRAIT_VALUES.accessory),
    habit: pick(rng, TRAIT_VALUES.habit),
    ...over,
  })

  const taken = new Set([a.victim, a.killer])
  const decoyNames: string[] = []
  for (const f of shuffle(rng, FIRST_NAMES)) {
    for (const s of shuffle(rng, SURNAMES)) {
      const name = titleCase(`${f} ${s}`)
      if (!taken.has(name) && !decoyNames.includes(name)) {
        decoyNames.push(name)
        break
      }
    }
    if (decoyNames.length >= 3) break
  }

  const others = TRAIT_VALUES[dim].filter((v) => v !== value)
  const suspects: Suspect[] = [
    { name: a.killer, traits: randTraits({ [dim]: value }) },
    ...decoyNames.map((name) => ({
      name,
      traits: randTraits({ [dim]: pick(rng, others) }),
    })),
  ]

  // ensure no two suspects share an identical trait sheet (never touch clueDim)
  for (let i = 0; i < suspects.length; i++) {
    let guard = 0
    while (guard++ < 25) {
      const others = new Set(
        suspects.filter((_, j) => j !== i).map((s) => JSON.stringify(s.traits)),
      )
      if (!others.has(JSON.stringify(suspects[i].traits))) break
      for (const d of DIMS)
        if (d !== dim) suspects[i].traits[d] = pick(rng, TRAIT_VALUES[d])
    }
  }

  return {
    kind: 'lineup',
    message,
    clueText: clue.readable,
    clueDim: dim,
    clueValue: value,
    suspects: shuffle(rng, suspects),
    messageCells,
  }
}

/* ----------------------------- elimination ----------------------------- */

function elimItems(rng: Rng, answer: string, pool: string[], noteKind: keyof typeof ELIM_NOTES): ElimItem[] {
  const decoys = pickN(rng, pool.filter((w) => squash(w) !== squash(answer)), 3).map(titleCase)
  return shuffle(rng, [answer, ...decoys]).map((name) => ({
    name,
    cleared: name !== answer,
    note:
      name !== answer
        ? pick(rng, ELIM_NOTES[noteKind]).replaceAll('{item}', name).replaceAll('{loc}', name)
        : '',
  }))
}

function buildElimination(
  rng: Rng, L: number, messageCells: number[], a: Atoms, words: string[], theme: Theme,
): EliminationPayload | null {
  if (words.length < 9) return null
  const message = fitMessage(rng, ELIM_MESSAGES, L)
  if (!message) return null

  const suspectPool = pickN(rng, FIRST_NAMES, 20)
    .map((f) => titleCase(`${f} ${pick(rng, SURNAMES)}`))
    .filter((n) => squash(n) !== squash(a.victim))
  const suspects = elimItems(rng, a.killer, suspectPool, 'suspect')
  const weapons = elimItems(rng, a.weapon, theme.weapons, 'weapon')
  const locations = elimItems(rng, a.location, theme.rooms, 'location')

  const wrong: Array<{ kind: 'suspect' | 'weapon' | 'location'; item: string; note: string }> = [
    ...suspects.filter((i) => i.cleared).map((i) => ({ kind: 'suspect' as const, item: i.name, note: i.note })),
    ...weapons.filter((i) => i.cleared).map((i) => ({ kind: 'weapon' as const, item: i.name, note: i.note })),
    ...locations.filter((i) => i.cleared).map((i) => ({ kind: 'location' as const, item: i.name, note: i.note })),
  ]

  const ordered = shuffle(rng, wrong)
  const eliminations = ordered.map((e, i) => ({ ...e, word: words[i] }))

  return { kind: 'elimination', suspects, weapons, locations, eliminations, message, messageCells }
}

/* ------------------------------ anagram -------------------------------- */

function fillTpl(words: string[], a: Atoms): string[] {
  return words.flatMap((w) => {
    if (w === '{VICTIM}') return a.victim.split(' ').map(squash)
    if (w === '{KILLER}') return a.killer.split(' ').map(squash)
    if (w === '{MOTIVE}') return [squash(a.motive)]
    return [w]
  })
}

const letterCount = (words: string[]) => words.reduce((n, w) => n + w.length, 0)

function buildAnagram(rng: Rng, L: number, messageCells: number[], a: Atoms): AnagramPayload | null {
  if (L > 60) return null // beyond our padding capacity; caller adds decoys / repacks
  for (const core of shuffle(rng, CONFESSIONS)) {
    const words = fillTpl(core, a)
    let rest = L - letterCount(words)
    if (rest < 0) continue
    const pads = shuffle(rng, CONFESSION_PADS.map((p) => fillTpl(p, a)))
    let guard = 0
    while (rest > 0 && guard++ < 60) {
      if (rest < 4) {
        words.push('XYZ'.slice(0, rest))
        rest = 0
        break
      }
      const fits = pads.filter((p) => letterCount(p) <= rest)
      if (!fits.length) break
      const p = pick(rng, fits)
      pads.splice(pads.indexOf(p), 1) // don't repeat a pad
      words.push(...p)
      rest -= letterCount(p)
    }
    if (rest !== 0) continue
    const phrase = words.join(' ')
    const squashed = phrase.replace(/ /g, '')
    // tiles = scrambled squashed; ensure not identical to fill order
    let tiles = squashed
    for (let i = 0; i < 40 && tiles === squashed; i++)
      tiles = shuffle(rng, squashed.split('')).join('')
    return { kind: 'anagram', phrase, tiles, messageCells }
  }
  return null
}

/* ------------------------------ dispatcher ------------------------------ */

export interface BuiltPayload {
  payload: Payload
  /** exact text written into leftover cells (row-major) */
  fill: string
}

export function buildPayload(
  mechanic: Mechanic, rng: Rng, L: number, messageCells: number[], a: Atoms, words: string[],
  theme: Theme,
): BuiltPayload | null {
  switch (mechanic) {
    case 'leftovers': {
      const p = buildLeftovers(rng, L, messageCells, a)
      return p && { payload: p, fill: p.message }
    }
    case 'lineup': {
      const p = buildLineup(rng, L, messageCells, a)
      return p && { payload: p, fill: p.message }
    }
    case 'elimination': {
      const p = buildElimination(rng, L, messageCells, a, words, theme)
      return p && { payload: p, fill: p.message }
    }
    case 'anagram': {
      const p = buildAnagram(rng, L, messageCells, a)
      return p && { payload: p, fill: p.tiles }
    }
    default:
      return null
  }
}
