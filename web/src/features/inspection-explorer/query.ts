import type { InspectionQuery } from '../../shared/domain/models';
const int=(v:string|null,fallback:number,max:number)=>v&&/^\d+$/.test(v)&&Number(v)>0&&Number(v)<=max?Number(v):fallback;
const date=(v:string|null)=>v&&Number.isFinite(Date.parse(v))?new Date(v).toISOString():undefined;
export function readQuery(params:URLSearchParams):InspectionQuery {
 return {page:int(params.get('page'),1,1000000),pageSize:[5,10,20].includes(Number(params.get('size')))?Number(params.get('size')):5,machineId:params.get('machine')||undefined,lotId:params.get('lot')||undefined,productId:params.get('product')||undefined,type:params.get('type')||undefined,verdict:['OK','NG','UNKNOWN'].includes(params.get('verdict')||'')?params.get('verdict') as InspectionQuery['verdict']:undefined,from:date(params.get('from')),to:date(params.get('to')),sort:{field:params.get('sort')==='productId'?'productId':'inspectedAt',direction:params.get('direction')==='asc'?'asc':'desc'}};
}
export function writeQuery(q:InspectionQuery) {
 const p=new URLSearchParams();const values={page:q.page,size:q.pageSize,machine:q.machineId,lot:q.lotId,product:q.productId,type:q.type,verdict:q.verdict,from:q.from,to:q.to,sort:q.sort?.field,direction:q.sort?.direction};
 for(const [k,v] of Object.entries(values))if(v!==undefined&&v!=='')p.set(k,String(v));return p;
}
/** Display and input use explicit KST, independent of browser timezone. */
export const displayTime=(value:string)=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
export const inputTime=(value?:string)=>value?displayTime(value).replace(' ','T'):'';
export const utcTime=(value:string)=>value?new Date(`${value}:00+09:00`).toISOString():undefined;
