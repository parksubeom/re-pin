# 템플릿 — CI 워크플로 (GitHub Actions)

`rules/90-ci.md`의 실행 템플릿. 새 모노레포(pnpm + Turborepo)에 `.github/workflows/ci.yml`로 넣는다.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true

jobs:
  verify:
    name: Lint · Type-check · Test · Build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0 # turbo --filter가 변경 범위를 계산하려면 히스토리 필요

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      # turbo가 캐시 히트한 패키지는 스킵한다.
      - name: Lint · Type-check · Test · Build
        run: pnpm turbo run lint type-check test build

      - name: Bundle size budget
        run: pnpm run size

  e2e:
    name: E2E (Playwright)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Install Playwright browsers
        run: pnpm exec playwright install --with-deps chromium

      # 변경 영향 앱만 E2E (기준 브랜치 대비)
      - name: Run E2E
        run: pnpm turbo run test:e2e --filter=...[origin/main]

      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: '**/playwright-report/'
          retention-days: 7
```

## 주의
- **format 검증**은 `turbo run lint`에 포함하거나 별도 `pnpm prettier --check .` 단계로 둔다(수정 아님, 검증만).
- **원격 캐시**(Turborepo Remote Cache / Vercel)를 붙이면 PR마다 변경 없는 패키지 재검증을 건너뛴다 —
  `TURBO_TOKEN`/`TURBO_TEAM`을 GitHub Secrets로 주입(`rules/80`).
- 브랜치 보호 규칙에서 `verify`·`e2e`를 **required status check**로 지정해 실제 머지 게이트로 만든다(`rules/70`).
- 단일 패키지 repo면 `pnpm turbo run ...` 대신 개별 스크립트(`pnpm run lint` 등)로 대체 가능.
