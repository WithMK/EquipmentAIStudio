import 'fake-indexeddb/auto';
import {it,expect} from 'vitest';
import {createReviewRepository} from '../src/adapters/mock/reviewRepository';
const auth={getIdentity:async()=>({id:'tester',displayName:'Test',mode:'demo' as const}),getAccessToken:async()=>null};
const draft={imageId:'image1',verdict:'NG' as const,defectTypeIds:['crack'],note:'test',expectedReviewId:null};
it('persists review on new repository and appends immutable linked revisions',async()=>{
 const name=crypto.randomUUID();const repo=createReviewRepository(auth,()=>true,name);
 const first=await repo.save(draft);expect(first).toHaveLength(1);expect(first[0].reviewerId).toBe('tester');
 const next=createReviewRepository(auth,()=>true,name);expect(await next.history('image1')).toEqual(first);
 const second=await next.save({...draft,verdict:'OK',defectTypeIds:[],note:'수정',expectedReviewId:first[0].id});
 expect(second).toHaveLength(2);expect(second[1]).toEqual(first[0]);expect(second[0].previousReviewId).toBe(first[0].id);
 expect(await repo.history('different')).toEqual([]);
});
it('serializes concurrent saves and rejects stale revisions without data loss',async()=>{
 const name=crypto.randomUUID();const a=createReviewRepository(auth,()=>true,name),b=createReviewRepository(auth,()=>true,name);
 const results=await Promise.allSettled([a.save(draft),b.save(draft)]);
 expect(results.filter(x=>x.status==='fulfilled')).toHaveLength(1);expect(results.filter(x=>x.status==='rejected')).toHaveLength(1);
 expect(await a.history('image1')).toHaveLength(1);
 await expect(a.save(draft)).rejects.toThrow('다른 탭');
});
it('rejects invalid data, missing images and unknown reviewers',async()=>{
 const repo=createReviewRepository(auth,()=>true,crypto.randomUUID());
 await expect(repo.save({...draft,defectTypeIds:[]})).rejects.toThrow('불량 유형');
 await expect(repo.save({...draft,verdict:'OK'})).rejects.toThrow('OK 판정');
 await expect(repo.save({...draft,defectTypeIds:['bad']})).rejects.toThrow('확인');
 await expect(repo.save({...draft,note:'a'.repeat(2001)})).rejects.toThrow('확인');
 await expect(createReviewRepository(auth,()=>false).save(draft)).rejects.toThrow('누락');
 await expect(createReviewRepository({...auth,getIdentity:async()=>null},()=>true).save(draft)).rejects.toThrow('검토자');
 expect(await repo.history('image1')).toEqual([]);
});
