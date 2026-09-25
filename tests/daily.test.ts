import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { CaseFile } from '../src/generator/types.ts'
import { LAUNCH_DATE } from '../src/config.ts'
import { dailyNumber, caseForDaily, dailyCaseId, msUntilNextDaily, shiftDateKey } from '../src/lib/daily.ts'
import { shareText, emojiRow, standingLine } from '../src/lib/share.ts'

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

  it('adds a standing line only when it is worth bragging about', () => {
    const r = { caseId: 12, daily: 47, seconds: 134, hints: 1, wrong: 0 }
    expect(shareText({ ...r, beatPct: 71 }, base).split('\n')[2]).toBe('Faster than 71% of detectives')
    expect(shareText({ ...r, beatPct: 0 }, base).split('\n')).toHaveLength(4)
    expect(shareText({ ...r, beatPct: null, first: true }, base)).toContain('First detective to crack it today')
    expect(standingLine({ beatPct: 100 })).toBe('Faster than every other detective so far today')
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

describe('daily progress', async () => {
  const { recordSolve, currentStreak, getProgress } = await import('../src/state/progress.ts')
  const rec = { seconds: 90, hints: 0, wrong: 0, challenge: true }

  it('keys the daily result and streak by daily number, not by clock', () => {
    recordSolve(101, rec, 5) // daily #5
    recordSolve(102, rec, 6) // #6 — even if it was finished after midnight
    expect(getProgress().daily).toMatchObject({ lastNumber: 6, streak: 2, result: { number: 6, caseId: 102 } })
    expect(currentStreak(getProgress(), launch(5))).toBe(2) // on day #6
    expect(currentStreak(getProgress(), launch(6))).toBe(2) // #7: still alive
    expect(currentStreak(getProgress(), launch(7))).toBe(0) // #8: broken
  })

  it('never lets an older daily finished late overwrite a newer one', () => {
    recordSolve(103, rec, 5)
    expect(getProgress().daily).toMatchObject({ lastNumber: 6, result: { number: 6 } })
    recordSolve(104, rec, 8) // skipped #7 → streak restarts
    expect(getProgress().daily).toMatchObject({ lastNumber: 8, streak: 1 })
  })

  it('archive solves never touch the daily', () => {
    const before = getProgress().daily
    recordSolve(1, rec, null)
    expect(getProgress().daily).toBe(before)
  })
})
