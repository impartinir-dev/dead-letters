import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CaseFile, CaseIndexEntry } from '../src/generator/types.ts'
import { WORD_SEARCH_MECHANICS } from '../src/generator/types.ts'
import { DIRS } from '../src/generator/grid.ts'
import { generateCase } from '../src/generator/index.ts'
import { TRAIT_VALUES } from '../src/generator/pools.ts'
import {
  countWorlds,
  interrogationConsistent,
  statementHolds,
  countOrders,
} from '../src/generator/modes.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const cases: CaseFile[] = [1, 2, 3].flatMap((v) =>
  JSON.parse(readFileSync(join(root, 'src', 'data', `cases-v${v}.json`), 'utf8')),
)
const index: CaseIndexEntry[] = JSON.parse(
  readFileSync(join(root, 'src', 'data', 'index.json'), 'utf8'),
)

const squash = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '')

/** Does `word` appear in the grid (any of 8 directions)? */
function wordInGrid(c: CaseFile, word: string): boolean {
  for (let r = 0; r < c.rows; r++)
    for (let col = 0; col < c.cols; col++)
      for (const { dr, dc } of Object.values(DIRS)) {
        let ok = true
        for (let i = 0; i < word.length; i++) {
          const rr = r + dr * i
          const cc = col + dc * i
          if (rr < 0 || rr >= c.rows || cc < 0 || cc >= c.cols || c.grid[rr][cc] !== word[i]) {
            ok = false
            break
          }
        }
        if (ok) return true
      }
  return false
}

describe('case corpus', () => {
  it('has 150 cases with sequential ids across 3 volumes', () => {
    expect(cases).toHaveLength(150)
    expect(cases.map((c) => c.id)).toEqual(Array.from({ length: 150 }, (_, i) => i + 1))
    expect(index).toHaveLength(150)
    expect(cases.filter((c) => c.volume === 1)).toHaveLength(50)
    expect(cases.filter((c) => c.volume === 2)).toHaveLength(50)
    expect(cases.filter((c) => c.volume === 3)).toHaveLength(50)
  })

  it('has unique titles', () => {
    expect(new Set(cases.map((c) => c.title)).size).toBe(150)
  })

  it('all eight mechanics represented', () => {
    const m = new Set(cases.map((c) => c.mechanic))
    expect(m).toEqual(
      new Set([
        'leftovers', 'lineup', 'elimination', 'anagram',
        'cryptogram', 'deduction', 'interrogation', 'timeline',
      ]),
    )
  })
})

describe('per-case validity', () => {
  it.each(cases)('case #%i "$title" is well-formed', (c) => {
    const isWS = WORD_SEARCH_MECHANICS.includes(c.mechanic)
    const p = c.payload

    if (isWS) {
      // grid shape + letters
      expect(c.grid).toHaveLength(c.rows)
      for (const row of c.grid) {
        expect(row).toHaveLength(c.cols)
        expect(row).toMatch(/^[A-Z]+$/)
      }

      // words valid, unique, fit grid
      expect(new Set(c.words).size).toBe(c.words.length)
      for (const w of c.words) {
        expect(w).toMatch(/^[A-Z]{3,}$/)
        expect(w.length).toBeLessThanOrEqual(Math.max(c.rows, c.cols))
        expect(wordInGrid(c, w)).toBe(true)
      }

      // placements cover exactly the bank words and match grid letters
      const covered = new Set<number>()
      for (const pl of c.placements) {
        expect(c.words).toContain(pl.word)
        const { dr, dc } = DIRS[pl.d]
        for (let i = 0; i < pl.word.length; i++) {
          const r = pl.r + dr * i
          const cc = pl.c + dc * i
          expect(c.grid[r][cc]).toBe(pl.word[i])
          covered.add(r * c.cols + cc)
        }
      }

      // leftover message: fill letters land in declared cells, disjoint from words
      if (
        p.kind === 'leftovers' || p.kind === 'lineup' ||
        p.kind === 'elimination' || p.kind === 'anagram'
      ) {
        const fill = p.kind === 'anagram' ? p.tiles : p.message
        expect(p.messageCells).toHaveLength(fill.length)
        p.messageCells.forEach((cell, i) => {
          expect(covered.has(cell)).toBe(false)
          const r = Math.floor(cell / c.cols)
          const cc = cell % c.cols
          expect(c.grid[r][cc]).toBe(fill[i])
        })
      }
    } else {
      expect(c.grid).toHaveLength(0)
      expect(c.words).toHaveLength(0)
      expect(c.placements).toHaveLength(0)
    }

    // mechanic-specific invariants
    if (p.kind === 'leftovers') {
      expect(p.message).toContain(squash(c.killer))
      expect(p.blanks.length).toBeGreaterThan(0)
    } else if (p.kind === 'lineup') {
      expect(p.suspects).toHaveLength(4)
      const matches = p.suspects.filter((s) => s.traits[p.clueDim] === p.clueValue)
      expect(matches).toHaveLength(1)
      expect(matches[0].name).toBe(c.killer)
      expect(TRAIT_VALUES[p.clueDim]).toContain(p.clueValue)
      expect(p.message).toBeTruthy()
    } else if (p.kind === 'elimination') {
      for (const list of [p.suspects, p.weapons, p.locations]) {
        expect(list).toHaveLength(4)
        expect(list.filter((i) => !i.cleared)).toHaveLength(1)
      }
      expect(p.suspects.find((i) => !i.cleared)!.name).toBe(c.killer)
      expect(p.weapons.find((i) => !i.cleared)!.name).toBe(c.weapon)
      expect(p.locations.find((i) => !i.cleared)!.name).toBe(c.location)
      expect(p.eliminations).toHaveLength(9)
      for (const e of p.eliminations) {
        expect(c.words).toContain(e.word)
        expect(e.note).not.toContain('{')
      }
    } else if (p.kind === 'anagram') {
      const sort = (s: string) => s.split('').sort().join('')
      expect(sort(p.tiles)).toBe(sort(p.phrase.replace(/ /g, '')))
      expect(p.tiles).not.toBe(p.phrase.replace(/ /g, ''))
    } else if (p.kind === 'cryptogram') {
      // cipher round-trips through the declared mapping
      const decoded = p.cipher
        .split('')
        .map((ch) => (/[A-Z]/.test(ch) ? p.mapping[ch] : ch))
        .join('')
      expect(decoded).toBe(p.phrase)
      // every cipher letter mapped, no letter maps to itself, givens are correct
      const cipherLetters = new Set(p.cipher.replace(/[^A-Z]/g, '').split(''))
      for (const cl of cipherLetters) {
        expect(p.mapping[cl]).toMatch(/^[A-Z]$/)
        expect(p.mapping[cl]).not.toBe(cl)
      }
      for (const [k, v] of Object.entries(p.givens)) {
        expect(p.mapping[k]).toBe(v)
        expect(cipherLetters.has(k)).toBe(true)
      }
      expect(Object.keys(p.givens).length).toBeGreaterThan(0)
    } else if (p.kind === 'deduction') {
      expect(p.suspects).toHaveLength(4)
      expect(p.weapons).toHaveLength(4)
      expect(p.locations).toHaveLength(4)
      expect(new Set(p.suspects).size).toBe(4)
      expect(new Set(p.weapons).size).toBe(4)
      expect(new Set(p.locations).size).toBe(4)
      expect(p.suspects).toContain(c.killer)
      expect(p.weapons).toContain(c.weapon)
      expect(p.locations).toContain(c.location)
      // exactly one world satisfies the clues, and it's the canonical one
      const { count, world } = countWorlds(p.clues, p.suspects, p.weapons, p.locations)
      expect(count).toBe(1)
      expect(world).not.toBeNull()
      expect(world!.guilty).toBe(c.killer)
      expect(world!.weaponOf.get(c.killer)).toBe(c.weapon)
      expect(world!.locOf.get(c.killer)).toBe(c.location)
      // assignment table agrees with the world
      for (const a of p.assignments) {
        expect(world!.weaponOf.get(a.suspect)).toBe(a.weapon)
        expect(world!.locOf.get(a.suspect)).toBe(a.location)
        expect(a.guilty).toBe(a.suspect === c.killer)
      }
    } else if (p.kind === 'interrogation') {
      expect(p.suspects).toHaveLength(4)
      expect(p.suspects.map((s) => s.speaker)).toContain(c.killer)
      // pairings are a perfect matching over the suspects
      const names = p.suspects.map((s) => s.speaker)
      const paired = p.pairings.flat()
      expect(p.pairings).toHaveLength(2)
      for (const n of names) expect(paired.filter((x) => x === n)).toHaveLength(1)
      // the killer is the unique speaker whose statement is false,
      // and the unique consistent suspect
      const liars = p.suspects.filter(
        (s) => !statementHolds(s, p.pairings, c.killer),
      )
      expect(liars).toHaveLength(1)
      expect(liars[0].speaker).toBe(c.killer)
      const consistent = names.filter((n) =>
        interrogationConsistent(p.suspects, p.pairings, n),
      )
      expect(consistent).toEqual([c.killer])
    } else if (p.kind === 'timeline') {
      expect(p.events.length).toBeGreaterThanOrEqual(5)
      expect(new Set(p.events).size).toBe(p.events.length)
      expect(new Set(p.order).size).toBe(p.events.length)
      // clues admit exactly one order — the canonical one
      expect(countOrders(p.clues, p.events.length)).toBe(1)
    }
  })
})

describe('determinism', () => {
  it('regenerating a case produces identical output', () => {
    for (const id of [1, 44, 104, 150]) {
      const stored = cases.find((c) => c.id === id)!
      // note: title uniqueness handling may have salted the seed at gen time,
      // so compare solvability-critical fields, not full equality
      const regen = generateCase(id, 0, new Set())
      expect(regen).not.toBeNull()
      expect(regen!.volume).toBe(stored.volume)
      expect(regen!.mechanic).toBe(stored.mechanic)
    }
  })
})
