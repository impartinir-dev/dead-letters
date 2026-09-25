import { useSyncExternalStore } from 'react'
import { dateKey, dailyNumber } from '../lib/daily'
import type { DailyStats } from '../lib/stats'

export interface SolveRecord {
  seconds: number
  hints: number
  wrong: number
  challenge: boolean
  at: number
}

/** First solve of a given daily case — what the share card reports. */
export interface DailyResult {
  number: number
  caseId: number
  seconds: number
  hints: number
  wrong: number
  /** reported to the global stats API (or permanently refused by it) */
  submitted?: boolean
  /** latest global numbers for this daily, incl. how many players it beat */
  stats?: DailyStats
}

export interface Progress {
  v: 1
  solved: Record<number, SolveRecord>
  /**
   * `lastNumber` = daily number of the last solved daily (streaks count daily
   * numbers, so a solve that crosses midnight still counts for its own case).
   * `last` is its local date, kept for saves made before `lastNumber` existed.
   */
  daily: { last: string; lastNumber?: number; streak: number; bestStreak: number; result?: DailyResult }
  helpSeen: boolean
  /** player turned off anonymous daily stats */
  statsOptOut?: boolean
}

const KEY = 'deadletters.v1'
const EMPTY: Progress = {
  v: 1,
  solved: {},
  daily: { last: '', streak: 0, bestStreak: 0 },
  helpSeen: false,
}

let state: Progress = load()
const listeners = new Set<() => void>()

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return { ...EMPTY, ...(JSON.parse(raw) as Progress) }
  } catch {
    /* corrupt or unavailable storage — start fresh */
  }
  return { ...EMPTY }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* storage full/blocked — progress lives in memory this session */
  }
}

function emit() {
  save()
  for (const l of listeners) l()
}

// keep open tabs in sync: another tab's save replaces this tab's copy
;(globalThis as { addEventListener?: (type: string, fn: (e: { key: string | null }) => void) => void })
  .addEventListener?.('storage', (e) => {
    if (e.key !== KEY) return
    state = load()
    for (const l of listeners) l()
  })

export function subscribe(fn: () => void): () => void {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getProgress(): Progress {
  return state
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getProgress)
}

export function isSolved(id: number): boolean {
  return id in state.solved
}

/** Daily number of the last solved daily (0 = none yet). */
function lastSolvedDaily(d: Progress['daily']): number {
  if (d.lastNumber) return d.lastNumber
  if (!d.last) return 0
  const [y, m, day] = d.last.split('-').map(Number)
  return dailyNumber(new Date(y, m - 1, day))
}

/**
 * Record a solve. `dailyNo` is the daily case number the case was opened as
 * (null for archive play); the first solve of each daily sets the streak and
 * the result the share card and global stats report.
 */
export function recordSolve(id: number, rec: Omit<SolveRecord, 'at'>, dailyNo: number | null): Progress {
  const prev = state.solved[id]
  const best = prev && prev.seconds < rec.seconds ? prev.seconds : rec.seconds
  const solved = { ...state.solved, [id]: { ...rec, seconds: best, at: Date.now() } }

  let daily = state.daily
  const last = lastSolvedDaily(daily)
  // only a newer daily counts (an older one finished late never overwrites)
  if (dailyNo !== null && dailyNo > last) {
    const streak = last === dailyNo - 1 ? daily.streak + 1 : 1
    daily = {
      last: dateKey(),
      lastNumber: dailyNo,
      streak,
      bestStreak: Math.max(streak, daily.bestStreak),
      result: {
        number: dailyNo,
        caseId: id,
        seconds: rec.seconds,
        hints: rec.hints,
        wrong: rec.wrong,
        submitted: false,
      },
    }
  }
  state = { ...state, solved, daily }
  emit()
  return state
}

/** Streak still alive: today's or yesterday's daily solved, else 0. */
export function currentStreak(p: Progress, now = new Date()): number {
  const last = lastSolvedDaily(p.daily)
  const today = dailyNumber(now)
  return last === today || last === today - 1 ? p.daily.streak : 0
}

/** Today's daily result, if the player has already solved it. */
export function todaysDailyResult(p: Progress, now = new Date()): DailyResult | null {
  return p.daily.result?.number === dailyNumber(now) ? p.daily.result : null
}

/** Store the stats API's answer for daily #number (ignored if a newer daily replaced it). */
export function saveDailyStats(number: number, patch: { stats?: DailyStats; submitted?: boolean }) {
  const r = state.daily.result
  if (!r || r.number !== number) return
  state = { ...state, daily: { ...state.daily, result: { ...r, ...patch } } }
  emit()
}

export function setStatsOptOut(optOut: boolean) {
  state = { ...state, statsOptOut: optOut }
  emit()
}

export function markHelpSeen() {
  state = { ...state, helpSeen: true }
  emit()
}

export function solvedCount(): number {
  return Object.keys(state.solved).length
}

export function nextUnsolvedId(): number {
  for (let i = 1; i <= 150; i++) if (!isSolved(i)) return i
  return 1
}
