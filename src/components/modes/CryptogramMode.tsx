import { useEffect, useMemo, useRef, useState } from 'react'
import type { CryptogramPayload } from '../../generator/types'
import type { ModeProps } from './types'
import { SuspectPicker } from '../Suspects'

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function CryptogramMode({ c, hintToken, setStatus, notify, onSolved, onWrong }: ModeProps) {
  const p = c.payload as CryptogramPayload & { kind: 'cryptogram' }
  const cipherLetters = useMemo(
    () => [...new Set(p.cipher.split('').filter((ch) => /[A-Z]/.test(ch)))],
    [p],
  )
  const [guesses, setGuesses] = useState<Record<string, string>>({ ...p.givens })
  const [sel, setSel] = useState<string | null>(cipherLetters[0] ?? null)
  const [wrongSet, setWrongSet] = useState<Set<string>>(new Set())
  const lastHint = useRef(0)
  const solvedRef = useRef(false)
  // once decoded, the note points at a suspect — the player still has to accuse
  const [decoded, setDecoded] = useState(false)
  const [picked, setPicked] = useState<string | null>(null)
  const [accused, setAccused] = useState<string | null>(null)

  const usedLetters = useMemo(() => new Set(Object.values(guesses)), [guesses])
  const givensSet = useMemo(() => new Set(Object.keys(p.givens)), [p])

  useEffect(() => {
    setStatus(`${Object.keys(guesses).length}/${cipherLetters.length} letters`)
  }, [guesses, cipherLetters.length, setStatus])

  const assign = (cipher: string, letter: string | null) => {
    setGuesses((g) => {
      const next = { ...g }
      if (letter === null) {
        if (!givensSet.has(cipher)) delete next[cipher]
      } else {
        // substitution is a bijection — a plaintext letter can't serve two cipher letters
        for (const k of Object.keys(next)) if (k !== cipher && next[k] === letter) delete next[k]
        next[cipher] = letter
      }
      return next
    })
    setWrongSet((w) => {
      const n = new Set(w)
      n.delete(cipher)
      return n
    })
  }

  // auto-evaluate when every cipher letter has a guess
  useEffect(() => {
    if (solvedRef.current) return
    if (!cipherLetters.every((cl) => guesses[cl])) return
    const wrong = new Set(cipherLetters.filter((cl) => guesses[cl] !== p.mapping[cl]))
    if (wrong.size === 0) {
      solvedRef.current = true
      setDecoded(true)
      notify('Decoded. Now — who does the note point to?')
    } else {
      setWrongSet(wrong)
      onWrong()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guesses])

  // hint: correctly assign one cipher letter
  useEffect(() => {
    if (hintToken === lastHint.current) return
    lastHint.current = hintToken
    const candidates = cipherLetters.filter((cl) => guesses[cl] !== p.mapping[cl])
    if (!candidates.length) return
    const cl = candidates[Math.floor(Math.random() * candidates.length)]
    setGuesses((g) => {
      const next = { ...g }
      for (const k of Object.keys(next)) if (k !== cl && next[k] === p.mapping[cl]) delete next[k]
      next[cl] = p.mapping[cl]
      return next
    })
    notify('The lab decoded one letter for you.')
  }, [hintToken, cipherLetters, guesses, p, notify])

  const tapCell = (cipher: string) => {
    setSel(cipher)
    if (!givensSet.has(cipher) && guesses[cipher]) assign(cipher, null)
  }

  const tapLetter = (letter: string) => {
    if (!sel || givensSet.has(sel)) return
    if (usedLetters.has(letter) && guesses[sel] !== letter) return
    assign(sel, letter)
    // advance to next unassigned cipher letter
    const next = cipherLetters.find((cl) => cl !== sel && !guesses[cl] && !givensSet.has(cl))
    if (next) setSel(next)
  }

  const accuse = () => {
    if (!picked) return
    setAccused(picked)
    if (picked === c.killer) onSolved()
    else onWrong()
  }

  if (decoded)
    return (
      <div className="mode cipher-mode solve-lineup">
        <p className="clue">“{p.phrase}”</p>
        <SuspectPicker
          suspects={c.suspects}
          picked={picked}
          onPick={setPicked}
          mark={accused ? { name: accused, right: accused === c.killer } : null}
        />
        <button className="btn btn-primary" disabled={!picked} onClick={accuse}>
          Accuse
        </button>
      </div>
    )

  return (
    <div className="mode cipher-mode">
      <p className="sheet-note">An encoded note was recovered. Crack the substitution cipher.</p>
      <div className="cipher-text">
        {p.cipher.split(' ').map((word, wi) => (
          <span key={wi} className="cipher-word">
            {word.split('').map((ch, i) => {
              const guess = guesses[ch]
              const cls = [
                'cipher-cell',
                sel === ch ? 'sel' : '',
                givensSet.has(ch) ? 'given' : '',
                wrongSet.has(ch) ? 'bad' : '',
                guesses[ch] && !givensSet.has(ch) ? 'guessed' : '',
              ]
                .filter(Boolean)
                .join(' ')
              return (
                <button key={i} className={cls} onClick={() => tapCell(ch)}>
                  <span className="cipher-guess">{guess ?? ''}</span>
                  <span className="cipher-char">{ch}</span>
                </button>
              )
            })}
          </span>
        ))}
      </div>
      <div className="alpha-tray">
        {ALPHABET.map((L) => (
          <button
            key={L}
            className="alpha-key"
            disabled={!sel || givensSet.has(sel) || (usedLetters.has(L) && guesses[sel] !== L)}
            onClick={() => tapLetter(L)}
          >
            {L}
          </button>
        ))}
      </div>
      <p className="dim center-note">
        {sel ? `Assigning letter ${sel} — same symbols decode the same way.` : 'Tap a letter.'}
      </p>
    </div>
  )
}
