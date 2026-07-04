'use client'

import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/shared/api/client'

import { projectQueryKey } from '../model/queryKeys'

/**
 * Client-side project read via the typed /api client. Use for interactive refetch after
 * mutations; the first render is fed by the RSC-direct read as initialData (rules/next/state-and-data).
 */
export function useProjectQuery(shareToken: string) {
  return useQuery({
    queryKey: projectQueryKey(shareToken),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/projects/{shareToken}', {
        params: { path: { shareToken } },
      })
      if (error) throw error
      return data
    },
  })
}
