import {test,expect} from '@playwright/test';
test('dataset snapshot, freeze, model registration and external tool persistence',async({page})=>{
 await page.goto('datasets');await page.getByRole('button',{name:'Dataset 생성',exact:true}).click();
 await page.getByLabel('Dataset 이름').fill('Side training');await page.getByRole('checkbox').first().check();
 await expect(page.getByText('선택 1 / 500개')).toBeVisible();await page.getByRole('button',{name:'선택 이미지로 저장'}).click();
 await expect(page.getByRole('status')).toHaveText('Dataset을 저장했습니다.');await page.reload();
 await expect(page.getByRole('button',{name:'Side training / 1.0',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'버전 확정',exact:true}).click();await expect(page.getByRole('status')).toHaveText('Dataset 버전을 확정했습니다.');
 await page.getByRole('link',{name:'AI Models',exact:true}).click();await page.getByRole('button',{name:'모델 버전 등록',exact:true}).click();
 await page.getByLabel('모델 이름',{exact:true}).fill('Side detector');await page.getByLabel('학습 Dataset',{exact:true}).selectOption({label:'Side training / 1.0'});
 await page.getByLabel('학습일',{exact:true}).fill('2026-11-05');await page.getByLabel('Accuracy (%)',{exact:true}).fill('98.5');await page.getByLabel('모델 파일 경로',{exact:true}).fill('D:\\Models\\side.model');await page.getByLabel('평가 조건 / 검증 Dataset',{exact:true}).fill('Held-out samples, same equipment');
 await page.getByRole('button',{name:'모델 저장',exact:true}).click();await expect(page.getByRole('button',{name:'Side detector / 1.0',exact:true})).toBeVisible();await page.reload();await expect(page.getByText('98.5%',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'External AI Tools',exact:true}).click();await page.getByLabel('도구 버전',{exact:true}).fill('2026.1');await page.getByLabel('설치 경로',{exact:true}).fill('D:\\SAIGE');await page.getByLabel('도구 메모',{exact:true}).fill('외부 PC에서 직접 학습');await page.getByRole('button',{name:'도구 정보 저장'}).click();await expect(page.getByRole('status')).toHaveText('도구 정보를 저장했습니다.');await page.reload();await expect(page.getByRole('heading',{name:'SAIGE AI Tool / 2026.1'})).toBeVisible();
});
test('candidate filters, cross-page selection and unsaved route protection',async({page})=>{
 await page.goto('datasets');await page.getByRole('button',{name:'Dataset 생성',exact:true}).click();await page.getByLabel('설비',{exact:true}).selectOption('EQ02');await page.getByLabel('검사 유형',{exact:true}).selectOption('THERMAL');await page.getByRole('checkbox').first().check();await page.getByRole('button',{name:'다음',exact:true}).click();await expect(page.getByText('선택 1 / 500개')).toBeVisible();await page.getByRole('checkbox').first().check();await expect(page.getByText('선택 2 / 500개')).toBeVisible();
 await page.getByRole('link',{name:'DatasetHub',exact:true}).click();await expect(page.getByRole('alertdialog')).toBeVisible();await page.getByRole('button',{name:'계속 작성'}).click();await expect(page.getByText('선택 2 / 500개')).toBeVisible();
 await page.getByLabel('LOT / Product / 위치',{exact:true}).fill('not-existing');await expect(page.getByText('조건에 맞는 이미지가 없습니다.')).toBeVisible();
});
test('Hub mixed, recovery and offline scenarios; navigation and deep reload',async({page})=>{
 await page.goto('hub');await expect(page.getByText('온라인 (Mock)',{exact:true})).toBeVisible();await expect(page.getByText('9 / 27',{exact:true})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
 await page.getByLabel('수집 상태',{exact:true}).selectOption('error');await expect(page.locator('tbody tr')).toHaveCount(1);await page.getByRole('button',{name:'EQ03 / Side',exact:true}).click();await expect(page.getByRole('heading',{name:'EQ03 / Side 상세'})).toBeVisible();
 await page.getByLabel('시연 시나리오',{exact:true}).selectOption('healthy');await expect(page.getByText('조건에 맞는 PC가 없습니다.')).toBeVisible();await page.getByLabel('수집 상태',{exact:true}).selectOption('');await expect(page.locator('tbody tr')).toHaveCount(27);
 await page.getByLabel('시연 시나리오',{exact:true}).selectOption('offline');await expect(page.getByText('연결 불가 (Mock)',{exact:true})).toBeVisible();await expect(page.locator('tbody .hub-state.unknown')).toHaveCount(27);await page.reload();await expect(page.getByRole('heading',{name:'DatasetHub',exact:true})).toBeVisible();
 for(const title of ['Datasets','AI Models','External AI Tools','Workspace','Inspection Explorer']){await page.getByRole('link',{name:title,exact:true}).click();await expect(page.getByRole('heading',{name:title,exact:true})).toBeVisible();}
});
test('bundled demo datasets and models are ready on first open and not duplicated on reload',async({page})=>{
 await page.goto('datasets');await expect(page.getByRole('button',{name:'[DEMO] SIDE 기준 데이터 / 1.0',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'[DEMO] SIDE 기준 데이터 / 2.0',exact:true}).click();await expect(page.getByText('확정 · 모델 연결 가능')).toBeVisible();await expect(page.getByText('검토 스냅샷',{exact:true}).first()).toBeVisible();
 await page.reload();await expect(page.getByRole('button',{name:'[DEMO] SIDE 기준 데이터 / 2.0',exact:true})).toHaveCount(1);
 await page.getByRole('link',{name:'AI Models',exact:true}).click();await page.getByRole('button',{name:'[DEMO] Side detector / 2.0',exact:true}).click();await expect(page.getByText('98.1%',{exact:true})).toBeVisible();
 await page.getByRole('link',{name:'[DEMO] SIDE 기준 데이터 / 2.0',exact:true}).click();await expect(page.getByText('확정 · 모델 연결 가능')).toBeVisible();
});
