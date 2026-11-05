/** Draft contract v0.1. These are frontend models, not an agreed backend schema. */
export type Id = string;
export type Verdict = 'OK' | 'NG' | 'UNKNOWN';
export type InspectionType = string; // SIDE / THERMAL are presets, not a closed enum.
export interface Equipment { id: Id; machineId: string; name: string; equipmentType: string; enabled: boolean }
export interface Lot { id: Id; machineId: string; lotId: string; startedAt: string }
export interface Product { id: Id; lotId: Id; productId: string; machineId: string; parentProductId?: Id; segmentIndex?: number }
export interface Inspection { id: Id; productId: Id; inspectionRunId: string; type: InspectionType; inspectedAt: string; originalVerdict: Verdict; supersedesInspectionId?: Id }
export interface InspectionImage { id: Id; inspectionId: Id; capturePoint: string; capturedAt: string; originalVerdict: Verdict; availability: 'available'|'missing'|'pending'; thumbnailUrl?: string; imageUrl?: string; width?: number; height?: number }
export interface InspectionReview { id: Id; imageId: Id; verdict: Verdict; defectTypeIds: string[]; note: string; reviewerId: Id; reviewedAt: string; previousReviewId?: Id }
export interface Dataset { id: Id; name: string; version: string; status: 'draft'|'frozen'; items: {imageId: Id; reviewId?: Id}[] }
export interface AIModel { id: Id; name: string; version: string; datasetId: Id; datasetVersion: string; trainedAt?: string; metrics: Record<string,number>; artifactPath: string; status: 'development'|'validation'|'production' }
export interface DatasetHubStatus { id: Id; observedAt: string; state: 'unknown'|'online'|'offline'; pcs: {machineId: string; pcId: string; state: 'unknown'|'success'|'warning'|'error'; lastSuccessAt?: string; lastError?: string}[] }
export interface InspectionSummary { product: Product; lot: Lot; inspection: Inspection; imageCount: number; missingImageCount: number; inspections: Inspection[]; verdict: Verdict; types: string[]; reinspectionCount: number }
export interface LotSummary { lot: Lot; products: InspectionSummary[]; totalProducts: number; matchedProducts: number; ok: number; ng: number }
export interface InspectionPage extends Page<LotSummary> { matchedProducts: number; okProducts: number; ngProducts: number }
export interface ProductRecord { product: Product; lot: Lot; inspections: Inspection[]; images: InspectionImage[] }
export interface InspectionQuery { page: number; pageSize: number; machineId?: string; lotId?: string; productId?: string; from?: string; to?: string; type?: InspectionType; verdict?: Verdict; sort?: {field:'inspectedAt'|'productId'; direction:'asc'|'desc'} }
export interface Page<T> { items: T[]; total: number; page: number; pageSize: number }
