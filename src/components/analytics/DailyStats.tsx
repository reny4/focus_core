'use client'

// HIG: Deference — 数値が主役; バーは補助

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useDailyStats } from '@/hooks/useStats'
import { formatSeconds } from '@/lib/time/duration'
import { SessionList } from './SessionList'
import { EmptyStats } from './EmptyStats'

type Props = { date: string }

function fmtHour(h: number) {
  return `${String(h).padStart(2, '0')}時`
}

function fmtMin(sec: number) {
  if (sec === 0) return ''
  const m = Math.round(sec / 60)
  return m >= 60 ? `${Math.floor(m / 60)}h` : `${m}m`
}

export function DailyStats({ date }: Props) {
  const { data, isLoading } = useDailyStats(date)

  if (isLoading) return <div className="h-48 animate-pulse bg-muted rounded-lg" />
  if (!data || data.totalSeconds === 0) return <EmptyStats />

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-3xl font-bold tabular-nums">{formatSeconds(data.totalSeconds)}</p>
        <p className="text-xs text-muted-foreground mt-1">合計集中時間</p>
      </div>

      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.hourly} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <XAxis
              dataKey="hour"
              tickFormatter={fmtHour}
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              interval={2}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [formatSeconds(Number(v)), '集中時間']}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              labelFormatter={(h: any) => fmtHour(Number(h))}
              contentStyle={{ fontSize: 12 }}
              cursor={{ fill: 'var(--muted)' }}
            />
            <Bar dataKey="totalSeconds" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.hourly.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.totalSeconds > 0 ? 'var(--primary)' : 'var(--muted)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.sessions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            セッション
          </p>
          <SessionList sessions={data.sessions} />
        </div>
      )}
    </div>
  )
}
