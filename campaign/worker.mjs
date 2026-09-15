const PREFIX = '/webkiln/track';
const VERSIONS = new Set(['4.25', '4.26', '4.27', '5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '5.7', '5.8']);
const clean = (value, fallback = 'none') => String(value || fallback).replace(/[^a-zA-Z0-9_. -]/g, '').slice(0, 100) || fallback;
const uuid = value => /^[0-9a-f-]{36}$/i.test(value || '') ? value : null;
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' };
export function attribution(params) {
  return Object.fromEntries(['source', 'medium', 'campaign', 'content', 'term'].map(key => [key, clean(params.get(`utm_${key}`), key === 'source' ? 'direct' : 'none')]));
}
export function destination(action, engine) {
  if (action === 'fab') return 'https://www.fab.com/listings/0c77209f-2e68-449d-8773-5d0c3d916ede';
  if (action === 'demo') return 'https://downloads.jggames.dev/samples/Webkiln-FPS-Sample.zip';
  if (action === 'trial' && VERSIONS.has(engine)) return `https://downloads.jggames.dev/trials/Webkiln-1.82-UE${engine}-Win64-Watermarked.zip`;
  return null;
}
function device(request) {
  const agent = request.headers.get('User-Agent') || '';
  if (/Android/i.test(agent)) return 'Android';
  if (/iPhone|iPad|iPod/i.test(agent)) return 'iOS';
  if (/Windows/i.test(agent)) return 'Windows';
  if (/Macintosh/i.test(agent)) return 'macOS';
  if (/Linux/i.test(agent)) return 'Linux';
  return 'Other';
}
function skipTracking(request) {
  return request.method === 'HEAD' || /prefetch/i.test(request.headers.get('Purpose') || request.headers.get('Sec-Purpose') || '') || /bot|spider|crawler|facebookexternalhit|HeadlessChrome/i.test(request.headers.get('User-Agent') || '');
}
async function record(request, env, event, params, id = crypto.randomUUID()) {
  if (skipTracking(request)) return;
  const a = attribution(params);
  await env.DB.prepare('INSERT OR IGNORE INTO events (id, occurred_at, event, visit_id, source, medium, campaign, content, term, placement, engine, device) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(id, new Date().toISOString(), event, uuid(params.get('visit')), a.source, a.medium, a.campaign, a.content, a.term, clean(params.get('placement')), VERSIONS.has(params.get('engine')) ? params.get('engine') : null, device(request)).run();
}
async function limitedBody(request) {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 2048) { await reader.cancel(); throw new Error('body too large'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  return new TextDecoder().decode(bytes);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === `${PREFIX}/health`) {
      if (request.method !== 'GET') return new Response(null, { status:405, headers });
      try { await env.DB.prepare('SELECT 1 FROM events LIMIT 1').first(); return Response.json({status:'ok'}, { headers }); }
      catch { return Response.json({status:'unavailable'}, {status:503, headers}); }
    }
    if (url.pathname === `${PREFIX}/events`) {
      if (request.method !== 'POST') return new Response(null, {status:405, headers});
      if (request.headers.get('Origin') !== url.origin) return new Response(null, {status:403, headers});
      let body;
      try { body = JSON.parse(await limitedBody(request)); } catch { return new Response(null, {status:400, headers}); }
      if (!body || !['page_view', 'video_start'].includes(body.event) || !uuid(body.id) || typeof body.query !== 'string' || body.query.length > 1200) return new Response(null, {status:400, headers});
      try { await record(request, env, body.event, new URLSearchParams(body.query), body.id); return new Response(null, {status:204, headers}); }
      catch { console.error('Webkiln event storage failed'); return new Response(null, {status:503, headers}); }
    }
    if (url.pathname.startsWith(`${PREFIX}/go/`)) {
      if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, {status:405, headers});
      const action = url.pathname.slice(`${PREFIX}/go/`.length);
      const target = destination(action, url.searchParams.get('engine'));
      if (!target) return new Response('Unknown destination', {status:404, headers});
      const outbound = new URL(target);
      if (action === 'fab') {
        const a = attribution(url.searchParams);
        for (const [key, value] of Object.entries(a)) if (value !== 'none') outbound.searchParams.set(`utm_${key}`, value);
      }
      try { await record(request, env, `${action}_click`, url.searchParams); }
      catch { console.error('Webkiln click storage failed'); }
      return new Response(null, {status:302, headers:{...headers, Location:outbound.toString()}});
    }
    return new Response('Not found', {status:404, headers});
  },
};
