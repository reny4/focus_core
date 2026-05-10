'use client'

import { formatSeconds } from '@/lib/time/duration'
import { StarDisplay } from '@/components/growth/StarDisplay'

type Props = {
  level: number
  levelCap: number
  prestige: number
  totalLevel: number
  progressRatio: number
  xpInCurrentLevel: number
  xpRequiredForNextLevel: number
  canPrestige: boolean
}

export function GrowthLevelCard({
  level,
  levelCap,
  prestige,
  totalLevel,
  progressRatio,
  xpInCurrentLevel,
  xpRequiredForNextLevel,
  canPrestige,
}: Props) {
  const progressPercent = Math.round(progressRatio * 100)
  const xpRemaining = xpRequiredForNextLevel - xpInCurrentLevel
  const timeRemaining = formatSeconds(xpRemaining)

  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* 総レベル */}
      <div className="flex items-baseline justify-between mb-3">
        <span className="text-xs text-muted-foreground">総レベル</span>
        <span className="text-2xl font-semibold tabular-nums tracking-tight">
          {totalLevel}
        </span>
      </div>

      {/* Level row */}
      <div className="flex items-center gap-2 text-sm">
        {prestige > 0 && (
          <span className="text-[11px] leading-none shrink-0">
            <StarDisplay count={prestige} />
          </span>
        )}
        <span className="font-medium tabular-nums shrink-0">Lv.{level}</span>

        {/* XP bar */}
        <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #7C7CFF 0%, #5A5AD6 100%)',
            }}
          />
        </div>

        {/* Status */}
        {canPrestige ? (
          <span className="text-[11px] text-[#A78BFA] font-medium shrink-0">MAX</span>
        ) : (
          <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">
            {timeRemaining}
          </span>
        )}
      </div>
    </div>
  )
}

export function GrowthLevelCardSkeleton() {
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-baseline justify-between mb-3">
        <div className="h-3 w-12 rounded bg-white/[0.06] animate-pulse" />
        <div className="h-6 w-8 rounded bg-white/[0.06] animate-pulse" />
      </div>
      <div className="flex items-center gap-2">
        <div className="h-3 w-10 rounded bg-white/[0.06] animate-pulse" />
        <div className="flex-1 h-[5px] rounded-full bg-white/[0.06] animate-pulse" />
        <div className="h-3 w-12 rounded bg-white/[0.06] animate-pulse" />
      </div>
    </div>
  )
}
