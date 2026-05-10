'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw } from 'lucide-react'
import { StarDisplay } from '@/components/growth/StarDisplay'

type Props = {
  level: number
  levelCap: number
  progressRatio: number
  prestige: number
  canPrestige: boolean
  isAnimating?: boolean
  onPrestigeClick?: () => void
}

export function GrowthIndicator({
  level,
  levelCap,
  progressRatio,
  prestige,
  canPrestige,
  isAnimating = false,
  onPrestigeClick,
}: Props) {
  const progressPercent = Math.round(progressRatio * 100)

  const ariaLabel = canPrestige
    ? `Focus Core レベル${level}、Prestige可能`
    : `Focus Core レベル${level}、次のレベルまで${progressPercent}パーセント`

  return (
    <div
      className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground select-none"
      aria-label={ariaLabel}
    >
      {/* Stars */}
      <AnimatePresence>
        {prestige > 0 && (
          <motion.span
            key={prestige}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <StarDisplay count={prestige} className="text-[10px] leading-none" />
          </motion.span>
        )}
      </AnimatePresence>

      <span className="font-medium tabular-nums">Lv.{level}</span>

      {canPrestige ? (
        <button
          type="button"
          onClick={onPrestigeClick}
          className="flex items-center gap-1 px-2 h-[18px] rounded-full text-[#A78BFA] text-[10px] font-medium transition-colors"
          style={{
            background: 'rgba(124,124,255,0.15)',
            border: '1px solid rgba(124,124,255,0.4)',
            width: '80px',
          }}
          aria-label="Prestigeを実行する"
        >
          <RotateCcw className="size-2.5 shrink-0" aria-hidden="true" />
          Prestige
        </button>
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
