'use client'

// HIG: Deference — タイマー数字が唯一の主役。周辺要素は最小化する
import { formatSeconds } from '@/lib/time/duration'
import type { TimerState } from '@/hooks/useTimer'

type Props = {
  timerState: TimerState
  focusTaskName?: string
  tagName?: string
  tagColor?: string
}

export function TimerDisplay({ timerState, focusTaskName, tagName, tagColor }: Props) {
  const { phase, remainingSeconds, overrunSeconds } = timerState

  const displayTime =
    phase === 'counting_up'
      ? `+${formatSeconds(overrunSeconds)}`
      : phase === 'counting_down'
      ? formatSeconds(remainingSeconds)
      : formatSeconds(0)

  // counting_up → primary (Indigo — quiet positive signal, NOT warning red)
  const timeColorClass =
    phase === 'counting_up' ? 'text-primary' : 'text-foreground'

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Task info — small, above the timer */}
      {focusTaskName && (
        <div className="flex items-center gap-2">
          {tagColor && (
            <span
              className="inline-block size-2 rounded-full shrink-0"
              style={{ backgroundColor: tagColor }}
              aria-hidden="true"
            />
          )}
          <span className="text-sm text-muted-foreground font-medium">
            {tagName && <span className="mr-1">{tagName}</span>}
            {focusTaskName}
          </span>
        </div>
      )}

      {/* Timer — the single largest element on screen */}
      <div
        className={`text-timer-lg font-semibold transition-colors duration-300 ${timeColorClass}`}
        aria-live="polite"
        aria-label={`${phase === 'counting_up' ? '超過時間' : '残り時間'}: ${displayTime}`}
      >
        {displayTime}
      </div>

      {phase === 'counting_up' && (
        <p className="text-xs text-muted-foreground">
          目標時間を超えて集中しています
        </p>
      )}
    </div>
  )
}
