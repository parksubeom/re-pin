'use client'

import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/shared/api/client'
import type { ProjectDTO } from '@/shared/api/types'

import { projectQueryKey } from '../model/queryKeys'

/**
 * Client-side project read via the typed /api client. Use for interactive refetch after
 * mutations; pass the RSC-fetched project as initialData to avoid a refetch on first render
 * (rules/next/state-and-data).
 */
export function useProjectQuery(shareToken: string, initialData?: ProjectDTO) {
  return useQuery({
    queryKey: projectQueryKey(shareToken),
    queryFn: async () => {
      const { data, error } = await apiClient.GET('/projects/{shareToken}', {
        params: { path: { shareToken } },
      })
      if (error) throw error
      return data
    },
    initialData,
  })
}
