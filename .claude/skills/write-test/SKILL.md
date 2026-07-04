---
name: write-test
description: Vitest 단위/컴포넌트 테스트, MSW 통합 테스트, Playwright E2E를 알맞은 층으로 스캐폴딩하고 작성한다. rules/50 원칙 적용. "테스트 작성", "스펙 추가", "테스트 만들어", "이 함수 테스트" 요청 시 사용.
---

# 테스트 작성

`rules/50-testing-quality.md`를 실행한다. 먼저 **무엇을 테스트하는지 → 어느 층인지**를 정한다.

## 층 선택
| 대상 | 층 | 위치 |
| --- | --- | --- |
| 유틸·컴포저블·Pinia 스토어 | 단위 (Vitest) | 소스 옆 `*.spec.ts` |
| Vue 컴포넌트(렌더·prop·emit) | 컴포넌트 (Vitest + `@vue/test-utils`) | 소스 옆 `*.spec.ts` |
| API 훅·화면 흐름(요청/응답) | 통합 (Vitest + MSW) | 소스 옆 `*.spec.ts` |
| 라우팅·인증·다화면 사용자 플로우 | E2E (Playwright) | `e2e/*.spec.ts` |

컴포넌트를 새로 만드는 경우엔 `create-component`가 스펙을 함께 생성하므로, 이 스킬은 **기존 코드에
테스트를 추가하거나 단위/통합/E2E를 별도로 작성**할 때 쓴다.

## 작성 원칙 (rules/50)
- **동작을 검증하고 구현을 검증하지 않는다.** "무엇을 하는가"를 테스트, 내부 구조 변화에 안 깨지게.
- 컴포넌트: `mount`로 렌더·prop 분기·emit + 외부 class의 tailwind-merge 충돌 해소까지.
- 스토어/컴포저블: setup-store를 직접 호출해 상태·액션 결과 검증(서버 데이터는 여기 없음).
- **파괴적 가드(자동 삭제·저장 등) 변경 → 회귀 스펙 필수** + 반대 방향(안티 가설) 케이스.
- describe/it 문구는 사용자 관점 자연어("썸네일이 없으면 텍스트가 보인다")로.

## 층별 패턴

### 단위/컴포넌트 (Vitest)
```ts
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
```
- happy-dom 환경. `@/` alias는 vitest.config가 vite에서 상속하므로 그대로 import.

### 통합 (Vitest + MSW)
- 실제 네트워크로 나가지 않게 **핸들러를 명시 등록**한다. 실패 케이스도 `HttpResponse.error()`로
  명시(핸들러 미등록으로 실패 유도 금지 — 비결정적 + 콘솔 노이즈).
- Vue Query 훅 테스트는 `QueryClient`를 케이스마다 새로 만들어 캐시 격리.

### E2E (Playwright)
- `e2e/`에 둔다(Vitest는 무시). CI는 build 후 preview를 띄워 실행.
- 셀렉터는 역할 기반(`getByRole`) 우선. 한국어 라벨은 `{ exact: true }`로 부분매칭 충돌 방지.
- 인증이 필요한 화면은 보호 라우트로 직접 이동해 리다이렉트를 활용.

## 검증
`pnpm run test`(+ 필요 시 `pnpm run test:e2e`). 통과를 "검증 완료"로 단정하지 말고
검증/미검증 영역을 분리해 보고(`rules/05`).
