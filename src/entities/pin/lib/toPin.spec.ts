import { describe, expect, it } from 'vitest'

import type { PinDTO } from '@/shared/api/types'

import { toPin } from './toPin'

const base: PinDTO = {
  id: 'p1',
  x: 0.5,
  y: 0.5,
  comment: '여기 고쳐주세요',
  authorName: '클라이언트',
  status: 'draft',
  roundNo: null,
  createdAt: '2026-07-05T00:00:00.000Z',
}

describe('toPin', () => {
  it('좌표·코멘트·상태를 그대로 도메인 핀으로 옮긴다', () => {
    const pin = toPin(base)
    expect(pin.x).toBe(0.5)
    expect(pin.comment).toBe('여기 고쳐주세요')
    expect(pin.status).toBe('draft')
    expect(pin.roundNo).toBeNull()
  })

  it('작성자 이름이 없으면(익명) 빈 문자열로 바꾼다', () => {
    expect(toPin({ ...base, authorName: null }).authorName).toBe('')
  })

  it('제출된 핀의 회차 번호를 유지한다', () => {
    expect(toPin({ ...base, status: 'submitted', roundNo: 1 }).roundNo).toBe(1)
  })
})
