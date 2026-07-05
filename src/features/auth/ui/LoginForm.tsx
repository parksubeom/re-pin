'use client'

import { useState } from 'react'

import { supabaseBrowser } from '@/shared/api/supabase.browser'

/**
 * 제작자 매직링크 로그인. 이메일 입력 → signInWithOtp → 메일의 링크가 /auth/confirm로 돌아온다.
 * shouldCreateUser:false — 신규 가입 없음(제작자는 Supabase에서 초대/생성). 클라이언트는 로그인 안 함.
 */
export function LoginForm() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending(true)
    const sb = supabaseBrowser()
    const { error: err } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    setPending(false)
    if (err) setError('로그인 링크 전송에 실패했습니다. 등록된 이메일인지 확인해 주세요.')
    else setSent(true)
  }

  if (sent) {
    return (
      <div
        style={{
          background: 'var(--ok-bg)',
          border: '1px solid var(--ok)',
          borderRadius: 12,
          padding: 20,
          fontSize: 14,
          color: 'var(--ok-deep)',
        }}
      >
        <strong>메일함을 확인하세요.</strong> {email} 으로 로그인 링크를 보냈습니다.
      </div>
    )
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
        gap: 12,
      }}
    >
      <label htmlFor="login-email" style={{ fontSize: 13, fontWeight: 700 }}>
        제작자 이메일
      </label>
      <input
        id="login-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@studio.com"
        style={{
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '10px 12px',
          fontSize: 14,
          background: 'var(--paper)',
        }}
      />
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
        }}
      >
        {pending ? '전송 중…' : '로그인 링크 받기'}
      </button>
      {error && <p style={{ color: 'var(--pin-deep)', fontSize: 13, fontWeight: 600 }}>{error}</p>}
    </form>
  )
}
