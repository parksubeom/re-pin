import { describe, expect, it } from 'vitest'

import { mapSubmitRoundError } from './submitRoundError'

describe('mapSubmitRoundError', () => {
  it('없는 공유 토큰(P0002)은 404로 매핑한다', () => {
    expect(mapSubmitRoundError('P0002', 'x')).toMatchObject({ status: 404 })
  })

  it('제출할 draft 핀이 없으면(P0003) 409로 매핑한다', () => {
    expect(mapSubmitRoundError('P0003', 'x')).toMatchObject({ status: 409 })
  })

  it('잔여 회차가 없으면(P0004) 409로 매핑한다', () => {
    expect(mapSubmitRoundError('P0004', 'x')).toMatchObject({ status: 409 })
  })

  it('알 수 없는 코드는 500으로, 원본 메시지를 보존한다', () => {
    expect(mapSubmitRoundError(undefined, 'boom')).toEqual({
      status: 500,
      message: 'boom',
      code: undefined,
    })
  })
})
