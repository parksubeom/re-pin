# Next (App Router) — 코드 스타일

> **쉽게 말하면:** React 부품 만드는 법 + Next의 "서버/클라 컴포넌트 구분" 규칙.

React 코드 스타일(함수 컴포넌트·`interface Props`·cva/cn·Tailwind·strict)은 `rules/react/code-style`와
동일하다. 여기서는 **Next(App Router) 고유 규칙**만 덧붙인다.

## 서버 컴포넌트가 기본이다

- App Router의 모든 컴포넌트는 **기본이 서버 컴포넌트(RSC)**. 별도 표시 없으면 서버에서 렌더된다.
- **`'use client'` 는 정말 필요한 잎(leaf)에만** 붙인다 — 상태(`useState`)·이펙트·이벤트 핸들러·브라우저
  API를 쓰는 컴포넌트. 파일 맨 위에 선언하며, 그 파일이 import하는 하위도 클라이언트 번들에 포함된다.
- **`'use client'` 를 트리 위쪽에 남발하지 않는다.** 인터랙션 조각만 클라이언트로 떼고, 나머지는 서버에.
- 무거운 라이브러리·비밀키·DB 접근은 **서버 컴포넌트/서버 액션에만**. 클라이언트로 새지 않게.

## 네비게이션 (pages router 아님)

- 링크는 `next/link`의 `<Link href>`. 프로그램 이동·경로 읽기는 **`next/navigation`**
  (`useRouter`/`usePathname`/`useSearchParams`) — **`next/router`(pages용) 사용 금지.**
- `useRouter`/`usePathname` 등은 클라이언트 훅이므로 `'use client'` 파일에서만.

## 파일·경계

- 라우팅 파일(`page.tsx`·`layout.tsx` 등)은 **얇게** 유지 — 로직은 FSD 슬라이스에서 import해 조립만
  (`rules/next/project-structure`).
- 이미지·폰트는 `next/image`·`next/font` 사용(최적화).
