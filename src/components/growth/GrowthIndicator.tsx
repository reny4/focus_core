'use client'

import { motion } from 'framer-motion'
import type { GetGrowthResponse } from '@/application/analytics/dto/AnalyticsDtos'

type Props = {
  growth: GetGrowthResponse | undefined
  isAnimating?: boolean
}

export function GrowthIndicator({ growth, isAnimating = false }: Props) {
  if (!growth) return null

  const isMaxLevel = growth.level === growth.levelCap
  const progressPercent = Math.round(growth.progressRatio * 100)

  const ariaLabel = isMaxLevel
    ? `Focus Core レベル${growth.level}、MAX`
    : `Focus Core レベル${growth.level}、次のレベルまで${progressPercent}パーセント`

  return (
    <div
      className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground select-none"
      aria-label={ariaLabel}
    >
      <span className="font-medium tabular-nums">Lv.{growth.level}</span>

      {isMaxLevel ? (
        <span className="text-[#7C7CFF] font-semibold">MAX</span>
      ) : (
        <>
          <div className="w-20 h-[5px] rounded-full bg-white/[0.08] overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, #7C7CFF 0%, #5A5AD6 100%)',
              }}
              initial={false}
              animate={{
                width: `${progressPercent}%`,
                boxShadow: isAnimating
                  ? '0 0 12px rgba(124,124,255,0.45)'
                  : '0 0 0px rgba(124,124,255,0)',
              }}
              transition={{ duration: 0.8, ease: [0.33, 1, 0.68, 1] }}
            />
          </div>
          <span className="tabular-nums">{progressPercent}%</span>
        </>
      )}
    </div>
  )
}
