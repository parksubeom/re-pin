import { NextResponse } from 'next/server'

import { apiError, projectIdForToken } from '@/shared/api/route-helpers'
import { supabaseServer } from '@/shared/api/supabase.server'
import type { PinCreateDTO, PinDTO } from '@/shared/api/types'

type Ctx = { params: Promise<{ shareToken: string }> }

// 익명 남용 가드: 토큰만 알면 무한정 삽입할 수 있으므로 프로젝트당 draft 핀 상한을 둔다.
const MAX_DRAFT_PINS = 100

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
  if (authorName != null && (typeof authorName !== 'string' || authorName.length > 100)) {
    return apiError(400, 'authorName must be at most 100 chars')
  }

  const sb = supabaseServer()

  // draft 상한 확인 (스토리지/DB 남용 방지)
  const { count, error: countErr } = await sb
    .from('pins')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', projectId)
    .eq('status', 'draft')
  if (countErr) {
    console.error('[pins POST] count failed:', countErr.message)
    return apiError(500, 'failed to save pin')
  }
  if ((count ?? 0) >= MAX_DRAFT_PINS) {
    return apiError(409, 'too many draft pins — submit a round first')
  }

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

  if (error) {
    // DB 에러 원문은 서버 로그로만 — 익명 클라이언트에 스키마 힌트를 흘리지 않는다.
    console.error('[pins POST] insert failed:', error.code, error.message)
    return apiError(400, 'failed to save pin', error.code)
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
  return NextResponse.json(pin, { status: 201 })
}
