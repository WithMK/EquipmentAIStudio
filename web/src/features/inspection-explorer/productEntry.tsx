import { useQuery } from '@tanstack/react-query';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useServices } from '../../shared/services/context';
import { Panel,Badge } from '../../shared/ui/Panel';
import { Button } from '../../shared/ui/button';
import { readQuery,writeQuery,displayTime } from './query';
export default function ProductEntry(){
 const {productId=''}=useParams();const [params]=useSearchParams();const {inspections}=useServices();
 const query=useQuery({queryKey:['product',productId],queryFn:({signal})=>inspections.getProduct(productId,{signal})});
 return <div><Button asChild variant="outline"><Link to={`/inspections?${writeQuery(readQuery(params))}`}>← 검색 결과로 복귀</Link></Button><div style={{marginTop:20}}><Panel title="Product inspection · 상세 진입" meta={<Badge>VIEWER · PHASE 3</Badge>}>
 {query.isPending?<p className="context-block" role="status">제품 로딩 중…</p>:query.isError?<div className="context-block" role="alert">제품 조회 실패 <Button onClick={()=>query.refetch()}>다시 시도</Button></div>:!query.data?<p className="context-block">제품을 찾을 수 없습니다.</p>:<><dl className="properties">{[['Product ID',query.data.product.productId],['LOT',query.data.lot.lotId],['설비',query.data.product.machineId],['제품 식별자',query.data.product.id],['원본 이미지 메타데이터',`${query.data.images.length}개 (과거 재검 포함)`]].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl><div className="context-block"><h3>원본 검사 실행 이력</h3><ul>{query.data.inspections.map(run=><li key={run.id}>{displayTime(run.inspectedAt)} · {run.type} · {run.originalVerdict}{run.supersedesInspectionId?' · 재검사':''}</li>)}</ul><p>이미지 확대·이동·NG 위치 확인은 Phase 3에서 구현합니다. 현재는 제품 선택과 목록 복귀 흐름만 제공합니다.</p></div></>}
 </Panel></div></div>;
}
