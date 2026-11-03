# Equipment AI Studio — Development Roadmap

> v0.1 | 2026-11-03 | 단계·검수 기준 초안

## 전제

- DatasetHub가 로그/이미지 수집을 담당하고, Data Processing·Matching을 통해 조회 가능한 메타데이터를 생성한다.
- Studio는 DatasetHub의 매칭된 결과만 활용하며 파서/매처를 다시 구현하지 않는다.
- SAIGE는 한 사용자가 학습 PC에서 별도 프로그램으로 실행한다.
- EquipmentAIPlatform의 공통 문서가 최상위 시스템 경계를 정의한다.

## Phase 0 — 설계 계약 및 실행 틀

- 웹 프론트엔드 스택, 배포 모델(독립 프로세스), 환경 설정, `/studio/` Base Path 지원 방향 결정
- EquipmentAIPlatform과의 인증·메뉴·라우팅 연계 인터페이스 합의
- DatasetHub와 `Equipment/LOT/Product/Inspection/Image` 식별자 및 읽기 API 계약 합의
- 실제 외부 API 미구현 시 Mock 데이터 어댑터로 UI 개발하되 Mock 여부를 명확히 표시
- **완료 기준**: 독립 웹 시작, 기본 라우팅/구성 검증, 상위 웹으로 경로 기반 라우팅 PoC

## Phase 1 — Data Explorer

- 설비/LOT/ProductID/검사 실행 단위 검색과 결과 목록·상세 뷰
- 검사 이미지 썸네일/원본 보기, 촬영 위치 및 NG 결과 확인
- 조회 실패/데이터 없음/미매칭 상태 구분, 권한 확인
- **완료 기준**: DatasetHub 샘플 데이터에 대해 조회 응답과 원본 이미지 대응이 검증됨

## Phase 2 — Dataset Management

- 검사 결과/조건 기반 학습 후보 필터링, 대상 목록 저장
- Dataset ID, 버전, 생성일, 포함 이미지/제품 목록, 원본 출처 기록
- 외부 도구로 전달할 이미지/메타데이터 Export; SAIGE 지원 포맷은 확인 후 구현
- 원본 파일 변경/삭제 금지, 재현성 확인
- **완료 기준**: 지정 이미지 세트와 메타데이터를 동일 버전으로 다시 내보낼 수 있음

## Phase 3 — AI Model Registry

- 모델명·ID·버전·학습일·Dataset 버전·성능 지표·아티팩트 경로·상태 관리
- 버전 비교 및 변경 이력, 등록 정보 유효성 검증
- 실제 모델 학습/서빙/자동 평가 기능은 개발 범위 아님
- **완료 기준**: 담당자가 SAIGE 학습 후 모델 정보를 등록하고 사용 이력을 조회 가능

## Phase 4 — SAIGE 실행 연결

- SAIGE 실행 경로/인자·지원 Import 포맷·라이선스 제약 검증
- 학습 PC에서만 동작하는 승인된 Custom URI / Local Launcher 등 검토
- 임의 외부 명령 실행 금지, 명시적 사용자 클릭·허용 목록·오류 피드백
- **완료 기준**: 학습 PC에서 사용자가 직접 실행하고, 잘못된 실행 요청을 거부

## Phase 5 — Equipment AI Platform 통합

- Reverse Proxy의 단일 외부 주소·포트에서 `/studio/` 경로 라우팅
- 메뉴 및 로그인/권한 체계 연계, 하위 경로와 정적 파일/링크/리로드 검증
- Studio 독립 배포 가능성 유지; 통합 장애가 DatasetHub 수집을 멈추지 않아야 함
- **완료 기준**: 독립 접근과 상위 포털 메뉴를 통한 접근 모두 정상 동작

## 공통 검증·개발 원칙

- 범용 제품으로 설계하되 첫 검증 대상은 MLCC Trimming
- 단계별 README 및 API 계약 갱신; CI 빌드·기본 UI 테스트 추가
- 파일 수집/매칭·학습 엔진을 웹 안에 중복 구현하지 않음
- 실제 설비 데이터/모델/사내망 비밀은 GitHub에 올리지 않음

## 의존성

`DatasetHub 매칭 데이터/API` → Data Explorer → Dataset Management → Model Registry/SAIGE 연결.
공통 인증/배포 통합은 독립적 PoC로 병행할 수 있음.
