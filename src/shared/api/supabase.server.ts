import 'server-only'

// SERVER-ONLY Supabase client. Uses the secret key (sb_secret_…, replaces the legacy
// service_role key) which BYPASSES RLS — so it must never reach the browser bundle.
// The `import 'server-only'` above turns any client-component import of this file into a
// build error (rules/80). Only Route Handlers / RSC / Server Actions may import it.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/**
 * Returns a singleton server Supabase client bound to the secret key.
 * Access scoping (invariant 4) is enforced in the calling code / SQL, not here —
 * this client can touch any row.
 */
export function supabaseServer(): SupabaseClient {
  if (cached) return cached

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const secret = process.env.SUPABASE_SECRET_KEY
  if (!url || !secret) {
    throw new Error(
      'Missing Supabase env: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SECRET_KEY (see .env.example)',
    )
  }

  cached = createClient(url, secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
