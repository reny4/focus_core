import type { SupabaseClient } from '@supabase/supabase-js'
import type { IAnalyticsQueryService } from '@/application/analytics/queries/IAnalyticsQueryService'
import type {
  DailyStatsDto,
  WeeklyStatsDto,
  MonthlyStatsDto,
  YearlyStatsDto,
  YearHeatmapDto,
  HeatmapDayDto,
  TagBreakdownDto,
  SessionHistoryDto,
  SessionSummaryDto,
} from '@/application/analytics/dto/AnalyticsDtos'
import type { UUID } from '@/domain/shared/types/UUID'
import { getDayRangeUtc } from '@/lib/time/timezone'
import { addDays, format } from 'date-fns'

function calcLevel(totalSeconds: number): 0 | 1 | 2 | 3 | 4 {
  if (totalSeconds === 0)         return 0
  if (totalSeconds <  30 * 60)   return 1
  if (totalSeconds <  60 * 60)   return 2
  if (totalSeconds < 120 * 60)   return 3
  return 4
}

function rowToSessionSummary(row: {
  id: string
  focus_task_name_snapshot: string
  tag_name_snapshot: string
  tag_color_snapshot: string
  target_duration_seconds: number
  actual_duration_seconds: number | null
  started_at: string
  ended_at: string | null
}): SessionSummaryDto {
  const actual = row.actual_duration_seconds ?? 0
  const target = row.target_duration_seconds
  return {
    sessionId: row.id,
    focusTaskName: row.focus_task_name_snapshot,
    tagName: row.tag_name_snapshot,
    tagColor: row.tag_color_snapshot,
    targetDurationSeconds: target,
    actualDurationSeconds: actual,
    startedAt: row.started_at,
    endedAt: row.ended_at ?? '',
    overrunSeconds: Math.max(actual - target, 0),
  }
}

export class SupabaseAnalyticsQueryService implements IAnalyticsQueryService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getDailyStats(userId: UUID, date: string, timezone: string): Promise<DailyStatsDto> {
    const { from, to } = getDayRangeUtc(date, timezone)

    const { data: rows, error } = await this.supabase.rpc('get_daily_stats', {
      p_user_id: userId,
      p_from_utc: from.toISOString(),
      p_to_utc: to.toISOString(),
      p_timezone: timezone,
    })

    // Fallback to JS-side query if RPC not available
    const { data: sessions, error: sessErr } = await this.supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .gte('started_at', from.toISOString())
      .lt('started_at', to.toISOString())
      .order('started_at', { ascending: true })

    if (sessErr) throw sessErr

    const sessionList = (sessions ?? [])
    const hourlyMap = new Map<number, number>()
    let total = 0

    for (const s of sessionList) {
      const actual = s.actual_duration_seconds ?? 0
      total += actual
      // Extract hour in user's timezone
      const hour = new Date(
        new Date(s.started_at).toLocaleString('en-US', { timeZone: timezone })
      ).getHours()
      hourlyMap.set(hour, (hourlyMap.get(hour) ?? 0) + actual)
    }

    const hourly = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      totalSeconds: hourlyMap.get(h) ?? 0,
    }))

    return {
      date,
      totalSeconds: total,
      hourly,
      sessions: sessionList.map(rowToSessionSummary),
    }
  }

  async getWeeklyStats(userId: UUID, startDate: string, timezone: string): Promise<WeeklyStatsDto> {
    const start = new Date(`${startDate}T00:00:00`)
    const endDate = format(addDays(start, 6), 'yyyy-MM-dd')

    const { from } = getDayRangeUtc(startDate, timezone)
    const { to } = getDayRangeUtc(endDate, timezone)

    const { data: sessions, error } = await this.supabase
      .from('focus_sessions')
      .select('started_at, actual_duration_seconds')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .gte('started_at', from.toISOString())
      .lt('started_at', to.toISOString())

    if (error) throw error

    const dayMap = new Map<string, number>()
    for (const s of sessions ?? []) {
      const dayStr = format(
        new Date(new Date(s.started_at).toLocaleString('en-US', { timeZone: timezone })),
        'yyyy-MM-dd'
      )
      dayMap.set(dayStr, (dayMap.get(dayStr) ?? 0) + (s.actual_duration_seconds ?? 0))
    }

    const dailyTotals = Array.from({ length: 7 }, (_, i) => {
      const d = format(addDays(start, i), 'yyyy-MM-dd')
      return { date: d, totalSeconds: dayMap.get(d) ?? 0 }
    })

    return { startDate, endDate, dailyTotals }
  }

  async getMonthlyStats(userId: UUID, year: number, month: number, timezone: string): Promise<MonthlyStatsDto> {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, '0')}-01`

    const { from } = getDayRangeUtc(startDate, timezone)
    const { from: to } = getDayRangeUtc(nextMonth, timezone)

    const { data: sessions, error } = await this.supabase
      .from('focus_sessions')
      .select('started_at, actual_duration_seconds')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .gte('started_at', from.toISOString())
      .lt('started_at', to.toISOString())

    if (error) throw error

    const dayMap = new Map<string, number>()
    for (const s of sessions ?? []) {
      const dayStr = format(
        new Date(new Date(s.started_at).toLocaleString('en-US', { timeZone: timezone })),
        'yyyy-MM-dd'
      )
      dayMap.set(dayStr, (dayMap.get(dayStr) ?? 0) + (s.actual_duration_seconds ?? 0))
    }

    // Generate all days in the month
    const daysInMonth = new Date(year, month, 0).getDate()
    const dailyTotals = Array.from({ length: daysInMonth }, (_, i) => {
      const d = `${year}-${String(month).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
      return { date: d, totalSeconds: dayMap.get(d) ?? 0 }
    })

    return { year, month, dailyTotals }
  }

  async getYearlyStats(userId: UUID, year: number, timezone: string): Promise<YearlyStatsDto> {
    const { from: yearStart } = getDayRangeUtc(`${year}-01-01`, timezone)
    const { from: yearEnd } = getDayRangeUtc(`${year + 1}-01-01`, timezone)

    const { data: sessions, error } = await this.supabase
      .from('focus_sessions')
      .select('started_at, actual_duration_seconds')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .gte('started_at', yearStart.toISOString())
      .lt('started_at', yearEnd.toISOString())

    if (error) throw error

    const monthMap = new Map<number, number>()
    for (const s of sessions ?? []) {
      const m = new Date(
        new Date(s.started_at).toLocaleString('en-US', { timeZone: timezone })
      ).getMonth() + 1
      monthMap.set(m, (monthMap.get(m) ?? 0) + (s.actual_duration_seconds ?? 0))
    }

    const monthlyTotals = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      totalSeconds: monthMap.get(i + 1) ?? 0,
    }))

    return { year, monthlyTotals }
  }

  async getYearHeatmap(userId: UUID, year: number, timezone: string): Promise<YearHeatmapDto> {
    const { from: yearStart } = getDayRangeUtc(`${year}-01-01`, timezone)
    const { from: yearEnd } = getDayRangeUtc(`${year + 1}-01-01`, timezone)

    const { data: sessions, error } = await this.supabase
      .from('focus_sessions')
      .select('started_at, actual_duration_seconds')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .gte('started_at', yearStart.toISOString())
      .lt('started_at', yearEnd.toISOString())

    if (error) throw error

    const dayMap = new Map<string, number>()
    for (const s of sessions ?? []) {
      const dayStr = format(
        new Date(new Date(s.started_at).toLocaleString('en-US', { timeZone: timezone })),
        'yyyy-MM-dd'
      )
      dayMap.set(dayStr, (dayMap.get(dayStr) ?? 0) + (s.actual_duration_seconds ?? 0))
    }

    // Generate all days of the year
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0
    const daysInYear = isLeap ? 366 : 365
    const startDate = new Date(`${year}-01-01T00:00:00`)

    const days: HeatmapDayDto[] = Array.from({ length: daysInYear }, (_, i) => {
      const d = format(addDays(startDate, i), 'yyyy-MM-dd')
      const totalSeconds = dayMap.get(d) ?? 0
      return { date: d, totalSeconds, level: calcLevel(totalSeconds) }
    })

    return { year, days }
  }

  async getTagBreakdown(userId: UUID, from: string, to: string, timezone: string): Promise<TagBreakdownDto> {
    const { from: fromUtc } = getDayRangeUtc(from, timezone)
    const { to: toUtc } = getDayRangeUtc(to, timezone)

    const { data: sessions, error } = await this.supabase
      .from('focus_sessions')
      .select('tag_id, tag_name_snapshot, tag_color_snapshot, actual_duration_seconds')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .gte('started_at', fromUtc.toISOString())
      .lt('started_at', toUtc.toISOString())

    if (error) throw error

    const tagMap = new Map<string, { tagName: string; tagColor: string; totalSeconds: number }>()

    for (const s of sessions ?? []) {
      const existing = tagMap.get(s.tag_id)
      if (existing) {
        existing.totalSeconds += s.actual_duration_seconds ?? 0
      } else {
        tagMap.set(s.tag_id, {
          tagName: s.tag_name_snapshot,
          tagColor: s.tag_color_snapshot,
          totalSeconds: s.actual_duration_seconds ?? 0,
        })
      }
    }

    const totalSeconds = Array.from(tagMap.values()).reduce((acc, t) => acc + t.totalSeconds, 0)

    if (totalSeconds === 0) {
      return { totalSeconds: 0, tags: [] }
    }

    const tags = Array.from(tagMap.entries())
      .map(([tagId, t]) => ({
        tagId,
        tagName: t.tagName,
        tagColor: t.tagColor,
        totalSeconds: t.totalSeconds,
        ratio: Math.round((t.totalSeconds / totalSeconds) * 1000) / 10,
      }))
      .sort((a, b) => b.totalSeconds - a.totalSeconds)

    return { totalSeconds, tags }
  }

  async getSessionHistory(userId: UUID, from: string, to: string): Promise<SessionHistoryDto> {
    const fromUtc = new Date(`${from}T00:00:00.000Z`)
    const toUtc = new Date(`${to}T23:59:59.999Z`)

    const { data: sessions, error } = await this.supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'finished')
      .gte('started_at', fromUtc.toISOString())
      .lte('started_at', toUtc.toISOString())
      .order('started_at', { ascending: false })
      .limit(100)

    if (error) throw error

    return {
      sessions: (sessions ?? []).map(rowToSessionSummary),
    }
  }
}
