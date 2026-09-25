# DEAD LETTERS — global daily stats

A tiny Cloudflare Worker + D1 database that powers "1,284 detectives solved
today · faster than 71%". The game itself stays on GitHub Pages; this runs
separately on Cloudflare's free tier.

**What it stores:** only counters per daily case — how many solved, how many
in each 5-second time bucket, how many solved flawlessly. No individual
results, no IP addresses, no device ids. See `schema.sql`.

**Until you deploy it, nothing changes:** with `STATS_API_URL` empty in
`src/config.ts` the game makes no network calls and shows no stats.

## One-time setup (about 10 minutes)

You need a free Cloudflare account: <https://dash.cloudflare.com/sign-up>.
Run these in a terminal from this `worker/` folder (`npx` downloads wrangler
on first use; nothing is added to the project):

```bash
cd worker
npx wrangler login
```

A browser window opens — allow access. Then create the database in western
Europe:

```bash
npx wrangler d1 create dead-letters-stats --location=weur
```

It prints a `database_id`. Paste it into `wrangler.toml` in place of
`REPLACE_WITH_THE_ID_FROM_wrangler_d1_create`. Then create the tables and
deploy:

```bash
npx wrangler d1 execute dead-letters-stats --remote --file=schema.sql
npx wrangler deploy
```

`deploy` prints your API address, e.g.
`https://dead-letters-stats.<your-subdomain>.workers.dev`. Check it:

```bash
curl https://dead-letters-stats.<your-subdomain>.workers.dev/v1/health
```

It should answer `{"ok":true}`.

## Switch it on in the game

1. Put the address (no trailing slash) into `STATS_API_URL` in
   `src/config.ts`.
2. Commit and push — GitHub Pages redeploys the game.
3. Open the site's Datenschutz page: it now includes the "Anonyme
   Tagesstatistik" section automatically.

Before going live, make sure Cloudflare's Data Processing Addendum covers your
account (Cloudflare acts as your processor here — check the DPA in your
account/terms, or ask Cloudflare support).

## When things change

| Change | Do this |
|---|---|
| You set or change `LAUNCH_DATE` in `src/config.ts` | Redeploy: `npx wrangler deploy` (the worker checks daily numbers against it) |
| New domain for the game | Add it to `ALLOWED_ORIGINS` in `wrangler.toml`, redeploy |
| Want to wipe all stats (e.g. after testing) | `npx wrangler d1 execute dead-letters-stats --remote --command "DELETE FROM daily_totals; DELETE FROM daily_buckets;"` |
| Local testing | `npx wrangler d1 execute dead-letters-stats --local --file=schema.sql`, then `npx wrangler dev`, and point `STATS_API_URL` at `http://127.0.0.1:8787` |

## Limits and cost

Free tier: 100,000 Worker requests and 100,000 database writes per day. Each
solve is one request and two writes; public counts are cached by browsers for
a minute and held in the worker's memory for 30 seconds, so home-screen views
barely touch the database — roughly **50,000 daily solves a day for free**. If DEAD LETTERS
outgrows that, the Workers Paid plan is about $5/month.

## Abuse protection

- Only the game's own origins may call the API (CORS + origin check).
- Solve times must be plausible (5 s – 24 h), hints 0–3, and only today's
  daily (±1 day for time zones) is accepted — nothing before launch day.
- At most 30 submissions per minute per IP (checked in memory, never stored).
- Percentiles use 5-second buckets, so a handful of fake entries can't
  distort them much.
- Known, accepted imprecision: without any per-player record there is no
  server-side de-duplication. If a player's connection drops after the server
  saved their solve, the game retries later and that solve counts twice. This
  is rare and keeps the service free of personal data.
