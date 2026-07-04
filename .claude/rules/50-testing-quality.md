# 50. 테스트 & 품질 게이트

> **쉽게 말하면:** 만든 뒤 자동으로 점검(테스트·검사)하고, 통과해야 저장한다.

## 테스트 3층

- **유닛/컴포넌트** — Vitest. 컴포넌트 렌더 도구는 프레임워크별: **Vue = `@vue/test-utils`,
  React = React Testing Library**. 스펙은 소스 옆 `*.spec.ts(x)`.
- **E2E** — Playwright. 스펙은 `e2e/` (Vitest는 무시). build 후 preview 서빙.
- **컴포넌트 문서/개발** — Storybook. 스토리 `title`은 FSD 경로(예: `shared/ui/BaseButton`).

규칙:

- 신규 shared/feature 컴포넌트는 스펙 + 스토리를 **함께** 제공.
- 컴포넌트 테스트는 렌더/prop 분기/이벤트 + 외부 class의 tailwind-merge 충돌 해소까지 커버.
  (Vue는 `mount`, React는 `render`+`screen`. 층 선택·패턴은 `write-test` 스킬)
- 커버리지 include는 `src/**/*.{ts,tsx,vue}`, 생성/부트스트랩 파일(`schema.d.ts`, `main.ts(x)`)은 제외.
- **실패 테스트를 삭제/비활성화로 해결하지 않는다** (→ `10-guardrails.md`).

## 품질 게이트 (자동 강제)

- **oxlint** `correctness: error` — 빠른 1차 게이트.
- **ESLint** — import 위생(`import-x`) + FSD 경계(`boundaries`). 위반 억제 금지.
- **Prettier** (+ tailwind 플러그인) — 포맷·클래스 순서 자동. 도구와 싸우지 않는다.
- **size-limit** — 번들 예산(앱 JS 100kB / CSS 15kB gzip). 초과 시 원인 규명.

## 작업 후 검증 절차 (runbook)

변경을 끝냈으면 **커밋 전에** 이 순서로 돌린다. 앞 단계가 실패하면 고치고 다시 처음부터.

```
1) pnpm run test          # 유닛/컴포넌트 (Vitest, 소스 옆 *.spec.ts)
2) pnpm run type-check     # vue-tsc, 타입 안전성
3) pnpm run lint           # oxlint → eslint (import 위생 + FSD 경계)
4) pnpm run build          # 타입체크 + 프로덕션 빌드 통과
5) pnpm run size           # 번들 예산 (해당 앱에 영향 시)
6) pnpm run test:e2e       # Playwright (사용자 플로우/라우팅 바꿨을 때만)
```

개발 중에는:

- `pnpm run test:watch` — 관련 스펙만 자동 재실행하며 TDD.
- `pnpm run storybook` — 컴포넌트를 상태별로 눈으로 확인.
- `pnpm run coverage` — 커버리지 확인(빈 구멍 파악용, 수치 강제 아님).

**어떤 테스트를 쓰나:**

- 로직/유틸/스토어/컴포넌트 동작 → **유닛/컴포넌트(Vitest)**.
- 파괴적 가드(자동 삭제·저장 등) 변경 → **회귀 스펙 필수** + 반대 방향(안티 가설) 케이스.
- 라우팅·인증·다화면 플로우 → **E2E(Playwright)**.
- 단순 className/문서 변경 → 회귀 스펙 비용 > 가치면 스킵하되 **커밋 본문에 사유 명시**.

**보고 원칙:** "spec PASS = 검증 완료"로 단정하지 않는다. 검증된 영역 / 미검증 영역(end-to-end
등) / 추가 검증 비용을 분리해 보고한다(→ `05-working-with-claude.md`).

## Git hooks (husky) — 언제 무엇이 실행되나

커밋·검증을 사람 손에 맡기지 않고 **git 훅으로 자동 강제**한다. husky가 훅을 관리한다.

**설치 (1회):** 루트 `package.json`의 `"prepare": "husky"` 덕분에 `pnpm install` 시 `.husky/`가
초기화된다. 모노레포에서는 **git 루트에 한 번만** 설치된다. 훅 파일은 실행 가능해야 한다
(`chmod +x .husky/pre-commit .husky/commit-msg`).

**발동 시점:**
| 훅 | 시점 | 실행 | 목적 |
| --- | --- | --- | --- |
| `pre-commit` | `git commit` 직전 | `npx lint-staged` | **스테이징된 파일만** oxlint→eslint→prettier 자동 수정. 포맷/린트 깨진 채로는 커밋 불가 |
| `commit-msg` | 메시지 작성 직후 | `npx --no-install commitlint --edit` | Conventional Commits 형식·타입 검증. 규약 위반 메시지 차단 |
| `pre-push` | `git push` 직전 | `npm run type-check` | 타입 오류가 있는 코드가 원격에 올라가지 않게 차단(로컬에서 CI 앞단 방어) |

- `lint-staged` 설정(`.lintstagedrc.json`): `*.{ts,vue}`는 oxlint→eslint→prettier, 그 외는 prettier.
  **전체가 아니라 변경 파일만** 대상이라 빠르다.
- `commit-msg`가 막는 예: `수정함`(타입 없음), `feature: ...`(허용 안 되는 타입) → 실패.
  `feat: add user avatar` → 통과.

**정책:**

- **`git commit --no-verify`(-n)로 훅 우회 금지.** 훅 실패는 무시가 아니라 원인 해결로 대응한다.
- 훅은 **로컬 1차 방어선**일 뿐이다. 최종 강제는 CI(lint/type-check/test/build/size)가 한다 —
  훅을 우회해도 PR CI에서 막힌다(→ `70-git-and-reviews.md`).
- 커밋은 `prepare-commit` 스킬을 쓰면 훅 발동 전에 브랜치 가드 + 4단 점검까지 끝난다.

**트러블슈팅:**

- 훅이 안 돈다 → `.husky/` 있는지, `pnpm install`로 `prepare` 실행됐는지, 파일 실행권한 확인.
- `commitlint: command not found` → devDependencies 설치 여부 확인(루트에서 `pnpm install`).

## 커밋

- **Conventional Commits** — commit-msg 훅에서 commitlint 강제.
  허용 타입: `feat fix docs style refactor perf test build ci chore revert`.
- **pre-commit** — lint-staged(스테이징 파일에 oxlint→eslint→prettier).
- 대화형 커밋은 `pnpm run commit` (cz-git).
