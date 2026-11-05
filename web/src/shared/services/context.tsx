import { createContext, useContext } from 'react';
import type { StudioServices } from './contracts';
export const ServicesContext = createContext<StudioServices | null>(null);
export function useServices() {
  const services = useContext(ServicesContext);
  if (!services) throw new Error('StudioServices provider is missing');
  return services;
}
