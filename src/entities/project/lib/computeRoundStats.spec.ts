import { describe, expect, it } from 'vitest'

import { computeRoundStats } from './computeRoundStats'

describe('computeRoundStats', () => {
  it('아직 아무 회차도 안 쓰면 잔여가 포함 횟수 그대로다', () => {
    expect(computeRoundStats(2, 0)).toEqual({ usedRounds: 0, remaining: 2, overflow: 0 })
  })

  it('회차를 쓰면 잔여가 그만큼 줄어든다', () => {
    expect(computeRoundStats(2, 1)).toEqual({ usedRounds: 1, remaining: 1, overflow: 0 })
  })

  it('포함 횟수를 다 쓰면 잔여는 0이다', () => {
    expect(computeRoundStats(2, 2)).toEqual({ usedRounds: 2, remaining: 0, overflow: 0 })
  })

  it('포함 횟수를 초과해도 잔여는 음수가 되지 않고 초과분은 따로 센다', () => {
    expect(computeRoundStats(2, 3)).toEqual({ usedRounds: 3, remaining: 0, overflow: 1 })
  })
})
