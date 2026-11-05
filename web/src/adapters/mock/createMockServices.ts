import { createCatalogRepository } from './catalogRepository';
import { createHubRepository } from './hubRepository';
import { createReviewRepository } from './reviewRepository';
import { createInspectionFixtures } from './inspectionFixtures';
import { createInspectionRepository } from './inspectionRepository';
import type { StudioServices } from '../../shared/services/contracts';
import { createEquipmentFixtures } from './fixtures';
export function createMockServices(): StudioServices {
  const equipment = createEquipmentFixtures();
  const records=createInspectionFixtures();
  const auth:StudioServices['auth']={async getIdentity(){return {id:'demo-engineer',displayName:'Demo engineer',mode:'demo'};},async getAccessToken(){return null;}};
  const reviewable=new Set(records.flatMap(r=>r.images.filter(i=>i.availability==='available').map(i=>i.id)));
  const reviews=createReviewRepository(auth,id=>reviewable.has(id));
  return {
    dataMode: 'mock',
    auth,
    reviews,
    catalog:createCatalogRepository(records,reviews),
    hub:createHubRepository(equipment),
    equipment: { async list(options) { options?.signal?.throwIfAborted(); return structuredClone(equipment); } },
    inspections: createInspectionRepository(records),
  };
}
