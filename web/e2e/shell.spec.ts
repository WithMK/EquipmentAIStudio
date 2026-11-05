import { test, expect } from '@playwright/test';
test('navigation, refresh, sidebar and layout', async ({page})=>{
 const errors:string[]=[]; page.on('pageerror',e=>errors.push(e.message));
 await page.goto('./');
 await expect(page.getByRole('heading',{name:'Inspection Explorer',exact:true})).toBeVisible();
 await expect(page.getByRole('table',{name:'LOT 제품 검사 목록'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 await page.getByRole('link',{name:'Workspace',exact:true}).click();
 await expect(page.getByRole('heading',{name:'현재 실행 환경'})).toBeVisible();
 await page.reload();
 await expect(page.getByText('Demo engineer',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'사이드바 접기'}).click();
 await expect(page.getByRole('button',{name:'사이드바 펼치기'})).toBeVisible();
 await page.getByRole('link',{name:'Inspection Explorer',exact:true}).click();
 await expect(page.getByRole('table',{name:'LOT 제품 검사 목록'})).toBeVisible();
 await page.reload();
 await expect(page.getByRole('table',{name:'LOT 제품 검사 목록'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 expect(errors).toEqual([]);
});
test('unknown route recovers inside configured base', async ({page})=>{
 await page.goto('not-a-feature');
 await expect(page.getByText('등록되지 않은 경로입니다')).toBeVisible();
 await page.getByRole('link',{name:'Inspection Explorer',exact:true}).last().click();
 await expect(page.getByRole('table',{name:'LOT 제품 검사 목록'})).toBeVisible();
});
