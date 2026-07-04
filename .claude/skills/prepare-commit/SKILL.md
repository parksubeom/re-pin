---
name: prepare-commit
description: 커밋 직전 자동 점검 + Conventional Commit 메시지 작성. 브랜치 가드(보호 브랜치 직접 커밋 차단), 관심사/중복/재사용 점검, lint/type-check/test 확인 후 규약에 맞는 메시지 생성. "커밋 준비/커밋해" 요청 시 사용.
---

# 커밋 준비

`rules/50-testing-quality.md`(커밋 규약)와 `rules/70-git-and-reviews.md`(브랜치 정책)를 실행한다.

## 1. 사전 가드 (순서대로)
- **브랜치 확인** — `git branch --show-current`. 보호 브랜치(`main`, `develop`, `develop-*`)면
  **직접 커밋 금지** → feature 브랜치로 전환 안내 (`rules/70`).
- **범위 확인** — 스테이징 변경이 요청 범위 내인지. 범위 밖 리팩터링/구조 변경 섞였으면 분리
  (`rules/10-guardrails.md`).
- **품질** — `pnpm run lint && pnpm run type-check && pnpm run test` 통과 확인.
  (pre-commit 훅이 lint-staged로 다시 한 번 강제한다.)
- **자기 리뷰(선택)** — 변경이 크면 `review-changes`로 경계·스펙·시크릿·중복을 먼저 점검.

## 2. 변경 점검 4단
1. **관심사 분리** — 한 커밋은 한 논리 변경. 무관한 변경은 별도 커밋.
2. **중복** — 같은 로직이 여러 곳에 복붙됐는지. 있으면 공통화 검토.
3. **재사용** — 기존 shared/entities 유틸·컴포넌트로 대체 가능한지.
4. **공용 컴포넌트** — 새 UI가 `shared/ui`(또는 `packages/ui`)로 승격 대상인지.

## 3. 메시지
- Conventional Commits. 타입: `feat fix docs style refactor perf test build ci chore revert`.
- 제목은 명령형·간결. 본문은 "무엇을·왜". 중·대규모는 영역별 섹션으로 묶는다.
- `docs/`, 생성 파일 변경만이면 `docs`/`chore`.
- 대화형이 편하면 `pnpm run commit`(cz-git).
- **Co-Authored-By 트레일러는 팀 정책에 따름** (기본 미포함).

## 4. 회귀 스펙 가치 판단
단순 className/문서 변경 등 visual/문서 fix는 회귀 스펙 비용 > 가치일 수 있다. 스킵하면 사유를
커밋 본문에 명시. 로직/가드 변경은 스펙을 함께 추가(`rules/50`).
