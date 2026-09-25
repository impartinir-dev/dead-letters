import { describe, it, expect } from 'vitest'
import { handle, type Deps } from '../worker/src/handler.ts'
import {
  bucketOf, parseSolve, dailyWindow, summarize,
  OVERFLOW_BUCKET, type DailyCounts, type Store,
} from '../worker/src/stats.ts'

class MemoryStore implements Store {
  days = new Map<number, DailyCounts>()
  async addSolve(daily: number, bucket: number, flawless: boolean) {
    const c = this.days.get(daily) ?? { daily, solves: 0, flawless: 0, buckets: new Map() }
    c.solves++
    if (flawless) c.flawless++
    c.buckets.set(bucket, (c.buckets.get(bucket) ?? 0) + 1)
    this.days.set(daily, c)
  }
  async read(daily: number) {
    const c = this.days.get(daily)
    return c ? { ...c, buckets: new Map(c.buckets) } : { daily, solves: 0, flawless: 0, buckets: new Map() }
  }
}

const SITE = 'https://impartinir-dev.github.io'
const LAUNCH = '2026-10-01'
// noon UTC on launch day + 9 → today's daily is #10
const NOW = new Date(Date.UTC(2026, 9, 10, 12))

function deps(over: Partial<Deps> = {}): Deps {
  return { store: new MemoryStore(), allowedOrigins: [SITE], launch: LAUNCH, now: NOW, ...over }
}

const post = (body: unknown, origin = SITE, raw?: string) =>
  new Request('https://stats.example/v1/solve', {
    method: 'POST',
    headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.7' },
    body: raw ?? JSON.stringify(body),
  })
const get = (path: string, origin = SITE) =>
  new Request(`https://stats.example${path}`, { headers: { Origin: origin } })

const solve = (seconds: number, extra: Partial<{ daily: number; hints: number; wrong: number }> = {}) => ({
  daily: 10, seconds, hints: 0, wrong: 0, ...extra,
})

describe('stats logic', () => {
  it('buckets solve times in 5-second steps with a 30-minute overflow', () => {
    expect(bucketOf(5)).toBe(1)
    expect(bucketOf(9)).toBe(1)
    expect(bucketOf(134)).toBe(26)
    expect(bucketOf(1799)).toBe(359)
    expect(bucketOf(50_000)).toBe(OVERFLOW_BUCKET)
  })

  it('rejects anything that is not a plausible solve', () => {
    expect(parseSolve(solve(134))).toEqual(solve(134))
    for (const bad of [
      null, 'x', [], {}, solve(2), solve(134.5), solve(134, { hints: 4 }), solve(134, { wrong: -1 }),
      solve(134, { daily: 0 }), { ...solve(134), seconds: '134' },
    ])
      expect(parseSolve(bad)).toBeNull()
  })

  it('accepts only the current daily ±1, and nothing before launch', () => {
    expect(dailyWindow(LAUNCH, NOW)).toEqual({ min: 9, max: 11 })
    expect(dailyWindow(LAUNCH, new Date(Date.UTC(2026, 9, 1, 0, 5)))).toEqual({ min: 1, max: 2 })
    expect(dailyWindow(LAUNCH, new Date(Date.UTC(2026, 8, 20))).max).toBeLessThan(1)
  })

  it('computes median, flawless share and a tie-aware percentile', () => {
    const c: DailyCounts = { daily: 10, solves: 5, flawless: 2, buckets: new Map([[10, 1], [20, 2], [40, 2]]) }
    const s = summarize(c)
    expect(s.medianSeconds).toBe(103) // bucket 20 midpoint (102.5 s)
    expect(s.flawlessPct).toBe(40)
    expect(s.beatPct).toBeNull()
    // I'm one of the two in bucket 20: beat the 2 slower + half of the 1 tie, out of 4 others
    expect(summarize(c, 20).beatPct).toBe(63)
    expect(summarize(c, 10).beatPct).toBe(100)
    expect(summarize({ ...c, solves: 1, buckets: new Map([[10, 1]]) }, 10)).toMatchObject({ first: true, beatPct: null })
  })
})

describe('stats API', () => {
  it('records solves and reports how many other players each one beat', async () => {
    const d = deps()
    for (const t of [300, 200, 100]) expect((await handle(post(solve(t)), d)).status).toBe(200)
    const res = await handle(post(solve(150)), d)
    const body = await res.json()
    expect(body).toMatchObject({ daily: 10, solves: 4, beatPct: 67, first: false })
    expect(res.headers.get('Access-Control-Allow-Origin')).toBe(SITE)
  })

  it('flags the very first solve of the day', async () => {
    const body = await (await handle(post(solve(90)), deps())).json()
    expect(body).toMatchObject({ solves: 1, first: true, beatPct: null })
  })

  it('serves public daily stats with a short cache', async () => {
    const d = deps()
    await handle(post(solve(100, { hints: 1 })), d)
    await handle(post(solve(200)), d)
    const res = await handle(get('/v1/daily/10'), d)
    expect(res.status).toBe(200)
    expect(res.headers.get('Cache-Control')).toBe('public, max-age=60')
    expect(await res.json()).toMatchObject({ daily: 10, solves: 2, flawlessPct: 50, beatPct: null })
    expect((await handle(get('/v1/daily/99'), d)).status).toBe(404) // future case
  })

  it('only answers the game’s own origin', async () => {
    const d = deps()
    expect((await handle(post(solve(100), 'https://evil.example'), d)).status).toBe(403)
    expect((await handle(get('/v1/daily/10', 'https://evil.example'), d)).status).toBe(403)
    const pre = await handle(new Request('https://stats.example/v1/solve', { method: 'OPTIONS', headers: { Origin: SITE } }), d)
    expect(pre.status).toBe(204)
    expect(pre.headers.get('Access-Control-Allow-Methods')).toContain('POST')
    expect((await handle(get('/v1/health', 'https://evil.example'), d)).status).toBe(200)
  })

  it('refuses stale, future, malformed and oversized submissions without storing them', async () => {
    const store = new MemoryStore()
    const d = deps({ store })
    expect((await handle(post(solve(100, { daily: 8 })), d)).status).toBe(422)
    expect((await handle(post(solve(100, { daily: 12 })), d)).status).toBe(422)
    expect((await handle(post(solve(1)), d)).status).toBe(400)
    expect((await handle(post(null, SITE, '{not json'), d)).status).toBe(400)
    expect((await handle(post(null, SITE, JSON.stringify({ ...solve(100), pad: 'x'.repeat(600) })), d)).status).toBe(413)
    expect(store.days.size).toBe(0)
  })

  it('rate-limits submissions per IP', async () => {
    const keys: string[] = []
    const limiter = { limit: async ({ key }: { key: string }) => (keys.push(key), { success: keys.length <= 2 }) }
    const store = new MemoryStore()
    const d = deps({ limiter, store })
    expect((await handle(post(solve(100)), d)).status).toBe(200)
    expect((await handle(post(solve(100)), d)).status).toBe(200)
    expect((await handle(post(solve(100)), d)).status).toBe(429)
    expect(keys[0]).toBe('203.0.113.7')
    expect((await store.read(10)).solves).toBe(2)
  })
})

describe('public read path', () => {
  it('uses the cheaper public reader for GET but fresh counts for submissions', async () => {
    const store = new MemoryStore()
    let publicReads = 0
    const d = deps({
      store,
      readPublic: async (n) => (publicReads++, { daily: n, solves: 999, flawless: 0, buckets: new Map() }),
    })
    expect(await (await handle(get('/v1/daily/10'), d)).json()).toMatchObject({ solves: 999 })
    expect(publicReads).toBe(1)
    expect(await (await handle(post(solve(100)), d)).json()).toMatchObject({ solves: 1, first: true })
    expect(publicReads).toBe(1)
  })
})

describe('standing honesty', () => {
  it('never rounds up to "unbeaten"', () => {
    // 301 solvers: one faster than me, 299 slower → 99.67% would round to 100
    const c: DailyCounts = { daily: 10, solves: 301, flawless: 0, buckets: new Map([[5, 1], [20, 1], [40, 299]]) }
    expect(summarize(c, 20).beatPct).toBe(99)
    expect(summarize(c, 5).beatPct).toBe(100)
  })
})
