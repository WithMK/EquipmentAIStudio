# Equipment AI Studio

> Frontend Prototype v0.1 · Phase 1~6 Mock 프론트엔드 구현

**여러 설비의 검사 결과·이미지를 통합 조회·검토·분류하고, AI 데이터셋과 모델을 관리하는 개발자 중심 Web Workspace.**

초기 대상은 MLCC 트리밍 설비(9대, 제어/검사 PC 총 약 27대). 이후 설비 유형을 확장할 수 있도록 설계한다. **실시간 설비 관제(가동률·알람·실시간 상태)**는 별도 관제 시스템 책임으로 중복 구현하지 않는다.


## 실행 — Windows

Node.js 24 LTS와 Git이 필요합니다. 현재 개발 브랜치는 `feat/studio-phase5-6-management`입니다.

### 더블클릭 실행 (권장)

1. Node.js 24 LTS를 설치합니다. 설치 직후에는 실행 창을 다시 여세요.
2. 아래 개발 브랜치를 clone하거나 ZIP으로 받아 압축을 풉니다.
3. **저장소 최상단 `Start-Studio.bat`를 더블클릭**합니다.

첫 실행에는 필요한 패키지를 자동 설치하고 현재 소스를 빌드합니다. 이후에는 의존성이 변경되었을 때만 재설치합니다. 빌드가 끝나면 서버와 브라우저가 자동으로 열립니다. 매번 최신 소스를 빌드하므로 별도 컴파일 명령은 필요 없습니다.

- 기본 접속: **http://localhost:5173/** (기존 `VITE_BASE_PATH` 설정 사용 시 해당 경로)
- 종료: 실행 창에서 `Ctrl+C` 또는 창 닫기. 서버 실행 동안 창을 유지하세요.
- 중복 실행/포트 사용 중이면 오류를 표시하고 다른 포트로 자동 변경하지 않습니다.
- 현재 배치파일은 **이 PC에서만 접속하는 시제품 확인용 서버**입니다. 다른 PC 접속·운영 서비스 등록은 포함하지 않습니다.
- 최초 설치/의존성 변경에는 npm 접근이 필요합니다. 폐쇄망용 의존성 번들은 별도 준비가 필요하며 배치파일이 이를 우회하지 않습니다.
- 검토 데이터는 브라우저 origin에 종속됩니다. 기존에 IP 주소나 다른 포트로 검토했다면 해당 주소에서만 보입니다.
- 오류는 실행 창에서 확인합니다. Node.js 설치, npm 네트워크, 빌드 오류, 기존 서버의 포트 사용 여부를 확인하세요.
- 자동화: `Start-Studio.bat --prepare`는 설치/빌드만 수행하고, `--no-open`은 브라우저 없이 서버를 실행합니다.

### 명령어로 실행

```powershell
git clone -b feat/studio-phase5-6-management https://github.com/WithMK/EquipmentAIStudio.git
cd EquipmentAIStudio/web
npm ci
npm run dev
```

터미널의 Local 주소(기본 `http://localhost:5173/`)를 브라우저에서 엽니다. VS2026의 C# 솔루션 빌드가 아니라 Node.js 웹 프로젝트입니다. 인터넷이 없는 환경은 npm 의존성을 사전에 준비해야 합니다.

```powershell
npm run check
npm run build
npm run preview
```

`dist/`가 정적 배포 결과입니다. `index.html`을 파일 탐색기로 직접 여는 방식은 지원하지 않습니다. 운영 서버는 앱 경로의 미존재 파일 요청을 해당 `index.html`로 fallback해야 합니다(API 경로 제외).

상위 포털 경로로 빌드하려면:

```powershell
$env:VITE_BASE_PATH = '/studio/'
npm run build
npm run preview
# preview가 출력한 주소 뒤 /studio/ 로 접속
Remove-Item Env:VITE_BASE_PATH
```

환경값은 **빌드 시점** 설정입니다. `.env.example`을 `.env.local`로 복사해도 됩니다. `VITE_API_BASE_URL`은 UI 경로와 별개이며 현재 연결되지 않습니다. `VITE_DATA_MODE=mock`만 지원하고 다른 값은 시작 오류로 표시합니다. 임의로 실제 API에 연결하거나 Mock으로 몰래 대체하지 않습니다. 모든 `VITE_*` 값은 브라우저에 공개되므로 비밀값을 넣지 마세요.

## 현재 구현 범위

- 공통 Dark Theme, 접이식 Sidebar, 작업 헤더·상태바, 오류·로딩·404 처리
- 모듈 등록 기반 메뉴·지연 로딩·하위 라우트, Inspection Explorer 기반 화면과 Workspace 환경 화면
- 서비스 주입, Mock Repository, 공통 HTTP transport, 인증 교체 인터페이스
- Equipment/LOT/Product/Inspection/Image/Review/Dataset/Model/Hub의 **초안 타입** 및 재현 가능한 설비 9대 fixture
- 조회·필터·정렬·LOT 단위 페이징과 제품 상세 진입은 구현했습니다. Viewer는 구현했습니다. 이미지별 Review 저장·이력은 구현했습니다. Dataset 생성·확정, Model/외부 도구 등록, Mock Hub 상태 조회를 제공합니다.

[Phase 1 구조와 확장 가이드](docs/FRONTEND_FOUNDATION.md) · [검증 기록](docs/PHASE1_VALIDATION.md)

## 주요 사용자와 업무 흐름

검사 SW·AI 개발자가 주요 사용자다.

1. **Inspection Explorer**: 검사 일자·시간, MachineId, LOT, ProductID, 검사 유형, OK/NG별 검색. LOT→Product 계층형 DataGrid로 목록과 검사 결과 확인.
2. **Product Inspection Detail / Image Viewer**: 선택한 제품의 Side/Thermal 이미지 및 NG 위치 확인, 확대·이동, 다중 이미지/재검사 비교.
3. **Image Review & Classification**: 설비 원래 판정값은 보존하고 개발자의 OK/NG 재검토·불량 유형·메모·검토 이력 별도 저장.
4. **Dataset Management**: 검토 이미지 선별, 데이터셋 구성·버전·원본 출처 추적, 외부 학습 도구용 Export.
5. **AI Model Management**: 모델 목록·버전·학습 데이터셋·성능·아티팩트 경로·사용 상태 및 변경 이력.
6. **AI Tools**: 학습 PC의 별도 **SAIGE** 프로그램 실행 연결(향후 안전한 Local Launcher/Custom URI 검증).
7. **DatasetHub Management**: 수집 PC/Hub의 상태·수집 진행·연결 오류·마지막 성공·누락·복구 이력 **원격 확인**, 권한 기반 수동 재수집/실패 재시도 요청. Collector 실행 및 설정 제어의 최종 권한은 DatasetHub Desktop/Backend에 있다.

## 시스템 책임 경계

| 프로젝트/시스템 | 책임 |
| --- | --- |
| [DatasetHub](https://github.com/WithMK/DatasetHub) | 설비 PC SMB Pull, 로그·이미지 수집·감시·복구, Parsing/Indexing/Matching; WPF 필수 운영·설정 UI |
| **EquipmentAIStudio** | 검사 이력 DataGrid·이미지 정밀 분석·개발자 분류·Dataset·Model 관리, Hub 상태 조회와 제한된 원격 명령 |
| [EquipmentAIPlatform](https://github.com/WithMK/EquipmentAIPlatform) | 범용 웹 포털, AI Agent/RAG, 웹 통합 접근점 |
| SAIGE | 별도 학습 PC에서 사용자가 직접 수행하는 모델 학습 |
| 별도 설비 관제 시스템 | 설비 가동률·실시간 알람·실시간 생산/설비 상태 |

**Studio는 수집·매칭 엔진을 실행하지 않고, DatasetHub가 제공할 인증된 API로만 상태 조회·허가된 명령을 요청한다.** 웹이 종료돼도 수집은 영향받지 않아야 한다.

## 개발 원칙

- **Frontend First**: 현재 실제 로그/검사 이미지가 없으므로 Mock LOT/Product/Inspection/Image/Model/HubStatus로 UI를 먼저 개발.
- Phase 1은 React + TypeScript + Vite를 사용. 기본 UI는 전문 이미지 분석용 Dark Theme. Mock와 실제 API 연결 계층 분리.
- Mock 사용 중임을 UI에 표시. 원본 검출 결과/개발자 Review 결과 분리, 리뷰 변경 이력 및 추적성 유지.
- DatasetHub WPF의 설비 등록·네트워크/공유폴더 점검·수집 감시·복구는 **필수**. Studio의 Hub Management는 원격 보조 기능이다.
- 초기 독립 웹으로 개발하고 향후 상위 포털의 `/studio/` 경로로 연결. Reverse Proxy로 외부 주소·포트를 하나로 제공하되 내부 서비스는 독립 유지.
- 장기: EquipmentRAG(설계 자료), Source Code/Git(검사 알고리즘/커밋), LLM/Agent 연계로 자연어 검사 검색·근거 기반 원인 분석. LLM의 직접 임의 SQL 실행 대신 검증된 읽기 전용 조회 Tool 사용.
- 실제 데이터·비밀·사내 주소·모델 아티팩트·검사 이미지는 공개 Git에 커밋하지 않음.

## 문서

- [상세 아키텍처](docs/ARCHITECTURE.md)
- [개발 로드맵](docs/DEVELOPMENT_ROADMAP.md)
- [공통 아키텍처 — 기준 문서](https://github.com/WithMK/EquipmentAIPlatform/blob/main/docs/ECOSYSTEM_ARCHITECTURE.md)

## 미확정

검사 메타데이터/식별 규약, 조회·명령 API, 인증, 저장소 스키마, SAIGE 런처 및 Dataset Export 포맷, 배포 포트·경로. 현재 문서는 **합의된 개발 방향**이며 미확정 기능의 구현 완료를 뜻하지 않는다.


## Phase 2 Inspection Explorer

Mock 설비 9대 / LOT 54개 / Product 432개, 2026-11-01~11-06 고정 데이터입니다. 날짜 입력·표시는 KST이며 URL/API 계약은 UTC입니다. LOT/제품 ID는 대소문자 무관 포함 검색, 여러 조건은 AND입니다. 제품 판정은 선택 유형의 최신 실행 중 하나라도 NG면 NG입니다. 과거 재검사 NG는 현재 NG 필터에 포함하지 않습니다. 이미지 수는 필터에 일치하는 최신 실행 기준, 누락 이미지는 별도로 표시합니다.

페이지 크기는 LOT 개수입니다. 필터 후 LOT에 일치하는 제품을 모두 표시해 한 LOT를 두 페이지로 나누지 않습니다. 정렬은 각 LOT 안의 제품에 적용하고 LOT는 첫 제품의 정렬값으로 정렬합니다. 검색·정렬·페이지 조건은 URL에 저장되어 상세 진입 후 복귀·새로고침·뒤로가기에 유지됩니다. 상세 진입 화면은 메타데이터와 원본 검사 이력만 제공하며 Viewer는 Phase 3입니다.

Mock adapter만 전체 fixture를 메모리에 읽고 화면에는 현재 페이지가 전달됩니다. 실제 API에서는 LOT 페이지와 제품 자식 조회를 서버에서 처리해야 하며 대형 LOT의 자식 페이징/가상화는 실데이터 규모에 맞춰 후속 도입합니다. 현재는 별도 Grid 종속성 없이 접근 가능한 HTML table을 사용합니다.

## Phase 3 이미지 검토 화면

제품 선택 후 유형별 최신 검사에서 NG 이미지를 먼저 엽니다. SIDE/THERMAL과 검사 실행(재검 포함)을 선택하고 썸네일로 촬영 위치를 바꿀 수 있습니다. 확대/축소, 화면 맞춤, 100%, 드래그 및 방향키 이동을 지원합니다. NG 영역은 원본 픽셀 좌표로 이미지와 함께 변환됩니다. 이미지 전환 시 맞춤으로 초기화합니다. 누락·로딩·실패를 별도 표시합니다.

`web/public/samples/`의 SVG 4개는 확대·NG 위치 확인용 결정적 합성 패턴입니다. 실제 검사 이미지나 실제 온도값이 아닙니다. 촬영 위치별로 일부 패턴을 재사용합니다. 실제 API adapter는 브라우저 호환 썸네일/원본 URL과 크기·NG 좌표를 제공하면 됩니다. TIFF 직접 디코딩/타일 스트리밍과 다중 이미지 동시 비교는 미구현입니다. 개발자 판정 저장은 Phase 4에 구현했습니다.

화면은 반복 브랜드·예정 메뉴·단계 배지를 줄이고 중성 회색과 판정 색상 중심으로 정리했습니다.

## Phase 4 검토 저장

Viewer 오른쪽 개발자 검토에서 OK/NG, 불량 유형(복수), 메모를 저장합니다. NG는 불량 유형이 필수이며 OK 변경 시 유형을 비웁니다. 설비 원본 판정은 바꾸지 않습니다. 검토 시각·검토자·이전 버전 연결을 이력으로 누적하고 최신 검토를 다시 불러옵니다. 누락된 이미지는 저장할 수 없습니다.

저장은 **해당 브라우저/프로필/웹 origin의 IndexedDB**를 사용합니다. 새로고침·재접속 후 유지되지만 다른 PC/브라우저와 공유되지 않으며 사이트 데이터 삭제 시 사라집니다. `/`와 `/studio/`가 같은 origin이면 같은 시연 저장소를 사용합니다. 실제 서버/인증/백업은 미구현이며 검토자는 Demo engineer입니다. 운영 데이터 저장 용도로 사용하지 마세요.

다른 탭에서 변경한 오래된 검토의 저장은 충돌 오류로 거부합니다. 다시 불러오기 후 검토하세요. 이미지·유형·검사 실행 변경과 화면 이동에는 미저장 확인이 있으며 탭 종료/새로고침에는 브라우저 기본 확인을 요청합니다. 브라우저가 종료 확인을 표시하지 않을 수 있으므로 저장 버튼 완료 메시지를 확인하세요.

`ReviewRepository`를 HTTP adapter로 교체할 수 있습니다. image-review 패널은 공통 slot 계약으로 주입되어 Viewer에서 다른 feature를 직접 import하지 않습니다. 실제 백엔드에서는 인증된 검토자·권한·revision 충돌 검증이 필요합니다.

## Phase 5 — Dataset / Model / External AI Tools

- **Datasets**: 생성 → 설비·LOT/Product·유형·레이블·검토 상태로 검색 → 이미지 선택(페이지 간 유지, 최대 500개) → 이름/버전 저장 → 버전 확정. 누락 이미지는 제외하고 재검사 실행별 이미지도 표시합니다.
- Dataset은 생성 당시 이미지 ID, 제품/LOT/설비/검사 출처, 원본 판정, 개발자 Review 전체와 최종 레이블을 보존합니다. 이후 Review가 바뀌어도 기존 버전은 바뀌지 않습니다. 미검토 이미지는 원본 판정을 사용합니다. 새 버전은 독립적으로 선택·저장합니다.
- **AI Models**: 확정 Dataset 선택 → 모델명/버전/학습일/Accuracy/평가 조건/파일 경로/상태 등록. 목록·검색·상세 및 학습 Dataset 이동. 상태는 기록용이며 운영 선택이 실제 배포를 실행하지 않습니다.
- **External AI Tools**: SAIGE 등 도구명/버전/설치 경로/메모 등록·재조회. 외부 도구의 역할과 EXE 미연결 상태를 표시합니다.
- 같은 이름/버전 중복은 대소문자·앞뒤 공백을 정규화하여 차단합니다. IndexedDB 트랜잭션으로 동시 등록도 검사합니다. Dataset/모델 버전의 내용 편집·삭제·Export는 제공하지 않으며 변경은 새 버전 등록으로 관리합니다.
- 신규 저장소는 `equipment-ai-studio-catalog-v1`; 기존 Review DB를 변경하지 않습니다. 브라우저 프로필/origin별 저장이고 백업·실제 인증·서버 공유는 없습니다. 경로는 텍스트 메타데이터이며 파일 접근/업로드는 하지 않습니다.

## Phase 6 — DatasetHub 조회

**DatasetHub** 메뉴에서 9대 설비·27개 PC의 Mock 수집 상태를 확인합니다. 정상/지연/실패 혼합, 장애 복구 후 정상, Hub 연결 불가 시나리오를 선택할 수 있습니다. 설비/PC 검색·상태 필터·PC 상세·오류/재시도/복구 이력을 제공합니다.

샘플 기준은 **2026-11-05 12:02 KST**로 고정됩니다. 30초 자동/수동 새로고침은 같은 샘플의 재조회이며 실시간 설비 통신이 아닙니다. Hub 미연결에서는 PC 상태를 확인 불가로 표시하고 과거 성공 시각을 현재 정상으로 오인하지 않도록 구분합니다. 실제 수집/재수집/설정 변경 명령은 구현하지 않았습니다.

`CatalogRepository` / `HubRepository`와 4개 독립 Feature Module을 추가했습니다. Shell 업무 로직을 변경하지 않았으며 API 도입 시 adapter 교체가 가능합니다. 실제 인증/API, SAIGE 실행, 모델 학습/배포, Dataset Export, TIFF 대용량 처리, LLM 연계는 후속 범위입니다.
