import 'server-only'

import { NextResponse } from 'next/server'

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
export function submitRoundErrorResponse(code: string | undefined, message: string) {
  switch (code) {
    case 'P0002':
      return apiError(404, 'unknown share token', code)
    case 'P0003':
      return apiError(409, 'no draft pins to submit', code)
    case 'P0004':
      return apiError(409, 'no remaining rounds', code)
    default:
      return apiError(500, message || 'submit failed', code)
  }
}
