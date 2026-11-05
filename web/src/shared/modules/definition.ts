import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
export interface FeatureRoute {
  path: string;
  load: () => Promise<{default: ComponentType}>;
}
export interface FeatureModule {
  id: string;
  path: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  load: () => Promise<{default: ComponentType}>;
  routes?: readonly FeatureRoute[];
}
export function validateModules(modules: readonly FeatureModule[]) {
  const ids = new Set<string>(), paths = new Set<string>();
  for (const module of modules) {
    if (!module.id || ids.has(module.id) || paths.has(module.path) || !/^[a-z0-9-]+$/.test(module.path)) throw new Error(`Invalid or duplicate feature module: ${module.id}`);
    ids.add(module.id); paths.add(module.path);
    const routes = new Set<string>();
    for (const route of module.routes || []) {
      if (!/^(?:[a-z0-9-]+|:[a-zA-Z][a-zA-Z0-9]*)(?:\/(?:[a-z0-9-]+|:[a-zA-Z][a-zA-Z0-9]*))*$/.test(route.path)) throw new Error('Invalid feature route');
      const shape = route.path.replace(/:[a-zA-Z][a-zA-Z0-9]*/g, ':param');
      if (routes.has(shape)) throw new Error('Duplicate feature route');
      routes.add(shape);
    }
  }
  return modules;
}
