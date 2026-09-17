import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

type Counts={visits:number;plays:number;demo:number;trial:number;fab:number;completed:number;interacted:number;pricing:number};
type Breakdown=Counts&{name:string};
type Creative=Counts&{source:string;campaign:string;content:string};
type Report={generatedAt:string;filters:{from:string;to:string;device:string;includeQa:boolean};totals:Counts;daily:(Counts&{day:string})[];creatives:Creative[];devices:Breakdown[];placements:Breakdown[];engines:Breakdown[]};
type Metric='visits'|'demo'|'trial'|'fab'|'completed'|'interacted'|'pricing';
const engagementMetrics:Metric[]=['completed','interacted','pricing'];
const tableMetrics:Metric[]=['visits','completed','interacted','pricing','demo','trial','fab'];
const API='/webkiln/track/dashboard';
const number=new Intl.NumberFormat('en');
const labels:Record<Metric,string>={visits:'Visits',demo:'Demo clicks',trial:'Trial clicks',fab:'Fab clicks',completed:'Demo completed',interacted:'Inventory used',pricing:'Pricing seen'};
const creativeNames:Record<string,string>={'citybuilder-react':'City builder / React','shooter-css':'Shooter / CSS HUD','racing-bridge':'Racing / Game bridge','rpg-ui':'RPG / Web UI','rpg-hud':'RPG / HUD'};
const name=(value:string)=>value==='none'?'Untagged':value==='direct'?'Direct':value;
const rate=(value:number,visits:number)=>visits?`${(value/visits*100).toFixed(1)}%`:'-';
const today=()=>new Date().toISOString().slice(0,10);
const daysAgo=(n:number)=>new Date(Date.now()-n*86400000).toISOString().slice(0,10);

function Trend({report,metric}:{report:Report;metric:Metric}){
  const points=[];const records=new Map(report.daily.map(row=>[row.day,row]));
  for(let date=Date.parse(report.filters.from);date<=Date.parse(report.filters.to);date+=86400000){const day=new Date(date).toISOString().slice(0,10);points.push({day,value:records.get(day)?.[metric]||0});}
  const max=Math.max(1,...points.map(row=>row.value));const width=1000,height=220,left=42,top=16,bottom=188;
  const coords=points.map((row,i)=>({x:left+(i/(points.length-1||1))*(width-left-12),y:bottom-row.value/max*(bottom-top),...row}));
  const line=coords.map(row=>`${row.x},${row.y}`).join(' ');
  return <div className="dash-chart"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${labels[metric]} from ${report.filters.from} to ${report.filters.to}`}>
    {[0,.5,1].map(part=><g key={part}><line x1={left} x2={width} y1={bottom-part*(bottom-top)} y2={bottom-part*(bottom-top)} stroke="var(--line)"/><text x="0" y={bottom-part*(bottom-top)+4} fill="var(--muted)" fontSize="12">{number.format(Math.round(max*part))}</text></g>)}
    <polygon points={`${left},${bottom} ${line} ${coords.at(-1)?.x},${bottom}`} fill="var(--accent)" opacity=".08"/>
    <polyline points={line} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round"/>
    {coords.map(row=><circle key={row.day} cx={row.x} cy={row.y} r={points.length>60?2:3.5} fill="var(--accent)"><title>{row.day}: {row.value} {labels[metric].toLowerCase()}</title></circle>)}
    <text x={left} y="214" fill="var(--muted)" fontSize="12">{report.filters.from}</text><text x={width-2} y="214" textAnchor="end" fill="var(--muted)" fontSize="12">{report.filters.to}</text>
  </svg></div>;
}

function csv(report:Report){
  const escape=(value:string|number)=>`"${String(value).replace(/^[=+@-]/,"'$&").replaceAll('"','""')}"`;
  const rows=[['Source','Campaign','Creative','Visits','Demo completed','Inventory used','Pricing seen','Demo clicks','Trial clicks','Fab clicks','Fab click rate'],...report.creatives.map(row=>[row.source,row.campaign,row.content,row.visits,row.completed,row.interacted,row.pricing,row.demo,row.trial,row.fab,rate(row.fab,row.visits)])];
  const url=URL.createObjectURL(new Blob([rows.map(row=>row.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=`webkiln-${report.filters.from}-${report.filters.to}.csv`;link.click();URL.revokeObjectURL(url);
}

export default function WebkilnDashboard(){
  const [from,setFrom]=useState(daysAgo(29)),[to,setTo]=useState(today()),[device,setDevice]=useState('all'),[qa,setQa]=useState(false);
  const [report,setReport]=useState<Report|null>(null),[auth,setAuth]=useState<'checking'|'login'|'ready'>('checking'),[error,setError]=useState(''),[busy,setBusy]=useState(false),[password,setPassword]=useState(''),[metric,setMetric]=useState<Metric>('visits'),[revision,setRevision]=useState(0),[sort,setSort]=useState<Metric>('visits');
  const passwordInput=useRef<HTMLInputElement>(null);
  useEffect(()=>{
    const controller=new AbortController();let active=true;
    async function load(){
      setBusy(true);setError('');setReport(null);
      try{
        const response=await fetch(`${API}/data?${new URLSearchParams({from,to,device,qa:qa?'1':'0'})}`,{signal:controller.signal});
        if(!active)return;
        if(response.status===401){setAuth('login');return;}
        const result=await response.json();if(!response.ok)throw new Error(result.error||'Could not load report.');
        if(active){setReport(result);setAuth('ready');}
      }catch(reason){if(active){setError(reason instanceof Error?reason.message:'Could not load report.');setAuth(current=>current==='checking'?'ready':current);}}
      finally{if(active)setBusy(false);}
    }
    void load();return()=>{active=false;controller.abort();};
  },[from,to,device,qa,revision]);
  async function login(event:FormEvent){
    event.preventDefault();setBusy(true);setError('');
    try{const response=await fetch(`${API}/login`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});const result=await response.json();if(!response.ok)throw new Error(result.error);setPassword('');setAuth('ready');setRevision(n=>n+1);}
    catch(reason){setError(reason instanceof Error?reason.message:'Could not sign in.');passwordInput.current?.focus();}finally{setBusy(false);}
  }
  async function logout(){try{const response=await fetch(`${API}/logout`,{method:'POST'});if(!response.ok)throw new Error();setReport(null);setAuth('login');}catch{setError('Could not sign out. Try again.');}}
  const preset=(days:number)=>{setFrom(daysAgo(days-1));setTo(today());};
  const creatives=report?[...report.creatives].sort((a,b)=>b[sort]-a[sort]):[];
  return <div className="dash-shell">
    <header className="dash-header"><a className="dash-brand" href="/webkiln/"><img src="/webkiln-logo.svg" alt=""/>Webkiln <span>Analytics</span></a><nav><a href="/webkiln/try/">Landing page ↗</a>{auth==='ready'&&<button onClick={()=>void logout()}>Sign out</button>}</nav></header>
    {auth==='checking'?<main className="dash-login"><p>Loading dashboard…</p></main>:auth==='login'?<main className="dash-login"><span className="dash-eyebrow">PRIVATE REPORT</span><h1>Campaign performance.</h1><form onSubmit={event=>void login(event)}><label htmlFor="dashboard-password">Password</label><input ref={passwordInput} id="dashboard-password" type="password" autoComplete="current-password" required value={password} onChange={event=>setPassword(event.target.value)}/><button className="dash-primary" disabled={busy}>{busy?'Signing in…':'Sign in'}</button></form>{error&&<p role="alert" className="dash-error">{error}</p>}</main>:<main>
      <div className="dash-title"><div><span className="dash-eyebrow">WEBKILN / ACQUISITION</span><h1>Campaign performance.</h1></div><div className="dash-tools"><button onClick={()=>setRevision(n=>n+1)} disabled={busy}>{busy?'Refreshing…':'Refresh'}</button><button onClick={()=>report&&csv(report)} disabled={!report}>Export CSV</button></div></div>
      <section className="dash-filters" aria-label="Report filters"><div className="dash-presets">{[7,30,90].map(days=><button key={days} aria-pressed={from===daysAgo(days-1)&&to===today()} onClick={()=>preset(days)}>{days} days</button>)}</div><label>From<input type="date" value={from} onChange={event=>setFrom(event.target.value)}/></label><label>To<input type="date" value={to} onChange={event=>setTo(event.target.value)}/></label><label>Device<select value={device} onChange={event=>setDevice(event.target.value)}>{['all','Windows','macOS','Linux','Android','iOS','Other'].map(item=><option key={item} value={item}>{item==='all'?'All devices':item}</option>)}</select></label><label className="dash-qa"><input type="checkbox" checked={qa} onChange={event=>setQa(event.target.checked)}/>Include tests</label><span className="dash-timezone">UTC</span></section>
      {error&&<div className="dash-error" role="alert">{error} <button onClick={()=>setRevision(n=>n+1)}>Retry</button></div>}
      {busy&&!report&&<div className="dash-loading" role="status">Loading report…</div>}
      {report&&<>
        <section className="dash-metrics" aria-label="Key metrics">{(['visits','demo','trial','fab'] as Metric[]).map(key=><button key={key} className={metric===key?'selected':''} onClick={()=>setMetric(key)} aria-pressed={metric===key}><span>{labels[key]}</span><strong>{number.format(report.totals[key])}</strong><small>{key==='visits'?'Page loads':`${rate(report.totals[key],report.totals.visits)} of visits`}</small></button>)}</section>
        <section className="dash-metrics dash-engagement" aria-label="Landing page engagement">{engagementMetrics.map(key=><button key={key} className={metric===key?'selected':''} onClick={()=>setMetric(key)} aria-pressed={metric===key}><span>{labels[key]}</span><strong>{number.format(report.totals[key]||0)}</strong><small>{rate(report.totals[key]||0,report.totals.visits)} of visits</small></button>)}</section>
        <p className="dash-engagement-note">Engagement tracking starts 17 September 2026. Demo completed means the UI finished building and was visible. Inventory used requires a user click. Pricing seen requires one second with at least half the price card visible. Earlier visits have no engagement measurements.</p>
        <section className="dash-panel dash-trend"><div className="dash-section-title"><h2>{labels[metric]} over time</h2><span>{number.format(report.totals.plays)} video starts <span className="dash-muted">including autoplay</span></span></div><Trend report={report} metric={metric}/>{report.totals.visits===0&&<p className="dash-empty">No visits in this period. {qa?'Try another date range.':'Test traffic is excluded.'}</p>}</section>
        <section className="dash-panel"><div className="dash-section-title"><h2>Ad creatives</h2><span>{creatives.length} {creatives.length===1?'source':'sources'}</span></div><div className="dash-table-scroll"><table><thead><tr><th>Creative / campaign</th>{tableMetrics.map(key=><th key={key} aria-sort={sort===key?'descending':'none'}><button onClick={()=>setSort(key)}>{labels[key]}{sort===key?' ↓':''}</button></th>)}<th>Fab rate</th></tr></thead><tbody>{creatives.map(row=><tr key={`${row.source}/${row.campaign}/${row.content}`}><td><strong>{creativeNames[row.content]||name(row.content)}</strong><small>{name(row.source)} / {name(row.campaign)}</small></td><>{tableMetrics.map(key=><td key={key}>{number.format(row[key]||0)}</td>)}</><td>{rate(row.fab,row.visits)}</td></tr>)}</tbody></table></div>{!creatives.length&&<p className="dash-empty">No creative data for these filters.</p>}</section>
        <div className="dash-breakdowns"><section className="dash-panel"><div className="dash-section-title"><h2>Devices</h2></div>{report.devices.length?report.devices.map(row=><div className="dash-device" key={row.name}><div><span>{row.name}</span><strong>{number.format(row.visits)} <small>visits</small></strong></div><div className="dash-bar"><span style={{width:`${report.totals.visits?row.visits/report.totals.visits*100:0}%`}}/></div><small>{row.demo} demo · {row.trial} trial · {row.fab} Fab</small></div>):<p className="dash-empty">No device data.</p>}</section>
        <section className="dash-panel"><div className="dash-section-title"><h2>Button locations</h2></div><table><thead><tr><th>Location</th><th>Demo</th><th>Trial</th><th>Fab</th></tr></thead><tbody>{report.placements.map(row=><tr key={row.name}><td>{row.name==='hero'?'Top of page':row.name==='evaluate'?'Bottom of page':row.name==='engine-selector'?'Trial selector':name(row.name)}</td><td>{row.demo}</td><td>{row.trial}</td><td>{row.fab}</td></tr>)}</tbody></table>{!report.placements.length&&<p className="dash-empty">No button clicks yet.</p>}{report.engines.length>0&&<div className="dash-engines"><h3>Trial versions</h3>{report.engines.map(row=><span key={row.name}>UE {row.name} <strong>{row.trial}</strong></span>)}</div>}</section></div>
        <footer className="dash-footer"><p>Clicks are counted once per page visit for each action. Refreshes count as new visits. Fab purchases and completed downloads are not tracked.</p><span>Updated {new Date(report.generatedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></footer>
      </>}
    </main>}
  </div>;
}
