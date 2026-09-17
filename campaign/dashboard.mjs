const BASE='/webkiln/track/dashboard';
const COOKIE='webkiln_dashboard';
const AGE=7*86400;
const encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
const response=(data,status=200,extra={})=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
export async function passwordHash(password){return hex(await crypto.subtle.digest('SHA-256',encoder.encode(password)));}
async function hmac(secret,value){
  const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
  return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));
}
function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||a.length!==b.length)return false;let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
export async function sessionToken(secret,now=Math.floor(Date.now()/1000)){
  const payload=`${now+AGE}.${crypto.randomUUID()}`;
  return `${payload}.${await hmac(secret,payload)}`;
}
export async function validSession(token,secret,now=Math.floor(Date.now()/1000)){
  if(!secret||typeof token!=='string')return false;
  const parts=token.split('.');
  if(parts.length!==3||!/^\d+$/.test(parts[0])||!/^[-a-f0-9]{36}$/.test(parts[1])||! /^[a-f0-9]{64}$/.test(parts[2]))return false;
  const expires=Number(parts[0]);
  return expires>now&&expires<=now+AGE&&equal(parts[2],await hmac(secret,`${parts[0]}.${parts[1]}`));
}
function cookie(value,age=AGE){return `${COOKIE}=${value}; Path=${BASE}; Max-Age=${age}; HttpOnly; Secure; SameSite=Strict`;}
export function filters(params){
  const today=new Date().toISOString().slice(0,10);
  const from=params.get('from')||new Date(Date.now()-29*86400000).toISOString().slice(0,10);
  const to=params.get('to')||today;
  const valid=value=>/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
  if(!valid(from)||!valid(to)||from>to||(Date.parse(to)-Date.parse(from))/86400000>365)throw new Error('Choose a valid date range of up to one year.');
  const device=params.get('device')||'all';
  if(!['all','Windows','macOS','Linux','Android','iOS','Other'].includes(device))throw new Error('Invalid device.');
  return {from,to,start:`${from}T00:00:00.000Z`,end:new Date(Date.parse(to)+86400000).toISOString(),device,includeQa:params.get('qa')==='1'};
}
const COUNTS=[['page_view','visits'],['video_start','plays'],['demo_click','demo'],['trial_click','trial'],['fab_click','fab'],['demo_complete','completed'],['inventory_interaction','interacted'],['pricing_view','pricing']].map(([event,name])=>`COUNT(DISTINCT CASE WHEN event='${event}' THEN visit_id END) AS ${name}`).join(', ');
export function reportQueries(f){
  const where=`occurred_at >= ? AND occurred_at < ?${f.includeQa?'':" AND source <> 'qa'"}${f.device==='all'?'':' AND device = ?'}`;
  const params=[f.start,f.end,...(f.device==='all'?[]:[f.device])];
  const query=(select,tail='')=>({sql:`SELECT ${select}, ${COUNTS} FROM (SELECT * FROM events UNION ALL SELECT * FROM engagement_events) WHERE ${where} ${tail}`,params});
  return [
    query("'total' AS name"),
    query('substr(occurred_at,1,10) AS day','GROUP BY day ORDER BY day'),
    query('source,campaign,content','GROUP BY source,campaign,content ORDER BY visits DESC,fab DESC LIMIT 250'),
    query('device AS name','GROUP BY device ORDER BY visits DESC'),
    query('placement AS name',"AND event IN ('demo_click','trial_click','fab_click') GROUP BY placement ORDER BY fab DESC,demo DESC"),
    query('engine AS name',"AND event='trial_click' GROUP BY engine ORDER BY trial DESC")
  ];
}
async function readLogin(request){
  if(Number(request.headers.get('Content-Length'))>1024)throw new Error('Too large');
  const reader=request.body?.getReader();if(!reader)throw new Error('Missing body');
  let size=0,text='';const decoder=new TextDecoder();
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>1024){await reader.cancel();throw new Error('Too large');}text+=decoder.decode(value,{stream:true});}
  return JSON.parse(text+decoder.decode());
}
export async function dashboard(request,env){
  const url=new URL(request.url);
  if(!env.DASHBOARD_SESSION_SECRET||!env.DASHBOARD_PASSWORD_HASH)return response({error:'Dashboard is not configured.'},503);
  if(url.pathname===`${BASE}/login`){
    if(request.method!=='POST')return response({error:'Method not allowed'},405);
    if(request.headers.get('Origin')!==url.origin)return response({error:'Forbidden'},403);
    try{
      const now=Math.floor(Date.now()/1000),bucket=Math.floor(now/900);
      const key=await hmac(env.DASHBOARD_SESSION_SECRET,`${request.headers.get('CF-Connecting-IP')||'unknown'}:${bucket}`);
      await env.DB.prepare('DELETE FROM dashboard_login_attempts WHERE expires_at < ?').bind(now).run();
      const rate=await env.DB.prepare('INSERT INTO dashboard_login_attempts (key,attempts,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(key,(bucket+1)*900).first();
      if(rate.attempts>10)return response({error:'Too many attempts. Try again in 15 minutes.'},429,{'Retry-After':'900'});
      const {password}=await readLogin(request);
      if(typeof password!=='string'||password.length>256||!equal(await passwordHash(password),env.DASHBOARD_PASSWORD_HASH))return response({error:'Incorrect password.'},401);
      return response({ok:true},200,{'Set-Cookie':cookie(await sessionToken(env.DASHBOARD_SESSION_SECRET))});
    }catch{return response({error:'Could not sign in. Try again.'},503);}
  }
  if(url.pathname===`${BASE}/logout`){
    if(request.method!=='POST'||request.headers.get('Origin')!==url.origin)return response({error:'Forbidden'},403);
    return response({ok:true},200,{'Set-Cookie':cookie('',0)});
  }
  const token=(request.headers.get('Cookie')||'').split(';').map(part=>part.trim()).find(part=>part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length+1);
  if(!await validSession(token,env.DASHBOARD_SESSION_SECRET))return response({error:'Sign in to view your data.'},401);
  if(url.pathname!==`${BASE}/data`)return response({error:'Not found'},404);
  if(request.method!=='GET')return response({error:'Method not allowed'},405);
  let f;try{f=filters(url.searchParams);}catch(error){return response({error:error.message},400);}
  try{
    const rows=await env.DB.batch(reportQueries(f).map(q=>env.DB.prepare(q.sql).bind(...q.params)));
    return response({generatedAt:new Date().toISOString(),filters:{from:f.from,to:f.to,device:f.device,includeQa:f.includeQa},totals:rows[0].results[0],daily:rows[1].results,creatives:rows[2].results,devices:rows[3].results,placements:rows[4].results,engines:rows[5].results});
  }catch{return response({error:'Reporting is temporarily unavailable. Refresh to retry.'},503);}
}
