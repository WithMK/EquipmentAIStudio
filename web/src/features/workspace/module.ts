import { Settings2 } from 'lucide-react';
import type { FeatureModule } from '../../shared/modules/definition';
export const workspaceModule: FeatureModule = { id:'workspace',path:'workspace',title:'Workspace',subtitle:'현재 환경 및 모듈 구성',icon:Settings2,load:()=>import('./page') };
