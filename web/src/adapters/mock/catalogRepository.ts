import { createCatalogFixtures } from './catalogFixtures';
import type { ProductRecord, InspectionReview } from '../../shared/domain/models';
import type { CatalogRepository, ReviewRepository } from '../../shared/services/contracts';
import type { DatasetVersion, ModelVersion, ExternalTool, ImageCandidate, DatasetItem } from '../../shared/domain/management';
interface Catalog { sampleVersion?:number; datasets:DatasetVersion[]; models:ModelVersion[]; tools:ExternalTool[] }
const empty=():Catalog=>({datasets:[],models:[],tools:[]});
const uid=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
const required=(s:string,label:string,max=200)=>{if(!s.trim()||s.length>max)throw new Error(`${label}을(를) 확인하세요.`);return s.trim();};
const version=(s:string)=>{if(!/^[a-zA-Z0-9][a-zA-Z0-9._-]{0,39}$/.test(s.trim()))throw new Error('버전은 영문·숫자·점·밑줄·하이픈 40자 이내로 입력하세요.');return s.trim();};
const key=(s:string)=>s.trim().toLowerCase();
/** Separate database: existing review store/version is untouched. All metadata writes serialize. */
export function createCatalogRepository(records:ProductRecord[],reviews:ReviewRepository,dbName='equipment-ai-studio-catalog-v1',seedSamples=false):CatalogRepository {
 let connection:Promise<IDBDatabase>|undefined;
 const open=()=>connection ||= new Promise((resolve,reject)=>{
  const request=indexedDB.open(dbName,1);
  request.onupgradeneeded=()=>request.result.createObjectStore('catalog');
  request.onerror=()=>{connection=undefined;reject(new Error('관리 저장소를 열 수 없습니다.'));};
  request.onblocked=()=>{connection=undefined;reject(new Error('다른 탭을 닫고 다시 시도하세요.'));};
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=undefined;};resolve(db);};
 });
 const transact=async<T>(fn:(catalog:Catalog)=>T,write=false):Promise<T>=>{
  const db=await open();
  return new Promise((resolve,reject)=>{
   const tx=db.transaction('catalog',write||seedSamples?'readwrite':'readonly'),store=tx.objectStore('catalog'),request=store.get('state');
   let result:T;let error:unknown=new Error('저장소 처리 실패. 브라우저 권한과 저장 공간을 확인하세요.');
   request.onsuccess=()=>{try{const state:Catalog=request.result||empty();let seeded=false;
    if(seedSamples&&!state.sampleVersion){
     const samples=createCatalogFixtures(records);
     for(const d of samples.datasets)if(!state.datasets.some(x=>x.id===d.id||key(x.name)===key(d.name)&&key(x.version)===key(d.version)))state.datasets.push(d);
     for(const m of samples.models)if(state.datasets.some(d=>d.id===m.datasetId&&d.status==='frozen')&&!state.models.some(x=>x.id===m.id||key(x.name)===key(m.name)&&key(x.version)===key(m.version)))state.models.push(m);
     for(const t of samples.tools)if(!state.tools.some(x=>x.id===t.id||key(x.name)===key(t.name)&&key(x.version)===key(t.version)))state.tools.push(t);
     state.sampleVersion=1;seeded=true;
    }
    result=fn(state);if(write||seeded)store.put(state,'state');}catch(e){error=e;tx.abort();}};
   tx.oncomplete=()=>resolve(structuredClone(result));tx.onabort=()=>reject(error);
  });
 };
 const images:ImageCandidate[]=records.flatMap(r=>r.images.map(image=>({image,productId:r.product.productId,productKey:r.product.id,machineId:r.product.machineId,lotId:r.lot.lotId,type:r.inspections.find(i=>i.id===image.inspectionId)!.type})));
 const byId=new Map(images.map(x=>[x.image.id,x]));
 const reviewMap=async()=>new Map((await reviews.latest()).map(r=>[r.imageId,r]));
 return {
  async candidates(q){
   if(!Number.isInteger(q.page)||q.page<1||!Number.isInteger(q.pageSize)||q.pageSize<1||q.pageSize>100)throw new Error('페이지 범위 오류');
   const labels=await reviewMap();const text=key(q.text||'');
   const rows=images.filter(x=>x.image.availability==='available').map(x=>({...x,review:labels.get(x.image.id)})).filter(x=>(!q.machineId||x.machineId===q.machineId)&&(!q.type||x.type===q.type)&&(!text||key(`${x.lotId} ${x.productId} ${x.image.capturePoint}`).includes(text))&&(!q.verdict||(x.review?.verdict||x.image.originalVerdict)===q.verdict)&&(q.reviewed===undefined||Boolean(x.review)===q.reviewed));
   return structuredClone({items:rows.slice((q.page-1)*q.pageSize,q.page*q.pageSize),total:rows.length,page:q.page,pageSize:q.pageSize});
  },
  datasets:()=>transact(c=>c.datasets),
  async createDataset(draft){
   const name=required(draft.name,'Dataset 이름'),v=version(draft.version);const ids=[...new Set(draft.imageIds)];
   if(!ids.length||ids.length>500)throw new Error('이미지를 1~500개 선택하세요.');
   const labels=await reviewMap();
   const items:DatasetItem[]=ids.map(id=>{
    const x=byId.get(id);if(!x||x.image.availability!=='available')throw new Error('누락되거나 알 수 없는 이미지입니다.');
    const review:InspectionReview|undefined=labels.get(id);
    return {imageId:id,productKey:x.productKey,productId:x.productId,machineId:x.machineId,lotId:x.lotId,inspectionId:x.image.inspectionId,type:x.type,originalVerdict:x.image.originalVerdict,label:review?.verdict||x.image.originalVerdict,...(review?{review:structuredClone(review)}:{})};
   });
   return transact(c=>{
    if(c.datasets.some(x=>key(x.name)===key(name)&&key(x.version)===key(v)))throw new Error('같은 이름과 버전의 Dataset이 있습니다.');
    const entry:DatasetVersion={id:uid(),name,version:v,status:'draft',createdAt:new Date().toISOString(),items};c.datasets.unshift(entry);return entry;
   },true);
  },
  freezeDataset:id=>transact(c=>{const d=c.datasets.find(x=>x.id===id);if(!d)throw new Error('Dataset을 찾을 수 없습니다.');if(d.status==='draft'){d.status='frozen';d.frozenAt=new Date().toISOString();}return d;},true),
  models:()=>transact(c=>c.models),
  registerModel:draft=>transact(c=>{
   const name=required(draft.name,'모델 이름'),v=version(draft.version),path=required(draft.artifactPath,'파일 경로',1000);
   const d=c.datasets.find(x=>x.id===draft.datasetId);if(!d||d.status!=='frozen')throw new Error('확정된 Dataset 버전을 선택하세요.');
   if(c.models.some(x=>key(x.name)===key(name)&&key(x.version)===key(v)))throw new Error('같은 이름과 버전의 모델이 있습니다.');
   if(!Number.isFinite(draft.accuracy)||draft.accuracy<0||draft.accuracy>100)throw new Error('정확도는 0~100% 범위입니다.');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(draft.trainedAt)||Number.isNaN(Date.parse(draft.trainedAt))||new Date(draft.trainedAt).toISOString().slice(0,10)!==draft.trainedAt)throw new Error('학습일을 확인하세요.');
   if(!['development','validation','production'].includes(draft.status))throw new Error('모델 상태 오류');
   const notes=required(draft.evaluationNotes,'평가 조건',2000);
   const entry:ModelVersion={...draft,name,version:v,artifactPath:path,evaluationNotes:notes,id:uid(),createdAt:new Date().toISOString()};c.models.unshift(entry);return entry;
  },true),
  tools:()=>transact(c=>c.tools),
  registerTool:draft=>transact(c=>{
   const name=required(draft.name,'도구 이름'),v=version(draft.version);required(draft.installPath,'설치 경로',1000);
   if(draft.notes.length>2000)throw new Error('메모는 2000자 이내입니다.');
   if(c.tools.some(x=>key(x.name)===key(name)&&key(x.version)===key(v)))throw new Error('동일 도구 버전이 있습니다.');
   const entry={...draft,name,version:v,id:uid(),createdAt:new Date().toISOString()};c.tools.unshift(entry);return entry;
  },true),
 };
}
