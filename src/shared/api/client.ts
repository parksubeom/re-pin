import createClient from 'openapi-fetch'

import type { paths } from './schema'

// Typed HTTP client for our own /api Route Handlers (rules/40).
// baseUrl is authoritative: the OpenAPI spec's paths are written without the /api prefix,
// and this prepends it. Browser-safe — no server-only / Supabase import here.
// Same-origin relative baseUrl works in the browser; on the server, callers use the RSC-direct
// entity fns instead of this client.
export const apiClient = createClient<paths>({ baseUrl: '/api' })
