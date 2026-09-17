import test from 'node:test';
import assert from 'node:assert/strict';
import worker, { attribution, destination } from '../worker.mjs';

test('only campaign fields survive attribution; private query values do not', () => {
  const values = attribution(new URLSearchParams('utm_source=reddit&utm_content=web-stack-image&email=private@example.com&token=secret'));
  assert.deepEqual(values, { source: 'reddit', medium: 'none', campaign: 'none', content: 'web-stack-image', term: 'none' });
});
test('campaign values are bounded and cannot inject markup', () => {
  assert.equal(attribution(new URLSearchParams('utm_source=' + 'x'.repeat(300))).source.length, 100);
  assert.equal(attribution(new URLSearchParams('utm_source=<script>')).source, 'script');
});
test('redirect destinations are fixed, with supported trial versions only', () => {
  assert.match(destination('fab'), /^https:\/\/www.fab.com\/listings\//);
  assert.match(destination('demo'), /^https:\/\/downloads.jggames.dev\/samples\//);
  assert.match(destination('trial', '5.8'), /UE5.8-Win64-Watermarked.zip$/);
  assert.equal(destination('trial', '../../secret'), null);
  assert.equal(destination('https://evil.example'), null);
});
test('cross-origin events and unknown event names are rejected', async () => {
  const request = (body, origin) => new Request('https://jggames.dev/webkiln/track/events', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  assert.equal((await worker.fetch(request({event:'page_view'}, 'https://evil.example'), {})).status, 403);
  assert.equal((await worker.fetch(request({event:'purchase'}, 'https://jggames.dev'), {})).status, 400);
});
test('HEAD and prefetch redirects never record conversions', async () => {
  const env = { DB: { prepare() { throw new Error('must not record'); } } };
  const result = await worker.fetch(new Request('https://jggames.dev/webkiln/track/go/fab', { method:'HEAD' }), env);
  assert.equal(result.status, 302);
  const prefetch = await worker.fetch(new Request('https://jggames.dev/webkiln/track/go/fab', {headers:{Purpose:'prefetch'}}), env);
  assert.equal(prefetch.status, 302);
});
test('tracking storage failure never blocks a demo or purchase click', async () => {
  const env = { DB: { prepare() { throw new Error('storage unavailable'); } } };
  const result = await worker.fetch(new Request('https://jggames.dev/webkiln/track/go/demo'), env);
  assert.equal(result.status, 302);
  assert.match(result.headers.get('Location'), /Webkiln-FPS-Sample.zip/);
});


test('engagement events are accepted and stored separately from outbound clicks', async () => {
  for (const event of ['demo_complete', 'inventory_interaction', 'pricing_view']) {
    let recorded;
    const env = { DB: { prepare(sql) { return { bind(...values) { recorded = { sql, values }; return this; }, async run() {} }; } } };
    const request = new Request('https://jggames.dev/webkiln/track/events', { method: 'POST', headers: { Origin: 'https://jggames.dev', 'Content-Type': 'application/json' }, body: JSON.stringify({ event, id: crypto.randomUUID(), query: new URLSearchParams({ visit: crypto.randomUUID(), utm_source: 'qa' }).toString() }) });
    assert.equal((await worker.fetch(request, env)).status, 204);
    assert.match(recorded.sql, /INSERT OR IGNORE INTO engagement_events/);
    assert.equal(recorded.values[2], event);
  }
});
