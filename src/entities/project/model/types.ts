import type { Pin } from '@/entities/pin'
import type { Round, RoundPolicy } from '@/entities/round'

export type Project = {
  id: string
  title: string
  clientName: string
  /** MVP: 시안 이미지 URL. 이후 라이브 URL(iframe/프록시) 지원 확장 */
  draftImageUrl: string
  shareToken: string
  policy: RoundPolicy
  rounds: Round[]
  pins: Pin[]
  createdAt: string
}
