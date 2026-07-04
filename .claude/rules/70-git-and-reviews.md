# 70. Git 워크플로 & 코드 리뷰

> **쉽게 말하면:** 본 줄기(main)에 바로 넣지 말고, 갈래를 만들어 검토(PR)를 거친다.

## 브랜치 정책

- **보호 브랜치 직접 커밋/푸시 금지**: `main`, `develop`, `develop-*` 등 공유 통합 브랜치.
  모든 변경은 **feature 브랜치 → PR → 리뷰 → 머지**.
- feature 브랜치 네이밍: `feat/<scope>`, `fix/<scope>`, `chore/<scope>`.
- Claude/에이전트는 보호 브랜치로의 로컬 머지·푸시를 **자동 수행하지 않는다.** 필요한 git 명령을
  코드 블록으로 제시하고 사용자가 직접 실행한다. (push 승인이 있어도 후속 머지는 별도 승인 대상)

## 커밋

- Conventional Commits + commitlint 강제(`rules/50`). 한 커밋 = 한 논리 변경.
- 커밋 전 `prepare-commit` 스킬로 브랜치 가드 + 관심사/중복/재사용 4단 점검.

## PR

- 작게, 리뷰 가능한 단위로. 제목은 Conventional Commit 형식.
- 본문에 **무엇을·왜·어떻게 검증했는지** + 스크린샷/재현 절차(해당 시). 템플릿:
  [`docs/ai/pr-review-checklist.md`](../docs/ai/pr-review-checklist.md).
- CI(lint/type-check/test/build/size)가 초록이어야 머지.

## 리뷰

- 리뷰는 **정확성(버그)** 과 **정리(재사용/단순화/효율)** 를 분리해서 본다.
- 파괴적 부수효과(자동 삭제·저장·정리 가드)를 바꾸는 PR은 "반대 방향 실패 모드"까지 점검(안티 가설).
- 지적은 `file:line`으로. 억제(eslint-disable, ts-ignore)로 통과시키지 않는다.

## 동기화

- push 후 원격에 봇/후속 커밋이 붙는 환경이면, 다음 작업 전 `git pull --ff-only`(또는
  divergent 시 `--no-rebase`)로 즉시 최신화한다. 단순 `git pull` 대신 전략 플래그를 명시.
