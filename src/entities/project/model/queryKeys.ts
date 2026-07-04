// Query keys for the project resource, colocated + exported (rules/40, rules/next/state-and-data).
// No server-only / Supabase import here so it is safe to pull into client hooks.
export const projectQueryKey = (shareToken: string) => ['project', shareToken] as const
