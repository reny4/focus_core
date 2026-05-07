// HIG: Clarity — セッション一覧、タイムスタンプと実績を明示

import type { SessionSummaryDto } from '@/application/analytics/dto/AnalyticsDtos'
import { formatSeconds } from '@/lib/time/duration'

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('ja-JP', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

type Props = { sessions: SessionSummaryDto[] }

export function SessionList({ sessions }: Props) {
  if (sessions.length === 0) return null

  return (
    <ul className="space-y-1">
      {sessions.map((s) => (
        <li
          key={s.sessionId}
          className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0"
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: s.tagColor }}
            aria-hidden="true"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{s.focusTaskName}</p>
            <p className="text-xs text-muted-foreground">
              {s.tagName} · {formatTime(s.startedAt)}〜{formatTime(s.endedAt)}
            </p>
          </div>
          <span className="text-sm tabular-nums text-muted-foreground shrink-0">
            {formatSeconds(s.actualDurationSeconds)}
          </span>
        </li>
      ))}
    </ul>
  )
}
