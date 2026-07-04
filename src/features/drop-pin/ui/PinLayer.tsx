'use client'

import { useState, type MouseEvent } from 'react'
import type { Pin } from '@/entities/pin'
import { createId } from '@/shared/lib/id'

type Props = {
  pins: Pin[]
  onAdd: (pin: Pin) => void
  disabled?: boolean
}

/**
 * 시안 이미지 위에 겹쳐지는 핀 레이어.
 * 빈 곳 클릭 → 임시 핀 + 코멘트 입력 → 저장 시 draft 핀으로 확정.
 */
export function PinLayer({ pins, onAdd, disabled = false }: Props) {
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null)
  const [comment, setComment] = useState('')

  function handleCanvasClick(e: MouseEvent<HTMLDivElement>) {
    if (disabled || pending) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setPending({ x, y })
    setComment('')
  }

  function confirm() {
    if (!pending || comment.trim() === '') return
    onAdd({
      id: createId('pin'),
      x: pending.x,
      y: pending.y,
      comment: comment.trim(),
      authorName: '클라이언트',
      createdAt: new Date().toISOString(),
      status: 'draft',
      roundNo: null,
    })
    setPending(null)
    setComment('')
  }

  return (
    <div
      onClick={handleCanvasClick}
      style={{ position: 'absolute', inset: 0, cursor: disabled ? 'default' : 'crosshair' }}
      aria-label="시안 위에 핀을 찍는 영역"
    >
      {pins.map((pin, i) => (
        <div
          key={pin.id}
          title={pin.comment}
          style={{
            position: 'absolute',
            left: `${pin.x * 100}%`,
            top: `${pin.y * 100}%`,
            transform: 'translate(-50%, -100%) rotate(-45deg)',
            width: 26,
            height: 26,
            borderRadius: '50% 50% 50% 0',
            background: pin.status === 'draft' ? 'var(--pin)' : 'var(--ok)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(212,83,126,.4)',
          }}
        >
          <span style={{ transform: 'rotate(45deg)', color: '#fff', fontSize: 12, fontWeight: 800 }}>
            {i + 1}
          </span>
        </div>
      ))}

      {pending && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: `${pending.x * 100}%`,
            top: `${pending.y * 100}%`,
            transform: 'translate(-50%, 12px)',
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            padding: 12,
            width: 240,
            boxShadow: '0 12px 30px -12px rgba(26,26,24,.35)',
            zIndex: 10,
          }}
        >
          <textarea
            autoFocus
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="여기를 어떻게 고칠까요?"
            rows={2}
            style={{
              width: '100%',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: 8,
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={confirm}
              style={{
                flex: 1,
                background: 'var(--pin)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 0',
                fontWeight: 700,
                fontSize: 13,
              }}
            >
              핀 남기기
            </button>
            <button
              onClick={() => setPending(null)}
              style={{
                background: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 12px',
                fontSize: 13,
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
