import { featureModule as datasets } from '../features/datasets/module';
import { featureModule as models } from '../features/models/module';
import { featureModule as tools } from '../features/ai-tools/module';
import { featureModule as hub } from '../features/hub-management/module';
// Composition root: adding a feature requires one registration, no Shell edits.
import { inspectionModule } from '../features/inspection-explorer/module';
import { workspaceModule } from '../features/workspace/module';
import { validateModules } from '../shared/modules/definition';
export const modules = validateModules([inspectionModule, datasets, models, tools, hub, workspaceModule]);

export const plannedModules: {title:string;phase:string}[] = [];
