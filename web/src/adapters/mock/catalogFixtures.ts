import type { ProductRecord } from '../../shared/domain/models';
import type { DatasetItem, DatasetVersion, ModelVersion, ExternalTool } from '../../shared/domain/management';
/** Stable, synthetic examples. Never writes Review history or touches actual files. */
export function createCatalogFixtures(records:ProductRecord[]) {
 const createdAt='2026-11-05T03:00:00Z';
 const all:DatasetItem[]=records.flatMap(r=>r.images.filter(i=>i.availability==='available').map(i=>({imageId:i.id,productKey:r.product.id,productId:r.product.productId,machineId:r.product.machineId,lotId:r.lot.lotId,inspectionId:i.inspectionId,type:r.inspections.find(x=>x.id===i.inspectionId)!.type,originalVerdict:i.originalVerdict,label:i.originalVerdict})));
 // Round-robin equipment selection prevents the preview from showing only EQ01.
 const balanced=(type:string,limit:number)=>{
  const groups=[...new Set(all.map(x=>x.machineId))].map(m=>all.filter(x=>x.machineId===m&&x.type===type));
  const result:DatasetItem[]=[];
  for(let n=0;result.length<limit&&groups.some(g=>n<g.length);n++)for(const g of groups){if(g[n]&&result.length<limit)result.push(structuredClone(g[n]));}
  return result;
 };
 const side=balanced('SIDE',72),thermal=balanced('THERMAL',36);
 const reviewed=side.slice(0,24).map((x,i)=>({...x,...(i%3===0?{label:'OK' as const,review:{id:`demo-review-${i}`,imageId:x.imageId,verdict:'OK' as const,defectTypeIds:[],note:'더미 검토 스냅샷: 과검출 제외 예시. 실제 검토 이력과 독립.',reviewerId:'sample-reviewer',reviewedAt:createdAt}}:{})}));
 const definitions=[
  {id:'demo-side-v1',name:'[DEMO] SIDE 기준 데이터',version:'1.0',status:'frozen' as const,items:side},
  {id:'demo-side-v2',name:'[DEMO] SIDE 기준 데이터',version:'2.0',status:'frozen' as const,items:reviewed},
  {id:'demo-thermal-v1',name:'[DEMO] THERMAL 기준 데이터',version:'1.0',status:'frozen' as const,items:thermal},
  {id:'demo-ng-draft',name:'[DEMO] NG 재검토 후보',version:'0.1',status:'draft' as const,items:all.filter(x=>x.originalVerdict==='NG').slice(0,24)},
  {id:'demo-mixed-draft',name:'[DEMO] SIDE·THERMAL 혼합',version:'0.1',status:'draft' as const,items:[...side.slice(0,12),...thermal.slice(0,12)]},
 ];
 const datasets:DatasetVersion[]=definitions.filter(x=>x.items.length).map(x=>({...x,createdAt,...(x.status==='frozen'?{frozenAt:createdAt}:{})}));
 const models:ModelVersion[]=[
  {id:'demo-model-side-v1',name:'[DEMO] Side detector',version:'1.0',datasetId:'demo-side-v1',trainedAt:'2026-11-03',accuracy:96.2,evaluationNotes:'합성 예시 수치. 실측 성능 아님. 평가세트 DEMO-HOLDOUT-SIDE-A.',artifactPath:'D:\\DemoModels\\side-v1.model',status:'development',createdAt},
  {id:'demo-model-side-v2',name:'[DEMO] Side detector',version:'2.0',datasetId:'demo-side-v2',trainedAt:'2026-11-04',accuracy:98.1,evaluationNotes:'합성 예시 수치. 실측 성능 아님. 평가세트 DEMO-HOLDOUT-SIDE-A.',artifactPath:'D:\\DemoModels\\side-v2.model',status:'validation',createdAt},
  {id:'demo-model-thermal-v1',name:'[DEMO] Thermal detector',version:'1.0',datasetId:'demo-thermal-v1',trainedAt:'2026-11-04',accuracy:97.4,evaluationNotes:'합성 예시 수치. 운영 상태 표시는 시연용이며 배포되지 않음. 평가세트 DEMO-HOLDOUT-THERMAL-A.',artifactPath:'D:\\DemoModels\\thermal-v1.model',status:'production',createdAt},
 ].filter(x=>datasets.some(d=>d.id===x.datasetId&&d.status==='frozen')) as ModelVersion[];
 const tools:ExternalTool[]=[{id:'demo-saige',name:'[DEMO] SAIGE AI Tool',version:'demo-1',installPath:'D:\\DemoTools\\SAIGE',notes:'설치 위치 예시이며 실제 설치·버전 정보가 아닙니다. 학습은 외부 프로그램에서 사용자가 직접 수행합니다.',createdAt}];
 return {datasets,models,tools};
}
