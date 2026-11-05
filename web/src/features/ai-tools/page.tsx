import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useServices } from '../../shared/services/context';
import { Panel } from '../../shared/ui/Panel';
import { Button } from '../../shared/ui/button';
import { LocalNote, Problem, UnsavedGuard } from '../../shared/ui/Management';
export default function Tools(){
 const {catalog}=useServices(),client=useQueryClient();const [name,setName]=useState('SAIGE AI Tool'),[version,setVersion]=useState(''),[path,setPath]=useState(''),[notes,setNotes]=useState('');
 const tools=useQuery({queryKey:['tools'],queryFn:()=>catalog.tools(),refetchOnMount:'always'});
 const save=useMutation({mutationFn:()=>catalog.registerTool({name,version,installPath:path,notes}),onSuccess:async()=>{await client.invalidateQueries({queryKey:['tools']});setName('SAIGE AI Tool');setVersion('');setPath('');setNotes('');}});
 return <div className="management"><LocalNote/><UnsavedGuard dirty={name!=='SAIGE AI Tool'||!!version||!!path||!!notes}/><div className="management-split"><Panel title="외부 학습 도구 등록"><p className="management-note">SAIGE는 별도 학습 PC에서 사용자가 실행하는 외부 프로그램입니다. Studio는 도구 정보와 모델 메타데이터를 관리합니다.</p><form onSubmit={e=>{e.preventDefault();save.mutate();}}><fieldset disabled={save.isPending} className="management-fields tool-fields"><label>도구 이름<input required maxLength={200} value={name} onChange={e=>setName(e.target.value)}/></label><label>도구 버전<input required maxLength={40} value={version} onChange={e=>setVersion(e.target.value)}/></label><label>설치 경로<input required maxLength={1000} value={path} onChange={e=>setPath(e.target.value)}/></label><label>도구 메모<textarea maxLength={2000} value={notes} onChange={e=>setNotes(e.target.value)}/></label><Button type="submit">도구 정보 저장</Button></fieldset></form><Problem error={save.error}/>{save.isSuccess&&<p role="status" className="management-note">도구 정보를 저장했습니다.</p>}</Panel><Panel title="등록된 도구"><Problem error={tools.error}/>{tools.isPending?<p className="management-empty">불러오는 중…</p>:!tools.data?.length?<p className="management-empty">등록된 외부 도구가 없습니다.</p>:tools.data.map(x=><article className="tool-record" key={x.id}><h3>{x.name} / {x.version}</h3><p className="mono">{x.installPath}</p><p>{x.notes||'메모 없음'}</p><small>정보 등록만 지원 · EXE 실행 미연결</small></article>)}</Panel></div></div>;
}
