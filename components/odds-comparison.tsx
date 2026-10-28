'use client';
import { useState } from 'react';
import { RefreshCw, ArrowLeftRight } from 'lucide-react';
import type { Match } from '@/lib/market';
import { matchSportsFixture } from '@/lib/isports';
import type { SportsData, SportsFixture } from '@/lib/isports';
type Props={matches:Match[];onLoadTerrace:()=>Promise<void>;terraceError:string;terraceCapturedAt:string;terraceExpired:boolean;now:number};
const fmt=(n:number)=>n.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
const time=(s:string|null)=>s?new Date(s).toLocaleString('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',second:'2-digit',timeZone:'Asia/Kuala_Lumpur'}):'Not available';
export default function OddsComparison({matches,onLoadTerrace,terraceError,terraceCapturedAt,terraceExpired,now}:Props){
 const [data,setData]=useState<SportsData|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[company,setCompany]=useState('3'),[matchFilter,setMatchFilter]=useState('all'),[risk,setRisk]=useState('100');
 async function load(){setLoading(true);setError('');await Promise.all([onLoadTerrace(),(async()=>{try{const response=await fetch('/api/isports');const next=await response.json() as SportsData;if(!response.ok||next.error||!next.configured)throw new Error(next.error||'iSports is not configured.');setData(next);}catch(e){setError(e instanceof Error?e.message:'Unable to load iSports.');}})()]);setLoading(false);}
 const apiMatches=matches.filter(m=>m.source==='api');
 const items:{id:string;name:string;m?:Match;fixture:SportsFixture|null}[]=apiMatches.map(m=>({id:m.id,name:`${m.a} v ${m.b}`,m,fixture:matchSportsFixture(m,data?.fixtures??[])}));
 for(const f of data?.fixtures??[])if(!items.some(i=>i.fixture?.id===f.id))items.push({id:`isports-${f.id}`,name:`${f.home} v ${f.away}`,fixture:f});
 const companies=[...new Map((data?.quotes??[]).map(q=>[q.companyId,q.company])).entries()];if(!companies.some(([id])=>id==='3'))companies.unshift(['3','Crown']);
 const amount=Number(risk),validRisk=Number.isFinite(amount)&&amount>=1&&amount<=1000000;
 const expired=!!data&&now>=Date.parse(data.expiresAt);
 return <section className="comparison-view">
  <div className="page-heading"><div><h1>COMPARE THE SAME SCORE.</h1><p>Terrace and iSports, side by side. 反波胆 profit per equal maximum loss.</p></div><ArrowLeftRight size={28}/></div>
  <div className="comparison-explainer"><strong>Two sources. One risk basis.</strong><p>Terrace uses the supplied Betfair-derived lay price: 100 ÷ (lay odds − 1). iSports uses 100 ÷ net back odds as a <strong>hypothetical lay return</strong>. iSports supplies back odds, not an executable lay quote. No multiplier or fee has been added.</p><p>Only real fixtures with matching home team, away team, exact kickoff and prematch / in-play phase are paired. Demo fixtures are never matched.</p></div>
  <div className="comparison-load"><button className="primary" disabled={loading} onClick={load}><RefreshCw size={16} className={loading?'spin':''}/>{loading?'Loading both sources…':'Load / refresh both sources'}</button><span>Manual refresh · iSports cached for 60 seconds</span></div>
  {(error||terraceError)&&<div className="inline-error" role="alert">{terraceError&&<p>Terrace: {terraceError}</p>}{error&&<p>iSports: {error}</p>}{data&&<p>The last successful iSports snapshot is retained below.</p>}</div>}
  {data?.warnings?.map(w=><p className="inline-error" role="status" key={w}>{w}</p>)}
  {(data||terraceCapturedAt)&&<div className="comparison-times"><span>Terrace captured: <b>{time(terraceCapturedAt)}</b>{terraceExpired?' · expired snapshot':''}</span><span>iSports captured: <b>{time(data?.receivedAt??null)}</b>{expired?' · expired snapshot':''}</span><span>All times MYT · Captures are not simultaneous</span></div>}
  <div className="comparison-controls"><label>Match<select value={matchFilter} onChange={e=>setMatchFilter(e.target.value)}><option value="all">All available matches ({items.length})</option>{items.map(i=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label><label>iSports bookmaker<select value={company} onChange={e=>setCompany(e.target.value)}>{companies.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><label>Credits at risk<input type="number" min="1" max="1000000" value={risk} onChange={e=>setRisk(e.target.value)}/></label></div>
  {!validRisk&&<p className="inline-error" role="alert">Enter a maximum loss from 1 to 1,000,000 credits.</p>}
  <p className="comparison-guide">A 6% return means 6 credits profit per 100 credits at risk when the excluded score does not happen. The risk is returned too; that exact score loses the risk. Credit amounts below are proportional estimates. Gap = iSports − Terrace, in percentage points.</p>
  {!items.length&&<div className="empty-panel"><ArrowLeftRight size={30}/><h3>{data?'No eligible Premier League fixtures':'Load the comparison board'}</h3><p>{data?'Neither snapshot contains eligible fixtures right now. Refresh when the providers have current Premier League markets.':'Load both APIs to compare real games. Your simulated sportsbook and credit wallet remain available.'}</p></div>}
  {items.filter(i=>matchFilter==='all'||i.id===matchFilter).map(item=>{
   const m=item.m,f=item.fixture,quote=f?data?.quotes.find(q=>q.matchId===f.id&&q.companyId===company&&q.live===f.live):undefined;
   const scores=[...new Set([...(m?.selections.map(s=>s.score)??[]),...(quote?.scores.map(s=>s.score)??[])])].sort((a,b)=>{const x=a.split('–').map(Number),y=b.split('–').map(Number);return x[0]-y[0]||x[1]-y[1]});
   return <article className="comparison-match" key={item.id}><h2>{item.name}</h2><p className="comparison-match-meta">{time(m?.kickoff??f?.kickoff??null)} MYT · {m?.live||f?.live?'In play':'Prematch'} · {m&&f?'Teams, kickoff and phase matched':m?'No unambiguous iSports fixture match':'No matching Terrace fixture with priced lay selections'}</p>
    {f&&<p className="comparison-match-meta">iSports match {f.id} · {quote?`${quote.company} price last changed: ${time(quote.changedAt)} MYT`:'No open correct-score quote for the selected bookmaker / phase'}. Last-change time is not feed latency.</p>}
    {!scores.length?<p className="comparison-guide">No numeric correct-score quotes in this snapshot.</p>:<div className="comparison-scroll" tabIndex={0} role="region" aria-label={`Rates for ${item.name}`}><table className="comparison-table"><thead><tr><th scope="col">Excluded<br/>score</th><th scope="col">Terrace<small>Betfair-derived lay return</small></th><th scope="col">iSports · {companies.find(([id])=>id===company)?.[1]}<small>Hypothetical lay return</small></th><th scope="col">Gap<small>iSports − Terrace</small></th></tr></thead><tbody>{scores.map(score=>{
     const terrace=m?.selections.find(s=>s.score===score),sports=quote?.scores.find(s=>s.score===score),a=terrace?100/(terrace.odds-1):null,b=sports?100/sports.netBackOdds:null;
     return <tr key={score}><th scope="row">{score}</th><td>{a!==null?<><strong>{fmt(a)}%</strong><small>{validRisk?`${fmt(amount*a/100)} CR profit`:'—'}</small><small>Lay {terrace!.odds}</small></>:<span className="comparison-missing">No lay quote</span>}</td><td>{b!==null?<><strong>{fmt(b)}%</strong><small>{validRisk?`${fmt(amount*b/100)} CR profit`:'—'}</small><small>Net back {sports!.netBackOdds}</small></>:<span className="comparison-missing">No iSports quote</span>}</td><td>{a!==null&&b!==null?<><strong>{b-a>=0?'+':''}{fmt(b-a)} pp</strong><small>{terraceExpired||expired?'Expired snapshot':'Snapshot difference'}</small></>:<span className="comparison-missing">—</span>}</td></tr>;
    })}</tbody></table></div>}
   </article>;
  })}
  <p className="comparison-guide">Comparison only. iSports prices cannot be added to the bet slip. Your existing credit-bet pricing and settlement rules are unchanged.</p>
 </section>;
}
