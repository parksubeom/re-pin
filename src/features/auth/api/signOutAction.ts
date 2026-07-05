'use server'

import { redirect } from 'next/navigation'

import { supabaseServerRls } from '@/shared/api/supabase.rls'

export async function signOutAction() {
  const sb = await supabaseServerRls()
  await sb.auth.signOut()
  redirect('/login')
}
