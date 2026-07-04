'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { projectQueryKey } from '@/entities/project'
import { apiClient } from '@/shared/api/client'
import type { PinCreateDTO, PinUpdateDTO } from '@/shared/api/types'

// Pin mutations for the no-login client flow (rules/next/state-and-data: writes via typed /api).
// Each invalidates the project query so the canvas re-reads pins/rounds/remaining.

export function useAddPin(shareToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: PinCreateDTO) => {
      const { data, error } = await apiClient.POST('/projects/{shareToken}/pins', {
        params: { path: { shareToken } },
        body: input,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectQueryKey(shareToken) }),
  })
}

export function useUpdateDraftPin(shareToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { pinId: string; patch: PinUpdateDTO }) => {
      const { data, error } = await apiClient.PATCH('/projects/{shareToken}/pins/{pinId}', {
        params: { path: { shareToken, pinId: input.pinId } },
        body: input.patch,
      })
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectQueryKey(shareToken) }),
  })
}

export function useDeleteDraftPin(shareToken: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (pinId: string) => {
      const { error } = await apiClient.DELETE('/projects/{shareToken}/pins/{pinId}', {
        params: { path: { shareToken, pinId } },
      })
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: projectQueryKey(shareToken) }),
  })
}
