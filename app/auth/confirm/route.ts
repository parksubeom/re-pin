import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

import { supabaseServerRls } from '@/shared/api/supabase.rls'

import type { EmailOtpType } from '@supabase/supabase-js'

// Magic-link landing (token_hash flow — NOT PKCE ?code, which fails on a fresh server GET).
// Supabase Auth → Email Templates → Magic Link must point here:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/
// open redirect 방지: 내부 경로("/...")만 허용. "//evil.com"·절대 URL·백슬래시 변형은 전부 "/"로.
function safeInternalPath(raw: string | null): string {
  if (!raw) return '/'
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/'
  return raw
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const token_hash = url.searchParams.get('token_hash')
  const type = url.searchParams.get('type') as EmailOtpType | null
  const next = safeInternalPath(url.searchParams.get('next'))

  if (token_hash && type) {
    const sb = await supabaseServerRls()
    const { error } = await sb.auth.verifyOtp({ type, token_hash })
    if (!error) redirect(next)
  }
  redirect('/login?error=auth')
}
