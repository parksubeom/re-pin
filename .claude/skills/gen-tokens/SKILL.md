---
name: gen-tokens
description: Token Studio(Figma)의 multiple-files export에서 Tailwind v4 디자인 토큰(src/app/styles/tokens.css)을 재생성한다. 디자이너가 새 토큰 export를 전달했거나, 색상/간격/radius/타이포 토큰을 바꿔야 할 때 사용.
---

# 디자인 토큰 생성

디자인 토큰을 디자이너의 Token Studio export와 동기화 상태로 유지합니다
(`docs/adr/0010` 참고).

> **상태: 파이프라인 미설치 (재구성용 청사진).** 디자이너 토큰 재정의 대기 중이라 실제
> 코드(`tokens/`, `scripts/build-tokens.mjs`, `gen:tokens` 스크립트, `tokens.css`,
> devDeps)는 제거된 상태입니다. 아래 절차로 재설치하세요:
>
> 1. `npm i -D style-dictionary @tokens-studio/sd-transforms`
> 2. `package.json`에 `"gen:tokens": "node scripts/build-tokens.mjs"` 추가
> 3. `scripts/build-tokens.mjs`를 `docs/adr/0010`의 설계(타입 기반 매핑·빈 `$themes` 폴백·
>    dark media 오버라이드)대로 작성
> 4. `main.css`에 `@import './tokens.css'` 추가, `.prettierignore`에 `tokens`·`tokens.css` 추가
>
> 이후부터는 아래 흐름이 그대로 적용됩니다.

## 디자이너 export 받기 → 업로드

1. 디자이너는 Figma **Tokens Studio** 플러그인에서 **Settings → "Multiple files"**로
   export한다.
2. 받은 파일들을 리포 루트 **`tokens/`**에 그대로 덮어쓴다 (export 원본 = 입력 SSOT,
   손대지 않음 / Prettier 제외):
   - `$metadata.json` — 토큰 세트 순서
   - `$themes.json` — 테마(light/dark) 정의
   - `core.json` — 원시 토큰 (color/spacing/radius/font …)
   - `light.json` / `dark.json` — 모드별 시맨틱 토큰

## 토큰 재생성

```sh
npm run gen:tokens
```

- 이는 `scripts/build-tokens.mjs`(Style Dictionary + `@tokens-studio/sd-transforms`)를
  실행해 `src/app/styles/tokens.css`를 덮어쓴다 (생성 파일, 읽기 전용 — 손으로 수정하지
  말 것; Prettier에서 제외됨).
- light + 원시 토큰은 `@theme`로, dark 시맨틱 토큰은 `@media (prefers-color-scheme: dark)`
  오버라이드로 나온다.
- `main.css`가 `@import './tokens.css'`로 소비하므로 별도 연결 작업은 없다.

## 매핑 규칙 (토큰 `$type` 기준)

네임스페이스는 그룹명이 아니라 **토큰 `$type`**으로 결정된다. 그룹명이 Tailwind와 달라도
(`colors`, `borderRadius` …) 알맞은 네임스페이스로 들어간다. 유틸 이름은 토큰 키를 따른다.

| `$type`      | CSS 변수      | 유틸 예시        | `$type`       | CSS 변수          | 유틸 예시            |
| ------------ | ------------- | ---------------- | ------------- | ----------------- | -------------------- |
| color        | `--color-*`   | `bg-bg-default`  | fontWeights   | `--font-weight-*` | `font-heading-bold`  |
| borderRadius | `--radius-*`  | `rounded-lg`     | lineHeights   | `--leading-*`     | `leading-body`       |
| spacing      | `--spacing-*` | `p-md`, `gap-lg` | letterSpacing | `--tracking-*`    | `tracking-decreased` |
| fontFamilies | `--font-*`    | `font-body`      | boxShadow     | `--shadow-*`      | `shadow-default`     |
| fontSizes    | `--text-*`    | `text-h1`        |               |                   |                      |

- **스킵되는 타입**: `dimension`(원시 backing), `paragraphSpacing`, `borderWidth`, `opacity`,
  그리고 복합 타입 `typography`. (`typography`는 단일 CSS 변수로 못 만들어 `Unknown CSS Font
Shorthand` 경고가 뜨는데 정상 — 자동 생성 대상이 아님.)
- 시맨틱 토큰은 `light.json`/`dark.json`에서 **같은 키**여야 다크 오버라이드가 맞물린다.
- core 참조는 `{colors.gray.300}` alias·수식(`{a} * {b}`)·`rgba({color}, a)` 모두 스크립트가
  해석한다.
- `$themes.json`이 비어 있으면 `$metadata.json`의 `tokenSetOrder`에서 `light`/`dark` 세트를
  찾아 스킴을 구성한다 (플러그인에서 테마 미구성 export도 그대로 동작).

## 검증

- `npm run gen:tokens` 출력의 변수 개수(theme vars / dark overrides)를 확인.
- `npm run build`로 Tailwind가 `@theme`를 처리하고 사용 중인 토큰 유틸이 컴파일되는지 확인.
- 새 시맨틱 토큰을 쓰는 컴포넌트는 라이트/다크 양쪽 스크린샷으로 확인 권장.
