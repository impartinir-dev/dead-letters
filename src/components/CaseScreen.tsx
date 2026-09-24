import { useEffect, useMemo, useRef, useState } from 'react'
import type { CaseFile } from '../generator/types'
import { loadCase } from '../lib/data'
import { fmtTime, MECHANIC_LABEL } from '../lib/format'
import { dailyCaseId } from '../lib/daily'
import { recordSolve } from '../state/progress'
import { cellsOf } from '../generator/grid'
import WordGrid from './WordGrid'
import WordBank from './WordBank'
import SolveSheet from './SolveSheet'
import SolvedOverlay from './SolvedOverlay'

const DIR_NAME: Record<string, string> = {
  E: 'east →', S: 'south ↓', SE: 'southeast ↘', W: 'west ←',
  N: 'north ↑', SW: 'southwest ↙', NE: 'northeast ↗', NW: 'northwest ↖',
}

export default function CaseScreen({ id, nav }: { id: number; nav: (h: string) => void }) {
  const [c, setCase] = useState<CaseFile | null>(null)
  const [found, setFound] = useState<Map<string, number[]>>(new Map())
  const [hintsLeft, setHintsLeft] = useState(3)
  const [flash, setFlash] = useState<Set<number> | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [reveal, setReveal] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [wrong, setWrong] = useState(0)
  const [solvedAt, setSolvedAt] = useState<number | null>(null)
  const [shakeWrong, setShakeWrong] = useState(false)

  // ---- timer (pauses when tab hidden) ----
  const startRef = useRef(0)
  const pausedAccum = useRef(0)
  const hiddenAt = useRef(0)
  const [elapsed, setElapsed] = useState(0)
  const solved = solvedAt !== null

  useEffect(() => {
    let alive = true
    setCase(null)
    loadCase(id).then((loaded) => {
      if (!alive) return
      setCase(loaded)
      startRef.current = Date.now()
    })
    return () => {
      alive = false
    }
  }, [id])

  useEffect(() => {
    if (!c || solved) return
    const t = setInterval(() => {
      if (document.hidden) return
      setElapsed((Date.now() - startRef.current - pausedAccum.current) / 1000)
    }, 250)
    const onVis = () => {
      if (document.hidden) hiddenAt.current = Date.now()
      else pausedAccum.current += Date.now() - hiddenAt.current
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [c, solved])

  // auto-clear toast
  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  // auto-clear flash
  useEffect(() => {
    if (!flash) return
    const t = setTimeout(() => setFlash(null), 1600)
    return () => clearTimeout(t)
  }, [flash])

  const allFound = c ? found.size === c.words.length : false

  // auto-reveal leftover letters once the grid is cleared
  useEffect(() => {
    if (allFound && c && (c.mechanic === 'leftovers' || c.mechanic === 'lineup' || c.mechanic === 'anagram'))
      setReveal(true)
  }, [allFound, c])

  const bank = useMemo(() => new Set(c ? c.words.filter((w) => !found.has(w)) : []), [c, found])
  const messageCells = useMemo(
    () => (c && reveal ? new Set(c.payload.messageCells) : null),
    [c, reveal],
  )

  const onFound = (word: string, cells: number[]) => {
    setFound((f) => new Map(f).set(word, cells))
    if (navigator.vibrate) navigator.vibrate(15)
    if (c && found.size + 1 === c.words.length) {
      const msg =
        c.mechanic === 'elimination'
          ? 'All words found — the evidence is in.'
          : c.mechanic === 'anagram'
            ? 'All words found — unscramble the confession.'
            : 'All words found — read the leftover letters.'
      setToast(msg)
    }
  }

  const useHint = () => {
    if (!c || hintsLeft <= 0 || solved) return
    const remaining = c.placements.filter((p) => !found.has(p.word))
    if (!remaining.length) return
    const p = remaining[Math.floor(Math.random() * remaining.length)]
    const cells = cellsOf(p, c.cols)
    setFlash(new Set([cells[0]]))
    setHintsLeft((h) => h - 1)
    setToast(`A word begins at the flashing letter and runs ${DIR_NAME[p.d] ?? p.d}.`)
  }

  const onCorrect = () => {
    if (!c || solved) return
    const seconds = Math.max(1, Math.round(elapsed))
    setSolvedAt(seconds)
    recordSolve(c.id, { seconds, hints: 3 - hintsLeft, wrong, challenge: seconds <= 120 }, c.id === dailyCaseId())
    if (navigator.vibrate) navigator.vibrate([30, 60, 30])
  }

  const onWrong = () => {
    setWrong((w) => w + 1)
    setShakeWrong(true)
    setTimeout(() => setShakeWrong(false), 500)
    if (navigator.vibrate) navigator.vibrate(80)
  }

  if (!c)
    return (
      <div className="page center">
        <p className="loading">Opening case file…</p>
      </div>
    )

  return (
    <div className={`page case-page ${shakeWrong ? 'shake' : ''}`}>
      <header className="case-head">
        <button className="btn-ghost" onClick={() => nav('#/cases')} aria-label="Back to case files">
          ←
        </button>
        <div className="case-head-title">
          <span className="case-no">CASE No. {c.id}</span>
          <h2>{c.title}</h2>
        </div>
        <span className="timer-chip">{fmtTime(elapsed)}</span>
      </header>

      <p className="flavor">{c.flavor}</p>
      <p className="mech-tag">{MECHANIC_LABEL[c.mechanic]}</p>

      <WordGrid
        grid={c.grid}
        bank={bank}
        found={found}
        messageCells={messageCells}
        flash={flash}
        locked={solved}
        onFound={onFound}
        onMiss={() => {
          if (navigator.vibrate) navigator.vibrate(40)
        }}
      />

      <WordBank words={c.words} found={new Set(found.keys())} />

      {toast && <div className="toast">{toast}</div>}

      <footer className="case-foot">
        <button className="btn-ghost" onClick={useHint} disabled={hintsLeft <= 0 || allFound}>
          HINT ×{hintsLeft}
        </button>
        <span className="found-count">
          {found.size}/{c.words.length} words
        </span>
        <button className="btn btn-primary" onClick={() => setSheetOpen(true)}>
          SOLVE
        </button>
      </footer>

      <SolveSheet
        open={sheetOpen}
        c={c}
        allFound={allFound}
        found={new Set(found.keys())}
        onClose={() => setSheetOpen(false)}
        onCorrect={() => {
          setSheetOpen(false)
          onCorrect()
        }}
        onWrong={onWrong}
      />

      {solved && (
        <SolvedOverlay
          c={c}
          seconds={solvedAt}
          hints={3 - hintsLeft}
          wrong={wrong}
          nav={nav}
        />
      )}
    </div>
  )
}
