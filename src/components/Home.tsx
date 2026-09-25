import { useState } from 'react'
import { CASE_INDEX } from '../lib/data'
import { caseForDaily, dailyNumber } from '../lib/daily'
import { fmtTime, MECHANIC_LABEL } from '../lib/format'
import { emojiRow } from '../lib/share'
import { shareResult } from '../lib/shareDevice'
import { useProgress, solvedCount, nextUnsolvedId, currentStreak, todaysDailyResult } from '../state/progress'
import Countdown, { useNow } from './Countdown'

const VOLUME_NAMES = ['HOMICIDE 101', 'COLD TRAILS', 'MASTER SLEUTH']

const SHARE_LABEL = { shared: 'Shared!', copied: 'Copied to clipboard', cancelled: 'Share result', failed: 'Could not share' }

export default function Home({ nav }: { nav: (h: string) => void }) {
  const progress = useProgress()
  const now = useNow()
  const n = dailyNumber(now)
  const daily = CASE_INDEX[caseForDaily(n) - 1]
  const result = todaysDailyResult(progress, now)
  const streak = currentStreak(progress, now)
  const solved = solvedCount()
  const continueId = nextUnsolvedId()
  const [shareState, setShareState] = useState<keyof typeof SHARE_LABEL | null>(null)

  return (
    <div className="page home">
      <header className="masthead">
        <div className="tile-row" aria-hidden>
          {'DEAD'.split('').map((ch, i) => (
            <span key={i} className="mast-tile red">
              {ch}
            </span>
          ))}
        </div>
        <div className="tile-row" aria-hidden>
          {'LETTERS'.split('').map((ch, i) => (
            <span key={i} className="mast-tile">
              {ch}
            </span>
          ))}
        </div>
        <h1 className="tagline">THE MURDER MYSTERY WORD SEARCH</h1>
      </header>

      <section className="daily-card" aria-labelledby="daily-no">
        <div className="daily-head">
          <span id="daily-no" className="daily-no">
            DAILY CASE #{n}
          </span>
          <span className="daily-date">
            {now.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
        </div>
        <h2 className="daily-title">{daily.title}</h2>
        <p className="daily-meta">{MECHANIC_LABEL[daily.mechanic]}</p>

        {result ? (
          <>
            <p className="daily-result">
              <i className="mini-stamp">SOLVED</i> in {fmtTime(result.seconds)} · {result.hints} hint
              {result.hints === 1 ? '' : 's'} · {result.wrong} false accusation{result.wrong === 1 ? '' : 's'}
            </p>
            <p className="daily-emoji" aria-hidden>
              {emojiRow(result)}
            </p>
            <button
              className="btn btn-primary big"
              onClick={async () => setShareState(await shareResult({ ...result, daily: result.number }))}
            >
              {shareState ? SHARE_LABEL[shareState] : 'Share result'}
            </button>
          </>
        ) : (
          <button className="btn btn-primary big" onClick={() => nav('#/daily')}>
            Open today’s case
          </button>
        )}

        <div className="daily-foot">
          <span className="streak-chip">
            {streak > 0 ? (
              <>
                Streak <b>{streak}</b> {streak === 1 ? 'day' : 'days'}
              </>
            ) : (
              'Start a streak today'
            )}
            {progress.daily.bestStreak > streak && <em> · best {progress.daily.bestStreak}</em>}
          </span>
          <Countdown now={now} />
        </div>
      </section>

      <section className="archive">
        <h3 className="section-label">
          <span>THE ARCHIVE</span>
          <span className="dim">{solved}/150 closed</span>
        </h3>
        <button className="btn big" onClick={() => nav(`#/case/${continueId}`)}>
          {solved === 0
            ? 'Start with Case No. 1'
            : solved === 150
              ? 'Replay Case No. 1'
              : `Continue — Case No. ${continueId}`}
        </button>
        <div className="volumes">
          {[1, 2, 3].map((v) => {
            const volCases = CASE_INDEX.filter((e) => e.volume === v)
            const done = volCases.filter((e) => e.id in progress.solved).length
            return (
              <button key={v} className="vol-card" onClick={() => nav(`#/cases?v=${v}`)}>
                <span className="vol-no">VOLUME {'I'.repeat(v)}</span>
                <span className="vol-name">{VOLUME_NAMES[v - 1]}</span>
                <span className="vol-bar">
                  <span style={{ width: `${(done / volCases.length) * 100}%` }} />
                </span>
                <span className="vol-count">
                  {done}/{volCases.length} closed
                </span>
              </button>
            )
          })}
        </div>
      </section>

      <footer className="home-foot">
        <div className="home-foot-row">
          <button className="btn-ghost" onClick={() => nav('#/help')}>
            How to play
          </button>
          <span className="dim">150 cases · new daily at midnight</span>
        </div>
        <nav className="legal-links" aria-label="Legal">
          <a href="#/impressum">Impressum</a>
          <span aria-hidden>·</span>
          <a href="#/datenschutz">Datenschutz</a>
        </nav>
      </footer>
    </div>
  )
}
