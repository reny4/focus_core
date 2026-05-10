'use client'

import { formatSeconds } from '@/lib/time/duration'
import type { TaskGrowthItemDto } from '@/application/analytics/dto/AnalyticsDtos'

type Props = {
  tasks: TaskGrowthItemDto[]
}

function TaskGrowthItem({ task }: { task: TaskGrowthItemDto }) {
  const progressPercent = Math.round(task.progressRatio * 100)

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      {/* Task name + level */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="shrink-0 size-2 rounded-full"
            style={{ backgroundColor: task.tagColor }}
            aria-hidden="true"
          />
          <span className="text-sm font-medium truncate">{task.focusTaskName}</span>
          <span className="text-xs text-muted-foreground shrink-0">{task.tagName}</span>
        </div>
        <span className="text-xs text-[#A78BFA] font-medium tabular-nums shrink-0 ml-2">
          Lv.{task.level}
        </span>
      </div>

      {/* XP bar */}
      <div className="h-[3px] rounded-full overflow-hidden mb-1.5" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${progressPercent}%`,
            background: 'linear-gradient(90deg, #7C7CFF 0%, #5A5AD6 100%)',
          }}
        />
      </div>

      {/* Stats */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>{formatSeconds(task.totalSeconds)}</span>
        <span aria-hidden="true">·</span>
        <span>{task.sessionCount}セッション</span>
      </div>
    </div>
  )
}

export function TaskGrowthList({ tasks }: Props) {
  if (tasks.length === 0) {
    return (
      <div
        className="rounded-xl px-4 py-4 text-sm text-muted-foreground text-center"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        記録がまだありません
      </div>
    )
  }

  return (
    <div
      className="rounded-xl px-4 py-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <p className="text-xs text-muted-foreground mb-3">タスク別</p>
      <div className="divide-y divide-white/[0.05]">
        {tasks.map((task) => (
          <TaskGrowthItem key={task.focusTaskId} task={task} />
        ))}
      </div>
    </div>
  )
}

export function TaskGrowthListSkeleton() {
  return (
    <div
      className="rounded-xl px-4 py-4"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="h-3 w-12 rounded bg-white/[0.06] animate-pulse mb-3" />
      {[0, 1, 2].map((i) => (
        <div key={i} className="py-3 first:pt-0 last:pb-0 border-t border-white/[0.05] first:border-t-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-white/[0.06] animate-pulse" />
              <div className="h-3 w-28 rounded bg-white/[0.06] animate-pulse" />
            </div>
            <div className="h-3 w-8 rounded bg-white/[0.06] animate-pulse" />
          </div>
          <div className="h-[3px] w-full rounded-full bg-white/[0.06] animate-pulse mb-1.5" />
          <div className="h-2.5 w-24 rounded bg-white/[0.06] animate-pulse" />
        </div>
      ))}
    </div>
  )
}
