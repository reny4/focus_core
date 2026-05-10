import { describe, it, expect } from 'vitest'
import { calcGrowthStats } from '@/application/analytics/queries/GetGrowthStats'

describe('calcGrowthStats', () => {
  describe('Prestige 0回目', () => {
    it('total_xp = 0 → level: 1, progressRatio: 0', () => {
      const r = calcGrowthStats(0, 0)
      expect(r.level).toBe(1)
      expect(r.xpInCurrentLevel).toBe(0)
      expect(r.progressRatio).toBe(0)
      expect(r.canPrestige).toBe(false)
      expect(r.totalLevel).toBe(1)
    })

    it('total_xp = 7199 → level: 1, xpInCurrentLevel: 7199', () => {
      const r = calcGrowthStats(7199, 0)
      expect(r.level).toBe(1)
      expect(r.xpInCurrentLevel).toBe(7199)
      expect(r.progressRatio).toBeCloseTo(7199 / 7200)
      expect(r.canPrestige).toBe(false)
    })

    it('total_xp = 7200 → level: 2, xpInCurrentLevel: 0', () => {
      const r = calcGrowthStats(7200, 0)
      expect(r.level).toBe(2)
      expect(r.xpInCurrentLevel).toBe(0)
      expect(r.progressRatio).toBe(0)
    })

    it('total_xp = 712800 → level: 100, progressRatio: 1', () => {
      const r = calcGrowthStats(712800, 0)
      expect(r.level).toBe(100)
      expect(r.xpInCurrentLevel).toBe(7200)
      expect(r.progressRatio).toBe(1)
      expect(r.canPrestige).toBe(true)
      expect(r.totalLevel).toBe(100)
    })

    it('total_xp = 720000 → level: 100（上限）, progressRatio: 1', () => {
      const r = calcGrowthStats(720000, 0)
      expect(r.level).toBe(100)
      expect(r.xpInCurrentLevel).toBe(7200)
      expect(r.progressRatio).toBe(1)
      expect(r.canPrestige).toBe(true)
    })
  })

  describe('Prestige 1回目実行後', () => {
    it('total_xp = 750000, prestige_count = 1 → level: 5', () => {
      const r = calcGrowthStats(750000, 1)
      // xpInCurrentPrestige = 750000 - 720000 = 30000
      // level = floor(30000 / 7200) + 1 = 4 + 1 = 5
      expect(r.level).toBe(5)
      expect(r.xpInCurrentLevel).toBe(30000 % 7200) // 1200
      expect(r.progressRatio).toBeCloseTo(1200 / 7200)
      expect(r.canPrestige).toBe(false)
      expect(r.totalLevel).toBe(100 + 5) // 105
    })
  })

  describe('Prestige 2回目実行後', () => {
    it('total_xp = 1500000, prestige_count = 2 → level: 9', () => {
      const r = calcGrowthStats(1500000, 2)
      // xpInCurrentPrestige = 1500000 - 1440000 = 60000
      // level = floor(60000 / 7200) + 1 = 8 + 1 = 9
      // xpInCurrentLevel = 60000 % 7200 = 60000 - 57600 = 2400
      expect(r.level).toBe(9)
      expect(r.xpInCurrentLevel).toBe(2400)
      expect(r.progressRatio).toBeCloseTo(2400 / 7200)
      expect(r.totalLevel).toBe(200 + 9) // 209
    })
  })
})
