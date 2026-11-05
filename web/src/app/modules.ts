// Composition root: adding a feature requires one registration, no Shell edits.
import { inspectionModule } from '../features/inspection-explorer/module';
import { workspaceModule } from '../features/workspace/module';
import { validateModules } from '../shared/modules/definition';
export const modules = validateModules([inspectionModule, workspaceModule]);

export const plannedModules = [{title:'Image Review',phase:'04'}, {title:'Datasets',phase:'05'}, {title:'AI Models',phase:'05'}, {title:'DatasetHub',phase:'06'}, {title:'External AI Tools',phase:'05'}];
