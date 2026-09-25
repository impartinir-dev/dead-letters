import { useEffect, useMemo, useRef, useState } from 'react'
import { cellsOf } from '../../generator/grid'
import WordGrid from '../WordGrid'
import WordBank from '../WordBank'
import SolveSheet from '../SolveSheet'
import type { ModeProps } from './types'

const DIR_NAME: Record<string, string> = {
  E: 'east →', S: 'south ↓', SE: 'southeast ↘', W: 'west ←',
  N: 'north ↑', SW: 'southwest ↙', NE: 'northeast ↗', NW: 'northwest ↖',
}

export default function WordSearchMode({ c, hintToken, setStatus, notify, onSolved, onWrong }: ModeProps) {
  const [found, setFound] = useState<Map<string, number[]>>(new Map())
  const [flash, setFlash] = useState<Set<number> | null>(null)
  const [reveal, setReveal] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const lastHint = useRef(0)

  const allFound = found.size === c.words.length

  useEffect(() => {
    setStatus(`${found.size}/${c.words.length} words`)
  }, [found.size, c.words.length, setStatus])

  // auto-reveal leftover letters once the grid is cleared
  useEffect(() => {
    if (allFound && (c.mechanic === 'leftovers' || c.mechanic === 'lineup' || c.mechanic === 'anagram'))
      setReveal(true)
  }, [allFound, c.mechanic])

  // hints: flash the start cell of a random unfound word
  useEffect(() => {
    if (hintToken === lastHint.current) return
    lastHint.current = hintToken
    if (allFound) return
    const remaining = c.placements.filter((p) => !found.has(p.word))
    if (!remaining.length) return
    const p = remaining[Math.floor(Math.random() * remaining.length)]
    const cells = cellsOf(p, c.cols)
    setFlash(new Set([cells[0]]))
    notify(`A word begins at the flashing letter and runs ${DIR_NAME[p.d] ?? p.d}.`)
  }, [hintToken, allFound, c, found, notify])

  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 1600)
    return () => clearTimeout(t)
  }, [flash])

  const onFound = (word: string, cells: number[]) => {
    setFound((f) => new Map(f).set(word, cells))
    if (navigator.vibrate) navigator.vibrate(15)
    if (found.size + 1 === c.words.length) {
      const msg =
        c.mechanic === 'elimination'
          ? 'All words found — the evidence is in.'
          : c.mechanic === 'anagram'
            ? 'All words found — unscramble the confession.'
            : 'All words found — read the leftover letters.'
      notify(msg)
    }
  }

  const bank = useMemo(() => new Set(c.words.filter((w) => !found.has(w))), [c, found])
  const messageCells = useMemo(
    () => (reveal && 'messageCells' in c.payload ? new Set(c.payload.messageCells) : null),
    [c, reveal],
  )

  return (
    <>
      <WordGrid
        grid={c.grid}
        bank={bank}
        found={found}
        messageCells={messageCells}
        flash={flash}
        locked={false}
        onFound={onFound}
        onMiss={() => {
          if (navigator.vibrate) navigator.vibrate(40)
        }}
      />
      <WordBank words={c.words} found={new Set(found.keys())} />
      <div className="mode-foot">
        <span />
        <button className="btn btn-primary" onClick={() => setSheetOpen(true)}>
          SOLVE THE CASE
        </button>
      </div>
      <SolveSheet
        open={sheetOpen}
        c={c}
        allFound={allFound}
        found={new Set(found.keys())}
        onClose={() => setSheetOpen(false)}
        onCorrect={() => {
          setSheetOpen(false)
          onSolved()
        }}
        onWrong={onWrong}
      />
    </>
  )
}
