import {test,expect} from '@playwright/test';
test('review persistence, original verdict preservation, history and unsaved navigation',async({page})=>{
 await page.goto('inspections?machine=EQ01&product=P001&lot=20261101');await page.getByRole('link',{name:'P001',exact:true}).click();
 const panel=page.getByRole('region',{name:'개발자 검토'});
 await expect(panel.getByText('미검토',{exact:true})).toBeVisible();
 await panel.getByRole('radio',{name:'OK',exact:true}).check();await panel.getByLabel('검토 메모').fill('과검출 검토');
 await page.getByRole('link',{name:'검색 결과로 복귀'}).click();
 await page.getByRole('button',{name:'계속 검토'}).click();
 await panel.getByRole('button',{name:'검토 저장',exact:true}).click();await expect(panel.getByRole('status')).toHaveText('검토를 저장했습니다.');
 await page.reload();await expect(panel.getByRole('radio',{name:'OK',exact:true})).toBeChecked();await expect(panel.getByLabel('검토 메모')).toHaveValue('과검출 검토');
 await expect(panel.getByText('설비 원본 판정:')).toContainText('NG');
 await panel.getByRole('radio',{name:'NG',exact:true}).check();await panel.getByRole('button',{name:'검토 저장',exact:true}).click();await expect(panel.getByRole('alert')).toContainText('불량 유형');
 await panel.getByRole('checkbox',{name:'균열',exact:true}).check();await panel.getByRole('button',{name:'검토 저장',exact:true}).click();await expect(panel.getByText('변경 이력 (2)')).toBeVisible();
 await panel.getByText('변경 이력 (2)').click();await expect(panel.locator('article')).toHaveCount(2);
 await page.getByRole('button',{name:'SIDE-2 OK',exact:true}).click();await expect(panel.getByText('미검토',{exact:true})).toBeVisible();
 await panel.getByRole('radio',{name:'NG',exact:true}).check();
 page.once('dialog',d=>d.dismiss());await page.getByRole('button',{name:'SIDE-1 NG',exact:true}).click();await expect(page.getByRole('button',{name:'SIDE-2 OK',exact:true})).toHaveAttribute('aria-pressed','true');
});
test('cross-tab conflict preserves draft and existing review',async({page,context})=>{
 const url='inspections/products/EQ01-LOT-20261101-01-P001';
 await page.goto(url);const other=await context.newPage();await other.goto(url);
 const panel=page.getByRole('region',{name:'개발자 검토'}),second=other.getByRole('region',{name:'개발자 검토'});
 await expect(panel.getByText('미검토',{exact:true})).toBeVisible();await expect(second.getByText('미검토',{exact:true})).toBeVisible();
 await panel.getByRole('radio',{name:'OK',exact:true}).check();await panel.getByRole('button',{name:'검토 저장',exact:true}).click();await expect(panel.getByRole('status')).toHaveText('검토를 저장했습니다.');
 await second.getByRole('radio',{name:'NG',exact:true}).check();await second.getByRole('checkbox',{name:'균열',exact:true}).check();await second.getByRole('button',{name:'검토 저장',exact:true}).click();
 await expect(second.getByRole('alert')).toContainText('다른 탭');await expect(second.getByRole('radio',{name:'NG',exact:true})).toBeChecked();
 other.once('dialog',d=>d.accept());await second.getByRole('button',{name:'다시 불러오기'}).click();await expect(second.getByRole('radio',{name:'OK',exact:true})).toBeChecked();
});
