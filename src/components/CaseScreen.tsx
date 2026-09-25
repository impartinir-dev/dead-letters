import { useEffect, useRef, useState } from 'react'
import type { CaseFile } from '../generator/types'
import { WORD_SEARCH_MECHANICS } from '../generator/types'
import { loadCase } from '../lib/data'
import { fmtTime, MECHANIC_LABEL } from '../lib/format'
import { dailyCaseId } from '../lib/daily'
import { recordSolve } from '../state/progress'
import WordSearchMode from './modes/WordSearchMode'
import CryptogramMode from './modes/CryptogramMode'
import DeductionMode from './modes/DeductionMode'
import InterrogationMode from './modes/InterrogationMode'
import TimelineMode from './modes/TimelineMode'
import SolvedOverlay from './SolvedOverlay'

export default function CaseScreen({ id, nav }: { id: number; nav: (h: string) => void }) {
  const [c, setCase] = useState<CaseFile | null>(null)
  const [hintsLeft, setHintsLeft] = useState(3)
  const [hintToken, setHintToken] = useState(0)
  const [toast, setToast] = useState<string | null>(null)
  const [status, setStatus] = useState('')
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

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 2600)
    return () => clearTimeout(t)
  }, [toast])

  const useHint = () => {
    if (!c || hintsLeft <= 0 || solved) return
    setHintsLeft((h) => h - 1)
    setHintToken((t) => t + 1)
  }

  const onSolved = () => {
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

  const modeProps = { c, hintToken, setStatus, notify: setToast, onSolved, onWrong }
  const isWS = WORD_SEARCH_MECHANICS.includes(c.mechanic)

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

      {isWS && <WordSearchMode {...modeProps} />}
      {c.mechanic === 'cryptogram' && <CryptogramMode {...modeProps} />}
      {c.mechanic === 'deduction' && <DeductionMode {...modeProps} />}
      {c.mechanic === 'interrogation' && <InterrogationMode {...modeProps} />}
      {c.mechanic === 'timeline' && <TimelineMode {...modeProps} />}

      {toast && <div className="toast">{toast}</div>}

      <footer className="case-foot">
        <button className="btn-ghost" onClick={useHint} disabled={hintsLeft <= 0}>
          HINT ×{hintsLeft}
        </button>
        <span className="found-count">{status}</span>
      </footer>

      {solved && (
        <SolvedOverlay c={c} seconds={solvedAt} hints={3 - hintsLeft} wrong={wrong} nav={nav} />
      )}
    </div>
  )
}
