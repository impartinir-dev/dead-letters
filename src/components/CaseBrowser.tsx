import { useMemo, useState } from 'react'
import { CASE_INDEX } from '../lib/data'
import { fmtTime, MECHANIC_LABEL } from '../lib/format'
import { useProgress } from '../state/progress'
import { dailyCaseId } from '../lib/daily'

const VOLUME_NAMES = ['HOMICIDE 101', 'COLD TRAILS', 'MASTER SLEUTH']

export default function CaseBrowser({ nav, initialVol }: { nav: (h: string) => void; initialVol: number }) {
  const progress = useProgress()
  const [vol, setVol] = useState(initialVol)
  const dailyId = dailyCaseId()

  const cases = useMemo(() => CASE_INDEX.filter((e) => e.volume === vol), [vol])

  return (
    <div className="page browser">
      <header className="browser-head">
        <button className="btn-ghost" onClick={() => nav('#/')} aria-label="Back">
          ←
        </button>
        <h2>Case Files</h2>
        <span className="dim">{Object.keys(progress.solved).length}/150</span>
      </header>

      <nav className="vol-tabs">
        {[1, 2, 3].map((v) => (
          <button key={v} className={v === vol ? 'tab active' : 'tab'} onClick={() => setVol(v)}>
            VOL {'I'.repeat(v)}
          </button>
        ))}
      </nav>
      <p className="vol-subtitle">{VOLUME_NAMES[vol - 1]}</p>

      <div className="case-grid">
        {cases.map((e) => {
          const rec = progress.solved[e.id]
          return (
            <button
              key={e.id}
              className={`case-card ${rec ? 'solved' : ''}`}
              onClick={() => nav(`#/case/${e.id}`)}
            >
              <span className="case-card-no">
                No. {e.id}
                {e.id === dailyId && <em className="daily-dot">daily</em>}
              </span>
              <span className="case-card-title">{e.title}</span>
              <span className="case-card-meta">
                {MECHANIC_LABEL[e.mechanic]} · {e.rows}×{e.rows}
              </span>
              {rec ? (
                <span className="case-card-done">
                  <i className="mini-stamp">SOLVED</i>
                  {fmtTime(rec.seconds)}
                  {rec.challenge ? ' ⚡' : ''}
                </span>
              ) : (
                <span className="case-card-open">unsolved</span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
