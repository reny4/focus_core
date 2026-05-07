'use client'

import { useEffect, useRef, useCallback } from 'react'
import { driver } from 'driver.js'
import 'driver.js/dist/driver.css'
import { getTutorialSteps, TUTORIAL_STORAGE_KEY } from '@/lib/tutorial/steps'

export function useTutorial() {
  const driverRef = useRef<ReturnType<typeof driver> | null>(null)

  const startTutorial = useCallback(() => {
    driverRef.current?.destroy()

    driverRef.current = driver({
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayOpacity: 0.4,
      stagePadding: 8,
      stageRadius: 12,

      nextBtnText: '次へ',
      prevBtnText: '戻る',
      doneBtnText: '始める',

      onDestroyed: () => {
        localStorage.setItem(TUTORIAL_STORAGE_KEY, 'true')
      },

      // Scroll to top before each step so mobile highlights are visible
      onHighlightStarted: () => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      },

      steps: getTutorialSteps(),
    })

    driverRef.current.drive()
  }, [])

  // Auto-start on first visit
  useEffect(() => {
    const completed = localStorage.getItem(TUTORIAL_STORAGE_KEY)
    if (completed) return

    const timer = setTimeout(() => {
      startTutorial()
    }, 800)

    return () => clearTimeout(timer)
  }, [startTutorial])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      driverRef.current?.destroy()
    }
  }, [])

  return { startTutorial }
}
