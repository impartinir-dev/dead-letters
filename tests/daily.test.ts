import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CaseFile } from '../src/generator/types.ts'
import { LAUNCH_DATE } from '../src/config.ts'
import { dailyNumber, caseForDaily, dailyCaseId, msUntilNextDaily, shiftDateKey } from '../src/lib/daily.ts'
import { shareText, emojiRow } from '../src/lib/share.ts'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const cases: CaseFile[] = [1, 2, 3].flatMap((v) =>
  JSON.parse(readFileSync(join(root, 'src', 'data', `cases-v${v}.json`), 'utf8')),
)

const [ly, lm, ld] = LAUNCH_DATE.split('-').map(Number)
const launch = (offsetDays: number, hour = 12) => new Date(ly, lm - 1, ld + offsetDays, hour)

describe('daily numbering', () => {
  it('launch day is #1 and each local day adds one', () => {
    expect(dailyNumber(launch(0, 0))).toBe(1)
    expect(dailyNumber(launch(0, 23))).toBe(1)
    expect(dailyNumber(launch(1, 0))).toBe(2)
    expect(dailyNumber(launch(46))).toBe(47)
    // across both DST switches of the following year
    expect(dailyNumber(launch(365, 1))).toBe(366)
  })

  it('shows #1 before launch', () => {
    expect(dailyNumber(launch(-30))).toBe(1)
  })

  it('cycles through all 150 cases before repeating', () => {
    const ids = Array.from({ length: 150 }, (_, i) => caseForDaily(i + 1))
    expect(new Set(ids).size).toBe(150)
    expect(caseForDaily(151)).toBe(caseForDaily(1))
    expect(dailyCaseId(launch(3))).toBe(caseForDaily(4))
  })

  it('counts down to local midnight', () => {
    expect(msUntilNextDaily(launch(0, 23))).toBe(3600_000)
    const ms = msUntilNextDaily(new Date())
    expect(ms).toBeGreaterThan(0)
    expect(ms).toBeLessThanOrEqual(86_400_000 + 3600_000)
  })

  it('knows yesterday by calendar date', () => {
    expect(shiftDateKey(new Date(2027, 0, 1, 0, 30), -1)).toBe('2026-12-31')
  })
})

describe('share text', () => {
  const base = 'https://example.com/deadletters/'

  it('matches the group-chat format', () => {
    const text = shareText({ caseId: 12, daily: 47, seconds: 134, hints: 1, wrong: 0 }, base)
    expect(text).toBe(
      'DEAD LETTERS #47 🔍\nSolved in 2:14 · 1 hint · 0 false accusations\n🟩🟩🟩🟩🟨\n' +
        'https://example.com/deadletters/#/daily',
    )
  })

  it('shows speed, hints and false accusations in the emoji row', () => {
    expect(emojiRow({ seconds: 90, hints: 0, wrong: 0 })).toBe('🟩🟩🟩🟩🟩 ⚡')
    expect(emojiRow({ seconds: 300, hints: 2, wrong: 1 })).toBe('🟩🟩🟨🟨🟥')
    expect(emojiRow({ seconds: 300, hints: 3, wrong: 9 })).toBe('🟥🟥🟥🟥🟥')
  })

  it.each(cases)('never spoils case #$id', (c) => {
    for (const daily of [null, 5]) {
      const text = shareText({ caseId: c.id, daily, seconds: 200, hints: 2, wrong: 1 }, base).toLowerCase()
      const secrets = [
        c.title, c.killer, c.victim, c.weapon, c.location,
        ...c.suspects.flatMap((s) => [s.name, s.role]),
        ...c.killer.split(' '), ...c.victim.split(' '),
      ]
      for (const s of secrets) expect(text, s).not.toContain(s.toLowerCase())
    }
  })
})
