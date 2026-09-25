import { useEffect, useRef, useState } from 'react'
import type { DeductionPayload } from '../../generator/types'
import type { ModeProps } from './types'

export default function DeductionMode({ c, hintToken, setStatus, notify, onSolved, onWrong }: ModeProps) {
  const p = c.payload as DeductionPayload & { kind: 'deduction' }
  const [pickS, setPickS] = useState<string | null>(null)
  const [pickW, setPickW] = useState<string | null>(null)
  const [pickL, setPickL] = useState<string | null>(null)
  const [struck, setStruck] = useState<Set<string>>(new Set())
  const lastHint = useRef(0)

  const pickedCount = (pickS ? 1 : 0) + (pickW ? 1 : 0) + (pickL ? 1 : 0)
  useEffect(() => {
    setStatus(`${pickedCount}/3 chosen`)
  }, [pickedCount, setStatus])

  // hint: strike one wrong option
  useEffect(() => {
    if (hintToken === lastHint.current) return
    lastHint.current = hintToken
    const wrongs = [
      ...p.suspects.filter((s) => s !== c.killer),
      ...p.weapons.filter((w) => w !== c.weapon),
      ...p.locations.filter((l) => l !== c.location),
    ].filter((n) => !struck.has(n))
    if (!wrongs.length) return
    const w = wrongs[Math.floor(Math.random() * wrongs.length)]
    setStruck((s) => new Set(s).add(w))
    notify('Evidence rules one option out.')
  }, [hintToken, p, c, struck, notify])

  const strike = (n: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setStruck((s) => {
      const next = new Set(s)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  }

  const col = (
    title: string,
    items: string[],
    sel: string | null,
    setSel: (v: string) => void,
  ) => (
    <div className="elim-col">
      <h4>{title}</h4>
      {items.map((name) => (
        <button
          key={name}
          className={`elim-item ded ${sel === name ? 'picked' : ''} ${struck.has(name) ? 'cleared' : ''}`}
          onClick={() => setSel(name)}
        >
          <span className="ded-x" onClick={(e) => strike(name, e)}>
            ✕
          </span>
          {name}
        </button>
      ))}
    </div>
  )

  const submit = () => {
    if (pickS === c.killer && pickW === c.weapon && pickL === c.location) onSolved()
    else onWrong()
  }

  return (
    <div className="mode ded-mode">
      <p className="sheet-note">Work the clues. Name the killer, the weapon, and the scene.</p>
      <div className="evidence">
        {p.clues.map((cl, i) => (
          <p key={i} className="evidence-card">
            {cl.text}
          </p>
        ))}
      </div>
      <div className="elim-cols">
        {col('SUSPECT', p.suspects, pickS, setPickS)}
        {col('WEAPON', p.weapons, pickW, setPickW)}
        {col('LOCATION', p.locations, pickL, setPickL)}
      </div>
      <button className="btn btn-primary wide" disabled={pickedCount < 3} onClick={submit}>
        Make the accusation
      </button>
    </div>
  )
}
