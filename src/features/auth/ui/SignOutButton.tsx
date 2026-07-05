'use client'

import { signOutAction } from '../api/signOutAction'

export function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        style={{
          background: 'transparent',
          border: '1px solid var(--border)',
          borderRadius: 8,
          padding: '6px 12px',
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--txt-2)',
        }}
      >
        로그아웃
      </button>
    </form>
  )
}
