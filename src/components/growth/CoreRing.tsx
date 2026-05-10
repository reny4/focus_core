'use client'

import { motion, AnimatePresence } from 'framer-motion'

type CoreRingProps = {
  phase: 'idle' | 'counting_down' | 'counting_up'
  elapsedSeconds: number
  targetDurationSeconds: number
  level: number
  isFinishing?: boolean
  isLevelingUp?: boolean
  isPrestiging?: boolean
}

const SIZE = 320
const CX = SIZE / 2
const CY = SIZE / 2

// 92% closed ring: gap at bottom (270deg start)
function ringTier(level: number): 'thin' | 'double' | 'orbital' {
  if (level <= 20) return 'thin'
  if (level <= 60) return 'double'
  return 'orbital'
}

type RingCircleProps = {
  r: number
  strokeWidth: number
  progress: number   // 0〜1
  color: string
  opacity?: number
  dashGap?: number   // for dashed rings
}

function RingCircle({ r, strokeWidth, progress, color, opacity = 1, dashGap }: RingCircleProps) {
  const circumference = 2 * Math.PI * r
  // 92% closed: leave 8% as gap
  const visibleLength = circumference * 0.92
  const dashArray = dashGap
    ? `${dashGap} ${dashGap * 2}`
    : `${visibleLength} ${circumference}`
  const dashOffset = dashGap
    ? 0
    : visibleLength * (1 - progress)

  return (
    <circle
      cx={CX}
      cy={CY}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={dashArray}
      strokeDashoffset={dashOffset}
      opacity={opacity}
      style={{ transform: 'rotate(-90deg)', transformOrigin: `${CX}px ${CY}px` }}
    />
  )
}

export function CoreRing({
  phase,
  elapsedSeconds,
  targetDurationSeconds,
  level,
  isFinishing = false,
  isLevelingUp = false,
  isPrestiging = false,
}: CoreRingProps) {
  const tier = ringTier(level)

  const progress = phase === 'counting_down'
    ? Math.min(elapsedSeconds / Math.max(targetDurationSeconds, 1), 1)
    : phase === 'counting_up'
    ? 1
    : 0

  const color = phase === 'counting_up' ? '#A78BFA' : '#6366F1'
  const idleOpacity = 0.15

  // counting_up: compute overlap multiplier
  const overrunSec = elapsedSeconds - targetDurationSeconds
  const overlapCount = phase === 'counting_up' && targetDurationSeconds > 0
    ? Math.floor(overrunSec / targetDurationSeconds) + 1
    : 1

  const animateTarget = isPrestiging
    ? { scale: [1, 1.04, 1] as number[], filter: ['drop-shadow(0 0 0px rgba(167,139,250,0))', 'drop-shadow(0 0 12px rgba(167,139,250,0.6))', 'drop-shadow(0 0 0px rgba(167,139,250,0))'] as string[] }
    : isLevelingUp
    ? { scale: [1, 1.03, 1] as number[], filter: ['drop-shadow(0 0 0px rgba(124,124,255,0))', 'drop-shadow(0 0 8px rgba(124,124,255,0.5))', 'drop-shadow(0 0 0px rgba(124,124,255,0))'] as string[] }
    : phase === 'counting_up'
    ? { scale: [1, 1.015, 1] as number[] }
    : { scale: 1 }

  const isPulsing = isPrestiging || isLevelingUp
  const animateTransition = isPulsing
    ? { duration: 0.8, ease: [0.33, 1, 0.68, 1] as [number, number, number, number] }
    : phase === 'counting_up'
    ? { duration: 2, repeat: Infinity, ease: 'easeInOut' as const }
    : undefined

  const svgContent = (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="absolute inset-0"
      aria-hidden="true"
    >
      {/* Background track */}
      <circle
        cx={CX} cy={CY} r={135}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={tier === 'thin' ? 2 : 2.5}
      />

      {/* Main progress ring */}
      {phase !== 'idle' && (
        <RingCircle
          r={135}
          strokeWidth={tier === 'thin' ? 2 : 2.5}
          progress={progress}
          color={color}
          opacity={1}
        />
      )}

      {/* idle ring */}
      {phase === 'idle' && (
        <RingCircle
          r={135}
          strokeWidth={2}
          progress={1}
          color="rgba(255,255,255,0.15)"
          opacity={idleOpacity}
        />
      )}

      {/* double tier: inner ring */}
      {(tier === 'double' || tier === 'orbital') && phase !== 'idle' && (
        <RingCircle
          r={115}
          strokeWidth={1}
          progress={progress}
          color={color}
          opacity={0.3}
        />
      )}

      {/* orbital tier: outer dashed orbit */}
      {tier === 'orbital' && (
        <circle
          cx={CX} cy={CY} r={151}
          fill="none"
          stroke="rgba(124,124,255,0.2)"
          strokeWidth={1}
          strokeDasharray="4 8"
          style={{
            animation: 'orbit-spin 12s linear infinite',
          }}
        />
      )}
    </svg>
  )

  return (
    <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
      <motion.div
        style={{ width: SIZE, height: SIZE, position: 'relative' }}
        animate={animateTarget}
        transition={animateTransition}
      >
        {svgContent}
      </motion.div>

      {/* Multiplier label (counting_up only, overlapCount >= 2) */}
      <AnimatePresence>
        {phase === 'counting_up' && overlapCount >= 2 && (
          <motion.div
            key={overlapCount}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              bottom: '28px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#A78BFA',
              fontSize: '11px',
              fontWeight: 600,
              letterSpacing: '0.05em',
              pointerEvents: 'none',
            }}
          >
            ×{overlapCount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orbital keyframe */}
      <style>{`
        @keyframes orbit-spin {
          from { transform: rotate(0deg); transform-origin: ${CX}px ${CY}px; }
          to   { transform: rotate(360deg); transform-origin: ${CX}px ${CY}px; }
        }
      `}</style>
    </div>
  )
}
