export type Rng = () => number

/** Deterministic PRNG (mulberry32). */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Combine a base seed with a case id and attempt counter. */
export function seedFor(caseId: number, attempt = 0): number {
  let h = 0x9e3779b9 ^ Math.imul(caseId, 0x85ebca6b) ^ Math.imul(attempt + 1, 0xc2b2ae35)
  h ^= h >>> 16
  h = Math.imul(h, 0x27d4eb2f)
  h ^= h >>> 15
  return h >>> 0
}

export function pick<T>(rng: Rng, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)]
}

export function shuffle<T>(rng: Rng, arr: readonly T[]): T[] {
  const out = arr.slice()
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function pickN<T>(rng: Rng, arr: readonly T[], n: number): T[] {
  return shuffle(rng, arr).slice(0, Math.min(n, arr.length))
}

/** inclusive integer in [lo, hi] */
export function int(rng: Rng, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}

export function chance(rng: Rng, p: number): boolean {
  return rng() < p
}
