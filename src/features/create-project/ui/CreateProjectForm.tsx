'use client'

import { useState } from 'react'

import { createProjectAction } from '../api/createProjectAction'

const label = { display: 'block', fontSize: 13, fontWeight: 700, marginBottom: 6 } as const
const input = {
  width: '100%',
  border: '1px solid var(--border)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 14,
  fontFamily: 'inherit',
  background: 'var(--paper)',
} as const

/**
 * 제작자 프로젝트 생성 폼. 시안 이미지 업로드 → Server Action → 공유 링크 발급.
 * M1: 로그인 없음(인증은 M2). 성공 시 /r/<token> 링크를 보여주고 복사 버튼을 제공한다.
 */
export function CreateProjectForm() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareToken, setShareToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const shareUrl = shareToken
    ? `${typeof window === 'undefined' ? '' : window.location.origin}/r/${shareToken}`
    : null

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setShareToken(null)
    setCopied(false)
    setPending(true)
    try {
      const result = await createProjectAction(new FormData(e.currentTarget))
      if (result.ok) {
        setShareToken(result.shareToken)
        e.currentTarget.reset()
      } else {
        setError(result.message)
      }
    } catch {
      setError('알 수 없는 오류가 발생했습니다. 다시 시도해 주세요.')
    } finally {
      setPending(false)
    }
  }

  async function copyLink() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
  }

  return (
    <form
      onSubmit={onSubmit}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 14,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      <div>
        <label htmlFor="cp-title" style={label}>
          프로젝트 제목
        </label>
        <input
          id="cp-title"
          name="title"
          required
          maxLength={200}
          style={input}
          placeholder="예: 카페 메뉴판 시안"
        />
      </div>

      <div>
        <label htmlFor="cp-rounds" style={label}>
          포함된 수정 횟수
        </label>
        <input
          id="cp-rounds"
          name="includedRounds"
          type="number"
          min={1}
          defaultValue={2}
          required
          style={{ ...input, width: 120 }}
        />
      </div>

      <div>
        <label htmlFor="cp-image" style={label}>
          시안 이미지 (PNG · JPG · WebP, 10MB 이하)
        </label>
        <input
          id="cp-image"
          name="image"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          required
          style={{ ...input, padding: 8 }}
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        style={{
          background: pending ? 'var(--border)' : 'var(--pin)',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '12px 20px',
          fontWeight: 800,
          fontSize: 14,
          alignSelf: 'flex-start',
        }}
      >
        {pending ? '만드는 중…' : '프로젝트 만들기 + 링크 발급'}
      </button>

      {error && <p style={{ color: 'var(--pin-deep)', fontSize: 13, fontWeight: 600 }}>{error}</p>}

      {shareUrl && (
        <div
          style={{
            background: 'var(--ok-bg)',
            border: '1px solid var(--ok)',
            borderRadius: 10,
            padding: 16,
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--ok-deep)' }}>
            공유 링크가 발급됐습니다 — 클라이언트에게 보내세요.
          </p>
          <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
            <code
              style={{
                flex: 1,
                fontSize: 13,
                background: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '8px 10px',
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              {shareUrl}
            </code>
            <button
              type="button"
              onClick={copyLink}
              style={{
                background: 'var(--ink)',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '8px 14px',
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: 'nowrap',
              }}
            >
              {copied ? '복사됨 ✓' : '복사'}
            </button>
          </div>
          <a
            href={`/r/${shareToken}`}
            style={{
              display: 'inline-block',
              marginTop: 10,
              fontSize: 13,
              color: 'var(--ok-deep)',
              fontWeight: 700,
            }}
          >
            링크 열어보기 →
          </a>
        </div>
      )}
    </form>
  )
}
