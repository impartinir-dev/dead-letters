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

  const endDrag = (e: React.PointerEvent) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    ref.current?.releasePointerCapture(e.pointerId)
    const a = anchorRef.current
    anchorRef.current = null

    const cells = selRef.current
    selRef.current = []
    setSel([])
    if (!a || cells.length < 2) return

    const str = cells.map((i) => grid[Math.floor(i / cols)][i % cols]).join('')
    const rev = str.split('').reverse().join('')
    if (bank.has(str)) onFound(str, cells)
    else if (bank.has(rev)) onFound(rev, [...cells].reverse())
    else if (cells.length >= 3 && !found.has(str) && !found.has(rev)) {
      setMissCells(new Set(cells))
      onMiss?.()
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
      role="grid"
      aria-label="Word search grid"
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
        {grid.flatMap((row, r) =>
          row.split('').map((ch, c) => {
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
            return (
              <div key={i} className={cls} aria-hidden>
                {ch}
              </div>
            )
          }),
        )}
      </div>
    </div>
  )
}
