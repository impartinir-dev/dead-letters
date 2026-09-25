import { useState } from 'react'
import type { CaseSuspect } from '../generator/types'

/** The case's cast, introduced before the puzzle. Collapsible to save room. */
export default function Suspects({ suspects }: { suspects: CaseSuspect[] }) {
  const [open, setOpen] = useState(true)
  return (
    <section className={`suspects ${open ? 'open' : ''}`}>
      <button className="suspects-toggle" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        SUSPECTS <span aria-hidden>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <ul className="suspects-list">
          {suspects.map((s) => (
            <li key={s.name}>
              <strong>{s.name}</strong> <span>— {s.hook}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/**
 * Tap-to-pick suspect cards used by accusation steps. `mark` colors the
 * accused card once a guess is made.
 */
export function SuspectPicker({
  suspects, picked, onPick, mark,
}: {
  suspects: CaseSuspect[]
  picked: string | null
  onPick: (name: string) => void
  mark?: { name: string; right: boolean } | null
}) {
  return (
    <div className="lineup">
      {suspects.map((s) => (
        <button
          key={s.name}
          className={[
            'suspect',
            picked === s.name ? 'picked' : '',
            mark?.name === s.name ? (mark.right ? 'right' : 'wrong') : '',
          ].join(' ')}
          onClick={() => onPick(s.name)}
        >
          <span className="suspect-name">{s.name}</span>
          <span className="suspect-hook">{s.hook}</span>
        </button>
      ))}
    </div>
  )
}
