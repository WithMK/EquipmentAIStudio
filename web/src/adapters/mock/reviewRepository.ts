import type { InspectionReview } from '../../shared/domain/models';
import type { ReviewRepository, AuthProvider, ReviewDraft } from '../../shared/services/contracts';
const defects=[{id:'crack',label:'균열'},{id:'edge',label:'가장자리 손상'},{id:'pattern',label:'패턴 이상'},{id:'foreign',label:'이물'},{id:'other',label:'기타'}];
/** Browser demo store. One readwrite transaction compares revision and appends history. */
export function createReviewRepository(auth:AuthProvider,canReview:(imageId:string)=>boolean,dbName='equipment-ai-studio-reviews-v1'):ReviewRepository {
 let connection:Promise<IDBDatabase>|undefined;
 const open=()=>connection ||= new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined'){reject(new Error('브라우저 저장소를 사용할 수 없습니다.'));return;}
  const request=indexedDB.open(dbName,1);
  request.onupgradeneeded=()=>{request.result.createObjectStore('reviews',{keyPath:'imageId'});};
  request.onerror=()=>{connection=undefined;reject(new Error('검토 저장소를 열지 못했습니다.'));};
  request.onblocked=()=>{connection=undefined;reject(new Error('다른 탭이 저장소 갱신을 막고 있습니다. 탭을 닫고 다시 시도하세요.'));};
  request.onsuccess=()=>{const db=request.result;db.onversionchange=()=>{db.close();connection=undefined;};resolve(db);};
 });
 const transaction=async(imageId:string,draft?:ReviewDraft):Promise<InspectionReview[]>=>{
  const identity=draft?await auth.getIdentity():null;
  if(draft&&!identity)throw new Error('검토자 정보를 확인할 수 없습니다.');
  const db=await open();
  return new Promise((resolve,reject)=>{
   const tx=db.transaction('reviews',draft?'readwrite':'readonly');const store=tx.objectStore('reviews');const read=store.get(imageId);
   let output:InspectionReview[]=[];let reason='검토 저장소 처리에 실패했습니다. 저장 공간과 브라우저 권한을 확인하세요.';
   read.onsuccess=()=>{
    const history:InspectionReview[]=read.result?.history||[];
    if(draft){
     if((history[0]?.id||null)!==draft.expectedReviewId){reason='다른 탭에서 검토가 변경되었습니다. 다시 불러온 후 저장하세요.';tx.abort();return;}
     const entry:InspectionReview={id:crypto.randomUUID(),imageId,verdict:draft.verdict,defectTypeIds:[...new Set(draft.defectTypeIds)],note:draft.note.trim(),reviewerId:identity!.id,reviewedAt:new Date().toISOString(),...(history[0]?{previousReviewId:history[0].id}:{})};
     output=[entry,...history];store.put({imageId,history:output});
    }else output=history;
   };
   tx.oncomplete=()=>resolve(structuredClone(output));
   tx.onabort=()=>reject(new Error(reason));tx.onerror=()=>{ /* onabort reports transaction failure, never claim saved early */ };
  });
 };
 return {
  history:id=>transaction(id),
  async defectTypes(){return structuredClone(defects);},
  async save(draft){
   if(!canReview(draft.imageId))throw new Error('누락되었거나 알 수 없는 이미지는 검토할 수 없습니다.');
   if(!['OK','NG'].includes(draft.verdict)||draft.note.length>2000||draft.defectTypeIds.some(id=>!defects.some(x=>x.id===id)))throw new Error('판정, 불량 유형 또는 메모를 확인하세요.');
   if(draft.verdict==='NG'&&!draft.defectTypeIds.length)throw new Error('NG 판정에는 불량 유형을 선택하세요.');
   if(draft.verdict==='OK'&&draft.defectTypeIds.length)throw new Error('OK 판정에는 불량 유형을 저장할 수 없습니다.');
   return transaction(draft.imageId,draft);
  },
 };
}
