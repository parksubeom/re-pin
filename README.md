# re-pin (수정핀)

> **크몽·외주 디자인 수정 요청 관리 — 클라이언트는 시안에 핀만 콕, 수정 횟수는 자동 카운트.**

외주 디자인 작업에서 "수정 3회 포함"은 늘 분쟁의 씨앗이다. 요청은 카톡·메일·전화로 흩어지고,
몇 번째 수정인지는 아무도 정확히 모른다. re-pin은 이걸 **링크 하나**로 바꾼다.

- **클라이언트** — 로그인 없이 공유 링크(`/r/<token>`)를 열고, 시안 위에 핀을 콕 찍어 코멘트를 남기고,
  모아서 "수정 요청 제출". 몇 회차를 썼고 몇 회가 남았는지 항상 보인다.
- **제작자** — 시안 이미지를 올리면 공유 링크가 발급된다. 회차·핀 현황이 대시보드에 쌓이고,
  수정 횟수는 서버가 강제로 센다(되돌릴 수 없음 — 증거 가치).

<!-- TODO: 스크린샷 1장 (클라이언트 리뷰 화면 — 핀 + 잔여 횟수 바) -->

## 동작 방식

```
제작자: 시안 업로드 → 공유 링크 발급 → 클라이언트에게 전달
클라이언트: 링크 열기(로그인 없음) → 핀 찍기 → 코멘트 → 회차 제출
서버: 회차 번호 단조 증가 · 잔여 횟수 자동 차감 · 제출된 핀은 불변(DB 트리거로 강제)
```

핵심 불변식은 전부 **데이터베이스 레벨**에서 강제된다 — 핀은 draft일 때만 수정/삭제 가능,
회차 번호는 재사용 불가, 잔여 횟수는 음수가 되지 않는다.

## 스택

| 영역       | 선택                                                                                  |
| ---------- | ------------------------------------------------------------------------------------- |
| 프레임워크 | Next.js 15 (App Router) · React 19 · TypeScript strict                                |
| 아키텍처   | Feature-Sliced Design (Next 트랙: `pageViews` 레이어)                                 |
| 데이터     | Supabase (Postgres + Storage + RLS) · 회차 제출은 원자적 RPC                          |
| API 레이어 | Route Handlers ← OpenAPI 스키마 ← openapi-typescript → openapi-fetch → TanStack Query |
| 인증       | 제작자만 매직링크(Supabase Auth) — 클라이언트는 영원히 노로그인                       |
| 품질       | Vitest · Playwright · oxlint + ESLint(FSD boundaries) · husky + commitlint            |

## 상태

MVP 개발 중. 영속화(M1)·제작자 인증/소유권(M2)·보안 점검까지 완료, 회차 확인서·OG 태그(M3) 예정.
로드맵은 [docs/MVP-PLAN.md](./docs/MVP-PLAN.md).

## 로컬 실행

```sh
pnpm install
cp .env.example .env.local   # Supabase URL·키 채우기 (파일에 안내 주석 있음)
# supabase/migrations/ 의 SQL을 Supabase SQL Editor에서 실행
pnpm dev                     # http://localhost:3000
```

품질 게이트: `pnpm run lint && pnpm run type-check && pnpm run test && pnpm run build`

---

Built with **[bumpist-code](https://github.com/parksubeom/bumpist-fe-guide)** — 이 프로젝트는
bumpist-code 가이드(규칙 + Claude Code 스킬)의 Next.js 트랙 첫 실전 검증 사례다. 여기서 발견된
지뢰 3종(pageViews 개명 등)이 가이드 v0.5.1로 환류됐다.
