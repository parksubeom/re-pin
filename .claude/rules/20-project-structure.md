# 20. 프로젝트 구조 — 모노레포 + Feature-Sliced Design

> **쉽게 말하면:** 파일을 역할별 층으로 정리하고, 위층은 아래층만 가져다 쓴다.

## 모노레포 레이아웃 (pnpm + Turborepo)

```
repo/
  pnpm-workspace.yaml       # apps/*, packages/*
  turbo.json                # build/type-check/lint/test 태스크 그래프
  package.json              # 루트(private): turbo + 전역 도구(husky/commitlint/prettier)
  tsconfig.base.json        # 앱이 extends하는 공통 strict 옵션
  apps/
    admin/                  # 관리자 앱 (FSD)
    service/                # 서비스 앱 (FSD)
  packages/
    ui/                     # 앱 간 공유 디자인 시스템 컴포넌트
    config/                 # 공유 eslint/prettier/tsconfig 프리셋
```

**배치 규칙**: 저장소 전역 1회성 도구(husky, commitlint, prettier, turbo, size-limit)는 루트에,
앱별로 달라지는 도구(vite, vitest, playwright, storybook, eslint, tailwind)는 각 앱 안에.

## FSD 계층 (상위 → 하위)

```
app → pages → widgets → features → entities → shared
```

- **규칙**: 한 계층은 자기 자신과 **엄격히 하위인** 계층만 import할 수 있다.
  예) `features`는 `entities`/`shared`는 되지만 `pages`는 절대 안 됨.
- `eslint-plugin-boundaries`가 빌드를 실패시켜 강제한다. 위반은 억제하지 말고 구조를 고친다.

각 계층 역할:

- `app/` — 부트스트랩(프로바이더/라우터/전역 스타일)
- `pages/` — 라우트 화면, 지연 로딩
- `widgets/` — features/entities 조합 UI 블록
- `features/` — 사용자 액션/시나리오
- `entities/` — 비즈니스 엔티티(model + api + 표현)
- `shared/` — 도메인 비종속 재사용(`ui/`, `lib/`, `api/`, `config/`)

## 슬라이스 구조 & Public API

```
features/<name>/
  ui/        컴포넌트 (Vue: PascalCase.vue / React: PascalCase.tsx)
  model/     클라이언트 상태 스토어 / 컴포저블·훅  (rules/<fw>/state-and-data)
  api/       서버 상태 쿼리 훅, 쿼리 키 colocation  (rules/<fw>/state-and-data)
  lib/       순수 계산 함수 (도메인에 묶이되 부수효과 없음)  (아래 "관심사 분리 판단 기준")
  index.ts   PUBLIC API — 다른 슬라이스는 오직 이 barrel에서만 import
```

(FSD 계층·경계 규칙은 프레임워크 무관. 세그먼트 내부 구현 규칙은 `rules/vue/*` 또는 `rules/react/*`.)

- 슬라이스 간 import는 항상 `index.ts`를 통해서. 깊은 경로 직접 접근 금지.
- `@/` alias 사용 (`import { BaseButton } from '@/shared/ui'`).

## 관심사 분리 판단 기준 (Layer × Slice × Segment)

> **쉽게 말하면:** "이 코드 어디에 둘까"를 감이 아니라 세 축 + 다섯 질문으로 정한다.
> 위치가 곧 그 코드의 정체(어느 계층의, 어떤 도메인의, 무슨 역할)를 말하게 만드는 게 목표다.

코드를 새로 쓰거나 옮길 때는 먼저 세 축으로 자리를 잡는다.

- **Layer(수직) — 권력(의존성) 기준.** 누가 누구를 참조할 수 있는가. (위 "FSD 계층" 규칙)
- **Slice(수평) — 주제(도메인) 기준.** `product` · `cart` · `user`처럼 비즈니스 단위로 나눈다.
- **Segment(직무) — 역할 기준.** 한 슬라이스 안에서 하는 일로 나눈다(아래 4종).

| 세그먼트 | 역할      | 부수효과   | 예                                     |
| -------- | --------- | ---------- | -------------------------------------- |
| `lib/`   | 순수 계산 | 없음       | `calculateCartTotal`, `canApplyCoupon` |
| `model/` | 상태·액션 | 있음       | `useCart`, cart 스토어                 |
| `api/`   | 서버 상태 | 있음(I/O)  | `useUsersQuery`                        |
| `ui/`    | 표현      | 있음(렌더) | `ProductCard`                          |

- `shared/lib` = 도메인을 모르는 범용 순수 함수(`formatCurrency`, `useDebounce`),
  `entities/<domain>/lib` = 특정 도메인에 묶인 순수 계산.
- 클라이언트 상태(`model`)와 서버 상태(`api`)를 섞지 않는 규칙은 `rules/<fw>/state-and-data`.

### 슬라이스는 얼마나 잘게 나누나 (생성·병합 기준)

세그먼트 위치 못지않게 자주 막히는 게 "이걸 새 슬라이스로 뺄까, 기존에 얹을까"다. 기준:

- **도메인 명사 하나 = 슬라이스 하나.** `cart` · `product` · `coupon`처럼 비즈니스 명사가 떠오를 때만
  슬라이스를 만든다. 명사가 안 나오면 아직 슬라이스가 아니다 → 기존 슬라이스에 얹는다.
- **화면이 하나 늘었다고 만들지 않는다.** "이 도메인만의 데이터·계산·액션"이 생길 때 만든다.
- **entity vs feature 경계.** `entities`는 데이터·순수 계산·표현만(**사용자 액션 금지**).
  담기·삭제·제출 같은 사용자 액션은 `features`. 한 액션이 두 곳 이상에서 재사용되면 `features`로 승격.
- **widget은 그리기보다 조립.** 폼 상태·유효성 같은 로직은 `features`로 내리고, widget이 껍데기에
  가까워도 정상이다(조립이 곧 widget의 일).
- **병합.** 두 슬라이스가 늘 함께만 바뀌고 따로 재사용된 적이 없으면 하나로 합친다(질문 5의 응집도와 같은 잣대).

### 다섯 질문으로 세부 위치 확정

위 세 축으로 후보가 좁혀지면, 아래 질문을 순서대로 던진다. 대개 한 자리로 수렴한다.

| #   | 관심사       | 질문                                            | YES                    | NO                     |
| --- | ------------ | ----------------------------------------------- | ---------------------- | ---------------------- |
| 1   | 액션 vs 계산 | 100번 실행하면 외부(상태·저장소·화면)를 바꾸나? | `model`/`ui`에 남긴다  | `lib`로 격리(순수함수) |
| 2   | 도메인 지식  | 떼어내 다른 서비스에 가져가도 그대로 작동하나?  | `shared`               | `entities`/`features`  |
| 3   | 단일 책임    | 이 파일이 바뀌어야 할 이유가 2개 이상인가?      | 쪼갠다                 | 그대로 둔다            |
| 4   | 추상화 레벨  | 저수준 구현(How)이 비즈니스 로직에 섞였나?      | 훅/`lib`로 숨긴다      | 그대로 둔다            |
| 5   | 응집도       | 이게 바뀔 때 늘 함께 바뀌는 게 있나?            | 그 곁(같은 슬라이스)에 | 억지로 모으지 않는다   |

**중복 vs 공통화:** 비슷한 코드가 두 곳에 보여도 바로 합치지 않는다. **세 번째 등장(rule of three)**에서,
그리고 둘이 _같은 이유로_ 바뀔 때만 상위 공용(`shared` 등)으로 올린다. 우연히 닮았을 뿐 다른 이유로 변할
코드를 묶으면 결합도만 오른다(질문 5의 반대편).

**예) 장바구니 총합 계산** → Layer `entities`(도메인 데이터) · Slice `cart` · Segment `lib`
→ `entities/cart/lib/calculateCartTotal.ts`

> 좋은 구조는 폴더를 어떻게 나눴느냐가 아니라 **"왜 이렇게 나눴는가"를 설명할 수 있느냐**의 문제다.
> 위 기준은 팀이 그 설명을 공유하는 공통 언어다.
