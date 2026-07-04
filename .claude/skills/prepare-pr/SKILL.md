---
name: prepare-pr
description: PR 올리기 직전 검증 runbook을 실행하고 PR 설명(무엇을/왜/검증)을 pr-review-checklist 템플릿으로 작성한 뒤 리뷰 포인트를 요약한다. 보호 브랜치 직접 머지는 하지 않고 명령을 안내한다. "PR 준비", "PR 올려" 요청 시 사용.
---

# PR 준비

`rules/70-git-and-reviews.md`와 `docs/ai/pr-review-checklist.md`를 실행한다. `prepare-commit`이
커밋 단위를 맡는다면, 이 스킬은 **PR 단위**를 맡는다.

## 1. 브랜치·동기화 확인
- feature 브랜치인지 확인(`git branch --show-current`). 보호 브랜치면 중단.
- 원격 봇 커밋 등으로 뒤처졌으면 `git pull --ff-only`(divergent면 `--no-rebase`)로 최신화.

## 2. 검증 runbook (`rules/50`)
```
pnpm run test → type-check → lint → build → size → (필요 시) test:e2e
```
하나라도 실패하면 PR을 만들지 말고 먼저 고친다. 여유가 되면 `review-changes`로 자기 리뷰 1회.

## 3. PR 설명 작성
`docs/ai/pr-review-checklist.md`의 본문 템플릿을 채운다:
- **무엇을** — 사용자 경험 표현 + (짧은 기술 노트)
- **왜** — 배경/문제/관련 이슈
- **어떻게 검증** — 위 runbook 체크 + 미검증 영역 명시(`rules/05`)
- **영향 범위/리스크** — 파괴적 변경 여부, 롤백 방법

## 4. 리뷰어용 요약
- 리뷰어가 집중해서 볼 파일/결정 지점을 3줄 이내로 짚어 준다.
- 스크린샷/재현 절차(UI 변경 시), 관련 ADR 링크(구조/도구 결정 시).

## 5. 푸시·PR 생성 안내 (직접 머지 금지)
- `git push -u origin <feature>` 명령을 안내한다(에이전트가 보호 브랜치로 머지하지 않음, `rules/70`).
- PR 생성 링크와 위 설명 초안을 함께 제시한다. 머지는 CI green + 리뷰 승인 후 사람이.
