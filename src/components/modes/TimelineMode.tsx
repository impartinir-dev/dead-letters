import { useEffect, useRef, useState } from 'react'
import type { TimelinePayload } from '../../generator/types'
import type { ModeProps } from './types'

export default function TimelineMode({ c, hintToken, setStatus, notify, onSolved, onWrong }: ModeProps) {
  const p = c.payload as TimelinePayload & { kind: 'timeline' }
  const n = p.events.length
  // slots[i] = event id placed at position i (null = empty); pinned = locked by hint
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(n).fill(null))
  const [pinned, setPinned] = useState<Set<number>>(new Set())
  const [shake, setShake] = useState(false)
  const lastHint = useRef(0)
  const solvedRef = useRef(false)

  const usedIds = new Set(slots.filter((s) => s !== null) as number[])
  const filledCount = usedIds.size

  useEffect(() => {
    setStatus(`${filledCount}/${n} placed`)
  }, [filledCount, n, setStatus])

  // hint: pin one event into its correct slot
  useEffect(() => {
    if (hintToken === lastHint.current) return
    lastHint.current = hintToken
    // find a slot that is empty or holds the wrong event
    for (let i = 0; i < n; i++) {
      const want = p.order[i]
      if (slots[i] !== want && !pinned.has(i)) {
        setSlots((s) => {
          const next = s.slice()
          const cur = next.indexOf(want)
          if (cur !== -1) next[cur] = null
          next[i] = want
          return next
        })
        setPinned((s) => new Set(s).add(i))
        notify('An interview pins one event in place.')
        return
      }
    }
  }, [hintToken, n, p.order, slots, pinned, notify])

  const tapEvent = (id: number) => {
    const i = slots.findIndex((s, idx) => s === null && !pinned.has(idx))
    if (i === -1 || usedIds.has(id)) return
    const next = slots.slice()
    next[i] = id
    setSlots(next)
  }

  const tapSlot = (i: number) => {
    if (pinned.has(i) || slots[i] === null) return
    const next = slots.slice()
    next[i] = null
    setSlots(next)
  }

  const submit = () => {
    if (slots.some((s) => s === null)) return
    const ok = slots.every((v, i) => v === p.order[i])
    if (ok && !solvedRef.current) {
      solvedRef.current = true
      onSolved()
    } else if (!ok) {
      setShake(true)
      setTimeout(() => setShake(false), 450)
      onWrong()
    }
  }

  return (
    <div className="mode timeline-mode">
      <p className="sheet-note">Reconstruct the night. Put the events in order.</p>
      <div className="evidence">
        {p.clues.map((cl, i) => (
          <p key={i} className="evidence-card">
            {cl.text}
          </p>
        ))}
      </div>

      <div className={`timeline-slots ${shake ? 'shake' : ''}`}>
        {slots.map((ev, i) => (
          <button
            key={i}
            className={`t-slot ${pinned.has(i) ? 'pinned' : ''} ${ev !== null ? 'filled' : ''}`}
            onClick={() => tapSlot(i)}
          >
            <span className="t-num">{i + 1}</span>
            <span className="t-label">{ev !== null ? p.events[ev] : '—'}</span>
          </button>
        ))}
      </div>

      <div className="t-pool">
        {p.events.map((ev, i) => (
          <button
            key={i}
            className="t-event"
            disabled={usedIds.has(i)}
            onClick={() => tapEvent(i)}
          >
            {ev}
          </button>
        ))}
      </div>

      <button className="btn btn-primary wide" disabled={filledCount < n} onClick={submit}>
        Confirm the timeline
      </button>
    </div>
  )
}
