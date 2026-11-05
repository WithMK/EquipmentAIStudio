export const clampScale=(value:number)=>Math.min(8,Math.max(0.05,value));
export const fitScale=(width:number,height:number,imageWidth:number,imageHeight:number)=>clampScale(Math.min((width-32)/imageWidth,(height-32)/imageHeight));
export function latestRunIds(runs:{id:string;type:string;inspectedAt:string}[]) {
 const latest=new Map<string,{id:string;inspectedAt:string}>();
 for(const run of runs)if(!latest.has(run.type)||latest.get(run.type)!.inspectedAt<run.inspectedAt)latest.set(run.type,run);
 return [...latest.values()].map(x=>x.id);
}
