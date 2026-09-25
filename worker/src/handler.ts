/**
 * HTTP API for the global daily stats (runtime-agnostic: standard Request /
 * Response only, so it runs on Workers and in the test suite).
 *
 *   POST /v1/solve        {daily, seconds, hints, wrong} -> DailyStats with beatPct
 *   GET  /v1/daily/:n     -> DailyStats (cached for 60 s)
 *   GET  /v1/health       -> {ok: true}
 */
import { bucketOf, dailyWindow, parseSolve, summarize, type DailyCounts, type Store } from './stats'

export interface RateLimiter {
  limit(opts: { key: string }): Promise<{ success: boolean }>
}

export interface Deps {
  store: Store
  /**
   * Optional cheaper read for the public GET (e.g. a short in-memory cache);
   * submissions always read fresh counts from `store`.
   */
  readPublic?: (daily: number) => Promise<DailyCounts>
  /** exact origins allowed to call the API, e.g. https://impartinir-dev.github.io */
  allowedOrigins: string[]
  /** optional per-IP limiter for submissions (key is used transiently, never stored) */
  limiter?: RateLimiter
  /** LAUNCH_DATE (YYYY-MM-DD) — daily #1 */
  launch: string
  now: Date
}

const MAX_BODY_BYTES = 512

function json(body: unknown, status: number, cors: Record<string, string>, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors, ...extra },
  })
}

function corsHeaders(origin: string | null, allowed: string[]): Record<string, string> | null {
  if (!origin || !allowed.includes(origin)) return null
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  }
}

export async function handle(req: Request, deps: Deps): Promise<Response> {
  const url = new URL(req.url)
  const cors = corsHeaders(req.headers.get('Origin'), deps.allowedOrigins)
  const path = url.pathname.replace(/\/+$/, '')

  if (path === '/v1/health') return json({ ok: true }, 200, cors ?? {})

  // everything else is for the game only
  if (!cors) return json({ error: 'origin not allowed' }, 403, {})
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })

  const window = dailyWindow(deps.launch, deps.now)

  const daily = path.match(/^\/v1\/daily\/(\d+)$/)
  if (daily && req.method === 'GET') {
    const n = Number(daily[1])
    if (n < 1 || n > window.max) return json({ error: 'unknown daily case' }, 404, cors)
    const read = deps.readPublic ?? ((d: number) => deps.store.read(d))
    const stats = summarize(await read(n))
    return json(stats, 200, cors, { 'Cache-Control': 'public, max-age=60' })
  }

  if (path === '/v1/solve' && req.method === 'POST') {
    const text = await req.text()
    if (text.length > MAX_BODY_BYTES) return json({ error: 'too large' }, 413, cors)
    let body: unknown
    try {
      body = JSON.parse(text)
    } catch {
      return json({ error: 'invalid json' }, 400, cors)
    }
    const solve = parseSolve(body)
    if (!solve) return json({ error: 'invalid solve' }, 400, cors)
    if (solve.daily < window.min || solve.daily > window.max)
      return json({ error: 'not a current daily case' }, 422, cors)

    if (deps.limiter) {
      const key = req.headers.get('CF-Connecting-IP') ?? 'unknown'
      const { success } = await deps.limiter.limit({ key })
      if (!success) return json({ error: 'slow down' }, 429, cors)
    }

    const bucket = bucketOf(solve.seconds)
    await deps.store.addSolve(solve.daily, bucket, solve.hints === 0 && solve.wrong === 0)
    const stats = summarize(await deps.store.read(solve.daily), bucket)
    return json(stats, 200, cors, { 'Cache-Control': 'no-store' })
  }

  return json({ error: 'not found' }, 404, cors)
}
