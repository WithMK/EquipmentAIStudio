import 'fake-indexeddb/auto';
import {it,expect} from 'vitest';
import {createCatalogRepository} from '../src/adapters/mock/catalogRepository';
import {createReviewRepository} from '../src/adapters/mock/reviewRepository';
import {createInspectionFixtures} from '../src/adapters/mock/inspectionFixtures';
import {createHubRepository} from '../src/adapters/mock/hubRepository';
import {createEquipmentFixtures} from '../src/adapters/mock/fixtures';
const auth={getIdentity:async()=>({id:'tester',displayName:'Tester',mode:'demo' as const}),getAccessToken:async()=>null};
function setup(){const records=createInspectionFixtures(1,1);const reviews=createReviewRepository(auth,id=>records.some(r=>r.images.some(i=>i.id===id&&i.availability==='available')),crypto.randomUUID());const name=crypto.randomUUID();return {records,reviews,name,catalog:createCatalogRepository(records,reviews,name)};}
it('filters and pages candidates; missing files excluded; latest review overrides original only for candidates',async()=>{
 const {catalog,reviews,records}=setup();const id=records[0].images[0].id;
 await reviews.save({imageId:id,verdict:'OK',defectTypeIds:[],note:'overkill',expectedReviewId:null});
 const rows=await catalog.candidates({page:1,pageSize:20,reviewed:true,verdict:'OK',machineId:'EQ01',type:'SIDE'});
 expect(rows.total).toBe(1);expect(rows.items[0].image.originalVerdict).toBe('NG');expect(rows.items[0].review?.verdict).toBe('OK');
 const a=await catalog.candidates({page:1,pageSize:100});expect(a.items.every(x=>x.image.availability==='available')).toBe(true);
 expect((await catalog.candidates({page:1,pageSize:20,text:'notfound'})).total).toBe(0);
 expect((await catalog.candidates({page:2,pageSize:2})).items[0].image.id).not.toBe(a.items[0].image.id);
 await expect(catalog.candidates({page:0,pageSize:20})).rejects.toThrow();
});
it('persists immutable dataset labels and review provenance after later re-review',async()=>{
 const {catalog,reviews,records,name}=setup();const id=records[0].images[0].id;
 const review=(await reviews.save({imageId:id,verdict:'NG',defectTypeIds:['crack'],note:'snapshot',expectedReviewId:null}))[0];
 const d=await catalog.createDataset({name:'Side',version:'1.0',imageIds:[id,id]});expect(d.items).toHaveLength(1);
 await reviews.save({imageId:id,verdict:'OK',defectTypeIds:[],note:'changed',expectedReviewId:review.id});
 const saved=(await createCatalogRepository(records,reviews,name).datasets())[0];expect(saved.items[0].label).toBe('NG');expect(saved.items[0].review?.note).toBe('snapshot');
 const d2=await catalog.createDataset({name:'Side',version:'2.0',imageIds:[id]});expect(d2.items[0].label).toBe('OK');
 expect((await catalog.freezeDataset(d.id)).status).toBe('frozen');expect((await catalog.freezeDataset(d.id)).items).toEqual(saved.items);
});
it('serializes duplicate versions across repositories and validates source selection',async()=>{
 const {catalog,records,reviews,name}=setup();const draft={name:'Side',version:'1',imageIds:[records[0].images[0].id]};
 const other=createCatalogRepository(records,reviews,name);
 const results=await Promise.allSettled([catalog.createDataset(draft),other.createDataset({...draft,name:' SIDE '})]);expect(results.filter(r=>r.status==='fulfilled')).toHaveLength(1);
 await expect(catalog.createDataset({...draft,version:'2',imageIds:[]})).rejects.toThrow();
 await expect(catalog.createDataset({...draft,version:'2',imageIds:['missing']})).rejects.toThrow();
 await expect(catalog.createDataset({...draft,version:'2',imageIds:[records[2].images[0].id]})).rejects.toThrow();
 await expect(catalog.createDataset({...draft,version:'bad version'})).rejects.toThrow();
});
it('requires frozen dataset, valid metrics, dates and unique model version; persists tools',async()=>{
 const {catalog,records,reviews,name}=setup();const d=await catalog.createDataset({name:'Set',version:'1',imageIds:[records[0].images[0].id]});
 const draft={name:'Side model',version:'1',datasetId:d.id,trainedAt:'2026-11-05',accuracy:97.2,evaluationNotes:'held out set',artifactPath:'D:\\models\\side.bin',status:'validation' as const};
 await expect(catalog.registerModel(draft)).rejects.toThrow('확정');await catalog.freezeDataset(d.id);
 await expect(catalog.registerModel({...draft,accuracy:NaN})).rejects.toThrow('정확도');
 await expect(catalog.registerModel({...draft,trainedAt:'2026-02-30'})).rejects.toThrow('학습일');
 await expect(catalog.registerModel({...draft,evaluationNotes:''})).rejects.toThrow();
 await catalog.registerModel(draft);await expect(catalog.registerModel(draft)).rejects.toThrow('같은');
 await catalog.registerTool({name:'SAIGE',version:'1',installPath:'D:\\AI',notes:'external'});
 const reloaded=createCatalogRepository(records,reviews,name);expect(await reloaded.models()).toHaveLength(1);expect(await reloaded.tools()).toHaveLength(1);
 await expect(catalog.registerTool({name:'SAIGE',version:'1',installPath:'D:\\AI',notes:''})).rejects.toThrow('동일');
});
it('hub scenarios reflect variable equipment counts, errors, recovery and offline unknown state',async()=>{
 const repo=createHubRepository(createEquipmentFixtures(12));const mixed=await repo.snapshot('mixed');expect(mixed.pcs).toHaveLength(36);expect(mixed.pcs.filter(p=>p.state==='error')).toHaveLength(1);expect(mixed.pcs.filter(p=>p.state==='warning')).toHaveLength(1);expect(mixed.events.some(e=>e.type==='recovered')).toBe(true);
 const recovered=await repo.snapshot('healthy');expect(recovered.pcs.every(p=>p.state==='success')).toBe(true);
 const offline=await repo.snapshot('offline');expect(offline.state).toBe('offline');expect(offline.pcs.every(p=>p.state==='unknown'&&p.access==='unknown')).toBe(true);
 expect(await repo.snapshot('mixed')).toEqual(mixed);expect((await createHubRepository([]).snapshot('mixed')).pcs).toHaveLength(0);
});
