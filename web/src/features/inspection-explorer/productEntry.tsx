import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useServices } from '../../shared/services/context';
import { Button } from '../../shared/ui/button';
import type { ProductRecord } from '../../shared/domain/models';
import { readQuery,writeQuery,displayTime } from './query';
import { latestRunIds } from './viewerMath';
import { ImageViewer } from './ImageViewer';
function InspectionDetail({record}:{record:ProductRecord}) {
 const [params]=useSearchParams();const [type,setType]=useState('ALL');const [runId,setRunId]=useState('latest');const [selected,setSelected]=useState('');
 const latest=useMemo(()=>latestRunIds(record.inspections),[record]);
 const images=record.images.filter(x=>(runId==='latest'?latest.includes(x.inspectionId):x.inspectionId===runId)&&(type==='ALL'||record.inspections.find(run=>run.id===x.inspectionId)?.type===type));
 const preferred=images.find(x=>x.originalVerdict==='NG'&&x.availability==='available')||images.find(x=>x.availability==='available')||images[0];
 const current=images.find(x=>x.id===selected)||preferred;
 useEffect(()=>{setSelected('');},[type,runId]);
 const run=record.inspections.find(x=>x.id===current?.inspectionId);
 return <div className="product-detail"><div className="product-bar"><Button asChild variant="outline"><Link to={`/inspections?${writeQuery(readQuery(params))}`}>← 검색 결과로 복귀</Link></Button><h2>제품 검사 <span>{record.product.productId}</span></h2><span>{record.product.machineId} / {record.lot.lotId}</span></div>
 <div className="viewer-layout"><aside className="image-list"><div className="image-list-heading"><strong>촬영 이미지</strong><span>{images.length}</span></div><div className="type-tabs">{['ALL',...new Set(record.inspections.map(x=>x.type))].map(t=><button key={t} aria-pressed={type===t} onClick={()=>{setType(t);setRunId('latest');}}>{t==='ALL'?'전체':t}</button>)}</div><label className="run-select">검사 실행<select aria-label="검사 실행" value={runId} onChange={e=>setRunId(e.target.value)}><option value="latest">유형별 최신 검사</option>{record.inspections.filter(x=>type==='ALL'||x.type===type).map(x=><option key={x.id} value={x.id}>{x.type} · {displayTime(x.inspectedAt)}{x.supersedesInspectionId?' · 재검':''}</option>)}</select></label><div className="thumbnails">{images.map(image=><button key={image.id} aria-label={`${image.capturePoint} ${image.originalVerdict}${image.availability==='missing'?' 누락':''}`} aria-pressed={current?.id===image.id} onClick={()=>setSelected(image.id)}>{image.thumbnailUrl?<img src={image.thumbnailUrl} alt="" loading="lazy"/>:<div className="missing-thumb">이미지 누락</div>}<span>{image.capturePoint}<b className={image.originalVerdict==='NG'?'ng-text':'ok-text'}>{image.originalVerdict}</b></span></button>)}</div></aside>
 <section className="viewer-main">{current?<ImageViewer key={current.id} image={current}/>:<div className="empty-state">선택한 조건에 이미지가 없습니다.</div>}</section>
 <aside className="image-metadata"><h3>이미지 정보</h3><dl>{[['촬영 위치',current?.capturePoint||'—'],['검사 유형',run?.type||'—'],['촬영 시간',current?displayTime(current.capturedAt):'—'],['설비 원본 판정',current?.originalVerdict||'—'],['이미지 상태',current?.availability==='missing'?'누락':'사용 가능'],['검사 실행',run?.supersedesInspectionId?'재검사':'최초 검사'],['분할 정보',record.product.segmentIndex?`${record.product.segmentIndex} / 4`:'단일 제품']].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><h3>원본 검사 실행 이력</h3><ul className="run-history">{record.inspections.map(x=><li key={x.id}><span>{x.type}<b className={x.originalVerdict==='NG'?'ng-text':'ok-text'}>{x.originalVerdict}</b></span><small>{displayTime(x.inspectedAt)}{x.supersedesInspectionId?' · 재검':''}</small></li>)}</ul><p>개발자 검토·판정 저장은 다음 단계에서 제공됩니다. 원본 판정은 수정하지 않습니다.</p></aside></div></div>;
}
export default function ProductEntry(){
 const {productId=''}=useParams();const [params]=useSearchParams();const {inspections}=useServices();
 const query=useQuery({queryKey:['product',productId],queryFn:({signal})=>inspections.getProduct(productId,{signal})});
 if(query.data)return <InspectionDetail key={productId} record={query.data}/>;
 return <div className="context-block"><Button asChild variant="outline"><Link to={`/inspections?${writeQuery(readQuery(params))}`}>← 검색 결과로 복귀</Link></Button>{query.isPending?<p role="status">제품 로딩 중…</p>:query.isError?<div role="alert">제품 조회 실패 <Button onClick={()=>query.refetch()}>다시 시도</Button></div>:<p>제품을 찾을 수 없습니다.</p>}</div>;
}
