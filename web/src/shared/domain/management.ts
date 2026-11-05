import type { InspectionImage, InspectionReview, Verdict } from './models';
export interface ImageCandidate { image:InspectionImage; productId:string; productKey:string; machineId:string; lotId:string; type:string; review?:InspectionReview }
export interface CandidateQuery { page:number; pageSize:number; machineId?:string; text?:string; type?:string; verdict?:Verdict; reviewed?:boolean }
export interface DatasetItem { imageId:string; productKey:string; productId:string; machineId:string; lotId:string; inspectionId:string; type:string; originalVerdict:Verdict; label:Verdict; review?:InspectionReview }
export interface DatasetVersion { id:string; name:string; version:string; status:'draft'|'frozen'; createdAt:string; frozenAt?:string; items:DatasetItem[] }
export interface ModelVersion { id:string; name:string; version:string; datasetId:string; trainedAt:string; accuracy:number; evaluationNotes:string; artifactPath:string; status:'development'|'validation'|'production'; createdAt:string }
export interface ExternalTool { id:string; name:string; version:string; installPath:string; notes:string; createdAt:string }
export interface HubPc { machineId:string; pcId:string; target:'Log'|'Image'; state:'success'|'warning'|'error'|'unknown'; access:'available'|'unavailable'|'unknown'; lastAttemptAt?:string; lastSuccessAt?:string; lastError?:string; recovery:string }
export interface HubEvent { id:string; machineId:string; pcId:string; at:string; type:'failure'|'retry'|'recovered'; message:string }
export interface HubSnapshot { id:string; state:'online'|'offline'; observedAt:string; lastHeartbeatAt:string; pcs:HubPc[]; events:HubEvent[] }
export type HubScenario = 'mixed'|'healthy'|'offline';
