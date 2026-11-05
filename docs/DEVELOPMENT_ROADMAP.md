# Equipment AI Studio — Development Roadmap

> v0.2 · 2026-11-05 · 설계 및 단계별 개발·검수 방향

## 현재 Frontend Prototype 개발 순서 (우선 적용)

사용자와 합의한 6개 Phase입니다. 기존 장기 계획의 번호와 혼동하지 않도록 아래 순서를 실행 기준으로 사용합니다. 각 단계 구현·검증·보고 후 사용자의 다음 단계 요청을 기다립니다.

| Phase | 범위 | 상태 |
|---|---|---|
| 1 | 저장소 분석, Shell, 테마, 모듈, Router, 서비스/Mock 계약 | 완료 |
| 2 | Inspection Explorer 검색·LOT/Product 표·정렬·페이징 | 구현 완료 |
| 3 | Product Detail·SIDE/THERMAL Viewer·Zoom/Pan | 구현 완료 |
| 4 | 원본과 분리된 Image Review·검토 저장/재조회 | 구현 완료 |
| 5 | Dataset·AI Model 관리, External AI Tools 정보 | 미구현 |
| 6 | Mock DatasetHub 관리·통합 검증 | 미구현 |

실제 API, 인증, SAIGE 실행, LLM, 배포 명령은 이 Mock 프론트엔드 6단계와 별도 합의 대상입니다. 아래 기존 장기안은 기능 방향 참고로 보존합니다.

## 전제

- DatasetHub Desktop은 현장 PC/공유폴더 연결·수집 모니터링·설정·수동 복구에 **필수**; 기존 SMB Pull 수집 방식 변경 금지
- Studio는 개발자용 검사 이력·이미지 분석/분류·AI Model 관리 및 Hub의 원격 보조 관리
- 실제 설비 로그/이미지는 아직 없으므로 Mock Data 계약으로 선행 개발하고 실제 Parser/Adapter만 교체할 수 있도록 구성
- 실시간 설비 가동률·알람 관제는 별도 시스템 소유

## 기존 장기안 Phase 0 — Frontend Foundation / Mock Contract

- 기존 저장소 소스·문서·공통 아키텍처 최신 확인 후 기술 스택 및 작업 브랜치 확정
- 전문 Dark Theme, 공통 Shell/Sidebar/라우터, 공통 표·필터·이미지 컴포넌트, 독립 웹 실행
- Equipment/LOT/Product/Inspection/Image/Review/Model/Hub 상태 Mock Fixture 및 데이터 생성
- Mock와 Real API Adapter 분리. Mock API에서 검색/이동/상태 조회/저장 등 실제 사용자 흐름 동작
- 향후 `/studio/` 경로/프록시 지원 가능하도록 배포 구성
- **완료 기준**: 임시 데이터로 독립 웹에서 모든 메뉴·라우팅·기본 동작 시연 가능, Mock 표시 정확

## 기존 장기안 Phase 1 — Inspection Explorer: 핵심 DataGrid

- LOT→Product 계층형 표, 기간·설비·LOT·ProductID·검사 유형·OK/NG 검색, 정렬·페이징, 필터 유지
- LOT 집계와 제품별 검사 결과/이미지 수/검토 상태 표시
- NG Product 클릭 시 해당 제품의 Image Detail 페이지로 이동
- 누락/부분 매칭/데이터 없음과 정상 빈 결과 구분
- **완료 기준**: EQ01~EQ09 Mock, NG/OK, 재검사, 복수 LOT 조건 검색 및 제품 이동 검증

## 기존 장기안 Phase 2 — Image Viewer / Review

- Side/Thermal 이미지 선택, Zoom/Pan, 100% 보기, ROI/NG 오버레이, 사진 간 비교, 재검사 이동
- 개발자 원본 판정 변경 없이 Review 결과·불량 유형·메모·검토자·이력 별도 기록
- 브라우저 호환 미지원 TIFF 대용량 이미지 전략(썸네일/타일/변환) 수립
- **완료 기준**: Mock 이미지에서 확대/비교/검토 및 저장 후 재조회 동작

## 기존 장기안 Phase 3 — AI Model Management (핵심)

- Model Registry 목록·상세·등록·버전·모델별 Dataset/평가 결과/파일 경로/운영상태
- 모델 성능 비교는 동일 평가 기준으로 수행, 변경 이력
- 실제 학습·모델 배포·추론 엔진 구현 제외
- **완료 기준**: Mock 모델 등록·버전 관리와 상태 조회 정상

## 기존 장기안 Phase 4 — Dataset Management

- 필터/Review 기반 이미지 선별, Dataset 구성·버전, 출처·재현성 기록
- Export 구현 전 SAIGE Import 형식 확정; 임의 자동 변환 최소화
- **완료 기준**: 같은 버전에서 동일 파일 목록과 Review Label을 재현 가능

## 기존 장기안 Phase 5 — DatasetHub Management (읽기 우선, 제한된 원격 명령)

- Hub API/Heartbeat/실제 수집 진행 상태와 설비·PC별 연결·오류·누락·복구 상태 조회
- DatasetHub가 완전히 종료된 경우 Web에서 연결 불가/마지막 응답 시간 표시
- 별도 인증·권한 확인 후에만 수동 재수집·실패 재시도 요청 추가. 실행은 기존 DatasetHub Collector가 소유
- **완료 기준**: 연결 정상/지연/Hub 종료 Mock, 원격 요청 JobId/실행 잠금/오류 검증
- **주의**: DatasetHub Reliability 구현과 병행 API 계약 협의, 기존 Desktop 운영 기능은 유지

## 기존 장기안 Phase 6 — External SAIGE & Upper Platform Integration

- SAIGE 수동 학습/Export 경로 및 안전한 사용자 주도 실행 연동(실행 방식 검증 후)
- EquipmentAIPlatform Reverse Proxy `/studio/`, 단일 외부 포트, 라우팅/인증/접근권한 검증
- **완료 기준**: Studio 독립 접근과 상위 웹 메뉴 접근 모두 가능. 웹 장애가 수집에 영향 없음

## 기존 장기안 Phase 7 — RAG / Source Code / LLM (후속)

- Agent Orchestrator와 검증된 읽기 전용 검사 조회 Tool 연계
- 선택 Product/Inspection과 설계 문서·Source Code/Git Commit·Recipe·모델 버전 연결
- 자연어 검색 결과를 기존 DataGrid/이미지 뷰로 반환. 이미지 유사도 검색은 별도 단계
- **완료 기준**: 검색 근거·버전 출처가 추적 가능하고 미확정 사실은 표시

## 횡단 검증

- 기존 DatasetHub 수집·감시·복구 기능을 웹에서 재구현하지 않을 것
- 원본 검사 판정·이미지 변경 금지; Review·Model·Dataset 메타데이터는 별도 이력
- 다량 데이터는 Server-side filter/page, 썸네일·대용량 이미지 최적화
- Hub 명령은 권한·감사·중복실행 방지, LLM은 직접 수집/설비 동작 변경 불가
- 실제 설비 데이터 및 비밀은 공개 Git에 포함하지 않음

## 주요 의존성

Mock Frontend는 독립 착수 가능. 실제 연동은 `DatasetHub Processing/Matching → 조회 API → Inspection Explorer/Image Viewer` 순서.
Hub Management는 `DatasetHub Reliability/운영 API`에 의존. SAIGE 연동은 Import/실행 계약 검증에 의존.

