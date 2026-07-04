import { NextResponse } from 'next/server'

import { apiError, projectIdForToken } from '@/shared/api/route-helpers'
import { supabaseServer } from '@/shared/api/supabase.server'
import type { PinCreateDTO, PinDTO } from '@/shared/api/types'

type Ctx = { params: Promise<{ shareToken: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const { shareToken } = await params

  const projectId = await projectIdForToken(shareToken)
  if (!projectId) return apiError(404, 'unknown share token')

  let body: Partial<PinCreateDTO>
  try {
    body = (await req.json()) as Partial<PinCreateDTO>
  } catch {
    return apiError(400, 'invalid JSON body')
  }

  const { x, y, comment, authorName } = body
  if (
    typeof x !== 'number' ||
    x < 0 ||
    x > 1 ||
    typeof y !== 'number' ||
    y < 0 ||
    y > 1 ||
    typeof comment !== 'string' ||
    comment.trim().length === 0 ||
    comment.length > 2000
  ) {
    return apiError(400, 'x/y must be 0..1 and comment must be 1..2000 chars')
  }

  const sb = supabaseServer()
  const { data, error } = await sb
    .from('pins')
    .insert({
      project_id: projectId,
      x,
      y,
      comment: comment.trim(),
      author_name: authorName ?? null,
      status: 'draft',
    })
    .select('id, x, y, comment, author_name, status, round_no, created_at')
    .single()

  if (error) return apiError(400, error.message, error.code)

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
  return NextResponse.json(pin, { status: 201 })
}
