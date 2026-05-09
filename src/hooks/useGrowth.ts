'use client'

import { useQuery } from '@tanstack/react-query'
import type { GetGrowthResponse } from '@/application/analytics/dto/AnalyticsDtos'

const STALE = 5 * 60 * 1000

export function useGrowth() {
  const query = useQuery({
    queryKey: ['analytics', 'growth'],
    queryFn: async () => {
      const res = await fetch('/api/analytics/growth')
      const data = await res.json()
      if (!data.ok) throw new Error(data.error?.message ?? 'Growth取得に失敗しました')
      return data.value as GetGrowthResponse
    },
    staleTime: STALE,
  })

  return {
    growth: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  }
}
