# Equipment AI Studio

> 설계 v0.2 · 2026-11-05 · 개발 방향 문서 (구현 완료 의미 아님)

**여러 설비의 검사 결과·이미지를 통합 조회·검토·분류하고, AI 데이터셋과 모델을 관리하는 개발자 중심 Web Workspace.**

초기 대상은 MLCC 트리밍 설비(9대, 제어/검사 PC 총 약 27대). 이후 설비 유형을 확장할 수 있도록 설계한다. **실시간 설비 관제(가동률·알람·실시간 상태)**는 별도 관제 시스템 책임으로 중복 구현하지 않는다.

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
- 기술 스택은 확정 전이며 React + TypeScript를 후보로 검토. 기본 UI는 전문 이미지 분석용 Dark Theme. Mock와 실제 API 연결 계층 분리.
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

웹 스택, 검사 메타데이터/식별 규약, 조회·명령 API, 인증, 저장소 스키마, SAIGE 런처 및 Dataset Export 포맷, 배포 포트·경로. 현재 문서는 **합의된 개발 방향**이며 미확정 기능의 구현 완료를 뜻하지 않는다.
