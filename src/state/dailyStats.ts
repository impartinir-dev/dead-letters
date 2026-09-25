/**
 * Glue between the local progress store and the global stats API: submits
 * the latest daily result exactly once (retrying on a later visit if the
 * network was down) and exposes hooks for the UI.
 */
import { useEffect, useState } from 'react'
import { dailyNumber, isLaunched } from '../lib/daily'
import { fetchDailyStats, statsConfigured, submitDailySolve, type DailyStats } from '../lib/stats'
import { getProgress, saveDailyStats, useProgress, type DailyResult, type Progress } from './progress'

/** Stats are live: API configured, player hasn't opted out, and the daily has launched. */
export function statsActive(p: Progress = getProgress()): boolean {
  return statsConfigured() && !p.statsOptOut && isLaunched()
}

/**
 * The stored daily result, if it can still be reported: today's, or
 * yesterday's (a case opened before midnight and solved after).
 */
function reportableResult(p: Progress): DailyResult | null {
  const r = p.daily.result
  return r && r.number >= dailyNumber() - 1 ? r : null
}

let inflight: Promise<DailyStats | null> | null = null

/** Report the latest daily result if it hasn't been yet; resolves to its stats. */
export function syncDailyResult(): Promise<DailyStats | null> {
  const p = getProgress()
  const r = reportableResult(p)
  if (!r || !statsActive(p)) return Promise.resolve(null)
  if (r.submitted) return Promise.resolve(r.stats ?? null)
  inflight ??= submitDailySolve({ daily: r.number, seconds: r.seconds, hints: r.hints, wrong: r.wrong })
    .then((out) => {
      if (out.ok) {
        saveDailyStats(r.number, { stats: out.stats, submitted: true })
        return out.stats
      }
      // refused for good (e.g. an implausibly fast time): stop retrying
      if (out.permanent) saveDailyStats(r.number, { submitted: true })
      return null
    })
    .finally(() => {
      inflight = null
    })
  return inflight
}

/**
 * Stats for the player's result on daily #daily, submitting first if needed.
 * `undefined` while loading, `null` when unavailable.
 */
export function useDailyResultStats(daily: number | null, enabled: boolean): DailyStats | null | undefined {
  const progress = useProgress()
  const r = progress.daily.result
  const cached = daily !== null && r?.number === daily ? r.stats : undefined
  const [stats, setStats] = useState<DailyStats | null | undefined>(enabled ? undefined : null)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    syncDailyResult().then((s) => alive && setStats(s && s.daily === daily ? s : null))
    return () => {
      alive = false
    }
  }, [enabled, daily])
  if (stats) return stats
  if (cached) return cached
  return stats // undefined = still loading, null = unavailable
}

/** Live public numbers for daily #n (null when unavailable). */
export function useDailyStats(daily: number, enabled: boolean): DailyStats | null {
  const [stats, setStats] = useState<DailyStats | null>(null)
  useEffect(() => {
    if (!enabled) return
    let alive = true
    fetchDailyStats(daily).then((s) => alive && setStats(s))
    return () => {
      alive = false
    }
  }, [daily, enabled])
  return enabled ? stats : null
}
