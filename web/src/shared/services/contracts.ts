import type { Equipment, InspectionQuery, InspectionPage, ProductRecord, InspectionReview } from '../domain/models';
export interface RequestOptions { signal?: AbortSignal }
export interface EquipmentRepository { list(options?: RequestOptions): Promise<Equipment[]> }
export interface InspectionRepository { search(query: InspectionQuery, options?: RequestOptions): Promise<InspectionPage>; getProduct(id:string, options?:RequestOptions): Promise<ProductRecord | null> }
/** Auth boundary only. The server must enforce authorization when introduced. */
export interface Identity { id: string; displayName: string; mode: 'demo'|'authenticated' }
export interface AuthProvider { getIdentity(): Promise<Identity | null>; getAccessToken(): Promise<string | null> }
export interface ReviewDraft { imageId:string; verdict:'OK'|'NG'; defectTypeIds:string[]; note:string; expectedReviewId:string|null }
export interface ReviewRepository {
 history(imageId:string):Promise<InspectionReview[]>;
 save(draft:ReviewDraft):Promise<InspectionReview[]>;
 defectTypes():Promise<{id:string;label:string}[]>;
}
export interface StudioServices { equipment: EquipmentRepository; inspections: InspectionRepository; auth: AuthProvider; reviews:ReviewRepository; dataMode: 'mock' }
