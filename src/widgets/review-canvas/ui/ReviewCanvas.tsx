'use client'

import { useState } from 'react'
import type { Pin } from '@/entities/pin'
import type { Round, RoundPolicy } from '@/entities/round'
import { PinLayer } from '@/features/drop-pin'
import { SubmitRoundBar } from '@/features/submit-round'

type Props = {
  draftImageUrl: string
  policy: RoundPolicy
}

/**
 * 시안 + 핀 레이어 + 회차 제출 바를 조립한 리뷰 캔버스.
 * MVP 단계: 상태는 메모리에만 (API 연결 전). persist는 features/*/api 로 옮긴다.
 */
export function ReviewCanvas({ draftImageUrl, policy }: Props) {
  const [pins, setPins] = useState<Pin[]>([])
  const [rounds, setRounds] = useState<Round[]>([])

  const draftPins = pins.filter((p) => p.status === 'draft')

  function submitRound() {
    if (draftPins.length === 0) return
    const no = rounds.length + 1
    setRounds([
      ...rounds,
      { no, submittedAt: new Date().toISOString(), pinIds: draftPins.map((p) => p.id) },
    ])
    setPins(pins.map((p) => (p.status === 'draft' ? { ...p, status: 'submitted', roundNo: no } : p)))
  }

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
          <img
            src={draftImageUrl}
            alt="검토할 시안"
            style={{ display: 'block', width: '100%', userSelect: 'none' }}
            draggable={false}
          />
          <PinLayer pins={pins} onAdd={(pin) => setPins([...pins, pin])} />
        </div>
        <p style={{ marginTop: 12, fontSize: 13, color: 'var(--txt-2)', textAlign: 'center' }}>
          고치고 싶은 곳을 손가락(또는 마우스)으로 콕 찍어 주세요
        </p>
      </div>
      <SubmitRoundBar
        draftCount={draftPins.length}
        usedRounds={rounds.length}
        policy={policy}
        onSubmit={submitRound}
      />
    </div>
  )
}
