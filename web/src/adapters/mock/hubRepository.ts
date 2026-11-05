import type { Equipment } from '../../shared/domain/models';
import type { HubRepository } from '../../shared/services/contracts';
import type { HubPc, HubEvent } from '../../shared/domain/management';
/** Deterministic scenarios; observedAt is fixture time, never masquerades as a live heartbeat. */
export function createHubRepository(equipment:Equipment[]):HubRepository {
 return {async snapshot(scenario){
  if(!['mixed','healthy','offline'].includes(scenario))throw new Error('알 수 없는 시나리오');
  const pcs:HubPc[]=equipment.flatMap((e,index)=>['Control','Side','Thermal'].map((pcId,p)=>{
   const failure=scenario==='mixed'&&index===2&&p===1,delay=scenario==='mixed'&&index===4&&p===2;
   return {machineId:e.machineId,pcId,target:p===0?'Log':'Image',state:scenario==='offline'?'unknown':failure?'error':delay?'warning':'success',access:scenario==='offline'?'unknown':failure?'unavailable':'available',lastAttemptAt:'2026-11-05T03:00:00Z',lastSuccessAt:failure||delay?'2026-11-05T02:30:00Z':'2026-11-05T03:00:20Z',...(failure?{lastError:'SMB 공유폴더 접근 거부'}:delay?{lastError:'예정 작업이 허용 지연 시간을 초과했습니다.'}:{}),recovery:failure?'재시도 대기 (2/5)':delay?'스케줄러 확인 필요':index===1&&p===1?'03:00 UTC 자동 복구 완료':'복구 작업 없음'};
  }));
  const events:HubEvent[]=scenario==='offline'?[]:equipment[1]?[{id:'f1',machineId:equipment[1].machineId,pcId:'Side',at:'2026-11-05T02:50:00Z',type:'failure',message:'공유폴더 연결 끊김'},{id:'r1',machineId:equipment[1].machineId,pcId:'Side',at:'2026-11-05T02:55:00Z',type:'retry',message:'자동 재시도 1회'},{id:'r2',machineId:equipment[1].machineId,pcId:'Side',at:'2026-11-05T03:00:00Z',type:'recovered',message:'접근 복구 및 누락 파일 3개 수집 완료'}]:[];
  if(scenario==='mixed'&&equipment[2])events.unshift({id:'f2',machineId:equipment[2].machineId,pcId:'Side',at:'2026-11-05T03:00:00Z',type:'failure',message:'SMB 공유폴더 접근 거부 · 재시도 2회'});
  return {id:'HUB-01',state:scenario==='offline'?'offline':'online',observedAt:'2026-11-05T03:02:00Z',lastHeartbeatAt:scenario==='offline'?'2026-11-05T02:30:00Z':'2026-11-05T03:01:50Z',pcs,events};
 }};
}
