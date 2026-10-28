export type Selection = { score: string; odds: number; size: number; marketId: string; runnerId: number; handicap: number };
export type Match = { id: string; a: string; b: string; time: string; live: boolean; minute?: number; current?: string; formA?: string; formB?: string; selections: Selection[]; source: 'demo' | 'api'; kickoff?: string };
export type Ticket = { id: string; eventId: string; a: string; b: string; score: string; odds: number; risk: number; profit: number; grossProfit?: number; platformFee?: number; feeRate?: number; created: string; source: 'demo' | 'api'; status: 'open' | 'won' | 'lost'; final?: string; marketId: string; runnerId: number; handicap: number };
export type Account = { balance: number; tickets: Ticket[]; results: Record<string,string>; topups: number };
export const freshAccount = (): Account => ({ balance: 10000, tickets: [], results: {}, topups: 0 });
export const round = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
export const profitFor = (risk: number, odds: number) => Number.isFinite(risk) && Number.isFinite(odds) && risk > 0 && odds > 1 ? Math.floor((risk / (odds - 1) + Number.EPSILON) * 100) / 100 : 0;
export const PLATFORM_FEE_RATE = 0.05;
// Gross profit keeps the existing round-down policy. Fee rounds to the nearest cent;
// net profit is the remaining cents. Risk is never part of the fee basis.
export function payoutFor(risk:number,odds:number) {
  const grossProfit=profitFor(risk,odds);
  const grossCents=Math.round(grossProfit*100);
  const feeCents=Math.round(grossCents*PLATFORM_FEE_RATE);
  return {grossProfit,platformFee:feeCents/100,profit:(grossCents-feeCents)/100,feeRate:PLATFORM_FEE_RATE};
}
export const netReturnPercent = (odds:number) => Number.isFinite(odds)&&odds>1 ? 100*(1-PLATFORM_FEE_RATE)/(odds-1) : 0;
// Standard 19-runner correct-score market: a 4×4 exact-score grid plus three remainders.
export const CORRECT_SCORE_OUTCOMES = [
  ...Array.from({length:4},(_,home)=>Array.from({length:4},(_,away)=>`${home}–${away}`)).flat(),
  'Any Other Home Win','Any Other Away Win','Any Other Draw',
];
export const normalizeScore = (s:string) => s.trim().replace(/\s*[-–:]\s*/g,'–');
export function normalizeOutcome(value:string):string|null {
  const score=normalizeScore(value);
  return CORRECT_SCORE_OUTCOMES.find(s=>s.toLowerCase()===score.toLowerCase())??null;
}
export function outcomeDescription(outcome:string):string {
  if(outcome==='Any Other Home Win')return 'Other home win · 其他主胜 · home wins with 4+ goals';
  if(outcome==='Any Other Away Win')return 'Other away win · 其他客胜 · away wins with 4+ goals';
  if(outcome==='Any Other Draw')return 'Other draw · 其他平局 · 4–4, 5–5 and higher draws';
  return `Exact full-time score ${outcome}`;
}
export function outcomeContainsScore(outcome:string,final:string):boolean {
  const score=normalizeScore(final);
  if(!/^\d+–\d+$/.test(score))throw new Error('Enter a valid final score.');
  const [home,away]=score.split('–').map(Number);
  if(outcome==='Any Other Home Win')return home>=4&&home>away;
  if(outcome==='Any Other Away Win')return away>=4&&away>home;
  if(outcome==='Any Other Draw')return home>=4&&home===away;
  if(!/^\d+–\d+$/.test(normalizeScore(outcome)))throw new Error('Unknown correct-score outcome.');
  return normalizeScore(outcome)===score;
}
export function compareOutcomes(a:string,b:string):number {
  const x=a.split('–').map(Number),y=b.split('–').map(Number);
  const numericA=x.length===2&&x.every(Number.isFinite),numericB=y.length===2&&y.every(Number.isFinite);
  if(numericA&&numericB)return x[0]-y[0]||x[1]-y[1];
  if(numericA!==numericB)return numericA?-1:1;
  return CORRECT_SCORE_OUTCOMES.indexOf(a)-CORRECT_SCORE_OUTCOMES.indexOf(b);
}
const demoRows = [
  ['demo-1', 'Arsenal', 'Chelsea', '18:30', true, 32, '1–0', 'WWDWW', 'WLWWD', [15.5, 10.5, 12, 8.2, 9.6, 13.5]],
  ['demo-2', 'Liverpool', 'Manchester City', '21:00', false, 0, '', 'WWWDW', 'WDWWW', [19, 13, 12.5, 8.6, 10, 13]],
  ['demo-3', 'Manchester United', 'Tottenham', '23:30', false, 0, '', 'WDWLW', 'WLWDW', [17.5, 12, 13.5, 8.8, 11, 14]],
  ['demo-4', 'Newcastle United', 'Aston Villa', 'Tomorrow · 03:00', false, 0, '', 'LWWDW', 'DWWWL', [14, 10, 14.5, 8, 10.5, 15]],
  ['demo-5', 'Brighton', 'Everton', 'Tomorrow · 22:00', false, 0, '', 'WDWDL', 'LLWDW', [12.5, 9.5, 17, 9, 10, 18]],
] as const;
export const DEMO_MATCHES: Match[] = demoRows.map((r) => ({ id:r[0], a:r[1], b:r[2], time:r[3], live:r[4], minute:r[5], current:r[6], formA:r[7], formB:r[8], source:'demo', selections:[...['0–0','1–0','0–1','1–1','2–0','0–2'],...CORRECT_SCORE_OUTCOMES.filter(s=>!['0–0','1–0','0–1','1–1','2–0','0–2'].includes(s))].map((score,i) => ({score, odds:[...r[9],30,14,25,18,32,42,28,38,70,85,24,22,600][i], size:1000, marketId:`demo-market-${r[0]}`,runnerId:i+1,handicap:0})) }));
export function parseFeed(map: Record<string,unknown>, live: boolean): Match[] {
  return Object.entries(map).flatMap(([id, raw]) => {
    if (!raw || typeof raw !== 'object') return [];
    const e=raw as Record<string,unknown>;
    if(e.sport !== 'soccer' || typeof e.tournament !== 'string' || !/^(?:english\s+)?premier league$/i.test(e.tournament.trim()) || typeof e.team1 !== 'string' || typeof e.team2 !== 'string' || !Array.isArray(e.markets)) return [];
    const groups = new Map<string,Selection[]>();
    for(const row of e.markets) {
      if(!row || row.marketType !== 'CORRECT_SCORE' || typeof row.runner !== 'string' || !normalizeOutcome(row.runner) || !Number.isFinite(row.layOdds) || row.layOdds <= 1 || !Number.isFinite(row.laySize) || row.laySize <= 0 || typeof row.marketId !== 'string' || !Number.isFinite(row.runnerId) || !Number.isFinite(row.handicap)) continue;
      const group=groups.get(row.marketId) ?? [];
      group.push({score:normalizeOutcome(row.runner)!,odds:row.layOdds,size:row.laySize,marketId:row.marketId,runnerId:row.runnerId,handicap:row.handicap});groups.set(row.marketId,group);
    }
    const selections=Array.from(groups.values()).sort((a,b)=>b.length-a.length)[0];
    if(!selections?.length) return [];
    const timestamp = typeof e.openTimestamp === 'string' ? new Date(e.openTimestamp) : null;
    // Drop historic prematch fixtures; the upstream board can retain them.
    if(!live && timestamp && timestamp.getTime() < Date.now()-15*60*1000) return [];
    const time=timestamp && Number.isFinite(timestamp.getTime()) ? new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit',timeZone:'Asia/Kuala_Lumpur'}).format(timestamp) : 'Time TBC';
    return [{id:`api-${live?'live':'prematch'}-${id}`,a:e.team1,b:e.team2,time,live,selections,kickoff:timestamp && Number.isFinite(timestamp.getTime()) ? timestamp.toISOString() : undefined,source:'api' as const}];
  });
}
export function placeTicket(account:Account, match:Match, selection:Selection, risk:number): Account {
  if(!Number.isFinite(risk) || risk < 1 || risk > 10000 || round(risk)!==risk) throw new Error('Enter a risk from 1 to 10,000 credits, with up to 2 decimals.');
  if(risk>account.balance) throw new Error('Not enough credits. Reduce your risk or refill your demo wallet.');
  if(account.results[match.id]) throw new Error('This demo match has already settled. Choose another match.');
  if(!match.selections.some(s=>s.marketId===selection.marketId && s.runnerId===selection.runnerId && s.handicap===selection.handicap && s.odds===selection.odds)) throw new Error('The price changed. Select your score again.');
  const payout=payoutFor(risk,selection.odds);
  const {profit}=payout;
  if(profit < .01) throw new Error('This risk is too small for the selected price. Increase it to earn at least 0.01 credits.');
  const ticket:Ticket={id:crypto.randomUUID(),eventId:match.id,a:match.a,b:match.b,score:selection.score,odds:selection.odds,risk,...payout,created:new Date().toISOString(),source:match.source,status:'open',marketId:selection.marketId,runnerId:selection.runnerId,handicap:selection.handicap};
  return {...account,balance:round(account.balance-risk),tickets:[ticket,...account.tickets]};
}
export function settleMatch(account:Account,eventId:string,final:string): Account {
  const score=normalizeScore(final);
  if(!/^\d+–\d+$/.test(score)) throw new Error('Enter a valid final score.');
  if(account.results[eventId]) throw new Error('This match has already settled.');
  if(!account.tickets.some(t=>t.eventId===eventId && t.status==='open')) throw new Error('There are no open bets for this match.');
  let balance=account.balance;
  const tickets=account.tickets.map(t=>{
    if(t.eventId!==eventId || t.status!=='open') return t;
    const won=!outcomeContainsScore(t.score,score);
    if(won) balance=round(balance+t.risk+t.profit);
    return {...t,final:score,status:won?'won' as const:'lost' as const};
  });
  return {...account,balance,tickets,results:{...account.results,[eventId]:score}};
}
