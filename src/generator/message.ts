import type { Rng } from './rng'
import { PAD_WORDS } from './pools'
import { pick, shuffle } from './rng'

/**
 * Pad `rest` characters with thematic pad words, always hitting the exact
 * length (single-letter "signature" mops up remainders < 3).
 */
export function padTo(rng: Rng, rest: number): string {
  let out = ''
  while (rest >= 3) {
    const candidates = PAD_WORDS.filter((w) => w.length <= rest)
    const w = pick(rng, candidates)
    out += w
    rest -= w.length
  }
  if (rest === 1) out += 'X'
  else if (rest === 2) out += 'XX'
  return out
}

/**
 * Given candidate core messages, return the first (shuffled order) that fits
 * `L` letters, padded to exactly `L`. Null if none fit.
 */
export function fitMessage(rng: Rng, cores: string[], L: number): string | null {
  for (const core of shuffle(rng, cores)) {
    if (core.length <= L) return core + padTo(rng, L - core.length)
  }
  return null
}
