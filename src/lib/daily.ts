export function dateKey(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Deterministic daily case id in [1, 150] from the local date. */
export function dailyCaseId(d = new Date()): number {
  const k = dateKey(d)
  let h = 2166136261
  for (let i = 0; i < k.length; i++) {
    h ^= k.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return (Math.abs(h) % 150) + 1
}
