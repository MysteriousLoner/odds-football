import assert from 'node:assert/strict';
import {test} from 'node:test';
import {matchSportsFixture,parseSportsFixtures,parseSportsQuotes} from './isports.ts';
const kickoff='2026-10-31T15:00:00.000Z';
const fixture={id:'42',home:'Manchester United',away:'Brighton Hove Albion',kickoff,live:false};
const match={a:'Man Utd',b:'Brighton',kickoff,live:false,source:'api'};
test('matching requires real source, verified aliases, ordered teams, exact time, phase and unique candidate',()=>{
 assert.equal(matchSportsFixture(match,[fixture])?.id,'42');
 for(const m of [{...match,source:'demo'},{...match,kickoff:undefined},{...match,kickoff:'2026-11-01T15:00:00Z'},{...match,live:true},{...match,a:match.b,b:match.a},{...match,a:'Man Utd U21'}])assert.equal(matchSportsFixture(m,[fixture]),null);
 assert.equal(matchSportsFixture(match,[fixture,{...fixture,id:'43'}]),null);
});
test('schedule parser excludes finished/cancelled games, other competitions and invalid times',()=>{
 const row={matchId:42,homeName:fixture.home,awayName:fixture.away,matchTime:Date.parse(kickoff)/1000,leagueName:'English Premier League',status:0};
 const parsed=parseSportsFixtures([row,{...row,status:-1},{...row,status:-13},{...row,leagueName:'England U21 Premier League'},{...row,matchTime:NaN}],Date.parse(kickoff)-86400000);
 assert.deepEqual(parsed,[fixture]);
});
test('back quote parser preserves all numeric scores and rejects absent, nonpositive, invalid and closed quotes',()=>{
 const row={matchId:'42',companyId:'3',changeTime:1793000000,odds:{bettingOddsItems:[{homeScore:1,awayScore:0,odds:'6.2'},{homeScore:4,awayScore:4,odds:'100'},{homeScore:0,awayScore:0,odds:'0'},{homeScore:null,awayScore:1,odds:9},{homeScore:2,awayScore:2,odds:'NaN'},null]}};
 const quotes=parseSportsQuotes([row,{...row,close:true},null],false);
 assert.equal(quotes.length,1);assert.equal(quotes[0].company,'Crown');
 assert.deepEqual(quotes[0].scores,[{score:'1–0',netBackOdds:6.2},{score:'4–4',netBackOdds:100}]);
 assert.equal((100/quotes[0].scores[0].netBackOdds).toFixed(2),'16.13');
});
