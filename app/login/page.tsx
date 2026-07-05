import { redirect } from 'next/navigation'

import { LoginForm } from '@/features/auth'
import { getMakerUser } from '@/shared/api/auth.server'

// Thin maker login route. Already signed in → bounce to the dashboard.
export default async function LoginPage() {
  if (await getMakerUser()) redirect('/')
  return (
    <main style={{ maxWidth: 420, margin: '0 auto', padding: '96px 20px' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>제작자 로그인</h1>
      <p style={{ marginTop: 8, marginBottom: 24, color: 'var(--txt-2)', fontSize: 14 }}>
        이메일로 로그인 링크를 보내드립니다. (클라이언트는 로그인 없이 공유 링크로 이용합니다.)
      </p>
      <LoginForm />
    </main>
  )
}
