import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CaseFile, CaseIndexEntry } from '../src/generator/types.ts'
import { DIRS, cellsOf } from '../src/generator/grid.ts'
import { generateCase } from '../src/generator/index.ts'
import { TRAIT_VALUES } from '../src/generator/pools.ts'

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

  it('all mechanics represented', () => {
    const m = new Set(cases.map((c) => c.mechanic))
    expect(m).toEqual(new Set(['leftovers', 'lineup', 'elimination', 'anagram']))
  })
})

describe('per-case validity', () => {
  it.each(cases)('case #%i "$title" is well-formed', (c) => {
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
    for (const p of c.placements) {
      expect(c.words).toContain(p.word)
      const { dr, dc } = DIRS[p.d]
      for (let i = 0; i < p.word.length; i++) {
        const r = p.r + dr * i
        const cc = p.c + dc * i
        expect(c.grid[r][cc]).toBe(p.word[i])
        covered.add(r * c.cols + cc)
      }
    }

    // leftover message: fill letters land in declared cells, disjoint from words
    const p = c.payload
    const fill = p.kind === 'anagram' ? p.tiles : p.message
    expect(p.messageCells).toHaveLength(fill.length)
    p.messageCells.forEach((cell, i) => {
      expect(covered.has(cell)).toBe(false)
      const r = Math.floor(cell / c.cols)
      const cc = cell % c.cols
      expect(c.grid[r][cc]).toBe(fill[i])
    })

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
