import { createMockServices } from '../adapters/mock/createMockServices';
export function createServices(mode = import.meta.env.VITE_DATA_MODE || 'mock') {
  if (mode !== 'mock') throw new Error(`Data adapter "${mode}" is not installed. Phase 1 supports mock only.`);
  return createMockServices();
}
