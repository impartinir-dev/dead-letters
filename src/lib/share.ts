import { fmtTime } from './format'

export interface ShareResult {
  caseId: number
  /** daily case number, or null for an archive case */
  daily: number | null
  seconds: number
  hints: number
  wrong: number
  /** global stats, when known: share of today's players beaten / first solver */
  beatPct?: number | null
  first?: boolean
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/**
 * Five squares: green by default, a yellow per hint, a red per false
 * accusation (greens first), plus ⚡ for a sub-2-minute solve.
 */
export function emojiRow(r: Pick<ShareResult, 'seconds' | 'hints' | 'wrong'>): string {
  const reds = Math.min(5, r.wrong)
  const yellows = Math.min(5 - reds, r.hints)
  const row = '🟩'.repeat(5 - reds - yellows) + '🟨'.repeat(yellows) + '🟥'.repeat(reds)
  return r.seconds <= 120 ? `${row} ⚡` : row
}

/** "Faster than 71% of detectives" — only when it's a boast worth sharing. */
export function standingLine(r: Pick<ShareResult, 'beatPct' | 'first'>): string | null {
  if (r.first) return 'First detective to crack it today'
  if (r.beatPct === 100) return 'Faster than every other detective so far today'
  if (typeof r.beatPct === 'number' && r.beatPct >= 1) return `Faster than ${r.beatPct}% of detectives`
  return null
}

/**
 * Spoiler-free, group-chat-ready result. Never includes the title, names,
 * weapon, location or any answer — only the case number and how it went.
 * `baseUrl` is the app URL without a hash (the daily link opens today's case).
 */
export function shareText(r: ShareResult, baseUrl: string): string {
  const head = r.daily !== null ? `DEAD LETTERS #${r.daily} 🔍` : `DEAD LETTERS · Case No. ${r.caseId} 🔍`
  const stats =
    `Solved in ${fmtTime(r.seconds)} · ${plural(r.hints, 'hint')} · ` +
    `${plural(r.wrong, 'false accusation')}`
  const standing = standingLine(r)
  const link = `${baseUrl}#/${r.daily !== null ? 'daily' : `case/${r.caseId}`}`
  return [head, stats, ...(standing ? [standing] : []), emojiRow(r), link].join('\n')
}
