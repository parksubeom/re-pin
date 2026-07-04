# Next (App Router) — 라우팅

> **쉽게 말하면:** 폴더·파일이 곧 URL. 정해진 특수 파일 이름으로 화면·로딩·에러를 만든다.

App Router는 **파일 기반 라우팅**이다. `app/` 아래 폴더 구조가 URL이 된다.

## 특수 파일 (규약 이름)

| 파일 | 역할 |
| --- | --- |
| `page.tsx` | 그 경로의 화면(공개 URL이 됨) |
| `layout.tsx` | 하위 공통 레이아웃(상태 유지, 중첩됨) |
| `loading.tsx` | 로딩 중 폴백(Suspense) |
| `error.tsx` | 그 구간 렌더 에러 경계(`'use client'`) |
| `not-found.tsx` | 404 화면 |
| `route.ts` | HTTP 핸들러(API 엔드포인트) — `page`와 공존 불가 |

## 폴더 규칙

- **동적 세그먼트**: `[id]`, 캐치올 `[...slug]`, 옵셔널 `[[...slug]]`.
- **라우트 그룹**: `(group)` — URL에 안 들어가고 레이아웃/구획만 나눔.
- **프라이빗 폴더**: `_folder` — 라우팅에서 제외(코드 보관용).
- 병렬(`@slot`)·인터셉트(`(.)`) 라우트는 필요할 때만(모달 등). 남용 금지.

## 규칙

- `page.tsx`·`layout.tsx`는 **얇게** — FSD 슬라이스(widgets/features)를 import해 조립만
  (`rules/next/project-structure`).
- 메타데이터는 `export const metadata` 또는 `generateMetadata`로. `<head>` 수동 조작 금지.
- 링크·이동은 `next/link`·`next/navigation`(`rules/next/code-style`).
- 인증·리다이렉트 같은 경로 가드는 `middleware.ts` 또는 레이아웃/서버 컴포넌트에서.
