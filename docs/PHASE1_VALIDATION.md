# Phase 1 validation

검증 날짜: 2026-11-05. 대상: Frontend Foundation만 해당.

## 자동 검사

- TypeScript strict typecheck 및 Vite production build
- 모듈 의존성 경계 검사
- Vitest: 모듈 등록/충돌, 상세 route, base path, 결정적 fixture와 복사 격리, 취소/빈 페이지, 미지원 adapter 거부, HTTP token/signal/오류 — 8 tests
- Windows CI: Node 24, npm ci, check, root build + Chromium E2E, `/studio/` build + E2E
- E2E: 1920×1080 / 1440×900, 목록 기본 진입, Workspace 이동·새로고침, sidebar 접기, 미등록 URL 복귀, 수평 overflow 및 JavaScript 오류 확인

## 수동 브라우저 확인

Cloud Chrome에서 Inspector 기반 화면, Mock 설비 목록, Workspace navigation 및 직접 새로고침을 확인했습니다. UI는 아직 실제 검사 데이터가 없는 기반 화면입니다.

## 재현

```powershell
cd web
npm ci
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
$env:VITE_BASE_PATH='/studio/'
npm run build
npm run test:e2e
Remove-Item Env:VITE_BASE_PATH
```

실제 설비·API·인증·검사 조회·Viewer·Review 업무 테스트는 해당 Phase에서 수행합니다. 테스트 통과가 운영 서버 프록시/SSO 구성 검증을 의미하지 않습니다. CI 결과는 해당 커밋의 Actions run에서 확인합니다.
