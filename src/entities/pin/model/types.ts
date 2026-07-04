export type PinId = string

export type Pin = {
  id: PinId
  /** 시안 이미지 기준 상대 좌표 (0~1) — 어떤 화면 크기에서도 같은 지점을 가리킨다 */
  x: number
  y: number
  comment: string
  authorName: string
  createdAt: string
  /** 아직 회차로 제출되지 않은 핀 */
  status: 'draft' | 'submitted' | 'resolved'
  roundNo: number | null
}
