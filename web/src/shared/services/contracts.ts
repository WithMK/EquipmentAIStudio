import type { Equipment, InspectionQuery, InspectionSummary, Page } from '../domain/models';
export interface RequestOptions { signal?: AbortSignal }
export interface EquipmentRepository { list(options?: RequestOptions): Promise<Equipment[]> }
export interface InspectionRepository { search(query: InspectionQuery, options?: RequestOptions): Promise<Page<InspectionSummary>> }
/** Auth boundary only. The server must enforce authorization when introduced. */
export interface Identity { id: string; displayName: string; mode: 'demo'|'authenticated' }
export interface AuthProvider { getIdentity(): Promise<Identity | null>; getAccessToken(): Promise<string | null> }
export interface StudioServices { equipment: EquipmentRepository; inspections: InspectionRepository; auth: AuthProvider; dataMode: 'mock' }
