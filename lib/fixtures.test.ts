import assert from 'node:assert/strict';
import {test} from 'node:test';
import {mytDate,inFixtureWindow,kickoffOrder} from './fixtures.ts';
import {parseFeed} from './market.ts';
test('MYT filters handle UTC midnight and the 29 October overnight cup kickoff',()=>{
 const now=Date.parse('2026-10-28T13:00:00Z');
 assert.equal(mytDate('2026-10-28T20:00:00Z'),'2026-10-29');
 assert.equal(inFixtureWindow('2026-10-28T20:00:00Z','near',now),true);
 assert.equal(inFixtureWindow('2026-10-28T20:00:00Z','2026-10-29',now),true);
 assert.equal(inFixtureWindow('2026-10-28T20:00:00Z','2026-10-28',now),false);
 assert.equal(inFixtureWindow('2026-11-01T16:30:00Z','near',now),false);
 assert.equal(inFixtureWindow('2026-11-01T16:30:00Z','all',now),true);
 assert.equal(inFixtureWindow(undefined,'near',now),false);
 assert.equal(inFixtureWindow('2026-10-28T15:59:59Z','2026-10-28',now),true);
 assert.equal(inFixtureWindow('2026-10-28T16:00:00Z','2026-10-29',now),true);
});
test('cup and Premier League fixtures remain distinct and sort by actual kickoff',()=>{
 const row={marketType:'CORRECT_SCORE',marketId:'1.2',runner:'1 - 0',runnerId:1,handicap:0,layOdds:12,laySize:100};
 const kickoff=new Date(Date.now()+86400000).toISOString();
 const event={sport:'soccer',tournament:'English Football League Cup',team1:'Liverpool',team2:'Chelsea',openTimestamp:kickoff,markets:[row]};
 const matches=parseFeed({cup:event,league:{...event,tournament:'Premier League',team2:'Arsenal',openTimestamp:new Date(Date.parse(kickoff)+86400000).toISOString()},otherSport:{...event,sport:'tennis'}},false).sort(kickoffOrder);
 assert.equal(matches.length,2);assert.equal(matches[0].competition,'English Football League Cup');assert.equal(matches[0].b,'Chelsea');assert.equal(matches[1].b,'Arsenal');
});
