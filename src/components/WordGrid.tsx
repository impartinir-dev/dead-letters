import { useRef, useState, useCallback, useEffect } from 'react'

const VEC = [
  { dr: 0, dc: 1 },   // E
  { dr: 1, dc: 1 },   // SE
  { dr: 1, dc: 0 },   // S
  { dr: 1, dc: -1 },  // SW
  { dr: 0, dc: -1 },  // W
  { dr: -1, dc: -1 }, // NW
  { dr: -1, dc: 0 },  // N
  { dr: -1, dc: 1 },  // NE
]

const STREAK_COLORS = ['#b3402f', '#1f5a5a', '#8a6508', '#4a3b6b', '#3f6b3a', '#7a1f5c']

interface Cell {
  r: number
  c: number
}

export interface WordGridProps {
  grid: string[]
  bank: Set<string> // unfound words, uppercase
  found: Map<string, number[]>
  messageCells: Set<number> | null
  flash: Set<number> | null
  locked: boolean
  onFound: (word: string, cells: number[]) => void
  onMiss?: () => void
}

function maxSteps(a: Cell, v: { dr: number; dc: number }, rows: number, cols: number): number {
  let n = 0
  for (;;) {
    const r = a.r + v.dr * (n + 1)
    const c = a.c + v.dc * (n + 1)
    if (r < 0 || r >= rows || c < 0 || c >= cols) break
    n++
  }
  return n
}

export default function WordGrid({
  grid, bank, found, messageCells, flash, locked, onFound, onMiss,
}: WordGridProps) {
  const rows = grid.length
  const cols = grid[0].length
  const ref = useRef<HTMLDivElement>(null)
  const [sel, setSel] = useState<number[]>([])
  const [missCells, setMissCells] = useState<Set<number> | null>(null)
  const anchorRef = useRef<Cell | null>(null)
  const draggingRef = useRef(false)
  const selRef = useRef<number[]>([])
  // keyboard: roving focus cursor + optional selection anchor
  const [cursor, setCursor] = useState<Cell>({ r: 0, c: 0 })
  const [keyAnchor, setKeyAnchor] = useState<Cell | null>(null)
  const [announce, setAnnounce] = useState('')
  const cellRefs = useRef<(HTMLDivElement | null)[]>([])

  const cellFromEvent = useCallback(
    (e: React.PointerEvent): Cell | null => {
      const el = ref.current
      if (!el) return null
      const rect = el.getBoundingClientRect()
      const c = Math.min(cols - 1, Math.max(0, Math.floor(((e.clientX - rect.left) / rect.width) * cols)))
      const r = Math.min(rows - 1, Math.max(0, Math.floor(((e.clientY - rect.top) / rect.height) * rows)))
      return { r, c }
    },
    [rows, cols],
  )

  const cellsBetween = useCallback(
    (a: Cell, b: Cell): number[] => {
      const dr = b.r - a.r
      const dc = b.c - a.c
      if (dr === 0 && dc === 0) return [a.r * cols + a.c]
      const sector = ((Math.round(Math.atan2(dr, dc) / (Math.PI / 4)) % 8) + 8) % 8
      const v = VEC[sector]
      // project drag vector onto the snapped direction (normalize for diagonals)
      let steps = Math.round((dr * v.dr + dc * v.dc) / (v.dr * v.dr + v.dc * v.dc))
      steps = Math.max(0, Math.min(steps, maxSteps(a, v, rows, cols)))
      const out: number[] = []
      for (let i = 0; i <= steps; i++) out.push((a.r + v.dr * i) * cols + (a.c + v.dc * i))
      return out
    },
    [rows, cols],
  )

  const onPointerDown = (e: React.PointerEvent) => {
    if (locked) return
    const cell = cellFromEvent(e)
    if (!cell) return
    e.preventDefault()
    ref.current?.setPointerCapture(e.pointerId)
    draggingRef.current = true
    anchorRef.current = cell
    selRef.current = [cell.r * cols + cell.c]
    setSel(selRef.current)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !anchorRef.current) return
    const cell = cellFromEvent(e)
    if (!cell) return
    const cells = cellsBetween(anchorRef.current, cell)
    selRef.current = cells
    setSel(cells)
  }

  const letterAt = (i: number) => grid[Math.floor(i / cols)][i % cols]

  /** Check a finished selection against the bank (either reading direction). */
  const commit = (cells: number[]): string | null => {
    if (cells.length < 2) return null
    const str = cells.map(letterAt).join('')
    const rev = str.split('').reverse().join('')
    if (bank.has(str)) {
      onFound(str, cells)
      return str
    }
    if (bank.has(rev)) {
      onFound(rev, [...cells].reverse())
      return rev
    }
    if (cells.length >= 3 && !found.has(str) && !found.has(rev)) {
      setMissCells(new Set(cells))
      onMiss?.()
    }
    return null
  }

  const endDrag = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    ref.current?.releasePointerCapture(e.pointerId)
    const a = anchorRef.current
    anchorRef.current = null

    const cells = selRef.current
    selRef.current = []
    setSel([])
    if (a) commit(cells)
  }

  /* keyboard: arrows move, Enter/Space starts then ends a selection, Esc cancels */
  const moveTo = (cell: Cell) => {
    setCursor(cell)
    cellRefs.current[cell.r * cols + cell.c]?.focus()
    if (keyAnchor) setSel(cellsBetween(keyAnchor, cell))
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (locked) return
    const { r, c } = cursor
    const clamp = (v: number, n: number) => Math.min(n - 1, Math.max(0, v))
    const moves: Record<string, Cell> = {
      ArrowUp: { r: clamp(r - 1, rows), c },
      ArrowDown: { r: clamp(r + 1, rows), c },
      ArrowLeft: { r, c: clamp(c - 1, cols) },
      ArrowRight: { r, c: clamp(c + 1, cols) },
      Home: { r, c: 0 },
      End: { r, c: cols - 1 },
    }
    if (moves[e.key]) {
      e.preventDefault()
      moveTo(moves[e.key])
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (!keyAnchor) {
        setKeyAnchor(cursor)
        setSel([r * cols + c])
        setAnnounce(`Selection started at ${grid[r][c]}. Move to the last letter and press Enter.`)
      } else {
        const cells = cellsBetween(keyAnchor, cursor)
        setKeyAnchor(null)
        setSel([])
        const word = commit(cells)
        setAnnounce(word ? `Found ${word}.` : `${cells.map(letterAt).join('')} is not in the word bank.`)
      }
    } else if (e.key === 'Escape' && keyAnchor) {
      setKeyAnchor(null)
      setSel([])
      setAnnounce('Selection cancelled.')
    }
  }

  useEffect(() => {
    if (!missCells) return
    const t = setTimeout(() => setMissCells(null), 380)
    return () => clearTimeout(t)
  }, [missCells])

  const selSet = new Set(sel)
  const foundCells = new Set<number>()
  for (const cells of found.values()) for (const i of cells) foundCells.add(i)

  const streaks = [...found.values()].map((cells, i) => ({
    cells,
    color: STREAK_COLORS[i % STREAK_COLORS.length],
  }))

  return (
    <div
      ref={ref}
      className="wgrid"
      style={{ ['--cols' as string]: cols, touchAction: 'none' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
      role="grid"
      aria-label="Word search grid. Use arrow keys to move, Enter to start and end a selection, Escape to cancel."
      aria-rowcount={rows}
      aria-colcount={cols}
    >
      <svg className="wgrid-streaks" viewBox={`0 0 ${cols} ${rows}`} preserveAspectRatio="none" aria-hidden>
        {streaks.map(({ cells, color }, i) => (
          <line
            key={i}
            x1={(cells[0] % cols) + 0.5}
            y1={Math.floor(cells[0] / cols) + 0.5}
            x2={(cells[cells.length - 1] % cols) + 0.5}
            y2={Math.floor(cells[cells.length - 1] / cols) + 0.5}
            stroke={color}
            strokeWidth={0.72}
            strokeLinecap="round"
            opacity={0.42}
          />
        ))}
        {sel.length > 1 && (
          <line
            x1={(sel[0] % cols) + 0.5}
            y1={Math.floor(sel[0] / cols) + 0.5}
            x2={(sel[sel.length - 1] % cols) + 0.5}
            y2={Math.floor(sel[sel.length - 1] / cols) + 0.5}
            stroke="#7a1f1f"
            strokeWidth={0.72}
            strokeLinecap="round"
            opacity={0.35}
          />
        )}
      </svg>
      <div className="wgrid-cells">
        {grid.map((row, r) => (
          <div key={r} role="row" className="wgrid-row">
            {row.split('').map((ch, c) => {
              const i = r * cols + c
              const cls = [
                'wcell',
                selSet.has(i) ? 'sel' : '',
                foundCells.has(i) ? 'found' : '',
                missCells?.has(i) ? 'miss' : '',
                messageCells?.has(i) ? 'msg' : '',
                flash?.has(i) ? 'flash' : '',
              ]
                .filter(Boolean)
                .join(' ')
              const state = [
                keyAnchor && keyAnchor.r === r && keyAnchor.c === c ? 'selection start' : '',
                foundCells.has(i) ? 'part of a found word' : '',
                messageCells?.has(i) ? 'leftover letter' : '',
              ].filter(Boolean)
              return (
                <div
                  key={i}
                  ref={(el) => {
                    cellRefs.current[i] = el
                  }}
                  className={cls}
                  role="gridcell"
                  tabIndex={cursor.r === r && cursor.c === c ? 0 : -1}
                  aria-selected={selSet.has(i)}
                  aria-label={`${ch}, row ${r + 1}, column ${c + 1}${state.length ? `, ${state.join(', ')}` : ''}`}
                  onFocus={() => setCursor({ r, c })}
                >
                  {ch}
                </div>
              )
            })}
          </div>
        ))}
      </div>
      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </div>
  )
}
