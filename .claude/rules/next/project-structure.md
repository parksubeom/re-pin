# Next (App Router) — 구조 (FSD 적응형)

> **쉽게 말하면:** Next의 `app/` 은 "URL 배선"만, 실제 코드는 FSD 레이어(`src/`)에. 둘의 이름 충돌을 이렇게 푼다.

공통 FSD 규칙(계층·경계·슬라이스·관심사 분리)은 `rules/20-project-structure`와 동일하다. Next는 `app/`
디렉토리가 라우팅을 강제하므로 **아래 적응 규칙**을 얹는다.

## 핵심: `app/` 은 라우팅 진입점일 뿐

- Next `app/` (또는 `src/app/`)에는 **라우팅 특수 파일만**(`page`·`layout`·`loading`·`error`…).
- 이 파일들은 **얇게** — FSD 슬라이스에서 화면을 import해 **조립만** 한다. 비즈니스 로직·상태·데이터
  페칭을 `page.tsx`에 직접 쓰지 않는다.

```tsx
// app/users/page.tsx  — 얇은 진입점
import { UserListPage } from '@/pages/user-list'
export default function Page() {
  return <UserListPage />
}
```

## FSD `app` 레이어 이름 충돌 해소

FSD의 최상위 `app` 레이어(프로바이더·전역 스타일·글로벌 셋업)가 Next `app/` 라우팅 디렉토리와 이름이
겹친다. **규칙:**

- FSD 레이어(`pages`·`widgets`·`features`·`entities`·`shared`)는 **`src/` 아래**에 둔다.
- FSD `app` 레이어의 책임(프로바이더·전역 스타일)은 **Next `root layout.tsx` + `src/app/providers.tsx`**
  (클라이언트 프로바이더 묶음)로 옮긴다. 별도 `app` 레이어 폴더를 라우팅 `app/`과 나란히 만들지 않는다.
- 즉 **Next `app/` = (FSD의 app+pages 진입) 라우팅**, 화면 알맹이는 `src/pages/*` 슬라이스.

```
app/                      # Next 라우팅 (얇음)
  layout.tsx              # root: providers.tsx 사용
  users/page.tsx          # → src/pages/user-list 조립
src/
  app/providers.tsx       # QueryClient·i18n·theme 등 클라 프로바이더
  pages/user-list/        # 화면 알맹이 (FSD)
  widgets/ features/ entities/ shared/
```

## 경계는 그대로 강제

- import 방향(상위→하위만)·public API(`index.ts`) 규칙 유지. `page.tsx`는 슬라이스의 `index.ts`만 import.
- 서버/클라 경계는 구조와 별개 축이다 — `'use client'`는 잎에서만(`rules/next/code-style`).
