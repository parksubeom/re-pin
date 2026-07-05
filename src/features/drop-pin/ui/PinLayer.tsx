'use client'

import { useState, type MouseEvent } from 'react'

import type { Pin } from '@/entities/pin'
import { createId } from '@/shared/lib/id'

type Props = {
  pins: Pin[]
  onAdd: (pin: Pin) => void
  onUpdate?: (pinId: string, comment: string) => void
  onDelete?: (pinId: string) => void
  disabled?: boolean
}

const popover = {
  position: 'absolute',
  background: 'var(--card)',
  border: '1px solid var(--border)',
  borderRadius: 12,
  padding: 12,
  width: 240,
  boxShadow: '0 12px 30px -12px rgba(26,26,24,.35)',
  zIndex: 10,
} as const

const textarea = {
  width: '100%',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: 8,
  fontSize: 14,
  fontFamily: 'inherit',
  resize: 'none',
} as const

/**
 * 시안 이미지 위에 겹쳐지는 핀 레이어.
 * - 빈 곳 클릭 → 임시 핀 + 코멘트 입력 → 저장 시 draft 핀으로 확정(onAdd).
 * - draft 핀 클릭 → 코멘트 수정(onUpdate) / 삭제(onDelete). submitted 핀은 불변(읽기 전용).
 */
export function PinLayer({ pins, onAdd, onUpdate, onDelete, disabled = false }: Props) {
  const [pending, setPending] = useState<{ x: number; y: number } | null>(null)
  const [comment, setComment] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editComment, setEditComment] = useState('')

  function handleCanvasClick(e: MouseEvent<HTMLDivElement>) {
    if (disabled || pending || editingId) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    setPending({ x, y })
    setComment('')
  }

  function confirmAdd() {
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

  function openEdit(pin: Pin) {
    if (disabled || pin.status !== 'draft') return
    setPending(null)
    setEditingId(pin.id)
    setEditComment(pin.comment)
  }

  function confirmEdit() {
    if (!editingId || editComment.trim() === '') return
    onUpdate?.(editingId, editComment.trim())
    setEditingId(null)
  }

  return (
    <div
      onClick={handleCanvasClick}
      style={{ position: 'absolute', inset: 0, cursor: disabled ? 'default' : 'crosshair' }}
      aria-label="시안 위에 핀을 찍는 영역"
    >
      {pins.map((pin, i) => (
        <button
          key={pin.id}
          type="button"
          title={pin.comment}
          onClick={(e) => {
            e.stopPropagation()
            openEdit(pin)
          }}
          style={{
            position: 'absolute',
            left: `${pin.x * 100}%`,
            top: `${pin.y * 100}%`,
            transform: 'translate(-50%, -100%) rotate(-45deg)',
            width: 26,
            height: 26,
            padding: 0,
            border: 'none',
            borderRadius: '50% 50% 50% 0',
            background: pin.status === 'draft' ? 'var(--pin)' : 'var(--ok)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 10px rgba(212,83,126,.4)',
            cursor: pin.status === 'draft' && !disabled ? 'pointer' : 'default',
          }}
        >
          <span
            style={{ transform: 'rotate(45deg)', color: '#fff', fontSize: 12, fontWeight: 800 }}
          >
            {i + 1}
          </span>
        </button>
      ))}

      {pending && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            ...popover,
            left: `${pending.x * 100}%`,
            top: `${pending.y * 100}%`,
            transform: 'translate(-50%, 12px)',
          }}
        >
          <textarea
            autoFocus
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="여기를 어떻게 고칠까요?"
            rows={2}
            style={textarea}
          />
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button
              onClick={confirmAdd}
              disabled={disabled}
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

      {editingId &&
        (() => {
          const pin = pins.find((p) => p.id === editingId)
          if (!pin) return null
          return (
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                ...popover,
                left: `${pin.x * 100}%`,
                top: `${pin.y * 100}%`,
                transform: 'translate(-50%, 12px)',
              }}
            >
              <textarea
                autoFocus
                value={editComment}
                onChange={(e) => setEditComment(e.target.value)}
                rows={2}
                style={textarea}
              />
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button
                  onClick={confirmEdit}
                  disabled={disabled}
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
                  수정
                </button>
                <button
                  onClick={() => {
                    onDelete?.(editingId)
                    setEditingId(null)
                  }}
                  disabled={disabled}
                  style={{
                    background: 'var(--pin-bg)',
                    color: 'var(--pin-deep)',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  삭제
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                  }}
                >
                  닫기
                </button>
              </div>
            </div>
          )
        })()}
    </div>
  )
}
