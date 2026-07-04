import type { components } from './schema'

// Ergonomic aliases DERIVED from the generated OpenAPI schema (rules/40 — never hand-write
// wire types). These are the single source of truth for the HTTP boundary shapes shared by
// Route Handlers, the openapi-fetch client, RSC reads, and React Query hooks.
export type ProjectDTO = components['schemas']['Project']
export type PinDTO = components['schemas']['Pin']
export type RoundDTO = components['schemas']['Round']
export type PinCreateDTO = components['schemas']['PinCreate']
export type PinUpdateDTO = components['schemas']['PinUpdate']
export type ApiError = components['schemas']['Error']
