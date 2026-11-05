import {expect,it} from 'vitest';
import {createInspectionFixtures} from '../src/adapters/mock/inspectionFixtures';
import {searchRecords,createInspectionRepository} from '../src/adapters/mock/inspectionRepository';
import {readQuery,writeQuery,utcTime,inputTime} from '../src/features/inspection-explorer/query';
const records=createInspectionFixtures();
it('deterministic 9 machines, 54 lots, 432 products and intact LOT pagination',()=>{
 expect(records).toEqual(createInspectionFixtures());
 const result=searchRecords(records,{page:1,pageSize:5});
 expect(result.total).toBe(54);expect(result.matchedProducts).toBe(432);expect(result.items).toHaveLength(5);
 expect(result.items.every(x=>x.products.length===8)).toBe(true);
 const second=searchRecords(records,{page:2,pageSize:5});expect(second.items.some(x=>result.items.some(y=>y.lot.id===x.lot.id))).toBe(false);
});
it('combines machine, ID, type, verdict and date filters',()=>{
 const result=searchRecords(records,{page:1,pageSize:5,machineId:'EQ01',lotId:'20261101',productId:'P001',type:'SIDE',verdict:'NG',from:'2026-11-01T00:00:00.000Z',to:'2026-11-01T23:59:59.000Z'});
 expect(result.total).toBe(1);expect(result.matchedProducts).toBe(1);expect(result.items[0].totalProducts).toBe(8);expect(result.items[0].products[0].verdict).toBe('NG');
});
it('uses latest run, preserves reinspection and reports missing images',()=>{
 const r=searchRecords(records,{page:1,pageSize:10,machineId:'EQ01',lotId:'20261101'});
 const p2=r.items[0].products.find(x=>x.product.productId==='P002')!;
 expect(p2.reinspectionCount).toBe(1);expect(p2.verdict).toBe('OK');expect(p2.imageCount).toBe(12);
 const p3=r.items[0].products.find(x=>x.product.productId==='P003')!;expect(p3.missingImageCount).toBe(2);expect(p3.imageCount).toBe(10);expect(p3.product.segmentIndex).toBe(3);
});
it('orders before paging and distinguishes empty from invalid input',()=>{
 const asc=searchRecords(records,{page:1,pageSize:5,sort:{field:'inspectedAt',direction:'asc'}});
 const desc=searchRecords(records,{page:1,pageSize:5,sort:{field:'inspectedAt',direction:'desc'}});
 expect(asc.items[0].products[0].inspection.inspectedAt<desc.items[0].products[0].inspection.inspectedAt).toBe(true);
 expect(searchRecords(records,{page:1,pageSize:5,productId:'does-not-exist'}).total).toBe(0);
 expect(()=>searchRecords(records,{page:1,pageSize:5,from:'2026-11-06',to:'2026-11-01'})).toThrow();
});
it('preserves URL query, normalizes hostile pagination and uses KST independent of host',()=>{
 const q=readQuery(new URLSearchParams('machine=EQ01&verdict=NG&page=2&size=10&sort=productId&direction=asc'));
 expect(readQuery(writeQuery(q))).toEqual(q);
 expect(readQuery(new URLSearchParams('page=-2&size=999&sort=evil')).page).toBe(1);
 expect(utcTime('2026-11-01T09:00')).toBe('2026-11-01T00:00:00.000Z');expect(inputTime('2026-11-01T00:00:00.000Z')).toBe('2026-11-01T09:00');
});
it('returns product by unique ID, isolates returned data, honors abort',async()=>{
 const repository=createInspectionRepository(records);const id=records[0].product.id;
 const record=await repository.getProduct(id);record!.product.productId='change';
 expect((await repository.getProduct(id))!.product.productId).toBe('P001');
 expect(await repository.getProduct('missing')).toBe(null);
 await expect(repository.search({page:1,pageSize:5},{signal:AbortSignal.abort()})).rejects.toThrow();
});
