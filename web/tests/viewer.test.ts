import {it,expect} from 'vitest';
import {clampScale,fitScale,latestRunIds} from '../src/features/inspection-explorer/viewerMath';
import {createMockServices} from '../src/adapters/mock/createMockServices';
it('fits both axes and clamps unsafe scales',()=>{expect(fitScale(832,532,1600,1000)).toBe(.5);expect(clampScale(100)).toBe(8);expect(clampScale(0)).toBe(.05);});
it('selects latest inspection independently for each type',()=>{expect(latestRunIds([{id:'old',type:'SIDE',inspectedAt:'2026-11-01'},{id:'thermal',type:'THERMAL',inspectedAt:'2026-11-01'},{id:'new',type:'SIDE',inspectedAt:'2026-11-02'}])).toEqual(['new','thermal']);});
it('adapter provides dimensioned NG samples and preserves missing image state',async()=>{
 const service=createMockServices();const results=await service.inspections.search({page:1,pageSize:5});
 const ng=results.items[0].products.find(x=>x.product.productId==='P001')!;
 const product=(await service.inspections.getProduct(ng.product.id))!;
 const image=product.images.find(x=>x.originalVerdict==='NG')!;
 expect(image.imageUrl).toContain('/samples/side-ng.svg');expect(image.width).toBe(1600);expect(image.defectRegions).toHaveLength(1);
 const missing=results.items[0].products.find(x=>x.product.productId==='P003')!;
 const record=(await service.inspections.getProduct(missing.product.id))!;
 expect(record.images.filter(x=>x.availability==='missing').every(x=>!x.imageUrl)).toBe(true);
});
