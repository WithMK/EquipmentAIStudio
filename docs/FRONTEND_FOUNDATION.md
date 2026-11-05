# Frontend Foundation — Phase 1

## 설계 선택

확장성은 업무 모듈의 독립성과 교체 가능한 데이터 경계로 확보합니다. 동적 플러그인 로더, 범용 CRUD 엔진, 상태 관리 프레임워크는 도입하지 않습니다. 현재 스키마는 변경 가능한 Mock Contract v0.1이며 서버 DTO와 동일하다고 가정하지 않습니다.

| 경로 | 책임 | 허용 의존성 |
|---|---|---|
| `web/src/app` | Composition root, Shell, Router, Provider, 전역 theme | features의 공개 등록점, adapters, shared |
| `web/src/features/<feature>` | 해당 업무 화면·hook·모듈 등록 메타데이터 | 자신의 파일, shared |
| `web/src/shared/domain` | UI가 사용하는 초안 데이터 모델 | 업무 구현에 의존하지 않음 |
| `web/src/shared/services` | Repository/Auth 인터페이스와 서비스 Context | domain |
| `web/src/shared/api-client` | HTTP 오류, 취소, 토큰 전달 | 서비스 계약 |
| `web/src/shared/ui` | 소스 소유 UI primitive | 업무 모듈에 의존하지 않음 |
| `web/src/adapters/mock` | 결정적 fixture와 Mock 구현 | shared 계약 |

`npm run check:boundaries`가 금지된 상대 경로 import를 검사합니다. 현재는 alias를 쓰지 않습니다. alias 도입 시 검사기도 함께 확장해야 합니다. features끼리 직접 import하지 않고 공통 계약을 통해 연결합니다. 공통화는 실제 두 번째 사용처가 생겼을 때 진행합니다.

## 신규 모듈 추가

1. `features/<name>/page.tsx`에서 화면을 default export합니다.
2. `module.ts`에서 `FeatureModule` 계약으로 id/path/title/subtitle/icon/load를 정의합니다.
3. `app/modules.ts` 목록에 등록합니다. Shell은 수정하지 않습니다. 후속 예정 목록에 있으면 해당 안내 항목을 제거합니다.
4. 상세 화면은 모듈의 `routes`에 `products/:productId` 같은 상대 경로와 lazy loader를 추가합니다. 실제 URL은 `<base>/<module.path>/products/:productId`입니다.
5. 데이터는 `useServices()`로 가져옵니다. Mock fixture를 UI에서 import하지 않습니다.
6. 필요한 서비스 계약을 좁게 추가하고 어댑터를 composition root에서 조립합니다.

```ts
export const exampleModule: FeatureModule = {
  id: 'example', path: 'example', title: 'Example', subtitle: 'Example workspace',
  icon: Box, load: () => import('./page'),
  routes: [{path: 'items/:id', load: () => import('./detail')}],
};
```

기존 Workspace가 두 번째 모듈 등록 예제입니다. 중복 id/path/모호한 파라미터 경로는 시작 시 거부합니다. 메뉴는 단일 깊이이며 다단계 메뉴가 실제로 필요해질 때 descriptor를 확장합니다. 모듈 내부 경로는 Shell과 독립적입니다.

## 데이터와 인증

- Equipment와 Inspection 조회 계약만 실제 서비스 슬롯으로 주입합니다. 나머지 모델은 타입 초안이며 미리 빈 CRUD 서비스를 만들지 않습니다.
- `InspectionQuery`와 `Page<T>`는 서버 필터/정렬/페이징 전환을 위한 계약입니다. Phase 1 검색은 빈 페이지를 반환하고 UI 검색은 아직 제공하지 않습니다.
- `createEquipmentFixtures(count)`는 결정적이며 기본값 9대입니다. UI는 개수를 하드코딩하지 않습니다. Phase 2 시나리오 목록은 fixtures의 `scenarioPlan`으로 관리하며 상세 생성은 아직 하지 않습니다.
- Product에 parentProductId/segmentIndex, Inspection에 inspectionRunId/supersedesInspectionId, Image에 availability를 둬 4분할·재검사·누락을 구분할 여지를 확보합니다. 문자열 검사 유형과 불량 분류 ID를 사용해 설비 유형을 고정하지 않습니다.
- 원본 판정은 Inspection/Image, 개발자 판정은 별도 Review입니다. Dataset은 imageId/reviewId, Model은 Dataset 버전 참조를 가집니다. 변경 이력 저장 정책은 Phase 4/5에서 구현합니다.
- 실제 API 추가 시 `adapters/http`에서 unknown 응답을 런타임 검증하고 domain으로 매핑합니다. `createHttpClient`는 transport만 제공합니다. 엔드포인트는 미확정이라 연결하지 않습니다.
- `AuthProvider`는 identity/token 조회 경계입니다. 현재 Demo identity는 로그인이나 보안 기능이 아닙니다. 향후 플랫폼 인증 provider를 주입하며 권한은 반드시 서버에서도 검증합니다. 토큰을 localStorage에 저장하지 않습니다.
- TanStack Query는 서버 상태, 컴포넌트 상태는 로컬 React state를 사용합니다. 검색 조건 URL 직렬화는 Phase 2에서 추가합니다. LLM은 추후 검증된 조회 조건을 생성하고 같은 InspectionRepository를 사용하도록 확장합니다.

## UI / 배포

Theme token은 `app/theme.css`, 버튼은 Radix Slot + CVA + Tailwind 기반 소스 소유 컴포넌트입니다. 다크 배경/조밀한 작업 패널/오른쪽 맥락 패널을 사용합니다. 미구현 기능은 클릭 가능한 더미 버튼으로 노출하지 않습니다. Phase 2에서 실제 검색을 연결하면서 상단 검색 영역을 추가합니다.

Vite `base`와 BrowserRouter `basename`은 같은 설정을 사용합니다. `/studio/` 배포에서는 정적 파일도 `/studio/assets/...`로 서비스하고 앱 경로를 `/studio/index.html`로 fallback해야 합니다. API에는 SPA fallback을 적용하지 마세요. 개발/preview 서버는 fallback을 제공하지만 운영 IIS/YARP/Nginx 설정을 대신하지 않습니다. `file://` 실행은 지원하지 않습니다.

설정은 빌드 시 고정됩니다. 서로 다른 환경에 같은 바이너리 설정을 주입해야 하는 요구가 생기면 runtime config loader를 추가합니다. 현재 환경변수는 `.env.example` 참고. `VITE_PREVIEW_HOST`는 원격 개발 미리보기 호스트 허용용이며 로컬 Windows에서 설정할 필요 없습니다.

## 이번 단계 제외

검사 표 라이브러리(TanStack Table/AG Grid), 이미지 Viewer, Review 저장소, Dataset/Model CRUD, Hub 실상태, 실제 API/SSO, SAIGE 실행, LLM, 동적 DLL/JS 플러그인, 수집/매칭 로직은 구현하지 않습니다.
