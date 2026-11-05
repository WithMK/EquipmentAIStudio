import { describe, it, expect, vi } from 'vitest';
import { Box } from 'lucide-react';
import { normalizeBasePath } from '../src/shared/config/basePath';
import { validateModules, type FeatureModule } from '../src/shared/modules/definition';
import { createMockServices } from '../src/adapters/mock/createMockServices';
import { createEquipmentFixtures } from '../src/adapters/mock/fixtures';
import { createServices } from '../src/app/services';
import { createHttpClient, ApiError } from '../src/shared/api-client/httpClient';
const sample: FeatureModule={id:'example',path:'example',title:'Example',subtitle:'',icon:Box,load:async()=>({default:()=>null})};
describe('extension contracts',()=>{
 it('registers a new module without a Shell change and rejects collisions',()=>{
  expect(validateModules([sample,{...sample,id:'second',path:'second'}])).toHaveLength(2);
  expect(()=>validateModules([sample,sample])).toThrow();
  expect(()=>validateModules([sample,{...sample,id:'other'}])).toThrow();
  expect(()=>validateModules([{...sample,path:'../escape'}])).toThrow();
 });
 it('supports feature-owned detail routes and rejects ambiguous parameters',()=>{
  expect(validateModules([{...sample,routes:[{path:'products/:id',load:sample.load}]}])).toHaveLength(1);
  expect(()=>validateModules([{...sample,routes:[{path:'products/:id',load:sample.load},{path:'products/:key',load:sample.load}]}])).toThrow();
 });
 it('normalizes root and nested mount paths and rejects external paths',()=>{
  expect(normalizeBasePath('/')).toBe('/');
  expect(normalizeBasePath('/studio')).toBe('/studio/');
  expect(normalizeBasePath('/portal/studio/')).toBe('/portal/studio/');
  for(const value of ['https://example.com','//evil','/../','/studio?x']) expect(()=>normalizeBasePath(value)).toThrow();
 });
 it('creates deterministic isolated fixtures with configurable equipment count',async()=>{
  expect(createEquipmentFixtures()).toEqual(createEquipmentFixtures());
  expect(createEquipmentFixtures(12)).toHaveLength(12);
  const service=createMockServices(); const first=await service.equipment.list();
  first[0].name='mutated'; expect((await service.equipment.list())[0].name).not.toBe('mutated');
  expect(new Set(first.map(x=>x.id)).size).toBe(9);
 });
 it('supports cancellation and empty pages without fabricating results',async()=>{
  const service=createMockServices();
  expect(await service.inspections.search({page:1,pageSize:25})).toEqual({items:[],total:0,page:1,pageSize:25});
  await expect(service.inspections.search({page:0,pageSize:25})).rejects.toThrow();
  await expect(service.equipment.list({signal:AbortSignal.abort()})).rejects.toThrow();
 });
 it('does not silently downgrade a real adapter request to mock',()=>{
  expect(()=>createServices('http')).toThrow('not installed');
 });
});
describe('HTTP boundary',()=>{
 it('injects current token, forwards cancellation and keeps API base separate',async()=>{
  const transport=vi.fn().mockResolvedValue(new Response(JSON.stringify({items:[]})));
  const signal=new AbortController().signal;
  const client=createHttpClient('/api/studio/',{getIdentity:async()=>null,getAccessToken:async()=>'test-token'},transport);
  expect(await client.get('equipment',signal)).toEqual({items:[]});
  expect(transport).toHaveBeenCalledWith('/api/studio/equipment',expect.objectContaining({signal,headers:expect.objectContaining({Authorization:'Bearer test-token'})}));
 });
 it('exposes HTTP failure and rejects foreign endpoints',async()=>{
  const transport=vi.fn().mockResolvedValue(new Response('denied',{status:403}));
  const client=createHttpClient('/api/',createMockServices().auth,transport);
  await expect(client.get('equipment')).rejects.toBeInstanceOf(ApiError);
  await expect(client.get('https://other.example')).rejects.toThrow('relative');
 });
});
