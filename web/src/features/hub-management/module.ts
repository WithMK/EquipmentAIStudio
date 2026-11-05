import { Network } from 'lucide-react';
import type { FeatureModule } from '../../shared/modules/definition';
export const featureModule:FeatureModule={id:'hub-management',path:'hub',title:'DatasetHub',subtitle:'수집 연결 상태 · 오류 · 자동 복구 이력',icon:Network,load:()=>import('./page')};
