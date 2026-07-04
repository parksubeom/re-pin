---
name: create-slice
description: ui/model/api 세그먼트와 index.ts public API를 갖춘 새 FSD 슬라이스(entity/feature/widget/page)를 팀 표준대로 스캐폴딩한다. Vue·React 공통. 클라이언트 스토어·서버 쿼리 훅·라우트 지연 로딩 포함. src/에 새 슬라이스 추가 시 사용.
---

# FSD 슬라이스 생성

`rules/20-project-structure.md`(구조, 프레임워크 무관) + `rules/<fw>/state-and-data`(상태·데이터,
Vue=Pinia/Vue Query · React=Zustand/React Query)를 실행한다.

## 입력

1. 계층 판단:
   - **entities** — 비즈니스 명사(user, order). 데이터 모델 + 표현.
   - **features** — 사용자 액션/시나리오(login, add-to-cart). 동사.
   - **widgets** — 여러 feature/entity를 **조합**한 큰 UI 블록(header, sidebar). 단일 액션이면 feature.
   - **pages** — 라우트 화면. 대개 widget/feature를 배치만.
2. 이름: kebab-case.

## 단계

1. `src/<layer>/<name>/`에 필요한 세그먼트만:
   - `ui/` — 컴포넌트(`create-component` 패턴).
   - `model/` — 클라이언트 상태 스토어(Vue=Pinia setup-store / React=Zustand). 서버 데이터는 두지 않음.
     구체 패턴은 `rules/<fw>/state-and-data`.
   - `api/` — 서버 상태 쿼리 훅(Vue Query / React Query, `gen-api-types` + `rules/<fw>/state-and-data`).
     쿼리 키 colocation + export.
2. `index.ts`로 **public API만** 재노출. 다른 슬라이스는 이 barrel에서만 import.
   entities는 관련 타입도 함께 노출(`export type { ... }`).
3. import 방향 준수 — 하위 계층만. 위반은 boundaries가 빌드 실패시킴(억제 금지).
4. `page`면 `app/router`에 지연 로딩 등록: `() => import('@/pages/<name>').then((m) => m.<Name>Page)`.
5. **스펙 콜로케이션** — 스토어/컴포저블·컴포넌트는 `*.spec.ts`를 소스 옆에. 층 선택·패턴은
   `write-test` 참조. 로직/가드가 있으면 회귀 스펙 필수(`rules/50`).

## 검증

`pnpm run lint && pnpm run type-check && pnpm run test`. 경계/import 위반은 억제하지 말고 구조를 고친다.
