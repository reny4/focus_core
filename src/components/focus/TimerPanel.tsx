'use client'

// HIG: Deference — このパネルが画面の主役。道具として静かに機能する
import { useState } from 'react'
import { toast } from 'sonner'
import { TimerDisplay } from './TimerDisplay'
import { TargetDurationInput } from './TargetDurationInput'
import { SessionControls } from './SessionControls'
import { ReviewDialog } from './ReviewDialog'
import { CoreRing } from '@/components/growth/CoreRing'
import { LevelUpOverlay } from '@/components/growth/LevelUpOverlay'
import { useActiveSession, useStartSession, useFinishSession, useDiscardSession } from '@/hooks/useActiveSession'
import { useTimer } from '@/hooks/useTimer'
import { useGrowth } from '@/hooks/useGrowth'
import { minutesToSeconds } from '@/lib/time/duration'
import type { GetGrowthResponse } from '@/application/analytics/dto/AnalyticsDtos'

type SelectedTask = {
  id: string
  name: string
  tagName: string
  tagColor: string
}

type Props = {
  selectedTask: SelectedTask | null
}

type OverlayState = {
  visible: boolean
  gainedXp: number
  fromLevel: number
  toLevel: number
}

const CORE_RING_SIZE = 320

export function TimerPanel({ selectedTask }: Props) {
  const [targetDurationSeconds, setTargetDurationSeconds] = useState(
    minutesToSeconds(25)
  )
  const [overlayState, setOverlayState] = useState<OverlayState>({
    visible: false, gainedXp: 0, fromLevel: 1, toLevel: 1,
  })
  const [isLevelingUp, setIsLevelingUp] = useState(false)

  const { data: sessionData, isLoading } = useActiveSession()
  const startSession = useStartSession()
  const finishSession = useFinishSession()
  const discardSession = useDiscardSession()
  const { growth, refetch: refetchGrowth } = useGrowth()

  const activeSession =
    sessionData?.exists && sessionData.session ? sessionData.session : null

  const timerInput = activeSession
    ? {
        startedAt: activeSession.startedAt,
        serverNow: activeSession.serverNow,
        targetDurationSeconds: activeSession.targetDurationSeconds,
        elapsedSeconds: activeSession.elapsedSeconds,
      }
    : null

  const timerState = useTimer(timerInput)
  const { showReviewDialog, onReviewDialogClose } = timerState

  const level = growth?.level ?? 1
  const targetSec = activeSession?.targetDurationSeconds ?? targetDurationSeconds

  async function handleStart() {
    if (!selectedTask) return
    try {
      await startSession.mutateAsync({
        focusTaskId: selectedTask.id,
        targetDurationSeconds,
      })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'セッションを開始できませんでした')
    }
  }

  async function handleFinish() {
    const beforeGrowth: GetGrowthResponse | undefined = growth
    try {
      await finishSession.mutateAsync()
      const { data: afterGrowth } = await refetchGrowth()
      const gainedXp = (afterGrowth?.totalXp ?? 0) - (beforeGrowth?.totalXp ?? 0)
      const didLevelUp = (afterGrowth?.level ?? 0) > (beforeGrowth?.level ?? 0)
      if (gainedXp > 0) {
        if (didLevelUp) setIsLevelingUp(true)
        setOverlayState({
          visible: true,
          gainedXp,
          fromLevel: beforeGrowth?.level ?? 1,
          toLevel: afterGrowth?.level ?? 1,
        })
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'セッションを終了できませんでした')
    }
  }

  async function handleDiscard() {
    try {
      await discardSession.mutateAsync()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'セッションを破棄できませんでした')
    }
  }

  function handleOverlayComplete() {
    setOverlayState(s => ({ ...s, visible: false }))
    setIsLevelingUp(false)
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-8">
        <div className="text-timer-md text-muted-foreground/30 font-semibold">
          --:--
        </div>
      </div>
    )
  }

  const displayTask = activeSession
    ? {
        name: activeSession.focusTaskName,
        tagName: activeSession.tagName,
        tagColor: activeSession.tagColor,
      }
    : selectedTask
    ? {
        name: selectedTask.name,
        tagName: selectedTask.tagName,
        tagColor: selectedTask.tagColor,
      }
    : null

  return (
    <>
      <div className="flex flex-col items-center justify-center gap-10 p-8 min-h-full">
        {/* Timer area — CoreRing wraps timer content */}
        <div
          className="relative flex items-center justify-center"
          style={{ width: CORE_RING_SIZE, height: CORE_RING_SIZE }}
        >
          {/* CoreRing behind */}
          <div className="absolute inset-0">
            <CoreRing
              phase={timerState.phase}
              elapsedSeconds={timerState.elapsedSeconds}
              targetDurationSeconds={targetSec}
              level={level}
              isLevelingUp={isLevelingUp}
            />
          </div>

          {/* Timer content in front */}
          <div className="relative z-10 flex items-center justify-center">
            {timerState.phase !== 'idle' ? (
              <TimerDisplay
                timerState={timerState}
                focusTaskName={displayTask?.name}
                tagName={displayTask?.tagName}
                tagColor={displayTask?.tagColor}
              />
            ) : (
              <div className="flex flex-col items-center gap-2">
                {displayTask ? (
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className="inline-block size-2 rounded-full shrink-0"
                      style={{ backgroundColor: displayTask.tagColor }}
                      aria-hidden="true"
                    />
                    <span className="text-sm text-muted-foreground font-medium">
                      {displayTask.tagName && <span className="mr-1">{displayTask.tagName}</span>}
                      {displayTask.name}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground mb-2 text-center px-4">
                    左のリストからタスクを選択してください
                  </p>
                )}
                <div className="text-timer-md text-muted-foreground/30 font-semibold">
                  {`${String(Math.floor(targetDurationSeconds / 60)).padStart(2, '0')}:00`}
                </div>
              </div>
            )}
          </div>

          {/* LevelUpOverlay — absolute center of ring area */}
          <LevelUpOverlay
            gainedXp={overlayState.gainedXp}
            fromLevel={overlayState.fromLevel}
            toLevel={overlayState.toLevel}
            visible={overlayState.visible}
            onComplete={handleOverlayComplete}
          />
        </div>

        {/* Duration input — only when idle */}
        {timerState.phase === 'idle' && (
          <TargetDurationInput
            value={targetDurationSeconds}
            onChange={setTargetDurationSeconds}
          />
        )}

        {/* Controls */}
        <div className="w-full max-w-xs">
          <SessionControls
            phase={timerState.phase}
            selectedFocusTaskId={selectedTask?.id ?? null}
            onStart={handleStart}
            onFinish={handleFinish}
            onDiscard={handleDiscard}
            isStarting={startSession.isPending}
            isFinishing={finishSession.isPending}
            isDiscarding={discardSession.isPending}
          />
        </div>
      </div>

      {/* 6h Review Dialog */}
      <ReviewDialog
        open={showReviewDialog}
        elapsedSeconds={timerState.elapsedSeconds}
        onContinue={onReviewDialogClose}
        onFinish={async () => {
          onReviewDialogClose()
          await handleFinish()
        }}
        onDiscard={async () => {
          onReviewDialogClose()
          await handleDiscard()
        }}
      />
    </>
  )
}
