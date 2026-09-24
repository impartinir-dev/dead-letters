import type { Placement } from './types'
import type { Rng } from './rng'

export const DIRS: Record<string, { dr: number; dc: number }> = {
  E: { dr: 0, dc: 1 },
  S: { dr: 1, dc: 0 },
  SE: { dr: 1, dc: 1 },
  W: { dr: 0, dc: -1 },
  N: { dr: -1, dc: 0 },
  SW: { dr: 1, dc: -1 },
  NE: { dr: -1, dc: 1 },
  NW: { dr: -1, dc: -1 },
}

export type Grid = (string | null)[][]

export function fits(len: number, r: number, c: number, dr: number, dc: number, rows: number, cols: number): boolean {
  const er = r + dr * (len - 1)
  const ec = c + dc * (len - 1)
  return er >= 0 && er < rows && ec >= 0 && ec < cols
}

export function canPlace(grid: Grid, word: string, r: number, c: number, dr: number, dc: number): boolean {
  for (let i = 0; i < word.length; i++) {
    const cell = grid[r + dr * i][c + dc * i]
    if (cell !== null && cell !== word[i]) return false
  }
  return true
}

export function put(grid: Grid, word: string, r: number, c: number, dr: number, dc: number) {
  for (let i = 0; i < word.length; i++) grid[r + dr * i][c + dc * i] = word[i]
}

/**
 * Try to place all `words` (returns null if any word can't be placed).
 * Words are placed longest-first; leftover cells stay null.
 */
export function placeWords(
  rng: Rng,
  words: string[],
  rows: number,
  cols: number,
  dirNames: string[],
): { grid: Grid; placements: Placement[] } | null {
  const grid: Grid = Array.from({ length: rows }, () => Array<string | null>(cols).fill(null))
  const placements: Placement[] = []
  const sorted = [...words].sort((a, b) => b.length - a.length)

  for (const word of sorted) {
    let placed = false
    for (let attempt = 0; attempt < 500 && !placed; attempt++) {
      const d = dirNames[Math.floor(rng() * dirNames.length)]
      const { dr, dc } = DIRS[d]
      const r = Math.floor(rng() * rows)
      const c = Math.floor(rng() * cols)
      if (!fits(word.length, r, c, dr, dc, rows, cols)) continue
      if (!canPlace(grid, word, r, c, dr, dc)) continue
      put(grid, word, r, c, dr, dc)
      placements.push({ word, r, c, d })
      placed = true
    }
    if (!placed) return null
  }
  return { grid, placements }
}

/** Indices (r*cols+c) of empty cells, row-major. */
export function leftoverCells(grid: Grid, cols: number): number[] {
  const out: number[] = []
  for (let r = 0; r < grid.length; r++)
    for (let c = 0; c < grid[r].length; c++)
      if (grid[r][c] === null) out.push(r * cols + c)
  return out
}

/** Cell indices covered by a placement. */
export function cellsOf(p: Placement, cols: number): number[] {
  const { dr, dc } = DIRS[p.d]
  const out: number[] = []
  for (let i = 0; i < p.word.length; i++) out.push((p.r + dr * i) * cols + (p.c + dc * i))
  return out
}

/** Write `message` into leftover cells (row-major); returns grid as row strings. */
export function finalizeGrid(grid: Grid, cols: number, cells: number[], message: string): string[] {
  for (let i = 0; i < cells.length; i++) {
    const r = Math.floor(cells[i] / cols)
    const c = cells[i] % cols
    grid[r][c] = message[i]
  }
  return grid.map((row) => row.join(''))
}
