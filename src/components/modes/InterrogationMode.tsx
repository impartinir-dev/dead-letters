import { useEffect, useRef, useState } from 'react'
import type { InterrogationPayload } from '../../generator/types'
import type { ModeProps } from './types'

export default function InterrogationMode({ c, hintToken, setStatus, notify, onSolved, onWrong }: ModeProps) {
  const p = c.payload as InterrogationPayload & { kind: 'interrogation' }
  const [picked, setPicked] = useState<string | null>(null)
  const [accused, setAccused] = useState<string | null>(null)
  const [cleared, setCleared] = useState<Set<string>>(new Set())
  const lastHint = useRef(0)

  useEffect(() => {
    setStatus(picked ? `Accusing ${picked.split(' ')[0]}` : 'Pick the liar')
  }, [picked, setStatus])

  // hint: clear one innocent suspect
  useEffect(() => {
    if (hintToken === lastHint.current) return
    lastHint.current = hintToken
    const innocents = p.suspects
      .map((s) => s.speaker)
      .filter((n) => n !== c.killer && !cleared.has(n))
    if (!innocents.length) return
    const n = innocents[Math.floor(Math.random() * innocents.length)]
    setCleared((s) => new Set(s).add(n))
    notify(`${n} checks out.`)
  }, [hintToken, p, c.killer, cleared, notify])

  const accuse = () => {
    if (!picked) return
    setAccused(picked)
    if (picked === c.killer) onSolved()
    else onWrong()
  }

  return (
    <div className="mode interrog-mode">
      <p className="clue">Everyone tells the truth — except the killer.</p>
      <p className="alibis">
        Confirmed alibis:{' '}
        {p.pairings.map(([a, b]) => `${a.split(' ')[0]} & ${b.split(' ')[0]}`).join(' · ')}
      </p>
      <div className="stmts">
        {p.suspects.map((s, i) => (
          <button
            key={i}
            className={[
              'stmt-card',
              picked === s.speaker ? 'picked' : '',
              cleared.has(s.speaker) ? 'cleared' : '',
              accused === s.speaker ? (s.speaker === c.killer ? 'right' : 'wrong') : '',
            ].join(' ')}
            disabled={cleared.has(s.speaker)}
            onClick={() => setPicked(s.speaker)}
          >
            <span className="stmt-name">
              {s.speaker}
              {cleared.has(s.speaker) && <em className="cleared-tag">cleared</em>}
            </span>
            <span className="stmt-text">“{s.text}”</span>
          </button>
        ))}
      </div>
      <button className="btn btn-primary wide" disabled={!picked} onClick={accuse}>
        Accuse
      </button>
    </div>
  )
}
