'use client'

// Client-side providers bundle for the App Router.
// Mounted once from the root `app/layout.tsx` (rules/next/state-and-data).
// Lives beside the routing entry (root `app/`) rather than under `src/app/`, because
// Next treats any `src/app/` as an App Router dir and would clash with the root `app/`.
import { QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

import { makeQueryClient } from '@/shared/api/query-client'

export function Providers({ children }: { children: ReactNode }) {
  // One QueryClient per browser session — created lazily so it isn't shared
  // across requests on the server.
  const [queryClient] = useState(() => makeQueryClient())

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
