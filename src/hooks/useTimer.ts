'use client'

import { useState, useEffect, useRef } from 'react'
import { deriveTimerValues } from '@/lib/time/duration'
import { REVIEW_THRESHOLD_SECONDS } from '@/lib/constants/duration'

type ActiveSessionInput = {
  startedAt: string
  serverNow: string
  targetDurationSeconds: number
  elapsedSeconds: number
}

export type TimerState = {
  phase: 'idle' | 'counting_down' | 'counting_up'
  elapsedSeconds: number
  remainingSeconds: number
  overrunSeconds: number
  requiresReview: boolean
  reachedMaxDuration: boolean
}

type TimerReturn = TimerState & {
  showReviewDialog: boolean
  onReviewDialogClose: () => void
}

export function useTimer(activeSession: ActiveSessionInput | null): TimerReturn {
  const [elapsedSeconds, setElapsedSeconds] = useState(
    activeSession?.elapsedSeconds ?? 0
  )
  const [hasShownReviewDialog, setHasShownReviewDialog] = useState(false)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const prevSessionStartRef = useRef<string | null>(null)

  // Tick interval — resets when session changes
  useEffect(() => {
    if (!activeSession) {
      setElapsedSeconds(0)
      setHasShownReviewDialog(false)
      setShowReviewDialog(false)
      prevSessionStartRef.current = null
      return
    }

    // Reset dialog flag on new session
    if (activeSession.startedAt !== prevSessionStartRef.current) {
      setHasShownReviewDialog(false)
      setShowReviewDialog(false)
      prevSessionStartRef.current = activeSession.startedAt
    }

    const serverNowMs = new Date(activeSession.serverNow).getTime()
    const startedAtMs = new Date(activeSession.startedAt).getTime()

    // Initialize with server-provided elapsed
    setElapsedSeconds(activeSession.elapsedSeconds)

    const id = setInterval(() => {
      const drift = Date.now() - serverNowMs
      const elapsed = Math.max(
        0,
        Math.floor((serverNowMs + drift - startedAtMs) / 1000)
      )
      setElapsedSeconds(elapsed)
    }, 1000)

    return () => clearInterval(id)
  }, [activeSession?.startedAt]) // eslint-disable-line react-hooks/exhaustive-deps

  // Show review dialog once at 6h threshold
  useEffect(() => {
    if (elapsedSeconds >= REVIEW_THRESHOLD_SECONDS && !hasShownReviewDialog) {
      setHasShownReviewDialog(true)
      setShowReviewDialog(true)
    }
  }, [elapsedSeconds]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!activeSession) {
    return {
      phase: 'idle',
      elapsedSeconds: 0,
      remainingSeconds: 0,
      overrunSeconds: 0,
      requiresReview: false,
      reachedMaxDuration: false,
      showReviewDialog: false,
      onReviewDialogClose: () => {},
    }
  }

  const derived = deriveTimerValues(elapsedSeconds, activeSession.targetDurationSeconds)

  return {
    phase: derived.phase as 'counting_down' | 'counting_up',
    elapsedSeconds,
    remainingSeconds: derived.remainingSeconds,
    overrunSeconds: derived.overrunSeconds,
    requiresReview: derived.requiresReview,
    reachedMaxDuration: derived.reachedMaxDuration,
    showReviewDialog,
    onReviewDialogClose: () => setShowReviewDialog(false),
  }
}
