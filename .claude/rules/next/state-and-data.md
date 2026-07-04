# Next (App Router) — 상태와 데이터

> **쉽게 말하면:** 가능하면 서버에서 가져오고(RSC), 클라 상태는 Zustand, 클라에서 서버데이터가 필요할 때만 React Query. 변경은 Server Action.

## 서버 데이터 — 먼저 서버 컴포넌트에서

- 첫 렌더에 필요한 데이터는 **서버 컴포넌트에서 직접 `await fetch()`/DB 조회**로 가져온다. 클라이언트로
  내려서 다시 받지 않는다(워터폴·번들 증가 방지).
- Next `fetch` 캐싱 옵션을 명시: `cache: 'force-cache'`(정적) / `no-store'`(매요청) / `next: { revalidate: N }`.
- 서버에서 받은 데이터는 **props로 클라이언트 컴포넌트에 내려준다.**

## 클라이언트에서의 서버 상태 — TanStack React Query

- 클라이언트에서 상호작용으로 다시 받아야 하는 서버 데이터(무한스크롤·낙관적 갱신·폴링)는 **React Query**.
  `useQuery`/`useMutation`, 쿼리 키 colocation + export (`rules/react/state-and-data`와 동일).
- 초기 데이터는 서버 컴포넌트에서 받아 `initialData`(또는 hydration)로 넘겨 중복 요청을 줄인다.
- `QueryClientProvider`는 **클라이언트 프로바이더 컴포넌트**(`'use client'`)로 감싸 root `layout`에서 등록.

## 클라이언트 상태 — Zustand

- 화면이 기억하는 순수 클라 상태(열림/닫힘·선택 등)는 Zustand, `model/` 세그먼트. selector로 구독.
- **서버 데이터를 Zustand에 캐싱하지 않는다.** 서버 상태는 RSC 또는 React Query 몫.

## 변경(mutation) — Server Action 우선

- 폼 제출·쓰기 작업은 **Server Action**(`'use server'`)을 우선. 클라이언트에서 직접 호출하거나 `<form action>`.
- 성공 후 **`revalidatePath`/`revalidateTag`** 로 서버 데이터 갱신. 복잡한 클라 상태 동기화가 필요하면 React Query `useMutation`.
- 외부로 노출할 HTTP 엔드포인트가 필요하면 Route Handler(`app/api/**/route.ts`).
