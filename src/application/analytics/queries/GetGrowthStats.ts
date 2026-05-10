import type { GetGrowthResponse } from '../dto/AnalyticsDtos'

export const XP_PER_LEVEL = 7200
export const LEVEL_CAP = 100
const XP_PER_PRESTIGE = 720000

export function calcGrowthStats(totalXp: number, prestigeCount: number): GetGrowthResponse {
  const xpInCurrentPrestige = totalXp - prestigeCount * XP_PER_PRESTIGE
  const rawLevel = Math.floor(xpInCurrentPrestige / XP_PER_LEVEL) + 1
  const level = Math.min(LEVEL_CAP, rawLevel)
  const isMaxLevel = level === LEVEL_CAP

  const xpInCurrentLevel = isMaxLevel ? XP_PER_LEVEL : xpInCurrentPrestige % XP_PER_LEVEL
  const progressRatio = isMaxLevel ? 1 : xpInCurrentLevel / XP_PER_LEVEL

  return {
    totalXp,
    level,
    levelCap: LEVEL_CAP,
    xpInCurrentLevel,
    xpRequiredForNextLevel: XP_PER_LEVEL,
    progressRatio,
    prestige: prestigeCount,
    canPrestige: isMaxLevel,
    totalLevel: prestigeCount * LEVEL_CAP + level,
  }
}
