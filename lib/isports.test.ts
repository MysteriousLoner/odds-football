import assert from 'node:assert/strict';
import {test} from 'node:test';
import {matchSportsFixture,parseSportsFixtures,parseSportsQuotes} from './isports.ts';
const kickoff='2026-10-31T15:00:00.000Z';
const fixture={id:'42',home:'Manchester United',away:'Brighton Hove Albion',kickoff,live:false,competition:'English Premier League'};
const match={a:'Man Utd',b:'Brighton',kickoff,live:false,source:'api'};
test('matching requires real source, verified aliases, ordered teams, exact time, phase and unique candidate',()=>{
 assert.equal(matchSportsFixture(match,[fixture])?.id,'42');
 for(const m of [{...match,source:'demo'},{...match,kickoff:undefined},{...match,kickoff:'2026-11-01T15:00:00Z'},{...match,live:true},{...match,a:match.b,b:match.a},{...match,a:'Man Utd U21'}])assert.equal(matchSportsFixture(m,[fixture]),null);
 assert.equal(matchSportsFixture(match,[fixture,{...fixture,id:'43'}]),null);
});
test('schedule parser includes leagues and cups but excludes finished/cancelled games and invalid times',()=>{
 const row={matchId:42,homeName:fixture.home,awayName:fixture.away,matchTime:Date.parse(kickoff)/1000,leagueName:'English Premier League',status:0};
 const parsed=parseSportsFixtures([row,{...row,status:-1},{...row,status:-13},{...row,matchId:43,leagueName:'England League Cup'},{...row,matchTime:NaN}],Date.parse(kickoff)-86400000);
 assert.deepEqual(parsed,[fixture,{...fixture,id:'43',competition:'England League Cup'}]);
});
test('back quote parser preserves all numeric scores and rejects absent, nonpositive, invalid and closed quotes',()=>{
 const row={matchId:'42',companyId:'3',changeTime:1793000000,odds:{bettingOddsItems:[{homeScore:1,awayScore:0,odds:'6.2'},{homeScore:4,awayScore:4,odds:'100'},{homeScore:0,awayScore:0,odds:'0'},{homeScore:null,awayScore:1,odds:9},{homeScore:2,awayScore:2,odds:'NaN'},null]}};
 const quotes=parseSportsQuotes([row,{...row,close:true},null],false);
 assert.equal(quotes.length,1);assert.equal(quotes[0].company,'Crown');
 assert.deepEqual(quotes[0].scores,[{score:'1–0',netBackOdds:6.2},{score:'4–4',netBackOdds:100}]);
 assert.equal((100/quotes[0].scores[0].netBackOdds).toFixed(2),'16.13');
});

test('same teams in different competitions do not pair, while verified League Cup names do',()=>{
 const cup={...fixture,competition:'England League Cup'};
 assert.equal(matchSportsFixture({...match,competition:'Premier League'},[cup]),null);
 assert.equal(matchSportsFixture({...match,competition:'English Football League Cup'},[cup])?.id,'42');
});

test('verified AFC Champions League Two / 2 labels match the same fixture',()=>{
 const m={...match,a:'Tampines Rovers',b:'Svay Rieng FC',competition:'AFC Champions League Two'};
 const f={...fixture,home:'Tampines Rovers FC',away:'Svay Rieng FC',competition:'AFC Champions League 2'};
 assert.equal(matchSportsFixture(m,[f])?.id,'42');
});
