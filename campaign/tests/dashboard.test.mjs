import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboard, passwordHash, sessionToken, validSession, filters, reportQueries } from '../dashboard.mjs';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

const secret = 'test-secret-with-enough-entropy-for-tests';
test('sessions reject tampering, expiry and different signing keys', async () => {
  const token = await sessionToken(secret, 1000);
  assert.equal(await validSession(token, secret, 1001), true);
  assert.equal(await validSession(token + 'x', secret, 1001), false);
  assert.equal(await validSession(token, 'other', 1001), false);
  assert.equal(await validSession(token, secret, 1000 + 7 * 86400), false);
});
test('report API is inaccessible without a valid session and never cached', async () => {
  const result = await dashboard(new Request('https://jggames.dev/webkiln/track/dashboard/data'), { DASHBOARD_SESSION_SECRET: secret, DASHBOARD_PASSWORD_HASH:'set' });
  assert.equal(result.status, 401);
  assert.equal(result.headers.get('Cache-Control'), 'no-store');
});
test('login rejects cross-origin requests before touching storage', async () => {
  const result = await dashboard(new Request('https://jggames.dev/webkiln/track/dashboard/login', { method:'POST', headers:{Origin:'https://evil.example'}, body:'{}' }), { DASHBOARD_SESSION_SECRET:secret, DASHBOARD_PASSWORD_HASH:'set' });
  assert.equal(result.status, 403);
});
test('login rejects wrong passwords and issues protected cookies for correct ones', async () => {
  const env = { DASHBOARD_SESSION_SECRET:secret, DASHBOARD_PASSWORD_HASH:await passwordHash('correct'), DB:{prepare(){return {bind(){return this;},run:async()=>({}),first:async()=>({attempts:1})};}} };
  const req = password => new Request('https://jggames.dev/webkiln/track/dashboard/login',{method:'POST',headers:{Origin:'https://jggames.dev'},body:JSON.stringify({password})});
  assert.equal((await dashboard(req('wrong'),env)).status,401);
  const response=await dashboard(req('correct'),env);
  assert.equal(response.status,200);
  assert.match(response.headers.get('Set-Cookie'),/HttpOnly; Secure; SameSite=Strict/);
});
test('repeated login attempts are limited',async()=>{
  const env={DASHBOARD_SESSION_SECRET:secret,DASHBOARD_PASSWORD_HASH:'set',DB:{prepare(){return {bind(){return this;},run:async()=>({}),first:async()=>({attempts:11})};}}};
  const req=new Request('https://jggames.dev/webkiln/track/dashboard/login',{method:'POST',headers:{Origin:'https://jggames.dev'},body:'{"password":"x"}'});
  assert.equal((await dashboard(req,env)).status,429);
});
test('report bounds validate real dates and filter values', () => {
  assert.throws(()=>filters(new URLSearchParams('from=2026-02-31&to=2026-03-01')));
  assert.throws(()=>filters(new URLSearchParams('from=2026-09-15&to=2026-09-01')));
  assert.throws(()=>filters(new URLSearchParams('device=evil')));
  const f=filters(new URLSearchParams('from=2026-09-01&to=2026-09-15&device=Windows'));
  assert.equal(f.end,'2026-09-16T00:00:00.000Z');
  assert.equal(f.includeQa,false);
});
test('queries bind user values, exclude QA by default and count unique clickers',()=>{
  const q=reportQueries(filters(new URLSearchParams('from=2026-09-01&to=2026-09-15&device=Windows')));
  assert.ok(q.every(item=>item.sql.includes("source <> 'qa'")));
  assert.ok(q.every(item=>item.params.includes('Windows')));
  assert.match(q[0].sql,/COUNT\(DISTINCT CASE WHEN event='fab_click' THEN visit_id END\)/);
});
test('real SQLite reports deduplicate actions, exclude QA, respect dates and device filters',async()=>{
  const db=new DatabaseSync(':memory:');
  db.exec(readFileSync(new URL('../migrations/0001_events.sql',import.meta.url),'utf8'));
  const insert=db.prepare('INSERT INTO events VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  let id=0;
  const add=(event,visit,source='reddit',day='2026-09-15',device='Windows')=>insert.run(String(++id),`${day}T12:00:00.000Z`,event,visit,source,'paid_social','campaign','creative','unrealengine','hero',null,device);
  add('page_view','one');add('fab_click','one');add('fab_click','one');add('video_start','one');
  add('page_view','two','reddit','2026-09-15','Android');add('demo_click','two','reddit','2026-09-15','Android');
  add('page_view','test','qa');add('fab_click','test','qa');add('page_view','old','reddit','2026-09-14');
  const query=f=>reportQueries(filters(new URLSearchParams(`from=2026-09-15&to=2026-09-15${f}`))).map(q=>db.prepare(q.sql).all(...q.params));
  const all=query('');assert.equal(all[0][0].visits,2);assert.equal(all[0][0].fab,1);assert.equal(all[0][0].demo,1);assert.equal(all[1].length,1);assert.equal(all[2].length,1);assert.equal(all[3].length,2);
  assert.equal(query('&device=Windows')[0][0].visits,1);
  assert.equal(query('&qa=1')[0][0].visits,3);
  const empty=reportQueries(filters(new URLSearchParams('from=2026-10-01&to=2026-10-01')))[0];
  assert.equal(db.prepare(empty.sql).get(...empty.params).visits,0);
  db.close();
});
