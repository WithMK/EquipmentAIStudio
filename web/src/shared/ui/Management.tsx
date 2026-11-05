import { useEffect } from 'react';
import { useBlocker } from 'react-router-dom';
import { Button } from './button';
export const formatTime=(s?:string)=>s?new Date(s).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'}):'—';
export function Problem({error}:{error:unknown}){return error?<p role="alert" className="management-error">{error instanceof Error?error.message:'처리 실패. 다시 시도하세요.'}</p>:null;}
export function LocalNote(){return <p className="management-note">Mock · 이 브라우저에만 저장됩니다. 실제 서버·학습·배포 미연결.</p>;}
export function UnsavedGuard({dirty}:{dirty:boolean}){
 const blocker=useBlocker(({currentLocation,nextLocation})=>dirty&&currentLocation.pathname!==nextLocation.pathname);
 useEffect(()=>{const guard=(e:BeforeUnloadEvent)=>{if(dirty){e.preventDefault();e.returnValue='';}};window.addEventListener('beforeunload',guard);return()=>window.removeEventListener('beforeunload',guard);},[dirty]);
 return blocker.state==='blocked'?<div role="alertdialog" aria-label="저장하지 않은 입력" className="review-leave"><p>저장하지 않은 입력이 있습니다.</p><Button onClick={()=>blocker.reset()}>계속 작성</Button><Button variant="outline" onClick={()=>blocker.proceed()}>변경 버리고 이동</Button></div>:null;
}
