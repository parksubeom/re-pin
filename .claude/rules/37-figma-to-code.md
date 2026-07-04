# 37. Figma → 코드

> **쉽게 말하면:** 화면은 상상해서 만들지 말고 Figma 디자인을 정확히 보고 옮긴다.

우리 프론트엔드는 대부분 **Figma 디자인이 기준(SSoT)**이고, **claude.ai Figma 커넥터**로 디자인을
읽어 구현한다(figma.com 노드 링크 기반). 눈짐작으로 값을 지어내지 않는다.

**단, 항상 Figma를 쓰는 건 아니다.** UI 작업을 시작할 때 Figma 디자인이 있는지 **먼저 확인**한다.
있으면 이 규칙(+`implement-from-figma`)을 따르고, 없으면 스펙/설명 기반으로 `create-component`·
`create-slice`로 구현한다. Figma 사용을 임의로 가정하지 않는다.

## 디자인은 Figma에서 실제 값으로 가져온다

- Figma MCP로 **디자인 컨텍스트 + 스크린샷 + 변수(variables)**를 가져와 레이아웃·색·간격·타이포·
  상태(hover/disabled 등)를 확인한다. "대충 이 정도" 값 금지.
- 노드 링크/ID가 없으면 먼저 요청한다.

## 값 매핑 — 하드코딩하지 않는다

- 색·간격·radius·타이포는 Figma 변수를 **우리 디자인 토큰**(`gen-tokens`가 만든 `tokens.css`,
  예: `bg-bg-default`, `p-md`)에 매핑해 쓴다. 임의 hex/px를 박지 않는다(`rules/<fw>/code-style`).
- Figma에 없는 값이 필요하면 임의로 만들지 말고 디자이너/토큰에 확인.

## 기존 컴포넌트를 먼저 재사용

- Figma **Code Connect 매핑이 있으면** 그 컴포넌트를 그대로 쓴다. 없으면 `shared/ui`(또는
  `packages/ui`)에서 유사 컴포넌트를 찾고, 그래도 없을 때만 `create-component`로 새로 만든다.
- MCP가 뱉는 자동 생성 코드를 그대로 붙여넣지 않는다 — 우리 컨벤션(`interface Props`/cva/cn/
  Tailwind)으로 옮긴다(`rules/<fw>/code-style`).

## 우리 규칙 위에서 구현

- 스타일은 Tailwind 전용 + 다크모드(`rules/<fw>/code-style`), 접근성 기본(`rules/35`), 화면 문구는
  하드코딩 말고 i18n(`rules/<fw>/i18n`).

## 검증 — 디자인과 대조

- 구현 결과를 Figma **스크린샷과 시각 대조**(Storybook에서 상태별로). 픽셀 완벽 집착보다 토큰·간격·
  상태(hover/focus/disabled/dark) 일치를 우선.
- 특수효과(점선 테두리·복합 그림자·그라디언트 등)는 그대로 안 나올 수 있으니 토큰/유틸로 근사하고
  차이를 알린다.
