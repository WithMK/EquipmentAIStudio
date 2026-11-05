import type { CandidateQuery, ImageCandidate, DatasetVersion, ModelVersion, ExternalTool, HubSnapshot, HubScenario } from '../domain/management';
import type { Page } from '../domain/models';
import type { Equipment, InspectionQuery, InspectionPage, ProductRecord, InspectionReview } from '../domain/models';
export interface RequestOptions { signal?: AbortSignal }
export interface EquipmentRepository { list(options?: RequestOptions): Promise<Equipment[]> }
export interface InspectionRepository { search(query: InspectionQuery, options?: RequestOptions): Promise<InspectionPage>; getProduct(id:string, options?:RequestOptions): Promise<ProductRecord | null> }
/** Auth boundary only. The server must enforce authorization when introduced. */
export interface Identity { id: string; displayName: string; mode: 'demo'|'authenticated' }
export interface AuthProvider { getIdentity(): Promise<Identity | null>; getAccessToken(): Promise<string | null> }
export interface ReviewDraft { imageId:string; verdict:'OK'|'NG'; defectTypeIds:string[]; note:string; expectedReviewId:string|null }
export interface ReviewRepository {
 latest():Promise<InspectionReview[]>;
 history(imageId:string):Promise<InspectionReview[]>;
 save(draft:ReviewDraft):Promise<InspectionReview[]>;
 defectTypes():Promise<{id:string;label:string}[]>;
}
export interface StudioServices { equipment: EquipmentRepository; inspections: InspectionRepository; auth: AuthProvider; reviews:ReviewRepository; catalog: CatalogRepository; hub:HubRepository; dataMode: 'mock' }

/** Prototype metadata contracts. No training, file execution or Collector commands. */
export interface CatalogRepository {
 candidates(query:CandidateQuery):Promise<Page<ImageCandidate>>;
 datasets():Promise<DatasetVersion[]>;
 createDataset(draft:{name:string;version:string;imageIds:string[]}):Promise<DatasetVersion>;
 freezeDataset(id:string):Promise<DatasetVersion>;
 models():Promise<ModelVersion[]>;
 registerModel(draft:Omit<ModelVersion,'id'|'createdAt'>):Promise<ModelVersion>;
 tools():Promise<ExternalTool[]>;
 registerTool(draft:Omit<ExternalTool,'id'|'createdAt'>):Promise<ExternalTool>;
}
export interface HubRepository { snapshot(scenario:HubScenario):Promise<HubSnapshot> }
