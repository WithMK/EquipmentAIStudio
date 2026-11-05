import { Database } from 'lucide-react';
import type { FeatureModule } from '../../shared/modules/definition';
export const featureModule:FeatureModule={id:'datasets',path:'datasets',title:'Datasets',subtitle:'이미지 선별 · 레이블 스냅샷 · 버전',icon:Database,load:()=>import('./page')};
