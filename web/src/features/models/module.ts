import { Boxes } from 'lucide-react';
import type { FeatureModule } from '../../shared/modules/definition';
export const featureModule:FeatureModule={id:'models',path:'models',title:'AI Models',subtitle:'모델 버전 · 학습 Dataset · 성능 기록',icon:Boxes,load:()=>import('./page')};
