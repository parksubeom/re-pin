import 'server-only'

import { NextResponse } from 'next/server'

import { mapSubmitRoundError } from './submitRoundError'
import { supabaseServer } from './supabase.server'

import type { ApiError } from './types'

/** Standard JSON error response. */
export function apiError(status: number, message: string, code?: string) {
  const body: ApiError = code ? { message, code } : { message }
  return NextResponse.json(body, { status })
}

/**
 * Resolve a shareToken to its project id. Central choke point for invariant 4:
 * every mutation scopes its DB statements to this id. Returns null on unknown token.
 */
export async function projectIdForToken(shareToken: string): Promise<string | null> {
  const sb = supabaseServer()
  const { data, error } = await sb
    .from('projects')
    .select('id')
    .eq('share_token', shareToken)
    .maybeSingle()
  if (error) throw error
  return data?.id ?? null
}

/** Maps the submit_round RPC's SQLSTATEs to HTTP responses (rules/next/error-handling). */
export function submitRoundErrorResponse(code: string | undefined, rawMessage: string) {
  const mapped = mapSubmitRoundError(code)
  if (mapped.status === 500) {
    // 원문은 서버 로그로만 — 익명 응답엔 일반 메시지.
    console.error('[rounds POST] submit_round failed:', code, rawMessage)
  }
  return apiError(mapped.status, mapped.message, mapped.code)
}
