CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  occurred_at TEXT NOT NULL,
  event TEXT NOT NULL CHECK(event IN ('page_view','video_start','demo_click','trial_click','fab_click')),
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
CREATE INDEX IF NOT EXISTS events_campaign_time ON events(campaign, occurred_at);
CREATE INDEX IF NOT EXISTS events_content_event ON events(content, event);
