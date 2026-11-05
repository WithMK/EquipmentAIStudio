import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useBlocker } from 'react-router-dom';
import type { InspectionReview } from '../../shared/domain/models';
import type { ReviewPanelProps } from '../../shared/modules/reviewSlot';
import { useServices } from '../../shared/services/context';
import { Button } from '../../shared/ui/button';
export default function ReviewPanel({image,onDirtyChange}:ReviewPanelProps){
 const {reviews}=useServices();const client=useQueryClient();const [notice,setNotice]=useState('');const [reset,setReset]=useState(0);
 const history=useQuery({queryKey:['reviews',image.id],queryFn:()=>reviews.history(image.id),staleTime:0,refetchOnMount:'always'});
 const types=useQuery({queryKey:['defect-types'],queryFn:()=>reviews.defectTypes()});
 return <section className="review-panel" aria-label="개발자 검토"><div className="review-heading"><h3>개발자 검토</h3><span>{history.isError?'조회 실패':history.isPending?'조회 중':history.data?.length?'검토 완료':'미검토'}</span></div><p className="review-original">설비 원본 판정: <strong>{image.originalVerdict}</strong></p>
 {notice&&<p className="review-notice" role="status">{notice}</p>}
 {history.isPending||types.isPending?<p role="status">검토 불러오는 중…</p>:history.isError||types.isError?<div role="alert">검토를 불러오지 못했습니다.<Button variant="outline" onClick={()=>{history.refetch();types.refetch();}}>다시 시도</Button></div>:<ReviewForm key={`${image.id}:${reset}`} image={image} onDirtyChange={onDirtyChange} history={history.data!} types={types.data!} onSaved={async data=>{client.setQueryData(['reviews',image.id],data);onDirtyChange(false);setNotice('검토를 저장했습니다.');setReset(x=>x+1);}} onReload={async()=>{const result=await history.refetch();if(result.error)throw result.error;setNotice('저장된 검토를 다시 불러왔습니다.');setReset(x=>x+1);}}/>}
 <small className="review-storage">이 브라우저에 저장 · Demo engineer · 실제 서버 미연결</small></section>;
}
function ReviewForm({image,onDirtyChange,history,types,onSaved,onReload}:ReviewPanelProps&{history:InspectionReview[];types:{id:string;label:string}[];onSaved:(data:InspectionReview[])=>Promise<void>;onReload:()=>Promise<void>}){
 const {reviews}=useServices();const latest=history[0];
 const [verdict,setVerdict]=useState<'OK'|'NG'|''>(latest?.verdict==='OK'||latest?.verdict==='NG'?latest.verdict:'');
 const [defectIds,setDefectIds]=useState(latest?.defectTypeIds||[]);const [note,setNote]=useState(latest?.note||'');const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const dirty=verdict!==(latest?.verdict||'')||note!==(latest?.note||'')||JSON.stringify([...defectIds].sort())!==JSON.stringify([...(latest?.defectTypeIds||[])].sort());
 const blocker=useBlocker(dirty||busy);
 useEffect(()=>{onDirtyChange(dirty||busy);return()=>onDirtyChange(false);},[dirty,busy,onDirtyChange]);
 useEffect(()=>{const guard=(e:BeforeUnloadEvent)=>{if(dirty||busy){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[dirty,busy]);
 const save=async()=>{setError('');if(!verdict){setError('검토 판정을 선택하세요.');return;}setBusy(true);try{await onSaved(await reviews.save({imageId:image.id,verdict,defectTypeIds:defectIds,note,expectedReviewId:latest?.id||null}));}catch(e){setError(e instanceof Error?e.message:'저장 실패');}finally{setBusy(false);}};
 return <><fieldset disabled={busy||image.availability!=='available'}><legend>검토 판정</legend><div className="review-verdict">{(['OK','NG'] as const).map(value=><label key={value}><input type="radio" name={`review-${image.id}`} value={value} checked={verdict===value} onChange={()=>{setVerdict(value);if(value==='OK')setDefectIds([]);}}/>{value}</label>)}</div>
 <div className="defect-types"><strong>불량 유형 {verdict==='NG'?'(필수)':''}</strong>{types.map(type=><label key={type.id}><input type="checkbox" disabled={verdict!=='NG'} checked={defectIds.includes(type.id)} onChange={e=>setDefectIds(ids=>e.target.checked?[...ids,type.id]:ids.filter(x=>x!==type.id))}/>{type.label}</label>)}</div>
 <label className="review-note">검토 메모<textarea aria-label="검토 메모" maxLength={2000} rows={3} value={note} onChange={e=>setNote(e.target.value)}/></label></fieldset>
 {image.availability!=='available'&&<p>이미지 누락·대기 상태에서는 검토할 수 없습니다.</p>}{error&&<p role="alert" className="filter-error">{error}</p>}
 <div className="review-actions"><Button disabled={busy||!dirty||image.availability!=='available'} onClick={save}>{busy?'저장 중…':'검토 저장'}</Button><Button variant="outline" disabled={busy} onClick={()=>{if(!dirty||window.confirm('저장하지 않은 검토를 버리고 다시 불러올까요?'))void onReload().catch(e=>setError(e instanceof Error?e.message:'다시 불러오기 실패'));}}>다시 불러오기</Button></div>
 {dirty&&<p className="review-unsaved">저장하지 않은 변경사항</p>}
 {blocker.state==='blocked'&&<div className="review-leave" role="alertdialog" aria-label="저장하지 않은 검토"><p>저장하지 않은 검토가 있습니다.</p><Button disabled={busy} onClick={()=>blocker.reset()}>계속 검토</Button><Button variant="outline" disabled={busy} onClick={()=>blocker.proceed()}>변경 버리고 이동</Button></div>}
 <details className="review-history"><summary>변경 이력 ({history.length})</summary>{history.map(entry=><article key={entry.id}><strong>{entry.verdict}</strong><time>{new Date(entry.reviewedAt).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'})} KST</time><span>{entry.reviewerId}</span><p>{entry.defectTypeIds.map(id=>types.find(t=>t.id===id)?.label||id).join(', ')}</p><p>{entry.note||'메모 없음'}</p></article>)}</details></>;
}
