# Equipment AI Studio — Architecture

> 설계 v0.1 | 2026-11-03 | 구현 전 개념 설계

## 1. 포지셔닝

EquipmentAIStudio는 설비에 독립적인 검사 데이터 활용·AI 학습 준비·모델 메타데이터 관리용 **Web App**입니다. 초기에는 MLCC 트리밍 데이터만 지원합니다. 내부 업무 로직·라우팅·컴포넌트는 확장 가능하게 만들되, 처음부터 범용 플러그인 엔진을 과도하게 구현하지 않습니다.

공통 기준: [EquipmentAIPlatform — ECOSYSTEM_ARCHITECTURE](https://github.com/WithMK/EquipmentAIPlatform/blob/main/docs/ECOSYSTEM_ARCHITECTURE.md).

## 2. 논리 구성

```text
 설비 제어/검사 PC (9대 × 3PC 예시)
       | 로그·이미지·메타데이터 / SMB Pull
       v
 DatasetHub (Data Collection PC, 상시 동작)
   Collector -> Processing -> Matching
       |                |
       +-- File Archive +-- Products/Inspections/Images DB
                            |
                      인증된 Data Query API (신설 예정)
                            |
                            v
 Equipment AI Studio (독립 웹)
   Data Explorer / Dataset Management / Model Registry / SAIGE Launcher UI
                            |
             SAIGE on training PC (사용자 직접 실행/학습)

 Equipment AI Platform (별도 상위 웹)
    - Agent / RAG / 통합 메뉴·인증·Reverse Proxy
    - 추후 `/studio/` 경로로 Equipment AI Studio 연결
```

## 3. 책임 및 비책임

| 컴포넌트 | 소유 기능 | 소유하지 않는 기능 |
| --- | --- | --- |
| DatasetHub | 수집·정합성·로그 DB화·이미지 인덱싱·제품별 매칭 | 모델 학습 UI, Web Viewer |
| Equipment AI Studio | 매칭 결과 조회, Dataset 정의/내보내기 요청, 모델 이력·상태 관리, 외부 AI 도구 연결 | 로그 수집, 원시 데이터 파싱/매칭, AI 모델 학습 |
| SAIGE | 별도 학습용 PC에서 직접 라벨링·학습 | DatasetHub 데이터 수집/매칭 |
| Equipment AI Platform | 통합 포털, Agent/RAG, 공통 접속점·인증 조율 | EquipmentAIStudio의 설비별 업무 처리 |

## 4. 기술·서비스 경계

- UI는 일반 브라우저에서 실행; 독립 실행과 상위 포털 내 통합을 모두 허용.
- 백엔드는 조회 API를 통해 DatasetHub의 처리 완료 데이터를 읽는다. 웹 서버가 수집 DB(SQLite 파일)를 SMB로 직접 열지 않는다.
- `GET /api/equipments`, `GET /api/products`, `GET /api/inspections`, `GET /api/images/{id}` 등은 **계약 예시**로서 아직 확정되지 않았다.
- 이미지 원본은 중앙 파일 저장소에 남기고 DB는 경로·메타데이터·관계를 저장한다. 웹 이미지 제공에는 접근 권한·썸네일·응답 크기 제한을 고려한다.
- 실데이터 모델을 정할 때 MachineId, LotId, ProductId, InspectionRunId, 촬영 위치/순번을 계약화한다. 파일명/수정 시간만으로 매칭하지 않는다.
- Dataset Export는 검증된 이미지와 메타데이터를 원본을 훼손하지 않는 방식으로 구성. SAIGE import 포맷 확정 전 임의 변환 규약을 약속하지 않는다.
- 모델 레지스트리는 모델 ID, 설비 유형, 버전, 학습 데이터셋, 학습일, 평가지표, 모델 아티팩트 위치, 사용 상태를 관리한다. 학습 작업 및 GPU 제어는 범위 밖이다.

## 5. 웹 모듈 구조 제안

```text
EquipmentAIStudio/
  docs/
  web/                      # 기술 스택 결정 후 구체화
    app/                    # 독립 실행 Shell, 라우팅
    features/
      data-explorer/
      dataset-management/
      model-registry/
      external-tools/
    shared/
      api-client/
      auth/
      ui/
  server/                   # 필요 시 Studio용 API/BFF
```

위 디렉터리는 **논리 예시**이며 실제 프로젝트 생성과 스택 선택 전에는 소스가 없을 수 있습니다. 설비별 차이는 `equipmentType`, 데이터 어댑터 및 API 스키마로 구분하고, 핵심 화면을 트리밍 고유 데이터에 직접 결합하지 않습니다.

## 6. 웹 통합 배포

- 초기: EquipmentAIPlatform과 EquipmentAIStudio를 각자 별도 포트로 독립 운영.
- 향후: Reverse Proxy(Nginx/YARP 등)로 한 외부 주소·포트를 사용하고 `/studio/` 등 경로별 내부 서버 라우팅.
- 내부 서비스 포트는 외부 방화벽에 노출하지 않는다.
- Base Path, 정적 리소스 URL, API URL, WebSocket, 인증 콜백·쿠키 Path 등은 경로 기반 Proxy를 고려한다.
- Reverse Proxy는 **웹 UI/로그인 화면을 자동 병합하지 않는다.** 공통 계정/SSO는 별도의 인증 계약이 필요하다.
- 최종적으로 소스 레벨 UI 편입도 가능하지만 현재는 독립 웹 + 경로 라우팅을 우선한다.

## 7. 외부 SAIGE 프로그램

담당자 1명이 학습 PC에서 별도 SAIGE 프로그램을 직접 실행한다. 웹의 '실행' 기능은 현재 **요구사항**이지 구현된 기능이 아니다. 브라우저가 EXE를 직접 시작할 수 없으므로 승인된 Local Launcher 또는 Custom URI Protocol을 추후 검증한다. 임의 프로세스 실행 API를 제공하지 않으며 사용자 동작/권한 검증 후 실행한다.

## 8. 데이터·보안·운영 원칙

- 생산 제어 PC에 서버 작업/AI 학습의 CPU·스토리지 부하가 영향을 주지 않도록 독립성 유지.
- 학습 데이터 선택·모델 정보 수정·내보내기는 권한 및 감사 이력 고려.
- 운영 데이터/이미지/인증정보를 공개 저장소에 업로드하지 않음.
- DB 선택, UI 프레임워크, API 및 라이브러리는 현장 망/계정 조건 확인 후 확정.

## 9. 미결정 사항

웹 프레임워크(React/Vue/Blazor 등), API Hosting 위치/프로토콜, 공동 사용자 인증, DatasetHub DB 분리 여부, 제품/검사 실행 ID 명명 규칙, 데이터셋 export 포맷, SAIGE 연계 방법, 포트/도메인. 미결정 사항을 암묵적으로 확정하지 않는다.
