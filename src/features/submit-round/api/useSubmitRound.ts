'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { projectQueryKey } from '@/entities/project'
import { apiClient } from '@/shared/api/client'

// Submits the current draft pins as a new round. On success the project query is invalidated
// so the "remaining rounds" counter and pin statuses refresh.
export function useSubmitRound(shareToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data, error } = await apiClient.POST('/projects/{shareToken}/rounds', {
        params: { path: { shareToken } },
      })
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectQueryKey(shareToken) }),
  })
}
