import type { StudioServices } from '../../shared/services/contracts';
import { createEquipmentFixtures } from './fixtures';
export function createMockServices(): StudioServices {
  const equipment = createEquipmentFixtures();
  return {
    dataMode: 'mock',
    auth: { async getIdentity() { return { id: 'demo-engineer', displayName: 'Demo engineer', mode: 'demo' }; }, async getAccessToken() { return null; } },
    equipment: { async list(options) { options?.signal?.throwIfAborted(); return structuredClone(equipment); } },
    inspections: { async search(query, options) {
      options?.signal?.throwIfAborted();
      if (!Number.isInteger(query.page) || query.page < 1 || !Number.isInteger(query.pageSize) || query.pageSize < 1 || query.pageSize > 100) throw new Error('Invalid pagination');
      // No production-like results until Phase 2. Empty is not a network failure.
      return { items: [], total: 0, page: query.page, pageSize: query.pageSize };
    } },
  };
}
