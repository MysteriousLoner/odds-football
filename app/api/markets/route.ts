import { parseFeed } from '@/lib/market';
export const dynamic='force-dynamic';
let cache: {at:number;data:unknown}|null=null;
let pending:Promise<Response>|null=null;
export async function GET() {
  const key=process.env.BETFAIR_ODDS_API_KEY;
  const headers={'Cache-Control':'no-store'};
  if(!key) return Response.json({configured:false,message:'Live odds are not connected. Set BETFAIR_ODDS_API_KEY in the server environment to connect.'},{headers});
  if(cache && Date.now()-cache.at<30000) return Response.json(cache.data,{headers});
  if(pending) return (await pending).clone();
  pending=(async()=>{
    try {
      const feeds=await Promise.all(['live','prematch'].map(async feed=>{
        const response=await fetch(`https://betfair-odds.com/betfair/v1/livemap?feed=${feed}&sports=soccer`,{headers:{'x-portal-apikey':key},signal:AbortSignal.timeout(15000)});
        if(!response.ok){
          const detail=response.status===401?'The odds API key was rejected.':response.status===403?'The API plan does not allow this feed.':response.status===429?'The API request limit was reached. Wait before refreshing.':'The odds provider is temporarily unavailable.';
          throw new Error(detail);
        }
        const body=await response.json() as {meta?:{stale?:boolean;age_ms?:number};liveMap?:Record<string,unknown>};
        if(body.meta?.stale !== false || !body.liveMap) throw new Error('The odds feed is stale or unavailable. New bets are paused.');
        return parseFeed(body.liveMap,feed==='live');
      }));
      const data={configured:true,matches:feeds.flat(),receivedAt:new Date().toISOString(),expiresAt:new Date(Date.now()+30000).toISOString()};
      cache={at:Date.now(),data};return Response.json(data,{headers});
    } catch(error){ return Response.json({configured:true,error:error instanceof Error?error.message:'Unable to load odds. Try refreshing.'},{status:502,headers}); }
  })();
  try{return (await pending).clone();}finally{pending=null;}
}
