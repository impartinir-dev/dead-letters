import { useEffect, useState } from 'react'
import { msUntilNextDaily } from '../lib/daily'

/** Current time, re-rendering every `ms` (default 1s). */
export function useNow(ms = 1000): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), ms)
    return () => clearInterval(t)
  }, [ms])
  return now
}

export function fmtCountdown(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const hh = String(Math.floor(s / 3600)).padStart(2, '0')
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0')
  const ss = String(s % 60).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

/** "Next case in 07:12:33" — ticks down to local midnight. */
export default function Countdown({ now }: { now: Date }) {
  return (
    <span className="countdown">
      Next case in <b>{fmtCountdown(msUntilNextDaily(now))}</b>
    </span>
  )
}
