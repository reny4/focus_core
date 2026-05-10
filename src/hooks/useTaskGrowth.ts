'use client'

import { useQuery } from '@tanstack/react-query'
import type { GetTaskGrowthResponse } from '@/application/analytics/dto/AnalyticsDtos'

export function useTaskGrowth() {
  const query = useQuery({
    queryKey: ['analytics', 'task-growth'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/task-growth')
      const data = await res.json()
      if (!data.ok) throw new Error(data.error?.message ?? 'タスク別成長の取得に失敗しました')
      return data.value as GetTaskGrowthResponse
    },
    staleTime: 5 * 60 * 1000,
  })

  return {
    taskGrowth: query.data,
    isLoading: query.isLoading,
  }
}
