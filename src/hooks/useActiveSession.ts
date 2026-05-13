import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const ACTIVE_SESSION_KEY = ['focus-sessions', 'active'] as const

export function useActiveSession() {
  return useQuery({
    queryKey: ACTIVE_SESSION_KEY,
    queryFn: async () => {
      const res = await fetch('/api/focus-sessions/active')
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as {
        exists: boolean
        session: {
          sessionId: string
          focusTaskId: string
          focusTaskName: string
          tagId: string
          tagName: string
          tagColor: string
          targetDurationSeconds: number
          startedAt: string
          serverNow: string
          elapsedSeconds: number
          phase: 'counting_down' | 'counting_up'
          remainingSeconds: number
          overrunSeconds: number
          requiresReview: boolean
        } | null
      }
    },
    staleTime: Infinity,
    refetchOnWindowFocus: true,
  })
}

type StartSessionInput = {
  focusTaskId: string
  targetDurationSeconds: number
  focusTaskName: string
  tagName: string
  tagColor: string
}

export function useStartSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: StartSessionInput) => {
      const res = await fetch('/api/focus-sessions/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focusTaskId: input.focusTaskId,
          targetDurationSeconds: input.targetDurationSeconds,
        }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ACTIVE_SESSION_KEY })
      const previous = queryClient.getQueryData(ACTIVE_SESSION_KEY)
      queryClient.setQueryData(ACTIVE_SESSION_KEY, {
        exists: true,
        session: {
          sessionId: 'optimistic',
          focusTaskId: input.focusTaskId,
          focusTaskName: input.focusTaskName,
          tagId: '',
          tagName: input.tagName,
          tagColor: input.tagColor,
          targetDurationSeconds: input.targetDurationSeconds,
          startedAt: new Date().toISOString(),
          serverNow: new Date().toISOString(),
          elapsedSeconds: 0,
          phase: 'counting_down' as const,
          remainingSeconds: input.targetDurationSeconds,
          overrunSeconds: 0,
          requiresReview: false,
        },
      })
      return { previous }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY })
    },
    onError: (_err, _input, context) => {
      queryClient.setQueryData(ACTIVE_SESSION_KEY, context?.previous)
    },
  })
}

export function useFinishSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/focus-sessions/finish', { method: 'POST' })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY })
    },
  })
}

export function useDiscardSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/focus-sessions/discard', { method: 'POST' })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_KEY })
    },
  })
}
