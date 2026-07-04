---
name: gen-api-types
description: openapi-typescript로 OpenAPI 명세에서 타입세이프 API 정의를 재생성하고, 타입세이프 Query 훅(Vue Query/React Query)을 연결한다. 백엔드 OpenAPI 명세가 바뀌거나 새 엔드포인트에 클라이언트 훅이 필요할 때 사용.
---

# API 타입 & 쿼리 훅 생성

프론트 API 레이어를 백엔드 OpenAPI 명세와 동기화한다. 규칙: `rules/40-api-types.md`.

## 타입 재생성

1. `OPENAPI_SCHEMA`(URL 또는 로컬 경로)로 명세를 가리킨다 (기본값 `./openapi.json`).
   ```
   OPENAPI_SCHEMA=https://api.example.com/openapi.json pnpm run gen:api
   ```
2. `src/shared/api/schema.d.ts`를 덮어쓴다 (**생성 파일 — 손으로 수정 금지**, lint/format 제외).
3. 타입세이프 클라이언트 `src/shared/api/client.ts`(`openapi-fetch`)가 새 `paths`를 자동 인식.

## 쿼리/뮤테이션 훅 추가

1. 슬라이스 결정: 리소스 → `entities/<noun>/api`, 액션 → `features/<action>/api`.
2. TanStack Query의 `useQuery`/`useMutation`으로 감싼다 — **Vue는 Vue Query, React는 React Query**
   (구체 패턴 `rules/<fw>/state-and-data`). `apiClient.GET('/path')` → `{ data, error }` 구조분해,
   실패 시 `throw error`.
3. **export되는 쿼리 키를 훅과 colocation**.
4. 훅을 슬라이스 `index.ts`에서 export.

## 검증

`pnpm run type-check`(경로/파라미터/응답 타입 체크) + 관련 `*.spec.ts`.
