import 'server-only'

import { redirect } from 'next/navigation'

import { supabaseServerRls } from './supabase.rls'

import type { User } from '@supabase/supabase-js'

/** Current maker, or null. Uses getUser() (validates the token with Supabase, not just cookies). */
export async function getMakerUser(): Promise<User | null> {
  const sb = await supabaseServerRls()
  const {
    data: { user },
  } = await sb.auth.getUser()
  return user
}

/** Require a logged-in maker; redirect to /login otherwise. Returns the user for RSC/actions. */
export async function requireMaker(): Promise<User> {
  const user = await getMakerUser()
  if (!user) redirect('/login')
  return user
}
