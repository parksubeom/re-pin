'use client'

// Segment error boundary (rules/next/error-handling): catches thrown RSC/query errors.
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{ maxWidth: 480, margin: '0 auto', padding: '96px 20px', textAlign: 'center' }}>
      <h1 style={{ fontSize: 20, fontWeight: 800 }}>문제가 발생했습니다</h1>
      <p style={{ marginTop: 8, color: 'var(--txt-2)', fontSize: 14 }}>
        잠시 후 다시 시도해 주세요.
      </p>
      <button
        type="button"
        onClick={reset}
        style={{
          marginTop: 20,
          background: 'var(--pin)',
          color: '#fff',
          border: 'none',
          borderRadius: 10,
          padding: '10px 18px',
          fontWeight: 700,
          fontSize: 14,
        }}
      >
        다시 시도
      </button>
    </main>
  )
}
