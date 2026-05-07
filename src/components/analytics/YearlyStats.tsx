'use client'

// HIG: Clarity — 12本棒グラフ（月別）

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LabelList } from 'recharts'
import { useYearlyStats } from '@/hooks/useStats'
import { formatSeconds } from '@/lib/time/duration'
import { EmptyStats } from './EmptyStats'

type Props = { year: number }

export function YearlyStats({ year }: Props) {
  const { data, isLoading } = useYearlyStats(year)

  if (isLoading) return <div className="h-48 animate-pulse bg-muted rounded-lg" />
  const total = data?.monthlyTotals.reduce((acc, m) => acc + m.totalSeconds, 0) ?? 0
  if (!data || total === 0) return <EmptyStats />

  const chartData = data.monthlyTotals.map((m) => ({
    ...m,
    label: `${m.month}月`,
    hours: Math.round(m.totalSeconds / 3600),
  }))

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-3xl font-bold tabular-nums">{formatSeconds(total)}</p>
        <p className="text-xs text-muted-foreground mt-1">{year}年合計集中時間</p>
      </div>

      <div className="h-44">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 4, bottom: 0, left: -24 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [formatSeconds(Number(v)), '集中時間']}
              labelFormatter={(l) => l}
              contentStyle={{ fontSize: 12 }}
              cursor={{ fill: 'var(--muted)' }}
            />
            <Bar dataKey="totalSeconds" fill="var(--primary)" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              <LabelList
                dataKey="hours"
                position="top"
                formatter={(v: any) => (Number(v) > 0 ? `${v}h` : '')}
                style={{ fontSize: 9, fill: 'var(--muted-foreground)' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
