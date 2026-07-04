import { NextResponse } from 'next/server'

import { apiError, projectIdForToken } from '@/shared/api/route-helpers'
import { supabaseServer } from '@/shared/api/supabase.server'
import type { PinDTO, PinUpdateDTO } from '@/shared/api/types'

type Ctx = { params: Promise<{ shareToken: string; pinId: string }> }

// Does this pin exist within this project? Distinguishes 404 (wrong pin/project) from
// 409 (pin exists but isn't draft — the trigger will reject the write).
async function pinExistsInProject(projectId: string, pinId: string): Promise<boolean> {
  const sb = supabaseServer()
  const { data, error } = await sb
    .from('pins')
    .select('id')
    .eq('id', pinId)
    .eq('project_id', projectId) // scoping — invariant 4
    .maybeSingle()
  if (error) throw error
  return !!data
}

export async function PATCH(req: Request, { params }: Ctx) {
  const { shareToken, pinId } = await params
  const projectId = await projectIdForToken(shareToken)
  if (!projectId) return apiError(404, 'unknown share token')

  let body: PinUpdateDTO
  try {
    body = (await req.json()) as PinUpdateDTO
  } catch {
    return apiError(400, 'invalid JSON body')
  }

  const patch: Record<string, unknown> = {}
  if (body.x !== undefined) {
    if (body.x < 0 || body.x > 1) return apiError(400, 'x must be 0..1')
    patch.x = body.x
  }
  if (body.y !== undefined) {
    if (body.y < 0 || body.y > 1) return apiError(400, 'y must be 0..1')
    patch.y = body.y
  }
  if (body.comment !== undefined) {
    if (body.comment.trim().length === 0 || body.comment.length > 2000) {
      return apiError(400, 'comment must be 1..2000 chars')
    }
    patch.comment = body.comment.trim()
  }
  if (Object.keys(patch).length === 0) return apiError(400, 'empty patch')

  const sb = supabaseServer()
  const { data, error } = await sb
    .from('pins')
    .update(patch)
    .eq('id', pinId)
    .eq('project_id', projectId) // scoping — invariant 4
    .eq('status', 'draft') // only drafts are editable
    .select('id, x, y, comment, author_name, status, round_no, created_at')
    .maybeSingle()

  if (error) return apiError(409, error.message, error.code) // trigger check_violation etc.
  if (!data) {
    // No row updated: either the pin doesn't exist here (404) or it's not draft (409).
    return (await pinExistsInProject(projectId, pinId))
      ? apiError(409, 'pin is not editable (not a draft)')
      : apiError(404, 'pin not found')
  }

  const pin: PinDTO = {
    id: data.id,
    x: data.x,
    y: data.y,
    comment: data.comment,
    authorName: data.author_name,
    status: data.status,
    roundNo: data.round_no,
    createdAt: data.created_at,
  }
  return NextResponse.json(pin)
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const { shareToken, pinId } = await params
  const projectId = await projectIdForToken(shareToken)
  if (!projectId) return apiError(404, 'unknown share token')

  const sb = supabaseServer()
  const { data, error } = await sb
    .from('pins')
    .delete()
    .eq('id', pinId)
    .eq('project_id', projectId) // scoping — invariant 4
    .eq('status', 'draft') // only drafts are deletable
    .select('id')
    .maybeSingle()

  if (error) return apiError(409, error.message, error.code)
  if (!data) {
    return (await pinExistsInProject(projectId, pinId))
      ? apiError(409, 'pin is not deletable (not a draft)')
      : apiError(404, 'pin not found')
  }
  return new NextResponse(null, { status: 204 })
}
