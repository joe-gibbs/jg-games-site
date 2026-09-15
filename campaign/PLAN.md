# Webkiln acquisition repair

User-approved scope: remove mobile traffic and automated audience expansion; create image/video ad variants; publish a marketing page with UTM attribution and demo/Fab tracking. Sales baseline: zero.

## Implementation

1. Replace the immutable all-device Reddit group with desktop-only, US, manual r/unrealengine targeting only. Pause old group; retain paused campaign and existing budget.
2. Add `/webkiln/try/` to the existing Vite build. Publish through the user's existing git-push CI/CD. Preserve unrelated uncommitted source changes.
3. Use a dedicated Cloudflare Worker only for the tracking API at `/webkiln/track/*`. Store allowlisted campaign attribution and events in a dedicated D1 database. Track page views, video starts, demo downloads, trial requests and Fab outbound clicks. Do not label outbound clicks as sales. No raw IP, full referrer, or persistent tracking cookie.
4. Validate tracking routes, fixed redirect destinations, deduplication and input limits with tests, then test real local D1 and deployed D1 persistence. Separate verification traffic using `utm_source=qa`.
5. Create three image variants from real HTML interfaces over Nano Banana concept backgrounds, plus two video variants using the existing marketing site RPG video and complete UI. Give every creative a distinct `utm_content`, shared `utm_source=reddit`, `utm_medium=paid_social`, `utm_campaign=webkiln_desktop_sep2026`, and `utm_term=unrealengine`.
6. Publish the page, verify links and tracking, then create ads in the paused campaign. Document reporting commands and verify final ad group restrictions.

Visual direction: existing Webkiln charcoal/orange identity, large legible type, real gameplay dominant, concise workflow benefits, demo and Fab actions above the fold.
