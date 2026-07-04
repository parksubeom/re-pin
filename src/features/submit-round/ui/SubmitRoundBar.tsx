'use client'

import type { RoundPolicy } from '@/entities/round'

type Props = {
  draftCount: number
  usedRounds: number
  policy: RoundPolicy
  onSubmit: () => void
}

/**
 * 하단 고정 바 — 이번 요청(draft 핀 묶음)을 1회차로 확정한다.
 * "잔여 수정 횟수"를 양쪽 모두에게 항상 보이게 하는 것이 제품의 핵심 가치.
 */
export function SubmitRoundBar({ draftCount, usedRounds, policy, onSubmit }: Props) {
  const remaining = Math.max(policy.includedRounds - usedRounds, 0)
  const exhausted = remaining === 0

  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        background: 'var(--card)',
        borderTop: '1px solid var(--border)',
        padding: '14px 20px',
      }}
    >
      <div style={{ fontSize: 14 }}>
        <strong style={{ color: 'var(--pin-deep)' }}>핀 {draftCount}개</strong> 작성 중 ·{' '}
        <span
          style={{
            background: exhausted ? 'var(--pin-bg)' : 'var(--ok-bg)',
            color: exhausted ? 'var(--pin-deep)' : 'var(--ok-deep)',
            fontWeight: 800,
            fontSize: 12.5,
            padding: '4px 10px',
            borderRadius: 99,
          }}
        >
          수정 {policy.includedRounds}회 중 {usedRounds}회 사용 · 잔여 {remaining}회
        </span>
      </div>
      <button
        onClick={onSubmit}
        disabled={draftCount === 0}
        style={{
          background: draftCount === 0 ? 'var(--border)' : 'var(--ink)',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '12px 20px',
          fontWeight: 800,
          fontSize: 14,
        }}
      >
        수정 요청 제출 ({draftCount})
      </button>
    </div>
  )
}
