import { useQuery } from '@tanstack/react-query';
import { Panel, Badge } from '../../shared/ui/Panel';
import { useServices } from '../../shared/services/context';
export default function Workspace(){
 const services=useServices();
 const identity=useQuery({queryKey:['identity'],queryFn:()=>services.auth.getIdentity()});
 return <div className="settings-grid"><Panel title="현재 실행 환경" meta={<Badge tone="accent">PHASE 1</Badge>}><dl className="properties">{[['데이터 연결','Mock · 실제 설비 연결 없음'],['Base path',import.meta.env.BASE_URL],['API base (미연결)',import.meta.env.VITE_API_BASE_URL || '/api/'],['사용자',identity.isError?'사용자 정보 오류':identity.isPending?'확인 중…':identity.data?.displayName || '미인증'],['인증','Demo provider · 실제 인증 미구현'],['검사 계약','v0.1 · Backend 계약 미확정']].map(([k,v])=><div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl></Panel>
 <Panel title="단계별 확장 계획"><ol className="roadmap">{['Foundation — Shell · 모듈 · 데이터 경계','Inspection Explorer — 검색 · 계층형 표','Product Detail — 이미지 Viewer','Image Review — 검토 · 저장','Dataset / Model — 등록 · 버전 관리','DatasetHub — 수집 현황 · 통합 검증'].map((s,i)=><li key={s}><span className={i===0?'current':''}>{String(i+1).padStart(2,'0')}</span><div>{s}<small>{i===0?'현재 단계':'후속 단계 · 미구현'}</small></div></li>)}</ol></Panel>
 <Panel title="작업 공간 원칙" className="wide"><div className="principles"><div><h3>원본 보존</h3><p>설비 판정과 개발자 검토는 별도 데이터로 관리합니다.</p></div><div><h3>독립적인 수집</h3><p>수집·매칭·복구는 DatasetHub가 담당합니다.</p></div><div><h3>교체 가능한 연결</h3><p>화면은 Repository를 통해 데이터를 조회합니다.</p></div></div></Panel></div>;
}
