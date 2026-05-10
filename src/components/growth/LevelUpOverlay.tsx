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

  // Auto-dismiss after 3s
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onComplete, 3000)
    return () => clearTimeout(timer)
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="xp-overlay"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.5, ease: EASE_OUT_CUBIC }}
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
          {/* Frosted glass card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '20px 32px',
              borderRadius: '20px',
              background: 'rgba(8, 8, 16, 0.72)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Session Complete label */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, ease: EASE_OUT_CUBIC }}
              style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.45)',
                letterSpacing: '0.10em',
                textTransform: 'uppercase',
                marginBottom: '6px',
                fontWeight: 500,
              }}
            >
              Session Complete
            </motion.p>

            {/* +XP value */}
            <motion.p
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE_OUT_CUBIC, delay: 0.1 }}
              style={{
                fontSize: '30px',
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
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: EASE_OUT_CUBIC, delay: 0.3 }}
                style={{
                  fontSize: '13px',
                  color: '#7C7CFF',
                  fontWeight: 600,
                  marginTop: '10px',
                  letterSpacing: '0.04em',
                }}
              >
                Lv.{fromLevel} → Lv.{toLevel}
              </motion.p>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
