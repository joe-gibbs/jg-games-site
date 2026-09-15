import assert from 'node:assert/strict';
const base = 'https://jggames.dev/webkiln/track';
const visit = crypto.randomUUID();
const query = new URLSearchParams({utm_source:'qa',utm_medium:'verification',utm_campaign:'production-check',utm_content:'tracking-check',visit,placement:'qa'}).toString();
assert.equal((await fetch(`${base}/health`)).status, 200);
const id = crypto.randomUUID();
for (let n = 0; n < 2; n++) {
  const result = await fetch(`${base}/events`, {method:'POST',headers:{Origin:'https://jggames.dev','Content-Type':'application/json'},body:JSON.stringify({event:'page_view',id,query})});
  assert.equal(result.status,204);
}
for (const action of ['fab','demo','trial']) {
  const result = await fetch(`${base}/go/${action}?${query}&engine=5.8`,{redirect:'manual'});
  assert.equal(result.status,302);
  const location = result.headers.get('location');
  assert.match(location, action === 'fab' ? /www.fab.com\/listings\/.*utm_source=qa/ : /downloads.jggames.dev/);
  console.log(`${action}: 302 with correct destination`);
}
console.log(`Database verification visit: ${visit}`);
