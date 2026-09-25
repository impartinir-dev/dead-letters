import type { Rng } from './rng'
import { PAD_PHRASES } from './pools'
import { shuffle } from './rng'

export const squash = (s: string) => s.toUpperCase().replace(/[^A-Z]/g, '')

/**
 * Depth-first search for a sequence of distinct `items` whose lengths sum to
 * exactly `rest`. Items are tried in the given order, so callers put the
 * phrases they'd rather see first. Null if no exact fill exists within budget.
 */
export function exactFill<T>(rest: number, items: T[], len: (t: T) => number, budget = 4000): T[] | null {
  let nodes = 0
  const used = new Set<number>()
  const go = (left: number): T[] | null => {
    if (left === 0) return []
    if (++nodes > budget) return null
    for (let i = 0; i < items.length; i++) {
      if (used.has(i)) continue
      const n = len(items[i])
      if (n > left) continue
      used.add(i)
      const tail = go(left - n)
      used.delete(i)
      if (tail) return [items[i], ...tail]
    }
    return null
  }
  return go(rest)
}

/** A message is clean when it names nothing it shouldn't and has no filler. */
export function cleanMessage(message: string, forbidden: string[]): boolean {
  return !/XX|QED/.test(message) && !forbidden.some((f) => f && message.includes(f))
}

/**
 * Pad `rest` letters with in-world phrases — the theme's own first, then the
 * shared bank (short ones last). Phrases containing a forbidden term are
 * skipped. Returns the squashed pieces, or null when no exact fill exists.
 */
export function padTo(rng: Rng, rest: number, themePhrases: string[], forbidden: string[]): string[] | null {
  const ok = (p: string) => !forbidden.some((f) => p.includes(f))
  const themed = shuffle(rng, themePhrases.map(squash).filter(ok))
  const shared = PAD_PHRASES.map(squash).filter(ok)
  const long = shuffle(rng, shared.filter((p) => p.length > 6))
  const short = shuffle(rng, shared.filter((p) => p.length <= 6))
  return exactFill(rest, [...themed, ...long, ...short], (p) => p.length)
}

/** Lower is better: few pieces, few one-word fillers, themed phrases welcome. */
function padScore(pieces: string[], themePhrases: string[]): number {
  const themed = new Set(themePhrases.map(squash))
  return pieces.reduce((n, p) => n + (p.length <= 6 ? 3 : 1) - (themed.has(p) ? 1 : 0), 0)
}

/**
 * Given candidate core messages, pad each to exactly `L` letters (no
 * forbidden term, no filler) and return the best-reading result, preferring
 * cores that need little or no padding. Null if none fit.
 */
export function fitMessage(
  rng: Rng, cores: string[], L: number, themePhrases: string[], forbidden: string[],
): { message: string; core: string } | null {
  let best: { message: string; core: string; score: number } | null = null
  for (const core of shuffle(rng, cores)) {
    if (core.length > L) continue
    for (let t = 0; t < 3; t++) {
      const pieces = padTo(rng, L - core.length, themePhrases, forbidden)
      if (pieces === null) break
      const message = core + pieces.join('')
      const score = padScore(pieces, themePhrases)
      if (cleanMessage(message, forbidden) && (!best || score < best.score))
        best = { message, core, score }
      if (!pieces.length) break
    }
  }
  return best && { message: best.message, core: best.core }
}
