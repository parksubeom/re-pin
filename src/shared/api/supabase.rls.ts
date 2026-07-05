import 'server-only'

// Server COOKIE client for MAKER surfaces (dashboard, create-project, delete). Uses the
// publishable key and runs UNDER RLS (auth.uid() = owner_id). NOT the secret client — this one
// must never bypass RLS. Used only in RSC / Server Actions (server-only).
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function supabaseServerRls() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (toSet) => {
          try {
            toSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // called from an RSC (read-only cookies) — safe to ignore; middleware refreshes.
          }
        },
      },
    },
  )
}
