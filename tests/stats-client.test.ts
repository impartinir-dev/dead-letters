import { describe, it, expect, vi, beforeEach } from 'vitest'

// stats switched on, launched a week ago
vi.mock('../src/config.ts', () => ({
  LAUNCH_DATE: '2020-01-01',
  STATS_API_URL: 'https://stats.example/',
  CONTACT_FORM_URL: '',
  ADS: { enabled: false, interstitialEvery: 3 },
}))

const { submitDailySolve, fetchDailyStats } = await import('../src/lib/stats.ts')
const { recordSolve, getProgress, setStatsOptOut } = await import('../src/state/progress.ts')
const { syncDailyResult } = await import('../src/state/dailyStats.ts')
const { dailyCaseId, dailyNumber } = await import('../src/lib/daily.ts')

const STATS = { daily: 7, solves: 12, medianSeconds: 150, flawlessPct: 25, beatPct: 71, first: false }
const reply = (status: number, body: unknown = STATS) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

let fetchMock: ReturnType<typeof vi.fn>
beforeEach(() => {
  fetchMock = vi.fn(async () => reply(200))
  vi.stubGlobal('fetch', fetchMock)
})

describe('stats client', () => {
  it('posts the solve as a preflight-free text/plain JSON body', async () => {
    const out = await submitDailySolve({ daily: 7, seconds: 134, hints: 1, wrong: 0 })
    expect(out).toEqual({ ok: true, stats: STATS })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://stats.example/v1/solve')
    expect(init.method).toBe('POST')
    expect(init.headers['Content-Type']).toMatch(/^text\/plain/)
    expect(JSON.parse(init.body)).toEqual({ daily: 7, seconds: 134, hints: 1, wrong: 0 })
  })

  it('retries later on outages and rate limits, but not on rejected input', async () => {
    fetchMock.mockResolvedValueOnce(reply(400, { error: 'invalid solve' }))
    expect(await submitDailySolve({ daily: 7, seconds: 1, hints: 0, wrong: 0 })).toEqual({ ok: false, permanent: true })
    fetchMock.mockResolvedValueOnce(reply(429, { error: 'slow down' }))
    expect((await submitDailySolve({ daily: 7, seconds: 60, hints: 0, wrong: 0 })).ok).toBe(false)
    fetchMock.mockResolvedValueOnce(reply(503, {}))
    expect(await submitDailySolve({ daily: 7, seconds: 60, hints: 0, wrong: 0 })).toEqual({ ok: false, permanent: false })
    fetchMock.mockRejectedValueOnce(new TypeError('offline'))
    expect(await submitDailySolve({ daily: 7, seconds: 60, hints: 0, wrong: 0 })).toEqual({ ok: false, permanent: false })
  })

  it('ignores malformed answers', async () => {
    fetchMock.mockResolvedValueOnce(reply(200, { hello: 'world' }))
    expect(await fetchDailyStats(7)).toBeNull()
    expect(fetchMock.mock.calls[0][0]).toBe('https://stats.example/v1/daily/7')
  })
})

describe('daily result sync', () => {
  it('submits today’s result exactly once, even when called concurrently', async () => {
    recordSolve(dailyCaseId(), { seconds: 134, hints: 1, wrong: 0, challenge: false }, dailyNumber())
    const [a, b] = await Promise.all([syncDailyResult(), syncDailyResult()])
    expect(a).toEqual(STATS)
    expect(b).toEqual(STATS)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(getProgress().daily.result).toMatchObject({ submitted: true, stats: STATS })
    // later visits reuse the stored answer
    expect(await syncDailyResult()).toEqual(STATS)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('sends nothing once the player opts out', async () => {
    setStatsOptOut(true)
    expect(await syncDailyResult()).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
    setStatsOptOut(false)
  })
})
