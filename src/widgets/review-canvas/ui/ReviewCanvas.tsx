'use client'

import { toPin } from '@/entities/pin'
import { useProjectQuery } from '@/entities/project'
import { PinLayer, useAddPin } from '@/features/drop-pin'
import { SubmitRoundBar, useSubmitRound } from '@/features/submit-round'
import type { ProjectDTO } from '@/shared/api/types'

type Props = {
  project: ProjectDTO
  draftImageUrl: string
}

/**
 * 시안 + 핀 레이어 + 회차 제출 바. 서버(RSC) 데이터로 초기화하고(initialData), 이후엔 React Query로
 * 최신을 유지한다. 핀 추가·회차 제출은 API 훅으로 영속화된다(새로고침해도 남음).
 */
export function ReviewCanvas({ project: initial, draftImageUrl }: Props) {
  const { data: project } = useProjectQuery(initial.shareToken, initial)
  const shareToken = initial.shareToken

  const pins = (project?.pins ?? initial.pins).map(toPin)
  const usedRounds = project?.usedRounds ?? initial.usedRounds
  const draftCount = pins.filter((p) => p.status === 'draft').length

  const addPin = useAddPin(shareToken)
  const submitRound = useSubmitRound(shareToken)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <div style={{ flex: 1, padding: 20, maxWidth: 860, width: '100%', margin: '0 auto' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: 14,
            overflow: 'hidden',
            border: '1px solid var(--border)',
            background: 'var(--card)',
          }}
        >
          {/* signed URL / placeholder, not a static asset — intentional <img> */}
          <img
            src={draftImageUrl}
            alt="검토할 시안"
            style={{ display: 'block', width: '100%', userSelect: 'none' }}
            draggable={false}
          />
          <PinLayer
            pins={pins}
            disabled={addPin.isPending}
            onAdd={(pin) =>
              addPin.mutate({
                x: pin.x,
                y: pin.y,
                comment: pin.comment,
                authorName: pin.authorName || null,
              })
            }
          />
        </div>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--txt-2)', textAlign: 'center' }}>
          고치고 싶은 곳을 손가락(또는 마우스)으로 콕 찍어 주세요
        </p>
      </div>
      <SubmitRoundBar
        draftCount={draftCount}
        usedRounds={usedRounds}
        policy={{ includedRounds: initial.includedRounds }}
        onSubmit={() => {
          if (draftCount > 0) submitRound.mutate()
        }}
      />
    </div>
  )
}
