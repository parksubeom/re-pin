# 40. API 레이어 — 타입세이프 클라이언트 (openapi)

> **쉽게 말하면:** 서버와 주고받는 데이터는 타입을 자동 생성해서 안전하게 다룬다. (Vue·React 공통)

## 타입 생성 (openapi-typescript) — 공통

- 요청/응답 타입을 **직접 작성하지 않는다.** OpenAPI 명세에서 생성한다.
  ```
  OPENAPI_SCHEMA=<url|path> pnpm run gen:api
  ```
- 출력 `src/shared/api/schema.d.ts`는 **생성 파일** — 손으로 수정 금지, lint/format 제외.
- 타입세이프 클라이언트 `src/shared/api/client.ts`(`openapi-fetch`)가 새 `paths`를 자동 인식.
- 기본적으로 런타임 스키마 검증 라이브러리(zod 등)를 도입하지 않는다 — 타입은 생성 타입으로 보장.

## 쿼리 훅으로 쓰기

- 생성 타입 + `openapi-fetch` 클라이언트를 **TanStack Query 훅**으로 감싼다. 슬라이스 결정:
  리소스 → `entities/<noun>/api`, 액션 → `features/<action>/api`. 쿼리 키는 훅과 colocation + export.
- 프레임워크별 훅 패턴(Vue Query / React Query)은 **`rules/vue/state-and-data`** 또는
  **`rules/react/state-and-data`** 참조. 공통 원칙: `{ data, error }` 구조분해 → 실패 시 `throw error`.
