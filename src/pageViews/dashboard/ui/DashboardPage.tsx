import Link from 'next/link'

import { CreateProjectForm } from '@/features/create-project'

/**
 * 제작자용 대시보드. 시안 업로드 → 공유 링크 발급.
 * (M1: 로그인 없음. 프로젝트 목록/인증은 M2.)
 */
export function DashboardPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>수정핀 대시보드</h1>
      <p style={{ marginTop: 8, color: 'var(--txt-2)', fontSize: 15 }}>
        시안 이미지를 올리면 공유 링크가 발급됩니다. 클라이언트는 링크만 열어 핀을 남깁니다.
      </p>

      <div style={{ marginTop: 28 }}>
        <CreateProjectForm />
      </div>

      <div style={{ marginTop: 28, fontSize: 13, color: 'var(--txt-2)' }}>
        데모를 먼저 보시려면{' '}
        <Link href="/r/demo" style={{ color: 'var(--pin-deep)', fontWeight: 700 }}>
          /r/demo
        </Link>{' '}
        를 여세요.
      </div>
    </main>
  )
}
