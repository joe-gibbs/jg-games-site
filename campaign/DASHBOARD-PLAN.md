# Private campaign dashboard

Publish `/webkiln/dashboard/` through the site's existing Git deployment. It reads aggregate reporting data from the existing tracking Worker and D1 database. A separate password and signed, secure HTTP-only session protect the reporting API. No analytics data or credentials enter the public build.

Show visits, demo clicks, trial clicks, Fab clicks and their visit rates; daily visits/actions; performance by creative; device and button breakdowns. Date and device filters apply to all results. Exclude QA by default. Label autoplay starts as playback, not intentional engagement, and clicks as clicks, not sales. Provide refresh and CSV export, accurate empty states, and errors without stale data.

Implementation: add authentication and parameter-bound aggregate queries with unit tests; add the React page and CSS; test real SQLite aggregation and authorization; build, deploy the Worker and site, and verify the live dashboard against D1. Preserve existing tracking endpoints and unrelated working changes.
