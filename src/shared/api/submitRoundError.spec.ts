import { describe, expect, it } from 'vitest'

import { mapSubmitRoundError } from './submitRoundError'

describe('mapSubmitRoundError', () => {
  it('없는 공유 토큰(P0002)은 404로 매핑한다', () => {
    expect(mapSubmitRoundError('P0002')).toMatchObject({ status: 404 })
  })

  it('제출할 draft 핀이 없으면(P0003) 409로 매핑한다', () => {
    expect(mapSubmitRoundError('P0003')).toMatchObject({ status: 409 })
  })

  it('잔여 회차가 없으면(P0004) 409로 매핑한다', () => {
    expect(mapSubmitRoundError('P0004')).toMatchObject({ status: 409 })
  })

  it('알 수 없는 코드는 500 + 일반 메시지로 — DB 원문을 응답에 싣지 않는다', () => {
    expect(mapSubmitRoundError(undefined)).toEqual({
      status: 500,
      message: 'submit failed',
      code: undefined,
    })
  })
})
