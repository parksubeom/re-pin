'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { supabaseBrowser } from '@/shared/api/supabase.browser'

/**
 * 제작자 로그인. 두 방식 지원:
 *  - 비밀번호: signInWithPassword → 세션 쿠키 → 대시보드로 이동.
 *  - 매직링크: signInWithOtp → 메일의 링크가 /auth/confirm로 돌아온다.
 * 둘 다 shouldCreateUser/create_user 없이 기존 제작자만 로그인(신규 가입은 Supabase에서 관리).
 */
export function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState<'password' | 'magic' | null>(null)

  async function onPasswordLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setPending('password')
    const sb = supabaseBrowser()
    const { error: err } = await sb.auth.signInWithPassword({
      email: email.trim(),
      password,
    })
    setPending(null)
    if (err) {
      setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해 주세요.')
      return
    }
    // 세션 쿠키가 심어졌으니 대시보드로. refresh로 서버 컴포넌트가 새 세션을 읽게 한다.
    router.replace('/')
    router.refresh()
  }

  async function onMagicLink() {
    if (!email.trim()) {
      setError('매직링크를 받으려면 이메일을 입력해 주세요.')
      return
    }
    setError(null)
    setPending('magic')
    const sb = supabaseBrowser()
    const { error: err } = await sb.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    })
    setPending(null)
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
      onSubmit={onPasswordLogin}
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
        autoComplete="email"
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

      <label htmlFor="login-password" style={{ fontSize: 13, fontWeight: 700, marginTop: 4 }}>
        비밀번호
      </label>
      <input
        id="login-password"
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
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
        disabled={pending !== null}
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
        {pending === 'password' ? '로그인 중…' : '로그인'}
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
        <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        <span style={{ fontSize: 12, color: 'var(--txt-2)' }}>또는</span>
        <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      <button
        type="button"
        onClick={onMagicLink}
        disabled={pending !== null}
        style={{
          background: 'transparent',
          color: 'var(--pin-deep)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '10px 20px',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        {pending === 'magic' ? '전송 중…' : '이메일로 로그인 링크 받기'}
      </button>

      {error && <p style={{ color: 'var(--pin-deep)', fontSize: 13, fontWeight: 600 }}>{error}</p>}
    </form>
  )
}
