import 'server-only'

import { supabaseServer } from '@/shared/api/supabase.server'
import type { PinDTO, ProjectDTO, RoundDTO } from '@/shared/api/types'

import { computeRoundStats } from '../lib/computeRoundStats'

const SIGNED_URL_TTL_SECONDS = 60 * 60 // 1h; private bucket → server-minted signed URL

/**
 * RSC-direct resource read (rules/40 → entities/<noun>/api). Awaited straight from a server
 * component. Returns the HTTP Project shape (the generated DTO) so the page and the client
 * React Query hook share one type. Returns null on unknown token so the caller can notFound().
 * Throws on unexpected DB / storage errors → nearest error.tsx.
 */
export async function getProjectByShareToken(shareToken: string): Promise<ProjectDTO | null> {
  const sb = supabaseServer()

  const { data: project, error } = await sb
    .from('projects')
    .select('id, title, image_path, share_token, included_rounds, created_at')
    .eq('share_token', shareToken)
    .maybeSingle()

  if (error) throw error
  if (!project) return null

  const [{ data: rawPins, error: pinsErr }, { data: rawRounds, error: roundsErr }] =
    await Promise.all([
      sb
        .from('pins')
        .select('id, x, y, comment, author_name, status, round_id, round_no, created_at')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true }),
      sb
        .from('rounds')
        .select('id, no, created_at')
        .eq('project_id', project.id)
        .order('no', { ascending: true }),
    ])
  if (pinsErr) throw pinsErr
  if (roundsErr) throw roundsErr

  const pins: PinDTO[] = (rawPins ?? []).map((p) => ({
    id: p.id,
    x: p.x,
    y: p.y,
    comment: p.comment,
    authorName: p.author_name,
    status: p.status,
    roundNo: p.round_no,
    createdAt: p.created_at,
  }))

  const rounds: RoundDTO[] = (rawRounds ?? []).map((r) => ({
    no: r.no,
    submittedAt: r.created_at,
    pinIds: (rawPins ?? []).filter((p) => p.round_id === r.id).map((p) => p.id),
  }))

  // Private bucket: mint a short-lived signed URL. Inspect the error — never fall back to ''.
  let draftImageUrl: string | null = null
  if (project.image_path) {
    const { data: signed, error: signErr } = await sb.storage
      .from('drafts')
      .createSignedUrl(project.image_path, SIGNED_URL_TTL_SECONDS)
    if (signErr) throw signErr
    draftImageUrl = signed?.signedUrl ?? null
  }

  const { usedRounds, remaining, overflow } = computeRoundStats(
    project.included_rounds,
    rounds.length,
  )

  return {
    id: project.id,
    title: project.title,
    draftImageUrl,
    shareToken: project.share_token,
    includedRounds: project.included_rounds,
    usedRounds,
    remaining,
    overflow,
    pins,
    rounds,
    createdAt: project.created_at,
  }
}
