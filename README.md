# Equipment AI Studio

**설비 검사 데이터 활용 및 AI 모델 관리 웹 애플리케이션** (설계/초기 개발 단계)

Equipment AI Studio는 특정 트리밍 설비에 국한되지 않는 범용 웹 프로젝트입니다. 초기 대상은 MLCC 트리밍 설비이지만, 추후 다른 설비 유형을 어댑터/구성으로 확장할 수 있도록 설계합니다.

## 담당 범위

- **Data Explorer**: DatasetHub에서 매칭 완료된 LOT·ProductID·검사 실행 단위 데이터 검색, 검사 결과/이미지 조회
- **Dataset Management**: 학습 후보 선택, 데이터셋 구성·버전·내보내기 이력 및 원본 추적
- **AI Model Registry**: 모델명·버전·학습 데이터셋·평가지표·아티팩트 경로·상태 관리
- **External AI Tools**: 학습용 PC에서 담당자 1명이 실행하는 SAIGE AI Tool 연계 창구(향후 검증 후 구현)

**하지 않는 일**: 설비 PC SMB 수집, 로그 파싱/DB화, 이미지-제품 자동 매칭, AI 학습 엔진 재구현. 해당 처리의 소유자는 DatasetHub 또는 SAIGE입니다.

## 함께 개발하는 프로젝트

| 저장소 | 역할 |
| --- | --- |
| [EquipmentAIPlatform](https://github.com/WithMK/EquipmentAIPlatform) | 상위 범용 AI 웹 포털, Agent/RAG, 통합 메뉴·접속점 |
| [DatasetHub](https://github.com/WithMK/DatasetHub) | 상시 로그·이미지 수집, Data Processing, Data Matching, 수집 운영 |
| **EquipmentAIStudio** | 데이터·이미지 조회, Dataset 준비, AI 모델 목록 및 SAIGE 연계 |

공통 기준(Single Source of Truth): [Equipment AI Ecosystem Architecture](https://github.com/WithMK/EquipmentAIPlatform/blob/main/docs/ECOSYSTEM_ARCHITECTURE.md). 상위 문서에 과거 명칭 *Trimming AI Web*이 남아 있을 경우 **EquipmentAIStudio**로 읽으며 공통 문서도 갱신합니다.

## 개발/운영 원칙

- 독립 웹 서버로 먼저 개발·검증하고, 후에 상위 Platform의 `/studio/` 경로로 연결(예시; 실제 경로 미확정)
- 포트를 달리 쓰는 독립 웹을 Reverse Proxy로 하나의 외부 주소/포트에 제공 가능
- 데이터는 DatasetHub가 제공할 **인증된 조회 API**를 통해 접근; SQLite DB 파일을 네트워크로 직접 열지 않음
- 제품·검사·이미지 식별자의 표준 정의는 DatasetHub와 공동 합의; 매칭 로직을 중복 개발하지 않음
- 학습 결과 및 모델 메타데이터만 관리; 실제 SAIGE 학습은 별도 PC의 프로그램에서 사용자 직접 수행
- 브라우저에서 임의 EXE 실행 불가. SAIGE 런처 기능은 Local Launcher/Custom URI 프로토콜의 보안과 지원 여부 확인 후 결정
- 원본 이미지/운영 로그/자격증명/사내 주소를 공개 Git에 커밋하지 않음

## 문서

- [아키텍처](docs/ARCHITECTURE.md)
- [개발 로드맵](docs/DEVELOPMENT_ROADMAP.md)
- [상위 시스템 공통 설계](https://github.com/WithMK/EquipmentAIPlatform/blob/main/docs/ECOSYSTEM_ARCHITECTURE.md)

## 현재 상태

**웹 기술 스택, API 계약, 인증/SSO, 저장소 스키마, SAIGE 데이터 포맷, 런처 구현은 미확정입니다.** 이 README는 시스템 경계와 개발 방향을 정의하며, 현재 실행 가능한 웹 애플리케이션이 완성되었다는 뜻이 아닙니다.
