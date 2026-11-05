# Equipment AI Studio — Architecture

> 설계 v0.2 · 2026-11-05 · 현 시점 개발 방향 / 계약·구현 미완료

## 1. 목적과 차별점

EquipmentAIStudio는 **다설비 검사 이력·이미지 분석·판정 검토·AI 모델 관리**에 초점을 둔 개발자용 웹 애플리케이션이다. 실시간 가동률, 알람, T/T 및 설비 상태 관제는 **별도 운영 관제 시스템**의 영역이며 Studio에서는 중복 구축하지 않는다.

메인 진입점은 카드형 Dashboard가 아니라 **LOT/Product 기반 Inspection DataGrid**다. 사용자는 일자·시간·설비·LOT·ProductID·SIDE/THERMAL·OK/NG·검토 여부로 검색 후 제품 클릭으로 상세 이미지 화면에 이동한다.

## 2. 시스템 및 데이터 흐름

```text
[설비 9대 · 제어 PC 1 + 검사 PC 2 (설비당)]
      |  표준 로그 / 검사 이미지 / 검사 결과 메타데이터
      v  기존 SMB Pull 유지
[DatasetHub — Data Collecting PC]
  WPF Desktop(필수): Equipment Management / Collection Monitoring / 복구
  Background: Collection / Reliability / Processing / Matching
      |                                         ^
      v                                         | (Studio 명령: 인증/검증/실행잠금)
[원본 File Archive + 데이터 DB]                  |
      |              [Hub 상태·이력·명령 API] ---+
      v                          ^
[인증된 조회·이미지 API]           |
      |                          |
      +-------- [EquipmentAIStudio Web] --------+
               Inspection Explorer / Image Review
               Dataset / AI Model / AI Tools / Hub Management
                            |
               학습용 PC SAIGE (사용자 직접 실행)

[EquipmentAIPlatform Web] -- /studio/ 라우팅 --> [EquipmentAIStudio]
                  Agent / RAG / Source Code 연계(장기)
```

DatasetHub가 수집/매칭/복구의 최종 실행 권한을 갖는다. Studio는 같은 작업을 별도 엔진으로 재구현하거나 DB·설정 파일을 직접 수정하지 않는다.

## 3. 화면·기능 명세

### 3.1 Inspection Explorer (최우선)

- 계층형 **LOT → Product** DataGrid, LOT 집계(전체 제품/OK/NG), 행 펼치기·정렬·페이징·필터·조건 유지
- 필터: 검사 시작/종료 일시 범위, 설비(MachineId), LOT, ProductID, 검사 타입, 원본 OK/NG, 개발자 Review 상태, 불량 유형
- 주요 열: 검사 시간, 설비, LOT, ProductID, 검사 타입, 판정, NG 유형, 이미지 수, 검토 상태
- Product 클릭 시 **Product Inspection Detail**로 라우팅. NG 제품은 NG 이미지/NG 포인트를 기본 선택하며, 필요 시 OK 이미지도 열람
- 목록은 Server-side Pagination/Filtering을 전제로 인터페이스 설계; 전체 이미지 수가 늘어도 한 번에 원본을 가져오지 않음
- 데이터 없는 경우/부분 매칭/이미지 누락/수집 지연을 구분해 표시

### 3.2 Product Inspection Detail / Image Viewer

- 제품별 Side/Thermal/포인트·면·재검사 실행별 이미지 목록
- 이미지 썸네일/원본, Zoom/Pan, Fit/Actual Pixels, ROI와 검출 오버레이, NG 좌표/결과
- 이미지 간 좌우 비교, 재검사 이미지와 원본 판정 비교, 키보드 탐색
- 대용량 PNG/TIFF는 서버 측 썸네일·웹 표시 가능 형식/타일 변환 등 검토; 브라우저가 TIFF를 기본 표시할 것이라 가정하지 않음
- 수치 단위(µm) 표시는 PixelSize/Calibration 메타데이터가 있을 때만 제공

### 3.3 Image Review & Classification

- **원본 설비 판정은 수정 금지.** 개발자 판정, 불량 유형, 코멘트, 검토자·시간을 별도 데이터로 저장
- 원본 NG → 검토 OK는 과검출 후보, 원본 OK → 검토 NG는 미검출 후보; 참값/검토 신뢰도 및 검토 표본 편향 확인 전 공식 성능 지표로 오용 금지
- 대량 이미지 태깅, 필터된 이미지 세트 검토, Review History 및 변경 감사 기록
- 불량 분류 체계는 설비 유형별로 확장, 트리밍 전용 코드값 고정 금지

### 3.4 Dataset Management

- 검색/검토 완료 이미지 선택 → Dataset 생성·버전·원본 파일·검사 이력·검토 레이블 출처 추적
- export는 원본 보존, 버전별 재현성 보장, SAIGE 입력 계약 확인 후 포맷 확정

### 3.5 AI Model Management

- ModelId, EquipmentType, ModelName, Version, TrainingDatasetVersion, TrainingDate, Metrics, ArtifactPath, Status, Notes, History
- 모델별 성능/버전 비교 시 **동일 검증 데이터셋 및 평가 조건** 확인
- 모델 운영 상태는 메타데이터 관리; 실제 설비 배포·실시간 추론 제어는 별도 승인/별도 시스템 소유

### 3.6 External AI Tools

- SAIGE는 별도 학습 PC의 독립 프로그램. 사용자는 외부 도구에서 직접 학습
- 브라우저에서 EXE 직접 실행 불가; Custom URI 또는 Local Launcher의 지원/권한/허용명령을 검증한 뒤 연동
- 현재 웹의 도구 실행 기능은 향후 계획; 임의 Shell 명령 제공 금지

### 3.7 DatasetHub Management (원격 보조)

- 읽기: Hub API 도달 여부, Heartbeat 최신성, Collector 스케줄 진행 여부, PC별 SMB 접근/수집 상태, 마지막 시도·성공·실패, 지연/복구/누락 통계, 저장소 용량, 오류/복구 이력
- 명령: 권한 검증 후 수동 수집/실패 파일 재시도/기간 재수집 **요청만** 허용. 서버는 명령을 기존 Collector 작업 큐·실행 잠금·유효성 검사에 통합하고 JobId/수락·진행·결과를 반환
- 위험 명령(수집경로·주기 변경, 임의 프로세스 종료/재시작, 설비 직접 제어)은 초기 Web 범위 제외
- Desktop이 수집 안정성의 필수 운영 콘솔이며 Web Management는 선택적 편의 기능. **Web 중단 → DatasetHub 수집 영향 없음**
- Hub 프로세스가 종료되면 자체 API도 죽을 수 있으므로 Web은 API 불통/마지막 Heartbeat/최종 확인 시각 표시. 같은 PC 전원 종료도 식별하려면 다른 호스트에서 감시 필요. 부재/불통을 '정상'으로 표시 금지

## 4. 계약 및 서비스 분리

- Studio Frontend는 Mock/Real을 분리한 API Adapter를 사용. 개발 초기 실제 설비 로그·이미지 없으므로 **Mock Contract v0.x** 및 재현 가능한 정상/NG/재검/누락 시나리오 준비.
- 공통 식별자: EquipmentType, MachineId, LotId, ProductId, InspectionRunId, ImageId, CapturePoint, CaptureTime. 파일명/시간만으로 조인 금지.
- 실제 소스/검사 PC 교환 형식이 확정되면 Parser/Adapter를 변경해 공통 모델 유지.
- 권장 읽기 계약(예시, 미확정): `GET /api/inspections`, `GET /api/lots`, `GET /api/products/{id}`, `GET /api/images/{id}`, `GET /api/hub/status`, `GET /api/hub/pcs`, `GET /api/hub/events`.
- 원격 명령 계약(예시, 미확정): `POST /api/hub/jobs/recollect`, `GET /api/hub/jobs/{id}`. 인증, 관리자 권한, Audit, Idempotency Key, 중복 실행 방지 필수.
- 조회 서비스는 SQLite 파일을 네트워크에서 직접 열지 않음. 이미지 자체는 아카이브에 두고, 인증된 API가 썸네일/원본을 제공하도록 구성
- 모델/검토/데이터셋 변경 데이터는 Studio 소유 영역으로 설계하고, DatasetHub의 수집 원본·기록을 덮어쓰지 않음. 구체 DB와 저장 위치는 미확정.

## 5. 프론트엔드 구조(권장 논리 형태)

```text
EquipmentAIStudio/
  docs/
  web/
    app/                      # 독립 Shell, Router, 테마
    features/
      inspection-explorer/     # LOT/Product DataGrid
      product-detail/          # Image Viewer
      image-review/            # 재판정, 불량 분류
      datasets/
      models/
      ai-tools/
      hub-management/
    shared/
      api-client/
      auth/
      ui/
  server/                      # 필요한 API/BFF (후속 검토)
```

프론트엔드 스택은 미확정(React+TS 후보). 시각 디자인은 고밀도 전문가형 **Dark Theme 검사 분석 워크스테이션**. 검색/표/이미지/오른쪽 메타데이터 패널의 일관성을 우선한다.

## 6. 독립 배포와 상위 웹 통합

- 독립 웹 서버로 우선 구현하고, EquipmentAIPlatform과 나중에 Reverse Proxy로 단일 외부 주소/포트에서 `/studio/` 경로로 연결
- Base Path, 정적 파일/라우팅, 인증 콜백/쿠키 경로, API 주소 설정 가능하게 설계
- Reverse Proxy만으로 UI/SSO가 자동 통합되지 않음. 공통 메뉴·인증·권한 규칙은 별도 연동
- 공통 Platform의 Agent/RAG 장애나 Studio 장애가 DatasetHub Collector를 중단시키지 않도록 결합 최소화

## 7. 장기 LLM/RAG/Source Code 연계

- EquipmentAIPlatform Agent를 통한 자연어 검사 검색: 자연어 → 검증된 필터 조건/읽기 전용 조회 Tool → 기존 DataGrid와 Image Viewer에 결과 표시
- 특정 Product/Inspection을 선택한 상태에서 검사 이미지·당시 SW 버전(Git Commit)·Recipe/파라미터·AI 모델 버전·RAG의 설계 근거/개발 이력 조회
- 코드/문서/모델 당시 버전이 확인되지 않으면 추정으로 단정하지 않고 미확인으로 표시
- 이미지 유사도 검색은 별도 Vision Embedding/Vector Retrieval 단계. LLM 텍스트 검색과 구분
- Source Code는 원칙적으로 읽기 전용 조회; 무승인 설비 제어/Recipe 변경/운영 배포 금지

## 8. 미결정 및 이행

웹 프레임워크/호스팅, 데이터 계약, DB 및 API 위치, Hub API 인증·접속 구조, SAIGE Import 및 런처, 정밀 이미지 포맷과 타일 서비스, 배포 경로/포트. 본 문서는 설계 방향이지 구현 보증이 아니다.
