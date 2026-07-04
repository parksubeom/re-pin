import Link from 'next/link'

/**
 * 제작자용 대시보드 (MVP 스텁).
 * 다음 단계: 프로젝트 생성 → 시안 업로드 → 공유 링크 발급.
 */
export function DashboardPage() {
  return (
    <main style={{ maxWidth: 720, margin: '0 auto', padding: '64px 20px' }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>수정핀 대시보드</h1>
      <p style={{ marginTop: 8, color: 'var(--txt-2)', fontSize: 15 }}>
        프로젝트 생성 · 시안 업로드 · 공유 링크 발급이 이곳에 들어갑니다.
      </p>
      <div
        style={{
          marginTop: 28,
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 24,
        }}
      >
        <p style={{ fontWeight: 700, fontSize: 15 }}>클라이언트 리뷰 화면 데모</p>
        <p style={{ marginTop: 4, fontSize: 14, color: 'var(--txt-2)' }}>
          핵심 인터랙션(핀 찍기 → 회차 제출 → 잔여 횟수)이 동작합니다.
        </p>
        <Link
          href="/r/demo"
          style={{
            display: 'inline-block',
            marginTop: 16,
            background: 'var(--pin)',
            color: '#fff',
            fontWeight: 800,
            fontSize: 14,
            padding: '12px 20px',
            borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          데모 열기 → /r/demo
        </Link>
      </div>
    </main>
  )
}
