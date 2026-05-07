'use client'

// HIG: Clarity — タグ別横棒グラフ、色で視覚的に区別

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useTagBreakdown } from '@/hooks/useStats'
import { formatSeconds } from '@/lib/time/duration'
import { EmptyStats } from './EmptyStats'

type Props = { from: string; to: string }

export function TagBreakdown({ from, to }: Props) {
  const { data, isLoading } = useTagBreakdown(from, to)

  if (isLoading) return <div className="h-32 animate-pulse bg-muted rounded-lg" />
  if (!data || data.totalSeconds === 0) return <EmptyStats />

  const chartData = data.tags.map((t) => ({
    name: t.tagName,
    totalSeconds: t.totalSeconds,
    color: t.tagColor,
    ratio: t.ratio,
  }))

  const barHeight = Math.max(chartData.length * 44, 100)

  return (
    <div className="space-y-4">
      <div className="text-center">
        <p className="text-3xl font-bold tabular-nums">{formatSeconds(data.totalSeconds)}</p>
        <p className="text-xs text-muted-foreground mt-1">合計集中時間</p>
      </div>

      <div style={{ height: barHeight }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 48, bottom: 0, left: 0 }}
          >
            <XAxis type="number" hide />
            <YAxis
              type="category"
              dataKey="name"
              width={60}
              tick={{ fontSize: 12, fill: 'var(--foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any, _: any, p: any) => [
                `${formatSeconds(Number(v))} (${p.payload.ratio}%)`,
                '集中時間',
              ]}
              contentStyle={{ fontSize: 12 }}
              cursor={{ fill: 'var(--muted)' }}
            />
            <Bar dataKey="totalSeconds" radius={[0, 3, 3, 0]} isAnimationActive={false}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-1.5">
        {data.tags.map((t) => (
          <li key={t.tagId} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: t.tagColor }}
              aria-hidden="true"
            />
            <span className="flex-1 truncate">{t.tagName}</span>
            <span className="tabular-nums text-muted-foreground text-xs">
              {formatSeconds(t.totalSeconds)}
            </span>
            <span className="tabular-nums text-xs w-12 text-right">{t.ratio}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
