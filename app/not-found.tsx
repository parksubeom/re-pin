import Link from 'next/link'

export default function NotFound() {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '96px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800 }}>페이지를 찾을 수 없습니다</h1>
      <p style={{ marginTop: 8, color: 'var(--txt-2)', fontSize: 14 }}>
        주소가 올바른지 확인해 주세요.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          marginTop: 20,
          color: 'var(--pin-deep)',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        대시보드로 →
      </Link>
    </main>
  )
}
