import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { Providers } from '@/app/providers'
import './globals.css'

export const metadata: Metadata = {
  title: '수정핀 — 수정 요청, 링크 하나로',
  description: '클라이언트는 화면에 핀만 콕. 수정 횟수는 자동으로 셉니다.',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
