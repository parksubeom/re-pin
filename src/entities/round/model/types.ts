import type { PinId } from '@/entities/pin'

export type Round = {
  no: number
  submittedAt: string
  pinIds: PinId[]
}

export type RoundPolicy = {
  /** 계약상 포함된 수정 횟수 */
  includedRounds: number
}
