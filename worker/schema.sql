-- Global daily stats: counters only. No individual results, IPs or device ids.
CREATE TABLE IF NOT EXISTS daily_totals (
  daily    INTEGER PRIMARY KEY,           -- daily case number
  solves   INTEGER NOT NULL DEFAULT 0,    -- how many solved it
  flawless INTEGER NOT NULL DEFAULT 0     -- ...with no hints and no false accusations
);

CREATE TABLE IF NOT EXISTS daily_buckets (
  daily  INTEGER NOT NULL,
  bucket INTEGER NOT NULL,                -- solve time / 5 s (360 = 30 min or slower)
  solves INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (daily, bucket)
);
