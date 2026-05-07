'use client'

// HIG: Clarity — 月次日別棒グラフ

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useMonthlyStats } from '@/hooks/useStats'
import { formatSeconds } from '@/lib/time/duration'
import { EmptyStats } from './EmptyStats'

type Props = { year: number; month: number }

export function MonthlyStats({ year, month }: Props) {
  const { data, isLoading } = useMonthlyStats(year, month)

  if (isLoading) return <div className="h-48 animate-pulse bg-muted rounded-lg" />
  const total = data?.dailyTotals.reduce((acc, d) => acc + d.totalSeconds, 0) ?? 0
  if (!data || total === 0) return <EmptyStats />

  const chartData = data.dailyTotals.map((d) => ({
    ...d,
    day: parseInt(d.date.split('-')[2], 10),
  }))

  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-3xl font-bold tabular-nums">{formatSeconds(total)}</p>
        <p className="text-xs text-muted-foreground mt-1">{month}月合計集中時間</p>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              interval={4}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(v: any) => [formatSeconds(Number(v)), '集中時間']}
              labelFormatter={(l) => `${l}日`}
              contentStyle={{ fontSize: 12 }}
              cursor={{ fill: 'var(--muted)' }}
            />
            <Bar dataKey="totalSeconds" fill="var(--primary)" radius={[2, 2, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
