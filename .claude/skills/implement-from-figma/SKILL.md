---
name: implement-from-figma
description: Figma 디자인을 Figma MCP로 읽어 우리 컨벤션(디자인 토큰·cva/cn·FSD·a11y·i18n)으로 구현한다. Figma 링크/노드를 주거나 "이 디자인 만들어", "피그마대로 구현" 요청 시 사용.
---

# Figma 디자인 구현

`rules/37-figma-to-code.md`를 실행한다. Figma가 기준이고, **claude.ai Figma 커넥터**로 읽어
우리 규칙 위에서 옮긴다.

## 0. Figma 사용 여부부터 확인

- **항상 Figma를 쓰는 건 아니다.** UI 작업이라도 착수 전에 먼저 묻는다:
  "이 작업에 참고할 **Figma 디자인이 있나요?** 있으면 figma.com 노드 링크를 주세요."
- **있으면** → 링크를 받아 아래 1~5 진행.
- **없으면(글/스펙/말로 설명)** → 이 스킬을 쓰지 않고 `create-component`/`create-slice`로 바로 구현
  (`rules/<fw>/code-style`, `rules/35`, `rules/<fw>/i18n`은 그대로 적용). Figma를 임의로 가정하지 않는다.

## 1. 디자인 파악 (claude.ai Figma 커넥터)

- 선택이 크면 `get_metadata`로 구조를 먼저 훑어 대상 노드를 좁힌다.
- `get_design_context`로 레이아웃·색·간격·타이포·상태를, `get_screenshot`으로 시각 기준을,
  `get_variable_defs`로 디자인 변수를 실제 값으로 가져온다. "대충 이 정도" 값 금지.
- `get_design_context`가 코드 형태를 주더라도 그대로 붙이지 않는다 — 값·구조만 참고해 우리
  컨벤션으로 재작성한다.

## 2. 재사용 먼저 확인

- `get_code_connect_map`으로 **Code Connect 매핑**이 있는지 보고, 있으면 그 코드 컴포넌트를 쓴다.
- 없으면 `shared/ui`(또는 `packages/ui`)에서 유사 컴포넌트를 찾는다. 그래도 없을 때만 새로 만든다.
  (자주 쓰는 디자인 컴포넌트는 `figma-code-connect` 흐름으로 매핑해 두면 다음부터 재사용이 쉬워진다.)

## 3. 값 → 토큰 매핑

- Figma 변수를 우리 디자인 토큰(`gen-tokens`의 `tokens.css`: `bg-*`, `p-*`, `text-*` …)에 매핑.
  임의 hex/px 하드코딩 금지(`rules/<fw>/code-style`). Figma에 없는 값은 지어내지 말고 확인.

## 4. 구현 (우리 컨벤션)

- 새 컴포넌트는 `create-component`, 화면/기능은 `create-slice`로.
- `interface Props`/cva/cn/Tailwind 전용·다크모드(`rules/<fw>/code-style`), 접근성(`rules/35`),
  문구는 i18n(`rules/<fw>/i18n`).
- MCP 자동 생성 코드를 그대로 붙이지 말고 우리 패턴으로 재작성.

## 5. 시각 검증

- Storybook에서 상태별(hover/focus/disabled/dark)로 Figma 스크린샷과 대조. 토큰·간격·상태 일치를
  픽셀 완벽보다 우선. 컴포넌트 스펙은 `write-test`.
- 점선·복합 그림자·그라디언트 등 특수효과는 그대로 안 나올 수 있으니 근사하고 차이를 알린다.
