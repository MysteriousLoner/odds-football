import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DEMO_MATCHES,freshAccount,placeTicket,settleMatch,profitFor,parseFeed} from './market.ts';
test('reverse correct score reserves maximum loss, returns risk plus profit on a different score',()=>{
 const m=DEMO_MATCHES[0],s=m.selections[0];const a=placeTicket(freshAccount(),m,s,100);
 assert.equal(a.balance,9900);assert.equal(a.tickets[0].profit,6.89);
 const b=settleMatch(a,m.id,'2-1');assert.equal(b.balance,10006.89);assert.equal(b.tickets[0].status,'won');
 assert.throws(()=>settleMatch(b,m.id,'1-0'));assert.throws(()=>placeTicket(b,m,s,100));
});
test('matching the excluded score loses only the reserved risk and settles all bets consistently',()=>{
 const m=DEMO_MATCHES[0];let a=placeTicket(freshAccount(),m,m.selections[0],100);a=placeTicket(a,m,m.selections[1],200);
 const b=settleMatch(a,m.id,'0–0');assert.equal(b.tickets[1].status,'lost');assert.equal(b.tickets[0].status,'won');assert.equal(b.balance,9921.05);
});
test('invalid stakes and changed prices cannot mutate wallet',()=>{
 const m=DEMO_MATCHES[0],s=m.selections[0];for(const risk of [NaN,Infinity,-100,0,.01,100.001,10001])assert.throws(()=>placeTicket(freshAccount(),m,s,risk));
 assert.throws(()=>placeTicket({...freshAccount(),balance:20},m,s,100));assert.throws(()=>placeTicket(freshAccount(),m,{...s,odds:2},100));assert.equal(profitFor(100,1),0);
});
test('API parser isolates competition, market, exact score and available lay side; preserves runner identity',()=>{
 const row={marketType:'CORRECT_SCORE',marketId:'1.2',runner:'1 - 0',runnerId:1,handicap:0,layOdds:12,laySize:100};
 const event={sport:'soccer',tournament:'Premier League',team1:'Arsenal',team2:'Chelsea',openTimestamp:new Date(Date.now()+86400000).toISOString(),markets:[row,{...row,runnerId:2,runner:'Any Other Home Win'},{...row,runnerId:3,layOdds:0},{...row,runnerId:4,marketType:'MATCH_ODDS'}]};
 const matches=parseFeed({good:event,other:{...event,tournament:'Scottish Premier League'},nullLeague:{...event,tournament:null}},false);
 assert.equal(matches.length,1);assert.equal(matches[0].selections.length,1);assert.equal(matches[0].selections[0].score,'1–0');assert.equal(matches[0].selections[0].marketId,'1.2');
 assert.equal(parseFeed({old:{...event,openTimestamp:'2020-01-01'}},false).length,0);
});
