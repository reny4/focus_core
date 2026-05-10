export type GetGrowthResponse = {
  totalXp: number
  level: number
  levelCap: number
  xpInCurrentLevel: number
  xpRequiredForNextLevel: number
  progressRatio: number
  prestige: number
  canPrestige: boolean
  totalLevel: number
}

export type SessionSummaryDto = {
  sessionId: string
  focusTaskName: string
  tagName: string
  tagColor: string
  targetDurationSeconds: number
  actualDurationSeconds: number
  startedAt: string
  endedAt: string
  overrunSeconds: number
}

export type DailyStatsDto = {
  date: string
  totalSeconds: number
  hourly: Array<{ hour: number; totalSeconds: number }>
  sessions: SessionSummaryDto[]
}

export type WeeklyStatsDto = {
  startDate: string
  endDate: string
  dailyTotals: Array<{ date: string; totalSeconds: number }>
}

export type MonthlyStatsDto = {
  year: number
  month: number
  dailyTotals: Array<{ date: string; totalSeconds: number }>
}

export type YearlyStatsDto = {
  year: number
  monthlyTotals: Array<{ month: number; totalSeconds: number }>
}

export type HeatmapDayDto = {
  date: string
  totalSeconds: number
  level: 0 | 1 | 2 | 3 | 4
}

export type YearHeatmapDto = {
  year: number
  days: HeatmapDayDto[]
}

export type TagBreakdownDto = {
  totalSeconds: number
  tags: Array<{
    tagId: string
    tagName: string
    tagColor: string
    totalSeconds: number
    ratio: number
  }>
}

export type SessionHistoryDto = {
  sessions: SessionSummaryDto[]
}

export type TaskGrowthItemDto = {
  focusTaskId: string
  focusTaskName: string
  tagName: string
  tagColor: string
  totalSeconds: number
  totalXp: number
  level: number
  progressRatio: number
  sessionCount: number
}

export type GetTaskGrowthResponse = {
  tasks: TaskGrowthItemDto[]
}
