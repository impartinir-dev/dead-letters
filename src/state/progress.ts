import { useSyncExternalStore } from 'react'
import { dateKey, dailyNumber, shiftDateKey } from '../lib/daily'

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
}

export interface Progress {
  v: 1
  solved: Record<number, SolveRecord>
  daily: { last: string; streak: number; bestStreak: number; result?: DailyResult }
  helpSeen: boolean
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

export function recordSolve(id: number, rec: Omit<SolveRecord, 'at'>, isDaily: boolean): Progress {
  const prev = state.solved[id]
  const best = prev && prev.seconds < rec.seconds ? prev.seconds : rec.seconds
  const solved = { ...state.solved, [id]: { ...rec, seconds: best, at: Date.now() } }

  let daily = state.daily
  if (isDaily) {
    const now = new Date()
    const today = dateKey(now)
    if (daily.last !== today) {
      const streak = daily.last === shiftDateKey(now, -1) ? daily.streak + 1 : 1
      daily = {
        last: today,
        streak,
        bestStreak: Math.max(streak, daily.bestStreak),
        result: { number: dailyNumber(now), caseId: id, seconds: rec.seconds, hints: rec.hints, wrong: rec.wrong },
      }
    }
  }
  state = { ...state, solved, daily }
  emit()
  return state
}

/** Streak still alive today: solved today or yesterday, else 0. */
export function currentStreak(p: Progress, now = new Date()): number {
  const { last, streak } = p.daily
  return last === dateKey(now) || last === shiftDateKey(now, -1) ? streak : 0
}

/** Today's daily result, if the player has already solved it. */
export function todaysDailyResult(p: Progress, now = new Date()): DailyResult | null {
  return p.daily.last === dateKey(now) && p.daily.result?.number === dailyNumber(now) ? p.daily.result : null
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
