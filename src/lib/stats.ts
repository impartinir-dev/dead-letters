/**
 * Client for the global daily stats API (worker/). Every call is optional:
 * it is skipped when STATS_API_URL is empty or the device is offline, times
 * out after 8 s, and never throws — any failure just means "no stats".
 */
import { STATS_API_URL } from '../config'

/** Mirrors DailyStats in worker/src/stats.ts. */
export interface DailyStats {
  daily: number
  solves: number
  medianSeconds: number | null
  flawlessPct: number | null
  /** share of other players this solve beat, 0–100 (only on submissions) */
  beatPct: number | null
  /** this submission was the first solve of the day */
  first: boolean
}

export const statsConfigured = (): boolean => STATS_API_URL !== ''

const TIMEOUT_MS = 8000

function isStats(v: unknown): v is DailyStats {
  const s = v as Partial<DailyStats> | null
  return !!s && typeof s.daily === 'number' && typeof s.solves === 'number'
}

type Outcome = { ok: true; stats: DailyStats } | { ok: false; permanent: boolean }

async function request(path: string, init?: RequestInit): Promise<Outcome> {
  const offline = (globalThis as { navigator?: { onLine?: boolean } }).navigator?.onLine === false
  if (!statsConfigured() || offline) return { ok: false, permanent: false }
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${STATS_API_URL.replace(/\/+$/, '')}${path}`, { ...init, signal: ctrl.signal })
    if (!res.ok) {
      // 4xx (except rate limiting) will never succeed — don't retry those
      return { ok: false, permanent: res.status >= 400 && res.status < 500 && res.status !== 429 }
    }
    const body: unknown = await res.json()
    return isStats(body) ? { ok: true, stats: body } : { ok: false, permanent: false }
  } catch {
    return { ok: false, permanent: false }
  } finally {
    clearTimeout(timer)
  }
}

/** Public numbers for a daily case (how many solved, median, …). */
export async function fetchDailyStats(daily: number): Promise<DailyStats | null> {
  const r = await request(`/v1/daily/${daily}`)
  return r.ok ? r.stats : null
}

/**
 * Report a daily solve. Sent as text/plain so the browser skips the CORS
 * preflight (one request instead of two); the API parses the JSON body.
 */
export function submitDailySolve(r: { daily: number; seconds: number; hints: number; wrong: number }): Promise<Outcome> {
  return request('/v1/solve', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
    body: JSON.stringify(r),
  })
}
