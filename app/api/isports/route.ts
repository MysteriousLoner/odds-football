import { parseSportsFixtures,parseSportsQuotes } from '@/lib/isports';
import type { SportsData } from '@/lib/isports';
export const dynamic='force-dynamic';
const cache=new Map<string,{at:number;key:string;data:SportsData}>();
let pending:{date:string;promise:Promise<SportsData>}|null=null;
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
export async function GET(incoming:Request){
 const date=new URL(incoming.url).searchParams.get('date')??new Date().toISOString().slice(0,10);
 const day=Date.parse(date+'T00:00:00Z'),today=Date.parse(new Date().toISOString().slice(0,10)+'T00:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(day)||new Date(day).toISOString().slice(0,10)!==date||day<today-86400000||day>today+14*86400000)return Response.json({configured:true,error:'Choose an iSports schedule date from yesterday through the next 14 days (UTC).'},{status:400,headers});
 const key=process.env.ISPORTS_API_KEY;
 if(!key)return Response.json({configured:false,error:'Set ISPORTS_API_KEY in the server environment to compare iSports prices.'},{headers});
 const cached=cache.get(date);
 if(cached?.key===key&&Date.now()-cached.at<60000)return Response.json(cached.data,{headers});
 if(pending&&pending.date!==date)return Response.json({configured:true,error:'Another iSports date is loading. Wait before changing dates.'},{status:429,headers});
 if(!pending&&Date.now()-lastAttempt<60000)return Response.json({configured:true,error:'Wait one minute between iSports refresh attempts.'},{status:429,headers});
 if(!pending){lastAttempt=Date.now();pending={date,promise:(async()=>{
  // Provider date parameter is UTC; preserve exact kickoff instants for MYT filters.
  const fixtures=parseSportsFixtures(await request('schedule/basic',{date},key));
  const warnings:string[]=[];
  const feeds=await Promise.all([false,true].map(async live=>{
   if(!fixtures.some(f=>f.live===live))return [];
   try{return parseSportsQuotes(await request(`odds/score/${live?'inplay':'prematch'}`,{},key),live);}catch(error){warnings.push(`${live?'In-play':'Prematch'}: ${error instanceof Error?error.message:'Prices unavailable.'}`);return [];}
  }));
  const ids=new Set(fixtures.map(f=>f.id)),at=Date.now();
  const data:SportsData={configured:true,fixtures,quotes:feeds.flat().filter(q=>ids.has(q.matchId)),receivedAt:new Date(at).toISOString(),expiresAt:new Date(at+60000).toISOString(),warnings,scheduleDateUTC:date};
  cache.set(date,{at,key,data});if(cache.size>5)cache.delete(cache.keys().next().value!);return data;
 })()};}
 try{return Response.json(await pending.promise,{headers});}catch(error){return Response.json({configured:true,error:error instanceof Error?error.message:'Unable to load iSports prices.'},{status:502,headers});}finally{pending=null;}
}
