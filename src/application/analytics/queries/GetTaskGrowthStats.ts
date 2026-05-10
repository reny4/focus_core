import type { TaskGrowthItemDto } from '../dto/AnalyticsDtos'
import { XP_PER_LEVEL, LEVEL_CAP } from './GetGrowthStats'

export function calcTaskLevel(totalSeconds: number): Pick<TaskGrowthItemDto, 'totalXp' | 'level' | 'progressRatio'> {
  const totalXp = totalSeconds
  const rawLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const level = Math.min(LEVEL_CAP, rawLevel)
  const isMaxLevel = level === LEVEL_CAP
  const xpInLevel = isMaxLevel ? XP_PER_LEVEL : totalXp % XP_PER_LEVEL
  const progressRatio = isMaxLevel ? 1 : xpInLevel / XP_PER_LEVEL
  return { totalXp, level, progressRatio }
}
