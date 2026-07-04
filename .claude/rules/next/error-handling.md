# Next (App Router) — 에러 처리 & 사용자 피드백

> **쉽게 말하면:** 렌더 에러는 `error.tsx` 경계로, API 에러는 한 곳에서, 토스트는 한 레이어만.

## 렌더 에러 — 파일 경계 사용

- 구간별 렌더 에러는 **`error.tsx`**(해당 세그먼트, `'use client'` 필수, `reset()` 제공)로 잡는다.
  루트 전체는 **`global-error.tsx`**. 없는 리소스는 **`not-found.tsx`** + `notFound()` 호출.
- React `ErrorBoundary`를 수동으로 깔기 전에 이 규약 파일을 먼저 쓴다(App Router 기본 메커니즘).

## API·데이터 에러

- **서버 컴포넌트 fetch 실패** → 에러를 throw하면 가까운 `error.tsx`가 받는다. 예상된 "없음"은 `notFound()`.
- **Server Action 실패** → 액션이 `{ ok:false, message }` 같은 결과를 반환하게 하고 폼에서 표시(민감정보 노출 금지).
- **클라 React Query 에러** → `isError`/`error` 분기.
- **에러 envelope** 파싱은 `shared/api`에서 단일 처리 — 컴포넌트가 raw 응답을 직접 뜯지 않는다.

## 토스트 규약 (한 곳에서만)

- 에러 토스트는 **한 레이어만** 소유(중앙 인터셉터 **또는** 호출부). 둘 다면 중복.
- 성공/에러 메시지는 레지스트리(SSoT)에서 해석. 메시지는 `string | string[]` 가능성 가정.

## 폼·파괴적 액션

- 서버 검증을 신뢰하되 즉시 UX는 클라 검증으로 보완. 파괴적(비가역) 액션 전 확인 UI.

## 템플릿

표준 처리 패턴은 [`docs/ai/error-toast-template.md`](../../docs/ai/error-toast-template.md) 참조
(Server Action/RSC 맥락에 맞춰 사용).
