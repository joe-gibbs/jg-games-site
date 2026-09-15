# Webkiln campaign tracking

Landing page: https://jggames.dev/webkiln/try/

The page ships with the normal Vite build through the existing git-push CI/CD. Only `/webkiln/track/*` is served by the dedicated tracking Worker. To deploy a tracking-code change, run `wrangler deploy --config campaign/wrangler.toml`.

## Report

From the repository root, run:

```powershell
wrangler d1 execute webkiln-marketing-events --remote --config campaign/wrangler.toml --file campaign/report.sql
```

The 30-day report groups unique page visits, video viewers, demo clicks, trial clicks, and Fab clicks by campaign and creative. A visit ID exists only for a single page load; refreshes count as new visits. It does not identify people. QA traffic is excluded. Clicks are intent signals, not completed downloads or sales. Fab purchases are not observable by this tracker; the known sales baseline is zero.

The database is `webkiln-marketing-events` in Cloudflare D1. No public reporting endpoint exposes campaign data. Stored fields are event time, allowlisted UTM tags, page-scoped visit ID, button placement, selected engine and broad device type. No IP address, raw user agent, or cross-site cookie is stored. Known crawlers, prefetches and HEAD requests are excluded, but sophisticated bots can still produce events.

## Validation

```powershell
node --test campaign/tests/worker.test.mjs
node campaign/verify-production.mjs
npm run build
```

The production check writes events tagged `utm_source=qa`; use its printed visit ID to inspect deduplication in D1. Expected: one page_view despite two identical submissions, plus one click for each destination.
