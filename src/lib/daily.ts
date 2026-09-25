import { LAUNCH_DATE } from '../config'
import { mulberry32, shuffle } from '../generator/rng'

export function dateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** The local calendar day `offset` days from `d`, as a date key. */
export function shiftDateKey(d: Date, offset: number): string {
  return dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() + offset))
}

/** Whole calendar days from `a` to `b` (date keys), DST-proof. */
function daysBetween(a: string, b: string): number {
  const utc = (k: string) => {
    const [y, m, d] = k.split('-').map(Number)
    return Date.UTC(y, m - 1, d)
  }
  return Math.round((utc(b) - utc(a)) / 864e5)
}

/** Daily case number: #1 on LAUNCH_DATE, +1 each local day (never below 1). */
export function dailyNumber(d = new Date()): number {
  return Math.max(1, daysBetween(LAUNCH_DATE, dateKey(d)) + 1)
}

/** True from LAUNCH_DATE on (local date) — before that the daily is a preview. */
export function isLaunched(d = new Date()): boolean {
  return daysBetween(LAUNCH_DATE, dateKey(d)) >= 0
}

/** Fixed, shuffled order of all 150 cases — no repeat for 150 days. */
const DAILY_ORDER = shuffle(
  mulberry32(0xdead1e77),
  Array.from({ length: 150 }, (_, i) => i + 1),
)

/** Case id for daily #n. */
export function caseForDaily(n: number): number {
  return DAILY_ORDER[(n - 1) % DAILY_ORDER.length]
}

/** Today's daily case id in [1, 150]. */
export function dailyCaseId(d = new Date()): number {
  return caseForDaily(dailyNumber(d))
}

/** Milliseconds until the next daily case (local midnight). */
export function msUntilNextDaily(now = new Date()): number {
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
  return midnight.getTime() - now.getTime()
}
