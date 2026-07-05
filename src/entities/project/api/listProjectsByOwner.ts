import 'server-only'

import { supabaseServerRls } from '@/shared/api/supabase.rls'

import { computeRoundStats } from '../lib/computeRoundStats'

export type ProjectSummary = {
  id: string
  title: string
  shareToken: string
  includedRounds: number
  usedRounds: number
  remaining: number
}

/**
 * Lists the CURRENT MAKER's projects via the cookie/RLS client — RLS (owner_id = auth.uid())
 * scopes the result, so no explicit owner filter is needed. Server-only; called from the
 * dashboard RSC. Round usage comes from the nested count aggregate.
 */
export async function listProjectsByOwner(): Promise<ProjectSummary[]> {
  const sb = await supabaseServerRls()
  const { data, error } = await sb
    .from('projects')
    .select('id, title, share_token, included_rounds, rounds(count)')
    .order('created_at', { ascending: false })
  if (error) throw error

  return (data ?? []).map((p) => {
    // supabase returns the nested count aggregate as rounds: [{ count }]
    const rounds = p.rounds as unknown as Array<{ count: number }> | null
    const usedRounds = rounds?.[0]?.count ?? 0
    const stats = computeRoundStats(p.included_rounds, usedRounds)
    return {
      id: p.id,
      title: p.title,
      shareToken: p.share_token,
      includedRounds: p.included_rounds,
      usedRounds: stats.usedRounds,
      remaining: stats.remaining,
    }
  })
}
