import { MECHANIC_HELP, MECHANIC_LABEL } from '../lib/format'
import { statsConfigured } from '../lib/stats'
import { setStatsOptOut, useProgress } from '../state/progress'

const WORD_SEARCH = ['leftovers', 'lineup', 'elimination', 'anagram'] as const
const PUZZLES = ['cryptogram', 'deduction', 'interrogation', 'timeline'] as const

export default function HelpModal({ nav }: { nav: (h: string) => void }) {
  const optOut = useProgress().statsOptOut ?? false
  return (
    <div className="page help">
      <header className="browser-head">
        <button className="btn-ghost" onClick={() => nav('#/')} aria-label="Back">
          ←
        </button>
        <h2>Detective's Handbook</h2>
        <span />
      </header>
      <div className="help-body">
        <h3>The basics</h3>
        <p>
          Every case opens with a victim and four suspects — each with a reason to want them dead.
          Exactly one of them did it. Work the case, then name the killer.
        </p>
        <p>
          Most cases are word searches: drag across letters (in any direction the case allows) to
          select a word, or use the arrow keys and press Enter at the first and last letter. Find every
          word in the bank to clear the grid.
        </p>

        <h3>Word-search cases</h3>
        {WORD_SEARCH.map((m) => (
          <p key={m}>
            <strong>{MECHANIC_LABEL[m]}.</strong> {MECHANIC_HELP[m]}
          </p>
        ))}

        <h3>Puzzle cases</h3>
        {PUZZLES.map((m) => (
          <p key={m}>
            <strong>{MECHANIC_LABEL[m]}.</strong> {MECHANIC_HELP[m]}
          </p>
        ))}

        <h3>Rules of the house</h3>
        <p>
          Three hints per case. A wrong accusation costs you nothing but pride — it's counted as a false
          accusation. Solve in under two minutes for the lightning mark.
        </p>
        <p>
          A new daily case unlocks at midnight. Solve it every day to build your streak, then share your
          result — it never gives away the answer. Progress is saved on this device.
        </p>

        {statsConfigured() && (
          <>
            <h3>Anonymous daily stats</h3>
            <p>
              When you solve the daily case, your time, hints and false accusations are added to anonymous
              counters, so everyone can see how they compare. No names, accounts or IP addresses are stored.
            </p>
            <p>
              <button className="btn" onClick={() => setStatsOptOut(!optOut)} aria-pressed={!optOut}>
                {optOut ? 'Stats are off — turn on' : 'Stats are on — turn off'}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
