import { QueryClient } from '@tanstack/react-query'

// Shared factory so the server and the browser build QueryClients the same way.
// In RSC you can create one per request; in the browser Providers keeps one per
// session (rules/next/state-and-data).
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // SSR-friendly: with a >0 staleTime, data fetched on the server isn't
        // immediately refetched on the client after hydration.
        staleTime: 60 * 1000,
      },
    },
  })
}
