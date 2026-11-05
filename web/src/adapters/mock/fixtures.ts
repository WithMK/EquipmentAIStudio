import type { Equipment } from '../../shared/domain/models';
/** Pure and deterministic. No clock or random dependency. Expand scenarios in Phase 2. */
export function createEquipmentFixtures(count = 9): Equipment[] {
  return Array.from({length: count}, (_, i) => {
    const machineId = `EQ${String(i + 1).padStart(2, '0')}`;
    return { id: machineId, machineId, name: `Trimming ${String(i + 1).padStart(2, '0')}`, equipmentType: 'MLCC_TRIMMING', enabled: true };
  });
}
export const scenarioPlan = ['ok', 'ng', 'multiple-products', 'four-segments', 'side-thermal', 'reinspection', 'missing-image', 'review-override', 'multiple-equipment', 'hub-failure-recovery'] as const;
