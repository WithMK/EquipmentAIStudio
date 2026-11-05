import { Wrench } from 'lucide-react';
import type { FeatureModule } from '../../shared/modules/definition';
export const featureModule:FeatureModule={id:'ai-tools',path:'ai-tools',title:'External AI Tools',subtitle:'외부 학습 프로그램 정보',icon:Wrench,load:()=>import('./page')};
