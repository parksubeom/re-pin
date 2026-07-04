# M1 — 영속화 계획 (plan-feature 산출물)

> `/plan-feature` 스킬의 산출물. MVP-PLAN.md의 M1을 착수 가능한 단계로 쪼갠 **합의된 계획**.
> 각 단계는 build 스킬(`gen-api-types`·`create-slice`·`create-component`·`write-test`)로 위임한다.
> 승인일: 2026-07-04 · 저장소: Supabase(Postgres+Storage+RLS) · 범위: 데이터 영속화 **+ 이미지 업로드**

## 의도 (인터뷰 요약)

- **누가**: 제작자(로그인)와 클라이언트(노로그인, shareToken 링크).
- **무엇을 / 왜**: 지금은 메모리 전용이라 새로고침하면 핀·회차가 다 날아간다. 이걸 진짜 저장해서,
  클라이언트가 링크를 다시 열어도 자기 핀·회차가 남아 있고, 제작자도 나중에 확인할 수 있게 한다.
  "수정 횟수 자동 카운트"가 제품 핵심 가치이므로, 그 카운트가 영속돼야 신뢰 장치가 된다.
- **완료 기준**: `/r/<shareToken>` 을 다른 브라우저/새로고침으로 열어도 (1) 시안 이미지 (2) 이전에
  찍은 핀 (3) 제출된 회차·잔여 횟수가 그대로 보인다. 제작자는 시안을 업로드해 새 프로젝트+링크를 만들 수 있다.

## 도메인 불변식 (서버에서 강제 — MVP-PLAN 유지)

1. 핀은 draft일 때만 수정/삭제. submitted 이후 불변.
2. Round.no 는 제출 순서대로 단조 증가, 되돌리지 않는다(증거 가치).
3. 잔여 = includedRounds − rounds.length, 음수 없음(초과분 별도 표시).
4. shareToken을 아는 사람은 그 프로젝트의 핀 읽기/쓰기만 가능(RLS). 다른 프로젝트 접근 불가.

## 저장소 매핑 (Postgres)

```
projects  (id, title, client_name, draft_image_path, share_token UNIQUE, included_rounds, created_at)
rounds    (id, project_id FK, no, submitted_at, UNIQUE(project_id, no))
pins      (id, project_id FK, round_id FK NULL, x, y, comment, author_name, status, created_at)
```
- 이미지: Supabase Storage 버킷 `drafts/`, DB엔 경로만. 공개 읽기 or 서명 URL.
- RLS: `share_token` 기반 정책 + 제작자 소유(auth) 정책. M1에선 shareToken 경로부터.

## 단계 (얇은 tracer bullet → 살 붙이기)

FSD 매핑 원칙(`rules/20·40`, `rules/next/state-and-data`): 서버 데이터는 **RSC에서 직접 조회**,
변경은 **Server Action**, 리소스 쿼리는 `entities/*/api`, 액션은 `features/*/api`.

### 단계 0 — Supabase 배선 (기반)
- Supabase 프로젝트 생성, `.env.local`(URL·anon key·service key), `src/shared/api/supabase.ts` 클라이언트(server/client 분리).
- 스키마 SQL(위 3테이블 + RLS + Storage 버킷) → `supabase/migrations/`.
- 스킬: (수동 설정) → `create-slice`(shared/api). 검증: 로컬에서 클라이언트로 연결 ping.

### 단계 1 — tracer bullet: shareToken 조회 영속화 ⭐
가장 얇게 끝-끝 도는 한 조각. 데모 하드코딩을 실제 조회로 교체.
- `entities/project/api` — `getProjectByShareToken(token)` (RSC용 서버 조회, 핀·회차 포함).
- seed 로 데모 프로젝트 1건 삽입 → `/r/demo` 가 DB에서 읽어 렌더(핀 0개라도).
- `ClientReviewPage` 를 async 서버 컴포넌트로, 조회 결과를 `ReviewCanvas`에 props로.
- 스킬: `gen-api-types`(선택) → `create-slice`(entities/project/api) → `create-component`(page async화).
- **검증**: `/r/demo` 새로고침해도 시안·정책이 DB에서 온다. 없는 토큰은 404(notFound).

### 단계 2 — 핀 쓰기 영속화
- `features/drop-pin/api` — `addPin` **Server Action**('use server'), 삽입 후 `revalidatePath`.
- `PinLayer` 의 로컬 onAdd → Server Action 호출로 교체(낙관적 갱신은 선택).
- 불변식 1(draft만) 서버에서 방어.
- 스킬: `create-slice`(features/drop-pin/api) → `write-test`(불변식). **검증**: 핀 찍고 새로고침 → 남아 있음.

### 단계 3 — 회차 제출 트랜잭션
- `features/submit-round/api` — `submitRound` Server Action: draft핀 묶음 → 새 round 생성 +
  핀 status/round_id 갱신을 **단일 트랜잭션(RPC)**. 불변식 2·3 서버 강제.
- `SubmitRoundBar` onSubmit → Server Action.
- 스킬: `create-slice` → `write-test`(회차 단조성·잔여 계산). **검증**: 제출 후 새로고침 → 회차·잔여 유지.

### 단계 4 — 시안 이미지 업로드 (제작자)
- `features/create-project/api` — 이미지 Storage 업로드 + projects insert + shareToken 발급 Server Action.
- 대시보드에 최소 업로드 폼(파일 선택 → 링크 발급 → 복사). `DashboardPage` 스텁을 실동작으로.
- 스킬: `create-slice`(features/create-project) → `create-component`(업로드 폼) → `write-test`.
- **검증**: 이미지 올려 새 프로젝트 → 발급된 `/r/<token>` 이 그 시안으로 열림.

## 자기비평 (critic)

- **범위 누수 위험**: 단계 4의 "제작자 로그인"은 M2 소관 → M1에선 로그인 없이도 만들 수 있게
  대시보드 업로드를 임시로 열어두거나 seed 소유자로 처리. 인증은 M2로 미룬다(명시).
- **빠진 상태**: 이미지 업로드 실패/용량초과, 존재하지 않는 shareToken(404), 잔여 0에서 제출 시도 →
  각 단계 검증에 에러 케이스 포함(`rules/next/error-handling`).
- **파괴적 변경**: 현재 메모리 상태 로직을 지우게 됨 → 단계별로 교체하며 각 단계 검증 후 다음으로.
  롤백 가능하도록 단계별 커밋(`prepare-commit`).
- **더 단순한 길**: localStorage로도 "새로고침 생존"은 되지만, 다른 기기·제작자 확인·증거가치가
  안 됨 → 제품 핵심(신뢰 장치)과 안 맞아 Supabase 유지가 맞다.
- **openapi 타입**: Supabase는 `supabase gen types` 로 DB 타입 생성 가능 → `rules/40`의 생성-타입
  원칙과 정합. 손으로 요청/응답 타입 쓰지 않는다.

## 일상어 요약 (확인용)

① Supabase에 저장 공간 연결 → ② 링크(`/r/demo`)를 열면 저장된 시안이 뜨게 → ③ 찍은 핀이 저장돼
새로고침해도 남게 → ④ "수정 요청 제출"이 회차로 진짜 저장되고 잔여 횟수가 유지되게 →
⑤ 제작자가 시안 이미지를 올려 새 공유 링크를 만들 수 있게. 각 단계 끝에 실제로 새로고침해서 확인.
