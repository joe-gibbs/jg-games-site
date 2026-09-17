-- Keep all existing events intact; engagement uses the same attribution fields.
CREATE TABLE IF NOT EXISTS engagement_events (
  id TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,
  event TEXT NOT NULL CHECK(event IN ('demo_complete','inventory_interaction','pricing_view')),
  visit_id TEXT,
  source TEXT NOT NULL,
  medium TEXT NOT NULL,
  campaign TEXT NOT NULL,
  content TEXT NOT NULL,
  term TEXT NOT NULL,
  placement TEXT NOT NULL,
  engine TEXT,
  device TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS engagement_time ON engagement_events(occurred_at);
