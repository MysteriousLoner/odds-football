import {fixtureDateOptions} from '@/lib/fixtures';
export default function FixtureFilters({date,setDate,competition,setCompetition,competitions,now}:{date:string;setDate:(v:string)=>void;competition:string;setCompetition:(v:string)=>void;competitions:string[];now:number}){
 return <div className="fixture-filters"><label>Kickoff date · MYT<select value={date} onChange={e=>setDate(e.target.value)}>{fixtureDateOptions(now).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label><label>Competition<select value={competition} onChange={e=>setCompetition(e.target.value)}><option value="all">All football competitions</option>{competitions.map(c=><option key={c} value={c}>{c}</option>)}</select></label></div>;
}
