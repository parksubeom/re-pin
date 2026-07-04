# M1 Step-0 — 부트스트랩 + Supabase 배선 (확정 설계)

> 2회의 다관점 설계·적대적 검증 워크플로우로 확정. rules/00·40·50·80 준수 경로.
> 데이터 레이어 결정: **Supabase(DB/Storage/RLS) ← Next Route Handler(app/api/**) ← OpenAPI 스키마
> ← openapi-typescript(gen:api → schema.d.ts) ← openapi-fetch ← React Query 훅** (+ RSC 직접 조회).

## 사전 발견 (실제 프로젝트 상태)

sujungpin은 `create-next-app` 최소 골격 + FSD 스캐폴딩만 있는 상태. **품질 게이트·API 레이어·테스트
툴링이 아직 없다** (react-query·openapi-fetch·eslint.config·vitest·shared/api 전부 없음). 따라서
Step-0은 **두 부분**으로 나뉜다:

### Part A — 부트스트랩 (`setup-fe-project` / `templates/app-next` 복사)

허브 `templates/app-next/`의 실물을 복사해 팀 표준 인프라를 얹는다 (임의 작성 금지, rules/10).

- 복사: `eslint.config.ts` · `tsconfig.json` · `next.config.ts`(next-intl) · `middleware.ts` ·
  `vitest.config.ts`+`setup` · `playwright.config.ts` · `src/app/{layout,providers,globals.css}` ·
  `src/shared/api/query-client.ts` · `src/shared/config/i18n/*` · `locales/{ko,en}/`.
- devDeps + 런타임: `INSTALL.md` 목록대로 (eslint 스택·oxlint·prettier·vitest·RTL·playwright /
  next·react·zustand·@tanstack/react-query·next-intl·cva·clsx·tailwind-merge·**openapi-fetch**·tailwind).
  `openapi-typescript`는 -D.
- `package.json` 스크립트: `dev·build·start·type-check·lint·test·test:e2e`.
- **주의**: 템플릿은 `/[locale]/...` 라우팅(next-intl)을 도입한다 → 기존 `app/r/[shareToken]`·`app/page`가
  `app/[locale]/...`로 재배치될 수 있다. middleware matcher는 `/api` 제외.
- 검증: `pnpm install && pnpm run lint && pnpm run type-check && pnpm run test && pnpm run build` + 커밋 1회(husky).

### Part B — Supabase 배선 (Part A 위에)

**신규 의존성 (정확히 핀, lockfile 커밋 — rules/80):**

| 패키지                  | 버전     | 구분    | 사유                                                      |
| ----------------------- | -------- | ------- | --------------------------------------------------------- |
| `@supabase/supabase-js` | 2.58.0   | runtime | Postgres+Storage+RPC 유일 지원 클라이언트. 서버 전용 사용 |
| `server-only`           | 0.0.1    | runtime | 서버 전용 모듈이 클라 번들에 새면 빌드 에러(가드)         |
| `openapi-fetch`         | (템플릿) | runtime | 이미 부트스트랩에 포함                                    |
| `openapi-typescript`    | (템플릿) | dev     | 이미 부트스트랩에 포함                                    |

**환경변수 (`.env.local` 생성 완료, secret은 사용자가 붙여넣음):**

- `NEXT_PUBLIC_SUPABASE_URL` (노출 안전)
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (sb_publishable_…, 브라우저 안전, RLS 게이트)
- `SUPABASE_SECRET_KEY` (sb_secret_…, **서버 전용**, NEXT_PUBLIC_ 금지) — 레거시 service_role 대체
- `SUPABASE_PROJECT_REF` (gen 툴링용)

**생성 파일:**

- `supabase/migrations/0001_init_schema.sql` · `0002_pin_mutability_triggers.sql` · `0003_submit_round_and_rls.sql`
  (아래 SQL). 사용자가 Supabase SQL 에디터/`db push`로 실행.
- `src/shared/api/supabase.server.ts` — `import 'server-only'` + 모듈 스코프 secret 클라이언트.
- `openapi.json` (앱 루트, 손수 작성) — /api 경로 명세. `x`/`y` 0..1, `round_id`/`round_no` nullable.
- `scripts/gen-api.mjs` — `pnpm exec openapi-typescript $OPENAPI_SCHEMA -o src/shared/api/schema.d.ts`
  (npx 금지, platform 분기 없음, PowerShell에서 `$env:OPENAPI_SCHEMA=...; pnpm run gen:api`).
- `src/shared/api/client.ts` — `createClient<paths>({ baseUrl: '/api' })`, 브라우저 안전(서버 import 없음).
- Route Handlers `app/api/**`: GET project / POST·PATCH·DELETE pins / POST rounds. 얇게, 로직은 슬라이스 서버 fn.
- `entities/project/api/getProjectByShareToken.ts` (RSC 직접 조회, `import 'server-only'`, createSignedUrl 에러 검사).
- `entities/project/model/queryKeys.ts` (server-only import 없음) + `useProjectQuery.ts` + **분리된 barrel**.
- `features/{add-pin,edit-pin,submit-round}/api/*.server.ts` + 훅. `create-project`는 **Server Action**(폼+업로드).
- 설정 제외: `.prettierignore`·`.oxlintrc.json`에 `src/shared/api/schema.d.ts` (eslint/vitest는 템플릿에 이미).

**핵심 불변식·보안 (검증이 확정한 fix들):**

- 핀은 draft로 태어나고(트리거), draft일 때만 수정/삭제. submitted는 content+round 바인딩 동결.
- `submit_round(share_token)` SECURITY DEFINER: advisory lock + row lock, 용량 초과 거부, `no`는
  `projects.next_round_no`(되감기 없는 카운터)에서 할당 → 삭제 후에도 재사용 안 됨.
- 서로 다른 SQLSTATE(P0002=404 / P0003=409 no-draft / P0004=409 no-remaining) → 핸들러가 `error.code`로 매핑.
- RLS enable + anon/authenticated deny-by-default. **service_role에 명시적 GRANT** (NOSUPERUSER라 필요).
- `pins.round_id → rounds ON DELETE NO ACTION` + cascade-bypass GUC + `delete_project()` wrapper
  (RESTRICT은 프로젝트 삭제 cascade를 깨뜨림 — 검증이 잡음).
- Storage `drafts` 버킷 **private**, 서버가 `createSignedUrl`로만 읽음(getPublicUrl 금지).
- `resolve_pin`은 M2(제작자 인증)로 연기 — M1에선 어떤 anon 경로에도 노출 안 함.
- 모든 mutation은 token→project_id 재도출 후 `AND project_id = <scoped>`로 스코핑(크로스 프로젝트 차단).

## 사용자 체크리스트 (에이전트가 못 하는 것)

- [x] Supabase 프로젝트 생성 (완료)
- [ ] `.env.local`의 `SUPABASE_SECRET_KEY=`에 sb_secret 값 붙여넣기
- [ ] 마이그레이션 `0001→0002→0003` 실행 (SQL 에디터 or `supabase db push`)
- [ ] `drafts` 버킷 private 확인 (`select public from storage.buckets where id='drafts'` → false)
- [ ] GRANT 확인 (`select has_function_privilege('service_role','public.submit_round(text)','execute')` → true)

## Step-0 완료 기준 (DoD, M1 단계 1~4는 아직 아님)

1. 의존성 설치·핀 완료, lockfile 커밋.
2. 마이그레이션 3개 무오류 실행 + 위 두 검증 쿼리 통과.
3. 연결 ping — 서버 전용에서 `select count(*) from projects` → 권한 에러 없이 0.
4. `pnpm run gen:api` → `src/shared/api/schema.d.ts` 생성, `@/shared/api/schema` import 해결.
5. `pnpm run type-check` green (strict + noUncheckedIndexedAccess, DB row→ProjectView 매퍼 포함).
6. `pnpm run lint` green + schema.d.ts가 4곳에서 제외.
7. `pnpm run build` 통과 (server-only 누출 없음 = barrel 분리 검증).

## 확정 SQL

`docs/sql/` 에 3개 파일로 저장 (다음 커밋). 내용은 워크플로우 종합 결과의 (C)절 그대로:
0001 init_schema / 0002 pin_mutability_triggers / 0003 submit_round_and_rls.
