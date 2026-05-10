import type {
  DailyStatsDto,
  WeeklyStatsDto,
  MonthlyStatsDto,
  YearlyStatsDto,
  YearHeatmapDto,
  TagBreakdownDto,
  SessionHistoryDto,
  GetGrowthResponse,
  GetTaskGrowthResponse,
} from '../dto/AnalyticsDtos'
import type { UUID } from '@/domain/shared/types/UUID'

export interface IAnalyticsQueryService {
  getDailyStats(userId: UUID, date: string, timezone: string): Promise<DailyStatsDto>
  getWeeklyStats(userId: UUID, startDate: string, timezone: string): Promise<WeeklyStatsDto>
  getMonthlyStats(userId: UUID, year: number, month: number, timezone: string): Promise<MonthlyStatsDto>
  getYearlyStats(userId: UUID, year: number, timezone: string): Promise<YearlyStatsDto>
  getYearHeatmap(userId: UUID, year: number, timezone: string): Promise<YearHeatmapDto>
  getTagBreakdown(userId: UUID, from: string, to: string, timezone: string): Promise<TagBreakdownDto>
  getSessionHistory(userId: UUID, from: string, to: string): Promise<SessionHistoryDto>
  getGrowthStats(userId: UUID): Promise<GetGrowthResponse>
  getTaskGrowthStats(userId: UUID): Promise<GetTaskGrowthResponse>
}
