---
name: create-component
description: 컴포넌트를 팀 표준 패턴(interface Props, cva 변형 + cn 병합, Tailwind 전용, 다크모드, 접근성)으로 스토리·스펙과 함께 스캐폴딩한다. Vue·React 모두 지원. 새 UI 컴포넌트 추가 시 사용.
---

# 컴포넌트 생성 (+ 스토리 + 스펙)

**프레임워크 확인**: 이 프로젝트가 Vue인지 React인지에 따라 규칙이 다르다 — Vue면
`rules/vue/code-style`, React면 `rules/react/code-style`를 그대로 실행한다. (`rules/00-core`)

시작 전에 **참고할 Figma 디자인이 있는지 확인**한다 — 있으면 `implement-from-figma`로,
없으면(스펙/설명 기반) 이 스킬로 진행한다.

- **Vue**: `templates/BaseButton/`(`.vue`/`.spec.ts`/`.stories.ts`/`index.ts`)이 복사 시작점.
- **React**: `rules/react/code-style`의 패턴대로 `.tsx` + 스펙(RTL) + 스토리 작성(현재 번들 템플릿 없음).
- 공통: `cn`이 없으면 `templates/utils.ts`를 `shared/lib/utils.ts`로 복사(clsx + tailwind-merge, 프레임워크 무관).

## 입력

1. 위치:
   - 도메인 비종속 재사용 → `shared/ui/<Name>/`.
   - **여러 앱이 함께 쓰는 디자인 시스템 컴포넌트**면 모노레포의 `packages/ui`로 승격. 판단 기준:
     한 앱 전용이면 그 앱 `shared/ui`, 둘 이상 앱에서 쓰이거나 쓰일 예정이면 `packages/ui`.
   - 특정 슬라이스 전용 → 그 슬라이스 `ui/`.
2. 이름: `PascalCase`.

## 단계

1. 컴포넌트 파일 — `interface Props`, Tailwind 전용, variant는 `cva` + 외부 class는 `cn` 병합.
   - Vue: `<Name>.vue`(`<script setup>` + `withDefaults` + `defineEmits`).
   - React: `<Name>.tsx`(함수 컴포넌트 + `className` prop + `onXxx` 콜백).
2. **접근성**(`rules/35`) — 시맨틱 요소(버튼은 `<button>`), 입력엔 연결된 label, 키보드 조작,
   `focus-visible` 링 유지. `div`로 버튼 흉내 금지.
3. 스토리 — Storybook `title`은 FSD 경로, 주요 상태 스토리.
4. 스펙 — 렌더/prop 분기/이벤트 + 외부 class tailwind-merge 충돌 해소 + 키보드/역할 한 케이스.
   (Vue `mount` / React `render`+`screen`. 더 깊은 층은 `write-test`)
5. `index.ts` + 계층 barrel(`shared/ui/index.ts` 또는 `packages/ui`)에서 export.
6. `shared/lib`에 `cn`이 없으면 `templates/utils.ts`를 `shared/lib/utils.ts`로 추가.

## 검증

`pnpm run test && pnpm run lint && pnpm run type-check`. 필요시 `pnpm run storybook` 눈 확인.
