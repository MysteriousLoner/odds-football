import json,csv,statistics,datetime,html
from pathlib import Path
p=Path(__file__).resolve().parents[2] / 'reports/odds-platform-audit-2026-10-26'
results=[]; flat=[]
for s in json.load(open(p/'site-captures.json')):
 d=json.load(open(p/('api-event-'+s['eventId']+'.json'))); e=d['response']['event'];q={m['runner'].replace(' ',''):m for m in e['markets'] if m['marketType']=='CORRECT_SCORE'}
 rs=[]
 for r in s['rows']:
  m=q[r['score']];o=m.get('layOdds',0)
  if o<=1:continue
  row=dict(r,apiLayOdds=o,apiReturnPercent=100/(o-1),ratio=r['sitePercent']*(o-1)/100,apiBackOdds=m.get('backOdds'),apiLaySize=m.get('laySize'),marketId=m['marketId'])
  rs.append(row);flat.append(dict(fixture=e['team1']+' v '+e['team2'],league=e['tournament'],eventId=s['eventId'],siteCapturedAt=s['capturedAt'],apiCapturedAt=d['capturedAt'],**row))
 ratios=[r['ratio'] for r in rs]; gap=abs((datetime.datetime.fromisoformat(s['capturedAt'].replace('Z','+00:00'))-datetime.datetime.fromisoformat(d['capturedAt'])).total_seconds())
 results.append(dict(eventId=s['eventId'],fixture=e['team1']+' v '+e['team2'],league=e['tournament'],kickoff=e['openTimestamp'],siteCapturedAt=s['capturedAt'],apiCapturedAt=d['capturedAt'],captureGapSeconds=gap,apiMeta=d['response']['meta'],n=len(rs),medianRatio=statistics.median(ratios),minRatio=min(ratios),maxRatio=max(ratios),nearHalf=sum(.45<=x<=.55 for x in ratios),rows=rs))
a=[r['ratio'] for r in flat]; summary=dict(fixtures=len(results),leagues=len(set(r['league'] for r in results)),pairs=len(a),medianRatio=statistics.median(a),minRatio=min(a),maxRatio=max(a),nearHalf=sum(.45<=x<=.55 for x in a),aboveOne=sum(x>1 for x in a),maxCaptureGapSeconds=max(r['captureGapSeconds'] for r in results))
report=dict(formula='API gross return on maximum liability (%) = 100 / (layOdds - 1); ratio = site percentage / API gross return percentage',scope='Full-time CORRECT_SCORE, numeric 0-0 through 3-3 only. Prematch soccer. Convenience sample, not a platform census. No commission assumption.',limitations='Captures are not simultaneous; use capture timestamps and feed metadata. Displayed percentages only; site settlement/stake basis and source feed are unverified. Initial captures with delayed table updates were superseded.',summary=summary,results=results)
(p/'comparison.json').write_text(json.dumps(report,indent=2))
with open(p/'comparison.csv','w') as f:
 w=csv.DictWriter(f,fieldnames=flat[0].keys());w.writeheader();w.writerows(flat)
tr=''.join('<tr><td>'+html.escape(r['fixture'])+'<br><small>'+html.escape(r['league'])+'</small></td><td>'+str(r['n'])+'</td><td>'+f'{r["medianRatio"]:.1%}'+'</td><td>'+f'{r["minRatio"]:.1%}–{r["maxRatio"]:.1%}'+'</td><td>'+str(r['nearHalf'])+'</td></tr>' for r in results)
sections=''
for r in results:
 rows=''.join('<tr><td>'+x['score']+'</td><td>'+str(x['apiLayOdds'])+'</td><td>'+f'{x["apiReturnPercent"]:.4f}%'+'</td><td>'+str(x['sitePercent'])+'%</td><td>'+f'{x["ratio"]:.1%}'+'</td></tr>' for x in r['rows'])
 sections+='<section><h2>'+html.escape(r['fixture'])+'</h2><p>Site '+r['siteCapturedAt']+' · API '+r['apiCapturedAt']+f' · Gap {r["captureGapSeconds"]:.0f}s · stale=false</p><img src="site-'+r['eventId']+'.jpg"><table><tr><th>Score</th><th>API lay</th><th>API gross return</th><th>Site return</th><th>Site/API</th></tr>'+rows+'</table></section>'
page='''<!doctype html><meta charset="utf-8"><title>Cross-league odds comparison</title><style>body{font:16px system-ui;max-width:1120px;margin:40px auto;color:#17252d;background:#f7f8fa}h1{font-size:34px}p{line-height:1.6}table{border-collapse:collapse;width:100%;background:white;margin:20px 0}td,th{padding:12px;border-bottom:1px solid #ddd;text-align:left}small{color:#667}section{margin-top:60px}img{width:100%;border:1px solid #ddd}code{background:#e6edf0;padding:4px}</style><h1>The site is not consistently half the API return</h1><p>Compiled comparison evidence · 26 October 2026 · Read-only audit. Screenshots are from 1CUF; API figures are calculated from the saved JSON responses, not screenshots of the provider.</p><p><b>112 selections · 7 matches · 6 leagues.</b> Median site/API multiplier: 74.2%. Only 7/112 selections lie within 45%–55%. 28/112 site returns exceed the API-derived return.</p><p><code>API gross return (%) = 100 / (layOdds − 1)</code><br><code>Multiplier = site return (%) / API gross return (%)</code></p><table><tr><th>Fixture / league</th><th>Pairs</th><th>Median multiplier</th><th>Range</th><th>Within 45–55%</th></tr>'''+tr+'</table><p>'+html.escape(report['limitations'])+' '+html.escape(report['scope'])+'</p>'+sections
(p/'report.html').write_text(page)
print(json.dumps(summary,indent=2));print('Evidence saved:',p)
