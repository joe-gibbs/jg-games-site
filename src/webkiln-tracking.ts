const trackingPath = '/webkiln/track';
const incoming = new URLSearchParams(window.location.search);
const campaign = new URLSearchParams();
for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']) {
  const value = incoming.get(key);
  if (value) campaign.set(key, value.replace(/[^a-zA-Z0-9_. -]/g, '').slice(0, 100));
}
// An in-memory visit ID links actions on this page without cookies or cross-site IDs.
const visit = crypto.randomUUID();
campaign.set('visit', visit);
const sent = new Set<string>();
export function trackEvent(name: 'page_view' | 'video_start') {
  if (sent.has(name)) return;
  sent.add(name);
  void fetch(`${trackingPath}/events`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, keepalive: true,
    body: JSON.stringify({ event: name, id: crypto.randomUUID(), query: campaign.toString() }),
  }).then(response => { if (!response.ok) sent.delete(name); }).catch(() => { sent.delete(name); });
}
export function actionUrl(action: string, placement: string, engine?: string) {
  const params = new URLSearchParams(campaign);
  params.set('placement', placement);
  if (engine) params.set('engine', engine);
  return `${trackingPath}/go/${action}?${params}`;
}

