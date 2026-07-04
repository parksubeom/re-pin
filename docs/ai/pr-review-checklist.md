# PR & 리뷰 체크리스트

`rules/70-git-and-reviews.md`의 실행 템플릿. PR 본문/리뷰에 복사해 사용한다.

## PR 본문 템플릿
```markdown
## 무엇을 (What)
<변경 요약 — 사용자 경험 표현 (짧은 기술 노트)>

## 왜 (Why)
<배경 / 해결한 문제 / 관련 이슈>

## 어떻게 검증했나 (How verified)
- [ ] pnpm run lint
- [ ] pnpm run type-check
- [ ] pnpm run test
- [ ] pnpm run build
- [ ] (해당 시) pnpm run test:e2e
- [ ] (UI) 스크린샷 / Storybook 확인
- 미검증 영역: <end-to-end 등 남은 부분>

## 영향 범위 / 리스크
<파괴적 변경 여부, 롤백 방법>
```

## 리뷰어 체크리스트
- [ ] **범위** — 요청 범위 내 변경인가? 무관한 리팩터링이 섞이지 않았나? (`rules/10`)
- [ ] **아키텍처** — FSD 계층·import 방향 준수? public API(index.ts) 경유? (`rules/20`)
- [ ] **컴포넌트** — `interface Props`/cva/cn/Tailwind 전용 규칙 준수? (`rules/30`)
- [ ] **상태/API** — 서버 상태는 Vue Query? 생성 타입 사용? (`rules/40`)
- [ ] **테스트** — 신규 컴포넌트에 spec+stories? 로직/가드 변경에 회귀 스펙? (`rules/50`)
- [ ] **에러/UX** — 토스트 중복 없음? 메시지 SSoT? (`rules/60`)
- [ ] **보안** — 시크릿 하드코딩 없음? .env.example 갱신? (`rules/80`)
- [ ] **정확성** — 반대 방향 실패 모드(안티 가설) 점검 (파괴적 가드 변경 시)
- [ ] **정리** — 재사용/단순화/중복 제거 여지
- [ ] CI 초록, size 예산 이내
```
