# Webkiln campaign tracking

Landing page: https://jggames.dev/webkiln/try/

Private dashboard: https://jggames.dev/webkiln/dashboard/

The dashboard uses live D1 aggregates with date and device filters, daily charts, creative and button breakdowns, and CSV export. QA is excluded by default. Dates use UTC. The password is generated locally in `campaign/.dashboard-password.txt` (git-ignored). Its SHA-256 hash and a separate signing key are Worker secrets. The browser receives a secure HTTP-only session cookie valid for seven days. Ten login attempts per 15-minute network bucket are allowed; the bucket uses a temporary HMAC of the requesting IP, never a stored raw IP. Rotate both Worker secrets to revoke existing sessions and change the password. Report data is never included in the static site build.

The page ships with the normal Vite build through the existing git-push CI/CD. Only `/webkiln/track/*` is served by the dedicated tracking Worker. To deploy a tracking-code change, run `wrangler deploy --config campaign/wrangler.toml`.

## Report

From the repository root, run:

```powershell
$trackingQuery = Get-Content campaign/report.sql -Raw
wrangler d1 execute webkiln-marketing-events --remote --config campaign/wrangler.toml --command $trackingQuery
```

The 30-day report groups unique page visits, video viewers, demo clicks, trial clicks, and Fab clicks by campaign and creative. Video starts include muted autoplay and are counted once per page load, including when the video loops. They do not indicate a deliberate play-button click. A visit ID exists only for a single page load; refreshes count as new visits. It does not identify people. QA traffic is excluded. Clicks are intent signals, not completed downloads or sales. Fab purchases are not observable by this tracker; the known sales baseline is zero.

The database is `webkiln-marketing-events` in Cloudflare D1. No public reporting endpoint exposes campaign data. Stored fields are event time, allowlisted UTM tags, page-scoped visit ID, button placement, selected engine and broad device type. No IP address, raw user agent, or cross-site cookie is stored. Known crawlers, prefetches and HEAD requests are excluded, but sophisticated bots can still produce events.

## Validation

Engagement tracking was added on 17 September 2026. `demo_complete` records a fully initialized RPG UI when at least 20% of the demo is visible in an active tab. It is an automatic completion signal, not proof of attention. `inventory_interaction` requires a trusted click on inventory open/close or an item; the automatic inventory animation does not count. `pricing_view` requires at least half the offer card to stay visible for one second in an active tab. Each is counted once per page visit. Earlier visits have no engagement observations.

For this release, apply `campaign/migrations/0003_engagement.sql` with Wrangler D1 before deploying the Worker, then publish the site. The migration only adds a table and index; existing events remain intact. Dashboard totals, daily charts, creative rows and CSV include the new counts. They do not count as download or purchase clicks.

```powershell
node --test campaign/tests/worker.test.mjs
node campaign/verify-production.mjs
npm run build
```

The production check writes events tagged `utm_source=qa`; use its printed visit ID to inspect deduplication in D1. Expected: one page_view despite two identical submissions, plus one click for each destination.
