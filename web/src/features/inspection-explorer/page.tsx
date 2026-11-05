import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ScanLine, Database, Layers, Image } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServices } from '../../shared/services/context';
import { Badge, Panel } from '../../shared/ui/Panel';
import { Button } from '../../shared/ui/button';
export default function InspectionExplorer() {
 const {equipment}=useServices();
 const query=useQuery({queryKey:['equipment','list'],queryFn:({signal})=>equipment.list({signal})});
 return <div className="workspace-grid"><div className="workspace-main">
  <div className="phase-notice"><span className="phase-number">01</span><div><strong>검사 분석 작업 공간의 시작</strong><p>현재는 공통 UI 기반을 검증하는 단계입니다. 검사 조회는 Phase 2에서 연결됩니다.</p></div><Badge tone="accent">FOUNDATION</Badge></div>
  <Panel title="Inspection records" meta={<span className="muted mono">LOT → PRODUCT</span>} className="records">
   <div className="record-toolbar"><div><Database size={15}/><span>검사 데이터 연결 대기</span></div><Badge>Mock adapter</Badge></div>
   <div className="table-wrap"><table aria-label="검사 목록 구조 미리보기"><thead><tr>{['LOT / Product ID','Equipment','Inspection time','Type','Result','Images'].map(x=><th key={x}>{x}</th>)}</tr></thead></table></div>
   <div className="empty-state"><div className="empty-icon"><ScanLine size={32}/></div><span className="eyebrow">INSPECTION EXPLORER</span><h2>검사 기록을 연결할 준비가 되었습니다</h2><p>LOT와 제품을 기준으로 검사 결과를 탐색하고,<br/>선택한 이미지에서 검토 작업을 이어갑니다.</p><Button variant="outline" asChild><Link to="/workspace">워크스페이스 구성 확인 <ArrowRight size={14}/></Link></Button><span className="empty-footnote">실제 설비 연결 없음 · 조회 / 필터 / 정렬은 다음 단계</span></div>
   <div className="table-footer"><span>검사 데이터 미연결</span><span>Contract v0.1 · Prototype</span></div>
  </Panel>
  <div className="flow-strip">{[{icon:Layers,title:'01 · Explore',text:'LOT / 제품별 검사 조회'},{icon:Image,title:'02 · Inspect',text:'이미지 확대 및 NG 위치 확인'},{icon:ScanLine,title:'03 · Review',text:'원본 판정과 검토 결과 분리'}].map(x=><div key={x.title}><x.icon size={18}/><div><strong>{x.title}</strong><p>{x.text}</p></div></div>)}</div>
 </div><aside className="detail-rail">
  <Panel title="Source context" meta={<Badge tone="warning">MOCK</Badge>}><div className="context-block"><span className="eyebrow">EQUIPMENT PROFILE</span><h3>MLCC Trimming</h3><p>UI 개발용 설비 목록입니다.<br/>실제 연결 상태를 나타내지 않습니다.</p></div>
  {query.isPending ? <p className="context-block" role="status">설비 목록 로딩 중…</p> : query.isError ? <div className="context-block" role="alert"><p>설비 목록을 읽지 못했습니다.</p><Button variant="outline" onClick={()=>query.refetch()}>다시 시도</Button></div> : <><div className="rail-label">등록된 Mock 설비 <span>{query.data.length}</span></div><ul className="equipment-list">{query.data.map(e=><li key={e.id}><span className="machine-dot"/><span className="mono">{e.machineId}</span><span>{e.name}</span></li>)}</ul></>}
  </Panel><Panel title="Selection details"><div className="selection-placeholder"><Layers size={22}/><p>아직 선택된 제품이 없습니다.</p><small>제품 메타데이터와 검사 맥락을<br/>표시할 영역입니다.</small></div></Panel>
 </aside></div>;
}
