import { createInspectionFixtures } from './inspectionFixtures';
import { createInspectionRepository } from './inspectionRepository';
import type { StudioServices } from '../../shared/services/contracts';
import { createEquipmentFixtures } from './fixtures';
export function createMockServices(): StudioServices {
  const equipment = createEquipmentFixtures();
  return {
    dataMode: 'mock',
    auth: { async getIdentity() { return { id: 'demo-engineer', displayName: 'Demo engineer', mode: 'demo' }; }, async getAccessToken() { return null; } },
    equipment: { async list(options) { options?.signal?.throwIfAborted(); return structuredClone(equipment); } },
    inspections: createInspectionRepository(createInspectionFixtures()),
  };
}
