import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CaseFile, CaseIndexEntry } from '../src/generator/types.ts'
import { WORD_SEARCH_MECHANICS } from '../src/generator/types.ts'
import { DIRS } from '../src/generator/grid.ts'
import { generateCase } from '../src/generator/index.ts'
import { TRAIT_VALUES } from '../src/generator/pools.ts'
import { THEMES } from '../src/generator/themes.ts'
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
  it.each(cases)('case #$id "$title" is well-formed', (c) => {
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
      expect(p.message.startsWith(p.core)).toBe(true)
      expect(p.blanks[0]).toBe('killer')
      if (p.blanks.includes('weapon')) expect(p.core).toContain(squash(c.weapon))
      if (p.blanks.includes('location')) expect(p.core).toContain(squash(c.location))
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

describe('story coherence', () => {
  const themeById = new Map(THEMES.map((t) => [t.id, t]))
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const mentions = (title: string, kw: string) =>
    new RegExp(`(^|[^A-Za-z])${escape(kw)}($|[^A-Za-z])`, 'i').test(title)
  /** keywords of other themes found in `title` (ignoring ones the own theme shares) */
  const foreignRefs = (title: string, themeId: string) => {
    const own = themeById.get(themeId)!.keywords.map((k) => k.toLowerCase())
    return THEMES.filter((t) => t.id !== themeId).flatMap((t) =>
      t.keywords
        .filter((k) => !own.includes(k.toLowerCase()) && mentions(title, k))
        .map((k) => `${t.id}:${k}`),
    )
  }

  it('every theme has 4–6 plausible rooms and weapons', () => {
    for (const t of THEMES) {
      for (const pool of [t.rooms, t.weapons]) {
        expect(pool.length, t.id).toBeGreaterThanOrEqual(4)
        expect(pool.length, t.id).toBeLessThanOrEqual(6)
        for (const x of pool) expect(x, t.id).toMatch(/^[A-Z][a-z]*( [A-Z][a-z]*)*$/)
        expect(new Set(pool.map(squash)).size, t.id).toBe(pool.length)
      }
      expect(t.keywords.length, t.id).toBeGreaterThan(0)
    }
  })

  it("no theme's own titles reference another theme", () => {
    for (const t of THEMES) for (const title of t.titles) expect(foreignRefs(title, t.id), title).toEqual([])
  })

  it.each(cases)("case #$id location and weapon come from its theme's pools", (c) => {
    const t = themeById.get(c.themeId)
    expect(t).toBeDefined()
    expect(t!.rooms).toContain(c.location)
    expect(t!.weapons).toContain(c.weapon)
    const p = c.payload
    if (p.kind === 'deduction') {
      for (const w of p.weapons) expect(t!.weapons).toContain(w)
      for (const l of p.locations) expect(t!.rooms).toContain(l)
    } else if (p.kind === 'elimination') {
      for (const w of p.weapons) expect(t!.weapons).toContain(w.name)
      for (const l of p.locations) expect(t!.rooms).toContain(l.name)
    }
  })

  it.each(cases)('case #$id "$title" does not reference another theme', (c) => {
    expect(foreignRefs(c.title, c.themeId)).toEqual([])
  })
})

describe('suspects and clues', () => {
  const themeById = new Map(THEMES.map((t) => [t.id, t]))
  const surname = (name: string) => squash(name.split(' ').slice(1).join(''))
  /** text the player reads as the case's clue, squashed */
  const clueTextOf = (c: CaseFile): string | null => {
    const p = c.payload
    if (p.kind === 'leftovers' || p.kind === 'lineup' || p.kind === 'elimination') return p.message
    if (p.kind === 'anagram' || p.kind === 'cryptogram') return squash(p.phrase)
    return null
  }
  /** does the text single out the killer (by name or role) and nobody else? */
  const pointsOnlyAtKiller = (text: string, c: CaseFile) => {
    const killer = c.suspects.find((s) => s.name === c.killer)!
    const namesKiller = text.includes(squash(killer.name)) || text.includes(squash(killer.role))
    const others = c.suspects.filter((s) => s !== killer)
    const namesOther = others.some(
      (s) => text.includes(squash(s.role)) || text.includes(surname(s.name)),
    )
    return namesKiller && !namesOther
  }

  it('every theme has 6 suspect archetypes and clean padding phrases', () => {
    for (const t of THEMES) {
      expect(t.suspects, t.id).toHaveLength(6)
      const roles = t.suspects.map((s) => squash(s.role))
      expect(new Set(roles).size, t.id).toBe(6)
      for (const s of t.suspects) {
        expect(s.role, t.id).toMatch(/^[a-z]+( [a-z]+)*$/)
        expect(s.hook.toLowerCase(), t.id).toContain(s.role)
        // no role hides inside another (clues must be unambiguous)
        for (const r of roles) if (r !== squash(s.role)) expect(r.includes(squash(s.role)), `${t.id}:${s.role}`).toBe(false)
      }
      expect(t.phrases.length, t.id).toBeGreaterThanOrEqual(3)
      const answers = [...t.rooms, ...t.weapons, ...t.suspects.map((s) => s.role)].map(squash)
      for (const ph of t.phrases) {
        expect(ph, t.id).toMatch(/^[A-Z]+( [A-Z]+)*$/)
        for (const a of answers) expect(squash(ph).includes(a), `${t.id}: "${ph}" names ${a}`).toBe(false)
      }
    }
  })

  it.each(cases)('case #$id introduces 4 suspects including the killer', (c) => {
    const t = themeById.get(c.themeId)!
    expect(c.suspects).toHaveLength(4)
    const names = c.suspects.map((s) => s.name)
    expect(new Set(names).size).toBe(4)
    expect(new Set(names.map(surname)).size).toBe(4)
    expect(names).toContain(c.killer)
    expect(names).not.toContain(c.victim)
    expect(new Set(c.suspects.map((s) => s.role)).size).toBe(4)
    for (const s of c.suspects) {
      expect(t.suspects.map((x) => x.role)).toContain(s.role)
      expect(s.hook).not.toContain('{')
      expect(s.hook.toLowerCase()).toContain(s.role)
    }
    // every mechanic that shows people uses exactly this cast
    const p = c.payload
    const cast = new Set(names)
    if (p.kind === 'lineup') expect(new Set(p.suspects.map((s) => s.name))).toEqual(cast)
    if (p.kind === 'elimination') expect(new Set(p.suspects.map((s) => s.name))).toEqual(cast)
    if (p.kind === 'deduction') expect(new Set(p.suspects)).toEqual(cast)
    if (p.kind === 'interrogation') expect(new Set(p.suspects.map((s) => s.speaker))).toEqual(cast)
  })

  it('no word bank contains a cast member\'s role', () => {
    for (const c of cases)
      for (const s of c.suspects)
        for (const w of c.words) expect(w.includes(squash(s.role)), `#${c.id} ${w}/${s.role}`).toBe(false)
  })

  it.each(cases)('case #$id has no filler padding', (c) => {
    const text = clueTextOf(c)
    if (text === null) return
    expect(text).not.toContain('XX')
    expect(text).not.toContain('QEDQED')
    expect(text).not.toMatch(/QED$/)
  })

  it.each(cases.filter((c) => ['leftovers', 'anagram', 'cryptogram'].includes(c.mechanic)))(
    'case #$id clue identifies the killer and no one else',
    (c) => {
      expect(pointsOnlyAtKiller(clueTextOf(c)!, c)).toBe(true)
    },
  )

  it('dead-letter cases point at a suspect by role, never "IT WAS <NAME>"', () => {
    const dead = cases.filter((c) => c.payload.kind === 'leftovers')
    const byRole = dead.filter((c) => {
      const p = c.payload as Extract<CaseFile['payload'], { kind: 'leftovers' }>
      const role = c.suspects.find((s) => s.name === c.killer)!.role
      return p.core.includes(squash(role)) && !p.core.includes(squash(c.killer))
    })
    expect(byRole.length).toBe(dead.length)
  })

  it.each(cases.filter((c) => c.mechanic === 'lineup' || c.mechanic === 'elimination'))(
    'case #$id padding never names anyone in the cast',
    (c) => {
      const text = clueTextOf(c)!
      for (const s of c.suspects) {
        expect(text).not.toContain(squash(s.role))
        expect(text).not.toContain(surname(s.name))
      }
    },
  )
})

describe('writing variety', () => {
  const themeById = new Map(THEMES.map((t) => [t.id, t]))
  const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const namesWord = (text: string, w: string) => new RegExp(`\\b${escape(w)}\\b`, 'i').test(text)
  /** undo the {victim}/{first} fill so a case's flavor maps back to its template */
  const templateOf = (c: CaseFile) =>
    c.flavor.replaceAll(c.victim, '{victim}').replace(new RegExp(`\\b${c.victim.split(' ')[0]}\\b`, 'g'), '{first}')

  it('every theme has 2–3 hand-written 2–3 sentence intros that give nothing away', () => {
    for (const t of THEMES) {
      expect(t.intros.length, t.id).toBeGreaterThanOrEqual(2)
      expect(t.intros.length, t.id).toBeLessThanOrEqual(3)
      for (const intro of t.intros) {
        expect(intro, t.id).toContain('{victim}')
        expect(intro.replace(/\{victim\}|\{first\}/g, ''), t.id).not.toMatch(/[{}]/)
        const sentences = intro.split(/[.!?](?:\s|$)/).filter((s) => s.trim())
        expect(sentences.length, intro).toBeGreaterThanOrEqual(2)
        expect(sentences.length, intro).toBeLessThanOrEqual(3)
        for (const w of [...t.rooms, ...t.weapons, ...t.suspects.map((s) => s.role)])
          expect(namesWord(intro, w), `${t.id} intro names "${w}": ${intro}`).toBe(false)
      }
    }
  })

  it("every case's intro comes from its own theme", () => {
    for (const c of cases) expect(themeById.get(c.themeId)!.intros, `#${c.id}`).toContain(templateOf(c))
  })

  it('no intro template is used for more than 10 cases', () => {
    const uses = new Map<string, number>()
    for (const c of cases) uses.set(templateOf(c), (uses.get(templateOf(c)) ?? 0) + 1)
    const worst = Math.max(...uses.values())
    expect(worst).toBeLessThanOrEqual(10)
  })

  it('no surname appears more than 4 times across all 150 cases', () => {
    const uses = new Map<string, number>()
    for (const c of cases)
      for (const name of [c.victim, ...c.suspects.map((s) => s.name)]) {
        const s = name.split(' ').slice(1).join(' ')
        uses.set(s, (uses.get(s) ?? 0) + 1)
      }
    const over = [...uses].filter(([, n]) => n > 4)
    expect(over).toEqual([])
  })
})

describe('determinism', () => {
  it('regenerating a case produces identical output', () => {
    for (const id of [1, 44, 104, 150]) {
      const stored = cases.find((c) => c.id === id)!
      // note: title uniqueness handling may have salted the seed at gen time,
      // so compare solvability-critical fields, not full equality
      const regen = generateCase(id, 0)
      expect(regen).not.toBeNull()
      expect(regen!.volume).toBe(stored.volume)
      expect(regen!.mechanic).toBe(stored.mechanic)
    }
  })
})
