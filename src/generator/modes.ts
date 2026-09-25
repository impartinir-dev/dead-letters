/**
 * Builders for the non-word-search mechanics: cryptogram, deduction,
 * interrogation, timeline. Each exports its builder plus the evaluator the
 * test-suite uses to prove unique solvability.
 */
import type { Rng } from './rng'
import { pick, pickN, shuffle, int } from './rng'
import type { Atoms } from './mechanics'
import { squash, titleCase } from './mechanics'
import {
  FIRST_NAMES, SURNAMES, WEAPONS, LOCATIONS,
  CIPHER_PHRASES, TIMELINE_EVENTS,
} from './pools'
import type {
  CryptogramPayload, DeductionClue, DeductionPayload,
  InterrogationPayload, Statement, TimeClue, TimelinePayload,
} from './types'

const low = (s: string) => s.toLowerCase()

/* ================================ CIPHER ================================ */

function fillAtoms(tpl: string, a: Atoms): string {
  return tpl
    .replaceAll('{WEAPON}', squash(a.weapon))
    .replaceAll('{LOCATION}', squash(a.location))
    .replaceAll('{KILLER}', squash(a.killer))
    .replaceAll('{VICTIM}', squash(a.victim))
    .replaceAll('{MOTIVE}', squash(a.motive))
}

export function buildCryptogram(rng: Rng, a: Atoms, vol: number): CryptogramPayload | null {
  const phrase = fillAtoms(pick(rng, CIPHER_PHRASES), a)
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const used = new Set(phrase.replace(/[^A-Z]/g, '').split(''))

  // random substitution; no used letter may map to itself (cryptoquip rule)
  const perm = shuffle(rng, letters.split(''))
  for (const ch of used) {
    const i = letters.indexOf(ch)
    if (perm[i] === ch) {
      const j = (i + 1 + int(rng, 0, 24)) % 26
      ;[perm[i], perm[j]] = [perm[j], perm[i]]
      if (perm[i] === ch) return null // astronomically rare; caller retries
    }
  }
  const enc = Object.fromEntries(letters.split('').map((ch, i) => [ch, perm[i]]))
  const cipher = phrase
    .split('')
    .map((ch) => (/[A-Z]/.test(ch) ? enc[ch] : ch))
    .join('')

  const cipherLetters = [...new Set(cipher.replace(/[^A-Z]/g, '').split(''))]
  const mapping: Record<string, string> = {}
  for (const cl of cipherLetters) {
    const plain = letters[perm.indexOf(cl)]
    mapping[cl] = plain
  }
  const nGivens = vol === 1 ? 5 : vol === 2 ? 3 : 2
  const givens: Record<string, string> = {}
  for (const cl of pickN(rng, cipherLetters, Math.min(nGivens, cipherLetters.length)))
    givens[cl] = mapping[cl]

  return { kind: 'cryptogram', phrase, cipher, givens, mapping }
}

/* =============================== DEDUCTION ============================== */

export interface World {
  weaponOf: Map<string, string>
  locOf: Map<string, string>
  guilty: string
}

function locOwner(l: string, w: World): string | undefined {
  for (const [s, loc] of w.locOf) if (loc === l) return s
  return undefined
}

export function clueHolds(clue: DeductionClue, w: World): boolean {
  switch (clue.kind) {
    case 'has-weapon': return w.weaponOf.get(clue.a) === clue.b
    case 'not-weapon': return w.weaponOf.get(clue.a) !== clue.b
    case 'at-location': return w.locOf.get(clue.a) === clue.b
    case 'not-location': return w.locOf.get(clue.a) !== clue.b
    case 'killer-weapon': return w.weaponOf.get(w.guilty) === clue.a
    case 'killer-not-weapon': return w.weaponOf.get(w.guilty) !== clue.a
    case 'killer-location': return w.locOf.get(w.guilty) === clue.a
    case 'killer-not-location': return w.locOf.get(w.guilty) !== clue.a
    case 'loc-weapon': { const o = locOwner(clue.a, w); return o !== undefined && w.weaponOf.get(o) === clue.b }
    case 'loc-not-weapon': { const o = locOwner(clue.a, w); return o !== undefined && w.weaponOf.get(o) !== clue.b }
    case 'innocent': return w.guilty !== clue.a
  }
}

function perms<T>(arr: T[]): T[][] {
  if (arr.length <= 1) return [arr.slice()]
  const out: T[][] = []
  for (let i = 0; i < arr.length; i++) {
    const rest = arr.slice(0, i).concat(arr.slice(i + 1))
    for (const p of perms(rest)) out.push([arr[i], ...p])
  }
  return out
}

/** Count worlds consistent with `clues`; returns the single world when unique. */
export function countWorlds(
  clues: DeductionClue[], suspects: string[], weapons: string[], locations: string[],
): { count: number; world: World | null } {
  const wperms = perms(weapons)
  const lperms = perms(locations)
  let count = 0
  let last: World | null = null
  for (const wp of wperms) {
    const weaponOf = new Map(suspects.map((s, i) => [s, wp[i]]))
    for (const lp of lperms) {
      const locOf = new Map(suspects.map((s, i) => [s, lp[i]]))
      for (const g of suspects) {
        const w: World = { weaponOf, locOf, guilty: g }
        if (clues.every((c) => clueHolds(c, w))) {
          count++
          last = w
        }
      }
    }
  }
  return { count, world: count === 1 ? last : null }
}

const clueText = (kind: DeductionClue['kind'], a: string, b?: string): string => {
  const A = a, B = b ? low(b) : ''
  const al = low(a)
  switch (kind) {
    case 'has-weapon': return `${A} had the ${B}.`
    case 'not-weapon': return `${A} did not have the ${B}.`
    case 'at-location': return `${A} was at the ${B}.`
    case 'not-location': return `${A} was not at the ${B}.`
    case 'killer-weapon': return `The killer had the ${al}.`
    case 'killer-not-weapon': return `The killer did not have the ${al}.`
    case 'killer-location': return `The killer was at the ${al}.`
    case 'killer-not-location': return `The killer was not at the ${al}.`
    case 'loc-weapon': return `The person at the ${al} had the ${B}.`
    case 'loc-not-weapon': return `The person at the ${al} did not have the ${B}.`
    case 'innocent': return `${A} is innocent.`
  }
}

export function buildDeduction(rng: Rng, a: Atoms): DeductionPayload | null {
  const suspects = shuffle(rng, [
    a.killer,
    ...pickN(
      rng,
      FIRST_NAMES.filter(
        (f) => f !== a.killer.split(' ')[0] && f !== a.victim.split(' ')[0],
      ),
      3,
    ).map((f) => titleCase(`${f} ${pick(rng, SURNAMES)}`)),
  ])
  const weapons = shuffle(rng, [a.weapon, ...pickN(rng, WEAPONS.filter((w) => w !== a.weapon.toUpperCase()), 3).map(titleCase)])
  const locations = shuffle(rng, [a.location, ...pickN(rng, LOCATIONS.filter((l) => l !== a.location.toUpperCase()), 3).map(titleCase)])

  // world: killer keeps the case's weapon/location; the rest permute
  const otherWeapons = shuffle(rng, weapons.filter((w) => w !== a.weapon))
  const otherLocs = shuffle(rng, locations.filter((l) => l !== a.location))
  const weaponOf = new Map<string, string>([[a.killer, a.weapon]])
  const locOf = new Map<string, string>([[a.killer, a.location]])
  const rest = suspects.filter((s) => s !== a.killer)
  rest.forEach((s, i) => {
    weaponOf.set(s, otherWeapons[i])
    locOf.set(s, otherLocs[i])
  })

  // candidate clue pool: every fact that is TRUE in this world
  const pool: DeductionClue[] = []
  for (const s of suspects) {
    for (const w of weapons) {
      pool.push({ text: '', kind: weaponOf.get(s) === w ? 'has-weapon' : 'not-weapon', a: s, b: w })
    }
    for (const l of locations) {
      pool.push({ text: '', kind: locOf.get(s) === l ? 'at-location' : 'not-location', a: s, b: l })
    }
    if (s !== a.killer) pool.push({ text: '', kind: 'innocent', a: s })
  }
  for (const w of weapons)
    pool.push({
      text: '',
      kind: weaponOf.get(a.killer) === w ? 'killer-weapon' : 'killer-not-weapon',
      a: w,
    })
  for (const l of locations)
    pool.push({
      text: '',
      kind: locOf.get(a.killer) === l ? 'killer-location' : 'killer-not-location',
      a: l,
    })
  for (const l of locations) {
    const owner = suspects.find((s) => locOf.get(s) === l)!
    for (const w of weapons)
      pool.push({
        text: '',
        kind: weaponOf.get(owner) === w ? 'loc-weapon' : 'loc-not-weapon',
        a: l,
        b: w,
      })
  }

  // greedily add clues that shrink the consistent-world count
  let remaining = countWorlds([], suspects, weapons, locations).count
  const clues: DeductionClue[] = []
  const usedKinds = new Set<string>()
  for (const c of shuffle(rng, pool)) {
    if (clues.length >= 9 || remaining === 1) break
    // prefer clue variety
    if (usedKinds.has(c.kind) && rng() < 0.6) continue
    const n = countWorlds([...clues, c], suspects, weapons, locations).count
    if (n > 0 && n < remaining) {
      clues.push(c)
      usedKinds.add(c.kind)
      remaining = n
    }
  }
  if (remaining !== 1) return null

  for (const c of clues) c.text = clueText(c.kind, c.a, c.b)
  const assignments = suspects.map((s) => ({
    suspect: s,
    weapon: weaponOf.get(s)!,
    location: locOf.get(s)!,
    guilty: s === a.killer,
  }))
  return { kind: 'deduction', suspects, weapons, locations, clues, assignments }
}

/* ============================= INTERROGATION ============================ */

export function pairOf(s: string, pairings: [string, string][]): string | null {
  for (const [a, b] of pairings) {
    if (a === s) return b
    if (b === s) return a
  }
  return null
}

export function statementHolds(st: Statement, pairings: [string, string][], killer: string): boolean {
  switch (st.kind) {
    case 'innocent-self': return st.speaker !== killer
    case 'guilty-other': return st.x === killer
    case 'innocent-other': return st.x !== killer
    case 'with-other': return pairOf(st.speaker, pairings) === st.x
    case 'other-alone': return pairOf(st.speaker, pairings) !== st.x
  }
}

/** A candidate killer is consistent iff only their statement is false. */
export function interrogationConsistent(
  stmts: Statement[], pairings: [string, string][], candidate: string,
): boolean {
  return stmts.every((s) => statementHolds(s, pairings, candidate) === (s.speaker !== candidate))
}

const STMT_TEXT: Record<Statement['kind'], (s: string, x?: string) => string> = {
  'innocent-self': () => 'I am innocent.',
  'guilty-other': (_s, x) => `${x} did it.`,
  'innocent-other': (_s, x) => `${x} is innocent.`,
  'with-other': (_s, x) => `I was with ${x} all night.`,
  'other-alone': (_s, x) => `I never saw ${x} that evening.`,
}

export function buildInterrogation(rng: Rng, a: Atoms): InterrogationPayload | null {
  const others = pickN(
    rng,
    FIRST_NAMES.filter((f) => f !== a.killer.split(' ')[0] && f !== a.victim.split(' ')[0]),
    3,
  ).map((f) => titleCase(`${f} ${pick(rng, SURNAMES)}`))
  const names = shuffle(rng, [a.killer, ...others])

  // random perfect matching over the 4 suspects
  const s = shuffle(rng, names)
  const pairings: [string, string][] = [
    [s[0], s[1]],
    [s[2], s[3]],
  ]

  const kinds: Statement['kind'][] = [
    'innocent-self', 'guilty-other', 'innocent-other', 'with-other', 'other-alone',
  ]
  // the killer's lie lands on identity claims when possible — harder to spot
  const killerKinds: Statement['kind'][] = ['innocent-self', 'guilty-other']

  for (let attempt = 0; attempt < 250; attempt++) {
    const stmts: (Statement | null)[] = names.map((speaker) => {
      const role = speaker === a.killer ? 'killer' : 'truth'
      const kindOrder =
        role === 'killer' && rng() < 0.8 ? [...shuffle(rng, killerKinds), ...kinds] : shuffle(rng, kinds)
      for (let t = 0; t < 40; t++) {
        const kind = kindOrder[t % kindOrder.length]
        const x = pick(rng, names.filter((n) => n !== speaker))
        const st: Statement = { speaker, text: '', kind, x }
        const truth = statementHolds(st, pairings, a.killer)
        if (truth === (speaker !== a.killer)) {
          st.text = STMT_TEXT[kind](speaker, x)
          return st
        }
      }
      return null
    })
    if (stmts.some((x) => !x)) continue
    const consistent = names.filter((n) => interrogationConsistent(stmts as Statement[], pairings, n))
    if (consistent.length === 1 && consistent[0] === a.killer) {
      return { kind: 'interrogation', suspects: stmts as Statement[], pairings }
    }
  }
  return null
}

/* ================================ TIMELINE ============================== */

export function clueHoldsOrder(clue: TimeClue, order: number[]): boolean {
  const pos = new Map(order.map((e, i) => [e, i]))
  const [a, b, c] = clue.ids.map((i) => pos.get(i)!)
  switch (clue.kind) {
    case 'before': return a < b
    case 'after': return a > b
    case 'first': return a === 0
    case 'last': return a === order.length - 1
    case 'immediately-after': return a === b + 1
    case 'between': return b < a && a < c
  }
}

export function countOrders(clues: TimeClue[], n: number): number {
  const idx = Array.from({ length: n }, (_, i) => i)
  let count = 0
  for (const p of perms(idx)) if (clues.every((c) => clueHoldsOrder(c, p))) count++
  return count
}

const TIME_TEXT: Record<TimeClue['kind'], (ev: string[], ids: number[]) => string> = {
  before: (ev, [a, b]) => `Witnesses agree: “${ev[a]}” came before “${ev[b]}”.`,
  after: (ev, [a, b]) => `Witnesses agree: “${ev[a]}” came after “${ev[b]}”.`,
  first: (ev, [a]) => `Everyone says “${ev[a]}” happened first.`,
  last: (ev, [a]) => `Everyone says “${ev[a]}” happened last.`,
  'immediately-after': (ev, [a, b]) => `“${ev[a]}” happened right after “${ev[b]}”.`,
  between: (ev, [a, b, c]) => `“${ev[a]}” came after “${ev[b]}”, but before “${ev[c]}”.`,
}

export function buildTimeline(rng: Rng, _a: Atoms, vol: number): TimelinePayload | null {
  const n = vol === 3 ? 6 : 5
  const chosen = pickN(rng, TIMELINE_EVENTS, n)
  // display order = shuffled; chronological order = the permutation `order`
  const order = shuffle(rng, Array.from({ length: n }, (_, i) => i))
  if (order.every((v, i) => v === i)) order.reverse() // don't display pre-solved

  // candidate true facts under `order`
  const pool: TimeClue[] = []
  const pairs: [number, number][] = []
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (i !== j) pairs.push([i, j])
  for (const [i, j] of pairs) {
    pool.push({ text: '', kind: 'before', ids: [i, j] })
    pool.push({ text: '', kind: 'after', ids: [i, j] })
    pool.push({ text: '', kind: 'immediately-after', ids: [i, j] })
  }
  for (let i = 0; i < n; i++) {
    pool.push({ text: '', kind: 'first', ids: [i] })
    pool.push({ text: '', kind: 'last', ids: [i] })
  }
  for (let i = 0; i < n; i++)
    for (const [j, k] of pairs)
      pool.push({ text: '', kind: 'between', ids: [i, j, k] })

  const truePool = pool.filter((c) => clueHoldsOrder(c, order))
  let remaining = countOrders([], n)
  const clues: TimeClue[] = []
  for (const c of shuffle(rng, truePool)) {
    if (clues.length >= 8 || remaining === 1) break
    const m = countOrders([...clues, c], n)
    if (m > 0 && m < remaining) {
      clues.push(c)
      remaining = m
    }
  }
  if (remaining !== 1) return null
  for (const c of clues) {
    const t = TIME_TEXT[c.kind](chosen, c.ids)
    c.text = t[0].toUpperCase() + t.slice(1)
  }
  return { kind: 'timeline', events: chosen, order, clues }
}

/* ------------------------------ dispatcher ----------------------------- */

export function buildMode(
  mechanic: string, rng: Rng, a: Atoms, vol: number,
): CryptogramPayload | DeductionPayload | InterrogationPayload | TimelinePayload | null {
  switch (mechanic) {
    case 'cryptogram': return buildCryptogram(rng, a, vol)
    case 'deduction': return buildDeduction(rng, a)
    case 'interrogation': return buildInterrogation(rng, a)
    case 'timeline': return buildTimeline(rng, a, vol)
    default: return null
  }
}
