'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type LevelUpOverlayProps = {
  gainedXp: number
  fromLevel: number
  toLevel: number
  visible: boolean
  onComplete: () => void
}

const EASE_OUT_CUBIC: [number, number, number, number] = [0.33, 1, 0.68, 1]

export function LevelUpOverlay({
  gainedXp,
  fromLevel,
  toLevel,
  visible,
  onComplete,
}: LevelUpOverlayProps) {
  const didLevelUp = toLevel > fromLevel

  // Auto-dismiss after 1.8s (within 2s total budget)
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onComplete, 1800)
    return () => clearTimeout(timer)
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="xp-overlay"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: 1, y: -8 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.6, ease: EASE_OUT_CUBIC }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          {/* Session Complete label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease: EASE_OUT_CUBIC }}
            style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginBottom: '4px',
              fontWeight: 500,
            }}
          >
            Session Complete
          </motion.p>

          {/* +XP value */}
          <motion.p
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: EASE_OUT_CUBIC, delay: 0.1 }}
            style={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#A78BFA',
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1,
            }}
          >
            +{gainedXp.toLocaleString()} XP
          </motion.p>

          {/* Level Up label */}
          {didLevelUp && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT_CUBIC, delay: 0.3 }}
              style={{
                fontSize: '13px',
                color: '#7C7CFF',
                fontWeight: 600,
                marginTop: '8px',
                letterSpacing: '0.04em',
              }}
            >
              Lv.{fromLevel} → Lv.{toLevel}
            </motion.p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
