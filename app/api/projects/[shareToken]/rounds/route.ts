import { NextResponse } from 'next/server'

import { submitRoundErrorResponse } from '@/shared/api/route-helpers'
import { supabaseServer } from '@/shared/api/supabase.server'
import type { RoundDTO } from '@/shared/api/types'

type Ctx = { params: Promise<{ shareToken: string }> }

export async function POST(_req: Request, { params }: Ctx) {
  const { shareToken } = await params
  const sb = supabaseServer()

  // submit_round re-derives project_id from the token itself (invariant 4 defense) and does the
  // whole allocate-lock-insert-flip atomically. Distinct SQLSTATEs map to HTTP codes.
  const { data, error } = await sb.rpc('submit_round', { p_share_token: shareToken })
  if (error) return submitRoundErrorResponse(error.code, error.message)

  // rpc returns the new rounds row; fetch its pin ids for the DTO.
  const round = data as { id: string; no: number; created_at: string }
  const { data: pins, error: pinsErr } = await sb.from('pins').select('id').eq('round_id', round.id)
  if (pinsErr) return submitRoundErrorResponse(undefined, pinsErr.message)

  const dto: RoundDTO = {
    no: round.no,
    submittedAt: round.created_at,
    pinIds: (pins ?? []).map((p) => p.id),
  }
  return NextResponse.json(dto, { status: 201 })
}
