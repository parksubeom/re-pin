import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Refreshes the maker's Supabase session cookie on maker routes. The matcher below EXCLUDES
// /api/** and /r/** (and /auth/**, static) so the anonymous client-capability flow never gets a
// session cookie or redirect — those paths use the secret client and stay login-free.
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (toSet) => {
          toSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  // Touch the session so an expired token is refreshed into the response cookies.
  await supabase.auth.getUser()

  return response
}

export const config = {
  // Everything EXCEPT: api routes, next internals, the anonymous /r review pages, auth callback,
  // and static asset files. Keeps /r/** and /api/** completely session-free.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|r/|auth/).*)'],
}
