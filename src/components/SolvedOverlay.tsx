import { useState } from 'react'
import type { CaseFile } from '../generator/types'
import { fmtTime } from '../lib/format'
import { shareCase } from '../lib/share'

interface Props {
  c: CaseFile
  seconds: number
  hints: number
  wrong: number
  nav: (h: string) => void
}

export default function SolvedOverlay({ c, seconds, hints, wrong, nav }: Props) {
  const [shared, setShared] = useState(false)
  return (
    <div className="overlay">
      <div className="overlay-card">
        <div className="stamp">CASE CLOSED</div>
        <h2>{c.title}</h2>
        <p className="resolution">
          {c.killer}, the {c.suspects.find((s) => s.name === c.killer)?.role}, did it — with the{' '}
          {c.weapon.toLowerCase()}, in the {c.location.toLowerCase()}.
        </p>
        <dl className="stats">
          <div>
            <dt>Time</dt>
            <dd>{fmtTime(seconds)}</dd>
          </div>
          <div>
            <dt>Words</dt>
            <dd>
              {c.words.length}/{c.words.length}
            </dd>
          </div>
          <div>
            <dt>Hints</dt>
            <dd>{hints}</dd>
          </div>
          <div>
            <dt>False accusations</dt>
            <dd>{wrong}</dd>
          </div>
        </dl>
        {seconds <= 120 && <p className="challenge-badge">⚡ SOLVED IN UNDER 2 MINUTES</p>}
        <div className="overlay-actions">
          {c.id < 150 && (
            <button className="btn btn-primary" onClick={() => nav(`#/case/${c.id + 1}`)}>
              Next case
            </button>
          )}
          <button
            className="btn"
            onClick={async () => {
              const ok = await shareCase(c, seconds, hints, wrong)
              setShared(ok)
            }}
          >
            {shared ? 'Copied!' : 'Share result'}
          </button>
          <button className="btn-ghost" onClick={() => nav('#/cases')}>
            Case files
          </button>
        </div>
      </div>
    </div>
  )
}
