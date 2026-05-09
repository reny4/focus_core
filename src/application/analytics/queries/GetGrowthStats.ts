import type { GetGrowthResponse } from '../dto/AnalyticsDtos'

const XP_PER_LEVEL = 7200
const LEVEL_CAP = 100

export function calcGrowthStats(totalXp: number, prestigeCount: number): GetGrowthResponse {
  const rawLevel = Math.floor(totalXp / XP_PER_LEVEL) + 1
  const level = Math.min(LEVEL_CAP, rawLevel)
  const isMaxLevel = level === LEVEL_CAP

  const xpInCurrentLevel = isMaxLevel ? XP_PER_LEVEL : totalXp % XP_PER_LEVEL
  const progressRatio = isMaxLevel ? 1 : xpInCurrentLevel / XP_PER_LEVEL

  return {
    totalXp,
    level,
    levelCap: LEVEL_CAP,
    xpInCurrentLevel,
    xpRequiredForNextLevel: XP_PER_LEVEL,
    progressRatio,
    prestige: prestigeCount,
  }
}
