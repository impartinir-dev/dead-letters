import { CASE_INDEX } from '../lib/data'
import { dailyCaseId, dateKey } from '../lib/daily'
import { useProgress, solvedCount, nextUnsolvedId } from '../state/progress'

const VOLUME_NAMES = ['HOMICIDE 101', 'COLD TRAILS', 'MASTER SLEUTH']

export default function Home({ nav }: { nav: (h: string) => void }) {
  const progress = useProgress()
  const solved = solvedCount()
  const dailyId = dailyCaseId()
  const dailyDone = dailyId in progress.solved && progress.daily.last === dateKey()
  const continueId = nextUnsolvedId()

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
        <p className="tagline">THE MURDER MYSTERY WORD SEARCH</p>
        <p className="sub">A collection of 150 deadly puzzles</p>
      </header>

      <section className="home-actions">
        <button className="btn btn-primary big" onClick={() => nav(`#/case/${continueId}`)}>
          {solved === 0
            ? 'Open Case No. 1'
            : solved === 150
              ? 'Replay Case No. 1'
              : `Continue — Case No. ${continueId}`}
        </button>
        <button className="btn big" onClick={() => nav(`#/case/${dailyId}`)}>
          Daily case — {new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          {dailyDone ? ' ✓' : ''}
        </button>
        {progress.daily.streak > 0 && (
          <p className="streak">Daily streak: {progress.daily.streak} day{progress.daily.streak === 1 ? '' : 's'}</p>
        )}
      </section>

      <section className="volumes">
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
      </section>

      <footer className="home-foot">
        <button className="btn-ghost" onClick={() => nav('#/help')}>
          How to play
        </button>
        <span className="dim">{solved}/150 cases closed</span>
      </footer>
    </div>
  )
}
