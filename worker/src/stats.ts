/**
 * Pure logic for the global daily stats service — no Cloudflare APIs, so it
 * is unit-tested directly. Privacy by design: the service only ever stores
 * counters per daily case (how many solved, how many in each 5-second time
 * bucket, how many flawlessly). No individual results, IPs or device ids.
 */

/** Solve times are counted in 5-second buckets… */
export const BUCKET_SECONDS = 5
/** …up to 30 minutes; everything slower shares the last bucket. */
export const OVERFLOW_BUCKET = 1800 / BUCKET_SECONDS
/** Faster than this is not a human solve. */
export const MIN_SECONDS = 5
export const MAX_SECONDS = 24 * 3600

export interface SolveInput {
  daily: number
  seconds: number
  hints: number
  wrong: number
}

export function bucketOf(seconds: number): number {
  return Math.min(OVERFLOW_BUCKET, Math.floor(seconds / BUCKET_SECONDS))
}

const isInt = (v: unknown, lo: number, hi: number): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= lo && v <= hi

/** Validate an untrusted request body; null when anything is off. */
export function parseSolve(body: unknown): SolveInput | null {
  if (typeof body !== 'object' || body === null) return null
  const { daily, seconds, hints, wrong } = body as Record<string, unknown>
  if (!isInt(daily, 1, 1_000_000)) return null
  if (!isInt(seconds, MIN_SECONDS, MAX_SECONDS)) return null
  if (!isInt(hints, 0, 3)) return null
  if (!isInt(wrong, 0, 99)) return null
  return { daily, seconds, hints, wrong }
}

/**
 * Daily numbers that may be submitted right now. Players' local dates span
 * UTC-12..UTC+14, so accept the UTC day's number ±1. Before launch (every
 * number < 1) nothing is accepted, so previews never pollute daily #1.
 */
export function dailyWindow(launch: string, now: Date): { min: number; max: number } {
  const [y, m, d] = launch.split('-').map(Number)
  const today = Math.floor((now.getTime() - Date.UTC(y, m - 1, d)) / 864e5) + 1
  return { min: Math.max(1, today - 1), max: today + 1 }
}

/** Everything stored for one daily case. */
export interface DailyCounts {
  daily: number
  solves: number
  flawless: number
  /** bucket -> number of solves in it */
  buckets: Map<number, number>
}

/** What the API returns. */
export interface DailyStats {
  daily: number
  solves: number
  /** approximate median solve time, seconds (null with no solves) */
  medianSeconds: number | null
  /** share of solves with no hints and no false accusations, 0–100 */
  flawlessPct: number | null
  /** share of *other* players this solve was faster than, 0–100 (null if not a submission, or the first) */
  beatPct: number | null
  /** true when this submission was the first solve of the day */
  first: boolean
}

function median(c: DailyCounts): number | null {
  if (c.solves === 0) return null
  const half = c.solves / 2
  let seen = 0
  for (const b of [...c.buckets.keys()].sort((x, y) => x - y)) {
    seen += c.buckets.get(b)!
    if (seen >= half) return b >= OVERFLOW_BUCKET ? 1800 : Math.round((b + 0.5) * BUCKET_SECONDS)
  }
  return null
}

/**
 * Public stats for a day. With `mine` (the bucket just submitted, already
 * included in the counts) also reports how many other players it beat —
 * slower buckets count fully, ties count half.
 */
export function summarize(c: DailyCounts, mine?: number): DailyStats {
  const base: DailyStats = {
    daily: c.daily,
    solves: c.solves,
    medianSeconds: median(c),
    flawlessPct: c.solves ? Math.round((100 * c.flawless) / c.solves) : null,
    beatPct: null,
    first: false,
  }
  if (mine === undefined) return base
  const others = c.solves - 1
  if (others <= 0) return { ...base, first: true }
  let slower = 0
  for (const [b, n] of c.buckets) if (b > mine) slower += n
  slower += ((c.buckets.get(mine) ?? 1) - 1) / 2
  // 100 means literally unbeaten — never let rounding claim it (299 of 300 → 99)
  const pct = Math.round((100 * slower) / others)
  return { ...base, beatPct: Math.max(0, slower < others ? Math.min(99, pct) : 100) }
}

/** Storage behind the API (D1 in production, in-memory in tests). */
export interface Store {
  addSolve(daily: number, bucket: number, flawless: boolean): Promise<void>
  read(daily: number): Promise<DailyCounts>
}
