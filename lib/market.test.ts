import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DEMO_MATCHES,freshAccount,placeTicket,settleMatch,profitFor,payoutFor,netReturnPercent,parseFeed,CORRECT_SCORE_OUTCOMES,outcomeContainsScore} from './market.ts';
test('reverse correct score reserves maximum loss, returns risk plus profit on a different score',()=>{
 const m=DEMO_MATCHES[0],s=m.selections[0];const a=placeTicket(freshAccount(),m,s,100);
 assert.equal(a.balance,9900);assert.equal(a.tickets[0].profit,6.55);
 const b=settleMatch(a,m.id,'2-1');assert.equal(b.balance,10006.55);assert.equal(b.tickets[0].status,'won');
 assert.throws(()=>settleMatch(b,m.id,'1-0'));assert.throws(()=>placeTicket(b,m,s,100));
});
test('matching the excluded score loses only the reserved risk and settles all bets consistently',()=>{
 const m=DEMO_MATCHES[0];let a=placeTicket(freshAccount(),m,m.selections[0],100);a=placeTicket(a,m,m.selections[1],200);
 const b=settleMatch(a,m.id,'0–0');assert.equal(b.tickets[1].status,'lost');assert.equal(b.tickets[0].status,'won');assert.equal(b.balance,9920);
});
test('invalid stakes and changed prices cannot mutate wallet',()=>{
 const m=DEMO_MATCHES[0],s=m.selections[0];for(const risk of [NaN,Infinity,-100,0,.01,100.001,10001])assert.throws(()=>placeTicket(freshAccount(),m,s,risk));
 assert.throws(()=>placeTicket({...freshAccount(),balance:20},m,s,100));assert.throws(()=>placeTicket(freshAccount(),m,{...s,odds:2},100));assert.equal(profitFor(100,1),0);
});
test('API parser isolates competition, market, supported outcomes and available lay side; preserves runner identity',()=>{
 const row={marketType:'CORRECT_SCORE',marketId:'1.2',runner:'1 - 0',runnerId:1,handicap:0,layOdds:12,laySize:100};
 const event={sport:'soccer',tournament:'Premier League',team1:'Arsenal',team2:'Chelsea',openTimestamp:new Date(Date.now()+86400000).toISOString(),markets:[row,{...row,runnerId:2,runner:'Any Other Home Win'},{...row,runnerId:3,layOdds:0},{...row,runnerId:4,marketType:'MATCH_ODDS'}]};
 const matches=parseFeed({good:event,other:{...event,tournament:'Scottish Premier League'},nullLeague:{...event,tournament:null}},false);
 assert.equal(matches.length,1);assert.equal(matches[0].selections.length,2);assert.equal(matches[0].selections[0].score,'1–0');assert.equal(matches[0].selections[0].marketId,'1.2');
 assert.equal(parseFeed({old:{...event,openTimestamp:'2020-01-01'}},false).length,0);
});

test('all 19 outcomes partition every final score and grouped lay tickets settle with correct liability',()=>{
 assert.equal(CORRECT_SCORE_OUTCOMES.length,19);
 for(let home=0;home<=12;home++)for(let away=0;away<=12;away++){
  const hits=CORRECT_SCORE_OUTCOMES.filter(o=>outcomeContainsScore(o,`${home}–${away}`));
  assert.equal(hits.length,1,`${home}–${away} belongs to exactly one outcome`);
 }
 const m=DEMO_MATCHES[1];assert.equal(m.selections.length,19);assert.ok(m.selections.every(s=>Number.isFinite(s.odds)&&s.odds>1));
 for(const [outcome,losing,winning] of [
  ['Any Other Home Win','4–0','3–0'],['Any Other Home Win','5–4','4–5'],
  ['Any Other Away Win','0–4','0–3'],['Any Other Away Win','4–5','5–4'],
  ['Any Other Draw','4–4','3–3'],['Any Other Draw','5–5','5–4'],
 ]){
  const selection=m.selections.find(s=>s.score===outcome)!;
  const placed=placeTicket(freshAccount(),m,selection,100);
  const lost=settleMatch(placed,m.id,losing);assert.equal(lost.balance,9900);assert.equal(lost.tickets[0].status,'lost');
  const won=settleMatch(placed,m.id,winning);assert.equal(won.balance,10000+placed.tickets[0].profit);assert.equal(won.tickets[0].status,'won');
 }
});
test('all 19 API runners preserve source identities and unavailable lay outcomes stay unpriced',()=>{
 const rows=CORRECT_SCORE_OUTCOMES.map((runner,i)=>({marketType:'CORRECT_SCORE',marketId:'1.19',runner,runnerId:100+i,handicap:0,layOdds:10+i,laySize:100}));
 const event={sport:'soccer',tournament:'Premier League',team1:'Arsenal',team2:'Chelsea',openTimestamp:new Date(Date.now()+86400000).toISOString(),markets:rows};
 const parsed=parseFeed({match:event},false)[0];assert.equal(parsed.selections.length,19);
 parsed.selections.forEach((s,i)=>{assert.equal(s.score,rows[i].runner);assert.equal(s.runnerId,rows[i].runnerId);assert.equal(s.odds,rows[i].layOdds);assert.equal(s.marketId,'1.19')});
 rows[16].laySize=0;rows[17].layOdds=0;
 const limited=parseFeed({match:event},false)[0];assert.equal(limited.selections.length,17);
 assert.ok(!limited.selections.some(s=>s.score==='Any Other Home Win'||s.score==='Any Other Away Win'));
});

test('5% fee reduces winning profit only; preview, stored ticket and wallet reconcile',()=>{
 const m=DEMO_MATCHES[1],base=m.selections[0];
 const selection={...base,odds:11};const market={...m,selections:[selection]};
 assert.deepEqual(payoutFor(100,11),{grossProfit:10,platformFee:0.5,profit:9.5,feeRate:0.05});
 assert.equal(netReturnPercent(11),9.5);
 const placed=placeTicket(freshAccount(),market,selection,100);
 assert.equal(placed.balance,9900);assert.equal(placed.tickets[0].grossProfit,10);assert.equal(placed.tickets[0].platformFee,0.5);assert.equal(placed.tickets[0].profit,9.5);
 const won=settleMatch(placed,m.id,'2–1');assert.equal(won.balance,10009.5);assert.equal(won.tickets[0].status,'won');
 const lost=settleMatch(placed,m.id,'0–0');assert.equal(lost.balance,9900);assert.equal(lost.tickets[0].status,'lost');
 assert.throws(()=>settleMatch(won,m.id,'2–1'));
});
test('fee rounding preserves credit cents and pre-fee tickets retain their original payouts',()=>{
 assert.deepEqual(payoutFor(100,10.5),{grossProfit:10.52,platformFee:0.53,profit:9.99,feeRate:0.05});
 for(const [risk,odds] of [[100,15.5],[250,11],[1,1000],[10000,1.01]]){
  const p=payoutFor(risk,odds);assert.equal(Math.round(p.profit*100)+Math.round(p.platformFee*100),Math.round(p.grossProfit*100));
 }
 const m=DEMO_MATCHES[1],s=m.selections[0],placed=placeTicket(freshAccount(),m,s,100);
 const {grossProfit,platformFee,feeRate,...ticket}=placed.tickets[0];
 const legacy={...placed,tickets:[{...ticket,profit:profitFor(100,s.odds)}]};
 assert.equal(settleMatch(legacy,m.id,'2–1').balance,10000+legacy.tickets[0].profit);
});
