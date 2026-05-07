import { useQuery } from '@tanstack/react-query'
import type {
  DailyStatsDto,
  WeeklyStatsDto,
  MonthlyStatsDto,
  YearlyStatsDto,
  YearHeatmapDto,
  TagBreakdownDto,
  SessionHistoryDto,
} from '@/application/analytics/dto/AnalyticsDtos'

const STALE = 5 * 60 * 1000

export function useDailyStats(date: string) {
  return useQuery({
    queryKey: ['analytics', 'daily', date],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/daily?date=${date}`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as DailyStatsDto
    },
    staleTime: STALE,
  })
}

export function useWeeklyStats(startDate: string) {
  return useQuery({
    queryKey: ['analytics', 'weekly', startDate],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/weekly?startDate=${startDate}`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as WeeklyStatsDto
    },
    staleTime: STALE,
  })
}

export function useMonthlyStats(year: number, month: number) {
  return useQuery({
    queryKey: ['analytics', 'monthly', year, month],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/monthly?year=${year}&month=${month}`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as MonthlyStatsDto
    },
    staleTime: STALE,
  })
}

export function useYearlyStats(year: number) {
  return useQuery({
    queryKey: ['analytics', 'yearly', year],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/yearly?year=${year}`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as YearlyStatsDto
    },
    staleTime: STALE,
  })
}

export function useYearHeatmap(year: number) {
  return useQuery({
    queryKey: ['analytics', 'heatmap', year],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/heatmap?year=${year}`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as YearHeatmapDto
    },
    staleTime: STALE,
  })
}

export function useTagBreakdown(from: string, to: string) {
  return useQuery({
    queryKey: ['analytics', 'tags', from, to],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/tags?from=${from}&to=${to}`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as TagBreakdownDto
    },
    staleTime: STALE,
  })
}

export function useSessionHistory(from: string, to: string) {
  return useQuery({
    queryKey: ['analytics', 'sessions', from, to],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/sessions?from=${from}&to=${to}`)
      const data = await res.json()
      if (!data.ok) throw new Error(data.error.message)
      return data.value as SessionHistoryDto
    },
    staleTime: STALE,
  })
}
