import type { PinDTO } from '@/shared/api/types'

import type { Pin } from '../model/types'

// Pure mapper: wire PinDTO → domain Pin. authorName is nullable on the wire (anonymous pins)
// but the domain Pin uses a non-null string, so null collapses to '' for rendering.
export function toPin(dto: PinDTO): Pin {
  return {
    id: dto.id,
    x: dto.x,
    y: dto.y,
    comment: dto.comment,
    authorName: dto.authorName ?? '',
    createdAt: dto.createdAt,
    status: dto.status,
    roundNo: dto.roundNo,
  }
}
