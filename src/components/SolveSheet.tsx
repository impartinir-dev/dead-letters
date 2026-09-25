import { useMemo, useState } from 'react'
import type { CaseFile, EliminationPayload, LineupPayload } from '../generator/types'
import { TRAIT_LABEL } from '../generator/pools'
import { SuspectPicker } from './Suspects'

const squash = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '')

interface PanelProps {
  c: CaseFile
  allFound: boolean
  found: Set<string>
  onCorrect: () => void
  onWrong: () => void
}

/* ------------------------------ leftovers ------------------------------ */

const BLANK_LABEL: Record<string, string> = { weapon: 'THE WEAPON', location: 'THE LOCATION' }

function LeftoversPanel({ c, allFound, onCorrect, onWrong }: PanelProps) {
  const p = c.payload as Extract<CaseFile['payload'], { kind: 'leftovers' }>
  const [vals, setVals] = useState<Record<string, string>>({})
  const [accused, setAccused] = useState<string | null>(null)
  const [wrong, setWrong] = useState<Set<string>>(new Set())
  const typed = p.blanks.filter((b) => b !== 'killer')

  if (!allFound)
    return <p className="sheet-note">Find every word in the bank — the leftover letters will spell out the truth.</p>

  const submit = () => {
    const bad = new Set<string>()
    if (accused !== c.killer) bad.add('killer')
    for (const b of typed) {
      const v = squash(vals[b] ?? '')
      if (v !== squash(b === 'weapon' ? c.weapon : c.location)) bad.add(b)
    }
    if (bad.size) {
      setWrong(bad)
      onWrong()
    } else onCorrect()
  }

  return (
    <div className="solve-leftovers">
      <p className="sheet-note">The leftover letters point to one of the suspects. Who did it?</p>
      <SuspectPicker
        suspects={c.suspects}
        picked={accused}
        onPick={(n) => {
          setAccused(n)
          setWrong((w) => {
            const next = new Set(w)
            next.delete('killer')
            return next
          })
        }}
        mark={wrong.has('killer') && accused ? { name: accused, right: false } : null}
      />
      {typed.map((b) => (
        <label key={b} className={`blank-row ${wrong.has(b) ? 'bad' : ''}`}>
          <span>{BLANK_LABEL[b]}</span>
          <input
            value={vals[b] ?? ''}
            onChange={(e) => {
              setVals({ ...vals, [b]: e.target.value })
              setWrong((w) => {
                const n = new Set(w)
                n.delete(b)
                return n
              })
            }}
            placeholder="…………"
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            enterKeyHint="done"
          />
        </label>
      ))}
      <button className="btn btn-primary" disabled={!accused} onClick={submit}>
        Close the case
      </button>
    </div>
  )
}

/* -------------------------------- lineup ------------------------------- */

function LineupPanel({ c, allFound, onCorrect, onWrong }: PanelProps) {
  const p = c.payload as LineupPayload & { kind: 'lineup' }
  const [picked, setPicked] = useState<number | null>(null)
  const [accused, setAccused] = useState<number | null>(null)

  if (!allFound)
    return <p className="sheet-note">Find every word — the leftover letters reveal who did it.</p>

  const accuse = () => {
    if (picked === null) return
    setAccused(picked)
    if (p.suspects[picked].name === c.killer) onCorrect()
    else onWrong()
  }

  return (
    <div className="solve-lineup">
      <p className="clue">“{p.clueText}”</p>
      <div className="lineup">
        {p.suspects.map((s, i) => (
          <button
            key={i}
            className={[
              'suspect',
              picked === i ? 'picked' : '',
              accused === i ? (s.name === c.killer ? 'right' : 'wrong') : '',
            ].join(' ')}
            onClick={() => setPicked(i)}
          >
            <span className="suspect-name">{s.name}</span>
            <span className="suspect-hook">{c.suspects.find((x) => x.name === s.name)?.hook}</span>
            <span className="suspect-traits">
              {(Object.keys(s.traits) as Array<keyof typeof s.traits>).map((d) => (
                <em key={d}>{TRAIT_LABEL[d][s.traits[d]]}</em>
              ))}
            </span>
          </button>
        ))}
      </div>
      <button className="btn btn-primary" disabled={picked === null} onClick={accuse}>
        Accuse
      </button>
    </div>
  )
}

/* ----------------------------- elimination ----------------------------- */

function EliminationPanel({ c, found, onCorrect, onWrong }: PanelProps) {
  const p = c.payload as EliminationPayload & { kind: 'elimination' }
  const [pickS, setPickS] = useState<string | null>(null)
  const [pickW, setPickW] = useState<string | null>(null)
  const [pickL, setPickL] = useState<string | null>(null)

  // evidence revealed so far: eliminations tied to found words
  const revealed = useMemo(() => p.eliminations.filter((e) => found.has(e.word)), [p, found])
  const clearedSet = useMemo(() => {
    const s = new Set<string>()
    for (const e of revealed) s.add(`${e.kind}:${e.item}`)
    return s
  }, [revealed])

  const col = (
    title: string,
    kind: 'suspect' | 'weapon' | 'location',
    items: EliminationPayload['suspects'],
    sel: string | null,
    setSel: (v: string) => void,
  ) => (
    <div className="elim-col">
      <h4>{title}</h4>
      {items.map((it) => {
        const cleared = clearedSet.has(`${kind}:${it.name}`)
        return (
          <button
            key={it.name}
            className={`elim-item ${cleared ? 'cleared' : ''} ${sel === it.name ? 'picked' : ''}`}
            disabled={cleared}
            onClick={() => setSel(it.name)}
          >
            {it.name}
          </button>
        )
      })}
    </div>
  )

  const submit = () => {
    if (pickS === c.killer && pickW === c.weapon && pickL === c.location) onCorrect()
    else onWrong()
  }

  return (
    <div className="solve-elim">
      <div className="elim-cols">
        {col('SUSPECT', 'suspect', p.suspects, pickS, setPickS)}
        {col('WEAPON', 'weapon', p.weapons, pickW, setPickW)}
        {col('LOCATION', 'location', p.locations, pickL, setPickL)}
      </div>
      <div className="evidence">
        <h4>EVIDENCE</h4>
        {revealed.length === 0 && <p className="dim">Find words to uncover evidence.</p>}
        {revealed.map((e, i) => (
          <p key={i} className="evidence-card">
            {e.note}
          </p>
        ))}
      </div>
      <button className="btn btn-primary" disabled={!(pickS && pickW && pickL)} onClick={submit}>
        Make the accusation
      </button>
    </div>
  )
}

/* ------------------------------- anagram ------------------------------- */

function AnagramPanel({ c, allFound, onCorrect, onWrong }: PanelProps) {
  const p = c.payload as Extract<CaseFile['payload'], { kind: 'anagram' }>
  const target = p.phrase.replace(/ /g, '')
  const tileChars = useMemo(() => p.tiles.split('').map((ch, i) => ({ id: i, ch })), [p])
  // slots: which tile id sits in each position (null = empty)
  const [slots, setSlots] = useState<(number | null)[]>(() => Array(target.length).fill(null))

  if (!allFound)
    return <p className="sheet-note">Find every word — the leftover letters form a confession.</p>

  const usedIds = new Set(slots.filter((s) => s !== null))

  const tapTile = (id: number) => {
    const i = slots.indexOf(null)
    if (i === -1) return
    const next = slots.slice()
    next[i] = id
    setSlots(next)
  }
  const tapSlot = (i: number) => {
    if (slots[i] === null) return
    const next = slots.slice()
    next[i] = null
    setSlots(next)
  }

  const submit = () => {
    if (slots.some((s) => s === null)) return
    const attempt = slots.map((s) => tileChars[s as number].ch).join('')
    if (attempt === target) onCorrect()
    else onWrong()
  }

  // render slot boxes grouped by word
  let pos = 0
  const wordGroups = p.phrase.split(' ').map((w) => {
    const idxs = Array.from({ length: w.length }, (_, k) => pos + k)
    pos += w.length
    return idxs
  })

  return (
    <div className="solve-anagram">
      <p className="sheet-note">The leftover letters are a scrambled confession. Arrange the tiles.</p>
      <div className="anagram-slots">
        {wordGroups.map((idxs, wi) => (
          <span key={wi} className="anagram-word">
            {idxs.map((i) => (
              <button
                key={i}
                className={`tile slot ${slots[i] !== null ? 'filled' : ''}`}
                onClick={() => tapSlot(i)}
              >
                {slots[i] !== null ? tileChars[slots[i] as number].ch : ''}
              </button>
            ))}
          </span>
        ))}
      </div>
      <div className="anagram-pool">
        {tileChars.map((t) => (
          <button
            key={t.id}
            className="tile"
            disabled={usedIds.has(t.id)}
            onClick={() => tapTile(t.id)}
          >
            {t.ch}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" disabled={slots.some((s) => s === null)} onClick={submit}>
        Read the confession
      </button>
    </div>
  )
}

/* -------------------------------- sheet -------------------------------- */

export default function SolveSheet({
  open, c, allFound, found, onClose, onCorrect, onWrong,
}: PanelProps & { open: boolean; onClose: () => void }) {
  const props: PanelProps = { c, allFound, found, onCorrect, onWrong }
  return (
    <div className={`sheet-backdrop ${open ? 'open' : ''}`} onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-grab" />
        <h3 className="sheet-title">Solve the Case</h3>
        {c.mechanic === 'leftovers' && <LeftoversPanel {...props} />}
        {c.mechanic === 'lineup' && <LineupPanel {...props} />}
        {c.mechanic === 'elimination' && <EliminationPanel {...props} />}
        {c.mechanic === 'anagram' && <AnagramPanel {...props} />}
      </div>
    </div>
  )
}
