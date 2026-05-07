'use client'

// HIG: Deference — このパネルが画面の主役。道具として静かに機能する
import { useState } from 'react'
import { toast } from 'sonner'
import { TimerDisplay } from './TimerDisplay'
import { TargetDurationInput } from './TargetDurationInput'
import { SessionControls } from './SessionControls'
import { ReviewDialog } from './ReviewDialog'
import { useActiveSession, useStartSession, useFinishSession, useDiscardSession } from '@/hooks/useActiveSession'
import { useTimer } from '@/hooks/useTimer'
import { minutesToSeconds } from '@/lib/time/duration'

type SelectedTask = {
  id: string
  name: string
  tagName: string
  tagColor: string
}

type Props = {
  selectedTask: SelectedTask | null
}

export function TimerPanel({ selectedTask }: Props) {
  const [targetDurationSeconds, setTargetDurationSeconds] = useState(
    minutesToSeconds(25)
  )

  const { data: sessionData, isLoading } = useActiveSession()
  const startSession = useStartSession()
  const finishSession = useFinishSession()
  const discardSession = useDiscardSession()

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
    try {
      await finishSession.mutateAsync()
      toast.success('セッションを記録しました')
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
        {/* Timer or idle state */}
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
              <p className="text-sm text-muted-foreground mb-2">
                左のリストからタスクを選択してください
              </p>
            )}
            <div className="text-timer-md text-muted-foreground/30 font-semibold">
              {`${String(Math.floor(targetDurationSeconds / 60)).padStart(2, '0')}:00`}
            </div>
          </div>
        )}

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
