export type FixtureWindow = 'near'|'all'|string;
export function mytDate(value:string|number):string {
 const timestamp=typeof value==='number'?value:Date.parse(value);
 return Number.isFinite(timestamp)?new Date(timestamp+8*3600000).toISOString().slice(0,10):'';
}
export function fixtureDateOptions(now:number){
 const today=mytDate(now),tomorrow=mytDate(now+86400000);
 return [{value:'near',label:'Today + tomorrow'},{value:today,label:`Today · ${today}`},{value:tomorrow,label:`Tomorrow · ${tomorrow}`},{value:'all',label:'All available dates'}];
}
export function inFixtureWindow(kickoff:string|undefined,window:FixtureWindow,now:number):boolean {
 if(window==='all')return true;
 const date=kickoff?mytDate(kickoff):'';
 return window==='near'?date===mytDate(now)||date===mytDate(now+86400000):date===window;
}
export function competitionKey(value:string):string {
 const key=value.toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const aliases:Record<string,string>={
  'premier league':'english premier league','england premier league':'english premier league',
  'english football league cup':'england league cup','english league cup':'england league cup','efl cup':'england league cup',
  'english fa cup':'england fa cup',
  'afc champions league two':'afc champions league 2',
 };
 return aliases[key]??key;
}
export const kickoffOrder=(a:{kickoff?:string},b:{kickoff?:string})=>(Date.parse(a.kickoff??'')||Infinity)-(Date.parse(b.kickoff??'')||Infinity);
