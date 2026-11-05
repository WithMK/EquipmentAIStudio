import { ScanLine } from 'lucide-react';
import type { FeatureModule } from '../../shared/modules/definition';
export const inspectionModule: FeatureModule = { id:'inspection',path:'inspections',title:'Inspection Explorer',subtitle:'검사 이력 · 제품 · 이미지',icon:ScanLine,load:()=>import('./page') };
