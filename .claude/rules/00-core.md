# 00. 코어 — 스택과 작업 기본 원칙

> **쉽게 말하면:** 우리가 쓰는 기술과, 작업할 때 지키는 가장 기본적인 약속들.

## 프레임워크는 프로젝트당 하나 — Vue 또는 React

프로젝트를 시작할 때 **Vue와 React 중 하나**를 고른다(`setup-fe-project`가 먼저 묻는다). 고른
프레임워크의 규칙을 **`rules/vue/`** 또는 **`rules/react/`**에서 함께 읽는다. 아래 스택 표의 "공통"은
둘 다 동일하고, "프레임워크별"만 갈린다.

## 스택 (고정)

**공통 (Vue·React 동일)**

- **Vite** 빌드 · **TypeScript strict**
- 서버 상태: **TanStack Query** · 타입세이프 API: **openapi-typescript** + **openapi-fetch**
- 스타일: **Tailwind CSS v4** + `cva`/`cn` · 디자인 토큰(Token Studio → `gen-tokens`)
- 아키텍처: **Feature-Sliced Design**
- 모노레포: **pnpm workspace + Turborepo** (`apps/*`, `packages/*`)
- 테스트: **Vitest** · **Playwright** · **Storybook**
- 품질: **oxlint** + **ESLint**(import-x + boundaries) · **Prettier** · **commitlint** + **husky**

**프레임워크별**

|                 | Vue (`rules/vue/`)     | React (`rules/react/`)   |
| --------------- | ---------------------- | ------------------------ |
| 컴포넌트        | Vue 3 `<script setup>` | 함수 컴포넌트 + 훅 (TSX) |
| 라우팅          | Vue Router             | React Router             |
| 클라이언트 상태 | Pinia                  | Zustand                  |
| 서버 상태 훅    | Vue Query              | React Query              |
| i18n            | vue-i18n               | react-i18next            |
| 컴포넌트 테스트 | `@vue/test-utils`      | React Testing Library    |

## 작업 기본 원칙

1. 규칙(`rules/`)이 SSoT다. 규칙과 코드/스킬이 어긋나면 규칙을 따르거나, 규칙 변경을 먼저 합의한다.
2. 새 패키지·설정·구조는 **명시 요청 없이 임의로 추가하지 않는다** (→ `10-guardrails.md`).
3. 포매터/린터와 싸우지 않는다. import 순서·클래스 정렬은 도구가 자동 처리한다.
4. 서버 데이터는 TanStack Query, 클라이언트 상태만 스토어(Pinia/Zustand). 둘을 섞지 않는다.
5. 컴포넌트/슬라이스 추가는 항상 해당 스킬 절차를 따라 동일 품질을 유지한다.

## 명령어 (모노레포 루트)

| 명령                          | 설명                       |
| ----------------------------- | -------------------------- |
| `pnpm dev`                    | 전체 앱 개발 서버 (turbo)  |
| `pnpm build`                  | 타입체크 + 프로덕션 빌드   |
| `pnpm lint`                   | oxlint + eslint            |
| `pnpm type-check`             | vue-tsc(Vue) / tsc(React)  |
| `pnpm test` / `pnpm test:e2e` | Vitest / Playwright        |
| `pnpm run commit`             | 대화형 Conventional Commit |
