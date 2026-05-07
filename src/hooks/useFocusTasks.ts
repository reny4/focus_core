import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export type FocusTaskDto = {
  id: string
  name: string
  tagId: string
  tagName: string
  tagColor: string
}

export const FOCUS_TASKS_KEY = ['focus-tasks'] as const

export function useFocusTasks() {
  return useQuery({
    queryKey: FOCUS_TASKS_KEY,
    queryFn: async () => {
      const res = await fetch('/api/focus-tasks')
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as { focusTasks: FocusTaskDto[] }
    },
    staleTime: 30 * 1000,
  })
}

export function useCreateFocusTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { name: string; tagId: string }) => {
      const res = await fetch('/api/focus-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as FocusTaskDto
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FOCUS_TASKS_KEY }),
  })
}

export function useUpdateFocusTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: { focusTaskId: string; name: string; tagId: string }) => {
      const { focusTaskId, ...body } = input
      const res = await fetch(`/api/focus-tasks/${focusTaskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as FocusTaskDto
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FOCUS_TASKS_KEY }),
  })
}

export function useArchiveFocusTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (focusTaskId: string) => {
      const res = await fetch(`/api/focus-tasks/${focusTaskId}/archive`, { method: 'POST' })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: FOCUS_TASKS_KEY }),
  })
}
