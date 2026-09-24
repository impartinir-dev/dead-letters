import { MECHANIC_HELP } from '../lib/format'

export default function HelpModal({ nav }: { nav: (h: string) => void }) {
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
          Every case is a word search. Drag across letters — in any direction the case allows — to
          select a word. Find every word in the bank to clear the grid.
        </p>
        <p>
          Then solve the murder. Each case ends one of four ways:
        </p>
        <h3>Dead letter</h3>
        <p>{MECHANIC_HELP.leftovers}</p>
        <h3>Suspect lineup</h3>
        <p>{MECHANIC_HELP.lineup}</p>
        <h3>Deduction</h3>
        <p>{MECHANIC_HELP.elimination}</p>
        <h3>Confession</h3>
        <p>{MECHANIC_HELP.anagram}</p>
        <h3>Rules of the house</h3>
        <p>
          Three hints per case. Solve in under two minutes for the lightning mark. A new daily case
          keeps your streak alive. Progress is saved on this device.
        </p>
      </div>
    </div>
  )
}
