export type SportsFixture = { id:string; home:string; away:string; kickoff:string; live:boolean };
export type SportsQuote = { matchId:string; companyId:string; company:string; live:boolean; changedAt:string|null; scores:{score:string; netBackOdds:number}[] };
export type SportsData = { configured:boolean; fixtures:SportsFixture[]; quotes:SportsQuote[]; receivedAt:string; expiresAt:string; error?:string; warnings?:string[] };
const aliases:Record<string,string>={
 'man utd':'manchester united','man united':'manchester united','man city':'manchester city',
 'tottenham':'tottenham hotspur','spurs':'tottenham hotspur','brighton':'brighton hove albion','brighton and hove albion':'brighton hove albion',
 'bournemouth':'afc bournemouth','nottm forest':'nottingham forest','nott forest':'nottingham forest',
 'wolves':'wolverhampton wanderers','west ham':'west ham united','newcastle':'newcastle united',
 'leeds':'leeds united','ipswich':'ipswich town','sunderland afc':'sunderland','sunderland a f c':'sunderland',
 'coventry':'coventry city','hull':'hull city',
};
export function teamKey(name:string):string {
 const key=name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[.&]/g,' ').replace(/\bfc\b/g,' ').replace(/\s+/g,' ').trim();
 return aliases[key]??key;
}
export function matchSportsFixture(match:{a:string;b:string;kickoff?:string;source:string;live:boolean},fixtures:SportsFixture[]):SportsFixture|null {
 if(match.source!=='api'||!match.kickoff||!Number.isFinite(Date.parse(match.kickoff)))return null;
 const candidates=fixtures.filter(f=>teamKey(f.home)===teamKey(match.a)&&teamKey(f.away)===teamKey(match.b)&&Date.parse(f.kickoff)===Date.parse(match.kickoff!)&&f.live===match.live);
 return candidates.length===1?candidates[0]:null;
}
export function parseSportsFixtures(raw:unknown,now=Date.now()):SportsFixture[]{
 if(!Array.isArray(raw))return [];
 return raw.flatMap(e=>{
  if(!e||!['English Premier League','England Premier League'].includes(e.leagueName)||!['string','number'].includes(typeof e.matchId)||typeof e.homeName!=='string'||typeof e.awayName!=='string'||!Number.isFinite(e.matchTime)||![0,1,2,3,4,5].includes(e.status))return [];
  const time=e.matchTime*1000;
  if(time<now-86400000||time>now+14*86400000)return [];
  return [{id:String(e.matchId),home:e.homeName,away:e.awayName,kickoff:new Date(time).toISOString(),live:e.status!==0}];
 });
}
export function parseSportsQuotes(raw:unknown,live:boolean):SportsQuote[]{
 if(!Array.isArray(raw))return [];
 return raw.flatMap(e=>{
  if(!e||e.close===true||!['string','number'].includes(typeof e.matchId)||!['string','number'].includes(typeof e.companyId)||!Array.isArray(e.odds?.bettingOddsItems))return [];
  const scores=new Map<string,number>();
  for(const r of e.odds.bettingOddsItems){
   if(!r||r.homeScore==null||r.awayScore==null||String(r.homeScore).trim()===''||String(r.awayScore).trim()==='')continue;
   const a=Number(r.homeScore),b=Number(r.awayScore),odds=Number(r.odds);
   if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>20||b>20||!Number.isFinite(odds)||odds<=0)continue;
   scores.set(`${a}–${b}`,odds);
  }
  if(!scores.size)return [];
  const id=String(e.companyId);
  return [{matchId:String(e.matchId),companyId:id,company:({'1':'Macauslot','3':'Crown','31':'Sbobet'} as Record<string,string>)[id]??`Bookmaker ${id}`,live,changedAt:Number.isFinite(e.changeTime)&&e.changeTime>0?new Date(e.changeTime*1000).toISOString():null,scores:[...scores].map(([score,netBackOdds])=>({score,netBackOdds}))}];
 });
}
