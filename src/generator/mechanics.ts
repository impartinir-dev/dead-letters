import type { Rng } from './rng'
import { pick, pickN, shuffle, chance } from './rng'
import { fitMessage, exactFill, cleanMessage, squash } from './message'
import {
  FIRST_NAMES, SURNAMES, MOTIVES,
  TRAIT_VALUES, CLUE_TEXT, ELIM_NOTES, ELIM_MESSAGES,
  CONFESSIONS, CONFESSION_PADS,
  type TraitDim,
} from './pools'
import type {
  Mechanic, Payload, LeftoverPayload, LineupPayload,
  EliminationPayload, AnagramPayload, Suspect, ElimItem, CaseSuspect,
} from './types'
import type { Theme } from './themes'

export interface Atoms {
  victim: string
  /** the case's 4 suspects in display order; one of them is the killer */
  suspects: CaseSuspect[]
  killer: string
  /** the killer's role, e.g. "sommelier" */
  killerRole: string
  weapon: string
  location: string
  motive: string
}

export { squash }
export const titleCase = (s: string) =>
  s.toLowerCase().replace(/\b[a-z]/g, (ch) => ch.toUpperCase())

const firstName = (name: string) => name.split(' ')[0]

/**
 * Victim, 4-person cast (distinct first names and surnames, each with a theme
 * role + hook), and the killer among them. `blockedSurnames` are ones already
 * used up across the casebook. Weapon and location come only from
 * the theme's own pools.
 */
export function makeAtoms(rng: Rng, theme: Theme, blockedSurnames: ReadonlySet<string> = new Set()): Atoms {
  const firsts = pickN(rng, FIRST_NAMES, 5)
  const lasts = pickN(rng, SURNAMES.filter((s) => !blockedSurnames.has(s)), 5)
  const victim = titleCase(`${firsts[0]} ${lasts[0]}`)
  const roles = pickN(rng, theme.suspects, 4)
  const cast: CaseSuspect[] = roles.map((r, i) => ({
    name: titleCase(`${firsts[i + 1]} ${lasts[i + 1]}`),
    role: r.role,
    hook: r.hook.replaceAll('{v}', firstName(victim)),
  }))
  const killer = cast[0]
  return {
    victim,
    suspects: shuffle(rng, cast),
    killer: killer.name,
    killerRole: killer.role,
    weapon: pick(rng, theme.weapons),
    location: pick(rng, theme.rooms),
    motive: titleCase(pick(rng, MOTIVES)),
  }
}

/**
 * Squashed terms a message must not contain: every room, weapon, suspect role
 * and suspect name/surname in the case — except the ones the clue itself is
 * allowed to name (`keep`).
 */
export function forbiddenTerms(
  a: Atoms, theme: Theme, keep: { killer?: boolean; weapon?: boolean; location?: boolean } = {},
): string[] {
  const out: string[] = []
  for (const r of theme.rooms) if (!(keep.location && r === a.location)) out.push(squash(r))
  for (const w of theme.weapons) if (!(keep.weapon && w === a.weapon)) out.push(squash(w))
  for (const s of a.suspects) {
    if (keep.killer && s.name === a.killer) continue
    out.push(squash(s.role), squash(s.name), squash(s.name.split(' ').slice(1).join('')))
  }
  return out
}

/* ------------------------------ leftovers ------------------------------ */

type Blank = 'killer' | 'weapon' | 'location'

/**
 * Clue cores point at the killer by role ("THE SOMMELIER DID IT") so the
 * player has to match the clue against the cast. When none fits the grid's
 * leftover count, the case generator retries with a different layout.
 */
function leftoverCores(blanks: Blank[], a: Atoms): string[] {
  const K = `THE${squash(a.killerRole)}`
  const W = squash(a.weapon), L = squash(a.location)
  const has = (b: Blank) => blanks.includes(b)
  if (has('weapon') && has('location'))
    return [
      `${K}DIDITWITHTHE${W}INTHE${L}`,
      `${K}USEDTHE${W}INTHE${L}`,
      `INTHE${L}${K}USEDTHE${W}`,
    ]
  if (has('weapon'))
    return [
      `${K}DIDITWITHTHE${W}`,
      `${K}HIDTHE${W}`,
      `THE${W}BELONGSTO${K}`,
    ]
  if (has('location'))
    return [
      `${K}STRUCKINTHE${L}`,
      `${K}DIDITINTHE${L}`,
      `${K}WAITEDINTHE${L}`,
    ]
  return [
    `${K}DIDIT`,
    `ITWAS${K}`,
    `NEVERTRUST${K}`,
    `${K}ISLYING`,
    `ARREST${K}`,
    `FOLLOW${K}`,
  ]
}

function buildLeftovers(
  rng: Rng, L: number, messageCells: number[], a: Atoms, theme: Theme,
): LeftoverPayload | null {
  const canonical: Blank[][] = [
    ['killer', 'weapon', 'location'],
    ['killer', 'location'],
    ['killer', 'weapon'],
    ['killer'],
  ]
  const order = chance(rng, 0.55) ? canonical : shuffle(rng, canonical)
  for (const blanks of order) {
    const forbidden = forbiddenTerms(a, theme, {
      killer: true,
      weapon: blanks.includes('weapon'),
      location: blanks.includes('location'),
    })
    const fit = fitMessage(rng, leftoverCores(blanks, a), L, theme.phrases, forbidden)
    if (fit) {
      const ord: Record<Blank, number> = { killer: 0, weapon: 1, location: 2 }
      return {
        kind: 'leftovers',
        message: fit.message,
        core: fit.core,
        blanks: blanks.slice().sort((x, y) => ord[x] - ord[y]),
        messageCells,
      }
    }
  }
  return null
}

/* -------------------------------- lineup ------------------------------- */

const DIMS = Object.keys(TRAIT_VALUES) as TraitDim[]

function buildLineup(
  rng: Rng, L: number, messageCells: number[], a: Atoms, theme: Theme,
): LineupPayload | null {
  const dim = pick(rng, DIMS)
  const value = pick(rng, TRAIT_VALUES[dim])
  const clue = CLUE_TEXT[dim][value]
  const others = TRAIT_VALUES[dim].filter((v) => v !== value)
  // padding must not mention a competing trait value or anyone in the cast
  const forbidden = [...forbiddenTerms(a, theme), ...others]
  const fit = fitMessage(rng, [clue.msg], L, theme.phrases, forbidden)
  if (!fit) return null

  const randTraits = (over: Partial<Suspect['traits']>): Suspect['traits'] => ({
    hair: pick(rng, TRAIT_VALUES.hair),
    hand: pick(rng, TRAIT_VALUES.hand),
    accessory: pick(rng, TRAIT_VALUES.accessory),
    habit: pick(rng, TRAIT_VALUES.habit),
    ...over,
  })

  const suspects: Suspect[] = a.suspects.map((s) => ({
    name: s.name,
    traits: randTraits({ [dim]: s.name === a.killer ? value : pick(rng, others) }),
  }))

  // ensure no two suspects share an identical trait sheet (never touch clueDim)
  for (let i = 0; i < suspects.length; i++) {
    let guard = 0
    while (guard++ < 25) {
      const rest = new Set(
        suspects.filter((_, j) => j !== i).map((s) => JSON.stringify(s.traits)),
      )
      if (!rest.has(JSON.stringify(suspects[i].traits))) break
      for (const d of DIMS)
        if (d !== dim) suspects[i].traits[d] = pick(rng, TRAIT_VALUES[d])
    }
  }

  return {
    kind: 'lineup',
    message: fit.message,
    clueText: clue.readable,
    clueDim: dim,
    clueValue: value,
    suspects,
    messageCells,
  }
}

/* ----------------------------- elimination ----------------------------- */

function elimItems(rng: Rng, answer: string, pool: string[], noteKind: keyof typeof ELIM_NOTES): ElimItem[] {
  const decoys = pickN(rng, pool.filter((w) => squash(w) !== squash(answer)), 3)
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
  const fit = fitMessage(rng, ELIM_MESSAGES, L, theme.phrases, forbiddenTerms(a, theme))
  if (!fit) return null

  const suspects = elimItems(rng, a.killer, a.suspects.map((s) => s.name), 'suspect')
  const weapons = elimItems(rng, a.weapon, theme.weapons, 'weapon')
  const locations = elimItems(rng, a.location, theme.rooms, 'location')

  const wrong: Array<{ kind: 'suspect' | 'weapon' | 'location'; item: string; note: string }> = [
    ...suspects.filter((i) => i.cleared).map((i) => ({ kind: 'suspect' as const, item: i.name, note: i.note })),
    ...weapons.filter((i) => i.cleared).map((i) => ({ kind: 'weapon' as const, item: i.name, note: i.note })),
    ...locations.filter((i) => i.cleared).map((i) => ({ kind: 'location' as const, item: i.name, note: i.note })),
  ]

  const ordered = shuffle(rng, wrong)
  const eliminations = ordered.map((e, i) => ({ ...e, word: words[i] }))

  return {
    kind: 'elimination', suspects, weapons, locations, eliminations,
    message: fit.message, messageCells,
  }
}

/* ------------------------------ anagram -------------------------------- */

const toWords = (s: string) => s.toUpperCase().split(' ').map(squash).filter(Boolean)

function fillTpl(tpl: string[], a: Atoms): string[] {
  return tpl.flatMap((w) => {
    if (w === '{KILLER}') return toWords(a.killer)
    if (w === '{ROLE}') return toWords(a.killerRole)
    if (w === '{VICTIMFIRST}') return toWords(firstName(a.victim))
    if (w === '{WEAPON}') return toWords(a.weapon)
    if (w === '{LOCATION}') return toWords(a.location)
    return [w]
  })
}

const letterCount = (ws: string[]) => ws.reduce((n, w) => n + w.length, 0)

function buildAnagram(
  rng: Rng, L: number, messageCells: number[], a: Atoms, theme: Theme,
): AnagramPayload | null {
  if (L > 60) return null // beyond our padding capacity; caller adds decoys / repacks
  const forbidden = forbiddenTerms(a, theme, { killer: true, weapon: true, location: true })
  for (const core of shuffle(rng, CONFESSIONS)) {
    const coreWords = fillTpl(core, a)
    const rest = L - letterCount(coreWords)
    if (rest < 0) continue
    const pads = [
      ...shuffle(rng, theme.phrases.map(toWords)),
      ...shuffle(rng, CONFESSION_PADS.map((p) => fillTpl(p, a))),
    ].filter((p) => cleanMessage(p.join(''), forbidden))
    const fill = exactFill(rest, pads, letterCount)
    if (!fill) continue
    const phrase = [...coreWords, ...fill.flat()].join(' ')
    const squashed = phrase.replace(/ /g, '')
    if (!cleanMessage(squashed, forbidden)) continue
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
      const p = buildLeftovers(rng, L, messageCells, a, theme)
      return p && { payload: p, fill: p.message }
    }
    case 'lineup': {
      const p = buildLineup(rng, L, messageCells, a, theme)
      return p && { payload: p, fill: p.message }
    }
    case 'elimination': {
      const p = buildElimination(rng, L, messageCells, a, words, theme)
      return p && { payload: p, fill: p.message }
    }
    case 'anagram': {
      const p = buildAnagram(rng, L, messageCells, a, theme)
      return p && { payload: p, fill: p.tiles }
    }
    default:
      return null
  }
}
