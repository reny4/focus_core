import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type TagDto = {
  id: string
  name: string
  color: string
}

export const TAGS_KEY = ['tags'] as const

export function useTags() {
  return useQuery({
    queryKey: TAGS_KEY,
    queryFn: async () => {
      const res = await fetch('/api/tags')
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as { tags: TagDto[] }
    },
    staleTime: 30 * 1000,
  })
}

export function useCreateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; color: string }) => {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as TagDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY })
    },
  })
}

export function useUpdateTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { tagId: string; name: string; color: string }) => {
      const { tagId, ...body } = input
      const res = await fetch(`/api/tags/${tagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as TagDto
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY })
      queryClient.invalidateQueries({ queryKey: ['focus-tasks'] })
    },
  })
}

export function useArchiveTag() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (tagId: string) => {
      const res = await fetch(`/api/tags/${tagId}/archive`, { method: 'POST' })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TAGS_KEY })
      queryClient.invalidateQueries({ queryKey: ['focus-tasks'] })
    },
  })
}
