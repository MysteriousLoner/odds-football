import { parseSportsFixtures,parseSportsQuotes } from '@/lib/isports';
import type { SportsData } from '@/lib/isports';
export const dynamic='force-dynamic';
let cache:{at:number;key:string;data:SportsData}|null=null;
let pending:Promise<SportsData>|null=null;
const headers={'Cache-Control':'no-store'};
let lastAttempt=0;
async function request(path:string,params:Record<string,string>,key:string):Promise<unknown>{
 const url=new URL(`https://api.isportsapi.com/sport/football/${path}`);url.search=new URLSearchParams({...params,api_key:key}).toString();
 let response:Response;
 try{response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Terrace-Comparison/1.0'},signal:AbortSignal.timeout(20000),cache:'no-store'});}catch{throw new Error('iSports could not be reached. Try again after a minute.');}
 if(!response.ok)throw new Error(response.status===429?'iSports request limit reached. Wait before refreshing.':'iSports is temporarily unavailable.');
 let body:{code?:number;data?:unknown};try{body=await response.json();}catch{throw new Error('iSports returned an unreadable response.');}
 if(body.code!==0)throw new Error('iSports rejected the request. Check the API key, Odds Pro permissions and request limits.');
 if(!Array.isArray(body.data))throw new Error('iSports returned an unexpected data format.');
 return body.data;
}
export async function GET(){
 const key=process.env.ISPORTS_API_KEY;
 if(!key)return Response.json({configured:false,error:'Set ISPORTS_API_KEY in the server environment to compare iSports prices.'},{headers});
 if(cache?.key===key&&Date.now()-cache.at<60000)return Response.json(cache.data,{headers});
 if(!pending&&Date.now()-lastAttempt<60000)return Response.json({configured:true,error:'Wait one minute between iSports refresh attempts.'},{status:429,headers});
 if(!pending){lastAttempt=Date.now();pending=(async()=>{
  // 1639 is the English Premier League ID verified against the provider schedule.
  const fixtures=parseSportsFixtures(await request('schedule/basic',{leagueId:'1639'},key));
  const warnings:string[]=[];
  const feeds=await Promise.all([false,true].map(async live=>{
   if(!fixtures.some(f=>f.live===live))return [];
   try{return parseSportsQuotes(await request(`odds/score/${live?'inplay':'prematch'}`,{},key),live);}catch(error){warnings.push(`${live?'In-play':'Prematch'}: ${error instanceof Error?error.message:'Prices unavailable.'}`);return [];}
  }));
  const ids=new Set(fixtures.map(f=>f.id)),at=Date.now();
  const data:SportsData={configured:true,fixtures,quotes:feeds.flat().filter(q=>ids.has(q.matchId)),receivedAt:new Date(at).toISOString(),expiresAt:new Date(at+60000).toISOString(),warnings};
  cache={at,key,data};return data;
 })();}
 try{return Response.json(await pending,{headers});}catch(error){return Response.json({configured:true,error:error instanceof Error?error.message:'Unable to load iSports prices.'},{status:502,headers});}finally{pending=null;}
}
