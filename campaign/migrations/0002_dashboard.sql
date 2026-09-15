CREATE TABLE IF NOT EXISTS dashboard_login_attempts (
 key TEXT PRIMARY KEY,
 attempts INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS dashboard_login_expiry ON dashboard_login_attempts(expires_at);
CREATE INDEX IF NOT EXISTS events_time ON events(occurred_at);
