/**
 * Cloudflare Worker entry: wires the stats API to a D1 database.
 * Deploy steps: worker/README.md.
 */
import { LAUNCH_DATE } from '../../src/config'
import { handle, type RateLimiter } from './handler'
import type { DailyCounts, Store } from './stats'

/* Minimal D1 typings (avoids pulling in @cloudflare/workers-types). */
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
}
interface D1Database {
  prepare(query: string): D1PreparedStatement
  batch<T = Record<string, unknown>>(statements: D1PreparedStatement[]): Promise<Array<{ results: T[] }>>
}

export interface Env {
  DB: D1Database
  /** comma-separated origins allowed to call the API */
  ALLOWED_ORIGINS?: string
  SUBMIT_LIMITER?: RateLimiter
}

class D1Store implements Store {
  constructor(private db: D1Database) {}

  async addSolve(daily: number, bucket: number, flawless: boolean): Promise<void> {
    // one atomic batch: bump the day's totals and its time bucket
    await this.db.batch([
      this.db
        .prepare(
          `INSERT INTO daily_totals (daily, solves, flawless) VALUES (?1, 1, ?2)
           ON CONFLICT(daily) DO UPDATE SET solves = solves + 1, flawless = flawless + excluded.flawless`,
        )
        .bind(daily, flawless ? 1 : 0),
      this.db
        .prepare(
          `INSERT INTO daily_buckets (daily, bucket, solves) VALUES (?1, ?2, 1)
           ON CONFLICT(daily, bucket) DO UPDATE SET solves = solves + 1`,
        )
        .bind(daily, bucket),
    ])
  }

  async read(daily: number): Promise<DailyCounts> {
    const [totals, buckets] = await this.db.batch<Record<string, number>>([
      this.db.prepare('SELECT solves, flawless FROM daily_totals WHERE daily = ?1').bind(daily),
      this.db.prepare('SELECT bucket, solves FROM daily_buckets WHERE daily = ?1').bind(daily),
    ])
    const t = totals.results[0]
    return {
      daily,
      solves: t?.solves ?? 0,
      flawless: t?.flawless ?? 0,
      buckets: new Map(buckets.results.map((r) => [r.bucket, r.solves])),
    }
  }
}

/**
 * Public counts are memoized per Worker instance for 30 s, so busy home
 * screens don't turn into one database read per view (the edge cache isn't
 * available on workers.dev). Submissions always read fresh counts.
 */
const PUBLIC_TTL_MS = 30_000
const recent = new Map<number, { at: number; counts: DailyCounts }>()

async function readPublic(store: Store, daily: number): Promise<DailyCounts> {
  const hit = recent.get(daily)
  if (hit && Date.now() - hit.at < PUBLIC_TTL_MS) return hit.counts
  const counts = await store.read(daily)
  if (recent.size > 16) recent.clear() // only a few days are ever live
  recent.set(daily, { at: Date.now(), counts })
  return counts
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      const store = new D1Store(env.DB)
      return await handle(req, {
        store,
        readPublic: (daily) => readPublic(store, daily),
        allowedOrigins: (env.ALLOWED_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
        limiter: env.SUBMIT_LIMITER,
        launch: LAUNCH_DATE,
        now: new Date(),
      })
    } catch {
      // never leak internals; the game treats any failure as "stats unavailable"
      return new Response(JSON.stringify({ error: 'server error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  },
}
