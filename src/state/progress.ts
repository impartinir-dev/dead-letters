import { useSyncExternalStore } from 'react'
import { dateKey } from '../lib/daily'

export interface SolveRecord {
  seconds: number
  hints: number
  wrong: number
  challenge: boolean
  at: number
}

export interface Progress {
  v: 1
  solved: Record<number, SolveRecord>
  daily: { last: string; streak: number; bestStreak: number }
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
    const today = dateKey()
    if (daily.last !== today) {
      const yesterday = dateKey(new Date(Date.now() - 864e5))
      const streak = daily.last === yesterday ? daily.streak + 1 : 1
      daily = { last: today, streak, bestStreak: Math.max(streak, daily.bestStreak) }
    }
  }
  state = { ...state, solved, daily }
  emit()
  return state
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
