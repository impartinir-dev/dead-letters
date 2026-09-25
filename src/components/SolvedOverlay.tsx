import { useState } from 'react'
import type { CaseFile } from '../generator/types'
import { fmtTime } from '../lib/format'
import { emojiRow } from '../lib/share'
import { shareResult } from '../lib/shareDevice'
import { nextUnsolvedId } from '../state/progress'
import Countdown, { useNow } from './Countdown'

interface Props {
  c: CaseFile
  seconds: number
  hints: number
  wrong: number
  /** daily case number when this was today's daily, else null */
  daily: number | null
  nav: (h: string) => void
}

const SHARE_LABEL = { shared: 'Shared!', copied: 'Copied!', cancelled: 'Share result', failed: 'Could not share' }

export default function SolvedOverlay({ c, seconds, hints, wrong, daily, nav }: Props) {
  const [shareState, setShareState] = useState<keyof typeof SHARE_LABEL | null>(null)
  const now = useNow()
  const role = c.suspects.find((s) => s.name === c.killer)?.role
  const share = async () => setShareState(await shareResult({ caseId: c.id, daily, seconds, hints, wrong }))
  const shareBtn = (primary: boolean) => (
    <button className={primary ? 'btn btn-primary' : 'btn'} onClick={share}>
      {shareState ? SHARE_LABEL[shareState] : 'Share result'}
    </button>
  )

  return (
    <div className="overlay" role="dialog" aria-modal="true" aria-labelledby="solved-title">
      <div className="overlay-card">
        {daily !== null && <p className="overlay-daily">DAILY CASE #{daily}</p>}
        <div className="stamp">CASE CLOSED</div>
        <h2 id="solved-title">{c.title}</h2>
        <p className="resolution">
          {c.killer}, the {role}, did it — with the {c.weapon.toLowerCase()}, in the{' '}
          {c.location.toLowerCase()}.
        </p>
        <dl className="stats">
          <div>
            <dt>Time</dt>
            <dd>{fmtTime(seconds)}</dd>
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
        <p className="overlay-emoji" aria-hidden>
          {emojiRow({ seconds, hints, wrong })}
        </p>
        {seconds <= 120 && <p className="challenge-badge">⚡ SOLVED IN UNDER 2 MINUTES</p>}
        <div className="overlay-actions">
          {daily !== null ? (
            <>
              {shareBtn(true)}
              <button className="btn" onClick={() => nav(`#/case/${nextUnsolvedId()}`)}>
                Keep playing the archive
              </button>
            </>
          ) : (
            <>
              {c.id < 150 && (
                <button className="btn btn-primary" onClick={() => nav(`#/case/${c.id + 1}`)}>
                  Next case
                </button>
              )}
              {shareBtn(false)}
            </>
          )}
          <button className="btn-ghost" onClick={() => nav('#/')}>
            Home
          </button>
        </div>
        {daily !== null && (
          <p className="overlay-next">
            <Countdown now={now} />
          </p>
        )}
      </div>
    </div>
  )
}
