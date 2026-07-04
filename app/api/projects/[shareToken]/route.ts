import { NextResponse } from 'next/server'

import { getProjectByShareToken } from '@/entities/project/api/getProjectByShareToken'
import { apiError } from '@/shared/api/route-helpers'

type Ctx = { params: Promise<{ shareToken: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const { shareToken } = await params
  const project = await getProjectByShareToken(shareToken)
  if (!project) return apiError(404, 'unknown share token')
  return NextResponse.json(project)
}
