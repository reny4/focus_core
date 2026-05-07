'use client'

// HIG: Depth — 4段階の不透明度で密度を表現、装飾なし

import { useYearHeatmap } from '@/hooks/useStats'
import { formatSeconds } from '@/lib/time/duration'
import { EmptyStats } from './EmptyStats'
import { format, parseISO, getDay, startOfYear } from 'date-fns'
import { ja } from 'date-fns/locale'
import { cn } from '@/lib/utils'

type Props = { year: number }

const LEVEL_CLASSES: Record<0 | 1 | 2 | 3 | 4, string> = {
  0: 'bg-muted',
  1: 'bg-primary/25',
  2: 'bg-primary/50',
  3: 'bg-primary/75',
  4: 'bg-primary',
}

const WEEKDAY_LABELS = ['月', '火', '水', '木', '金', '土', '日']

export function YearHeatmap({ year }: Props) {
  const { data, isLoading } = useYearHeatmap(year)

  if (isLoading) return <div className="h-32 animate-pulse bg-muted rounded-lg" />
  if (!data) return <EmptyStats />

  // Build week columns: each column is an array of 7 days (Mon=0...Sun=6)
  // ISO weekday: Mon=1...Sun=7 → index 0..6
  const firstDay = new Date(`${year}-01-01`)
  // getDay(): 0=Sun...6=Sat → convert to Mon-based index
  const firstDayOfWeek = (getDay(firstDay) + 6) % 7 // 0=Mon

  // daysByWeek[weekIdx][weekdayIdx] = HeatmapDayDto | null
  const daysByWeek: (typeof data.days[number] | null)[][] = []
  let week: (typeof data.days[number] | null)[] = Array(firstDayOfWeek).fill(null)

  for (const day of data.days) {
    week.push(day)
    if (week.length === 7) {
      daysByWeek.push(week)
      week = []
    }
  }
  if (week.length > 0) {
    while (week.length < 7) week.push(null)
    daysByWeek.push(week)
  }

  // Month labels: find first week index for each month
  const monthLabels: { month: number; weekIdx: number }[] = []
  for (let i = 0; i < daysByWeek.length; i++) {
    const firstNonNull = daysByWeek[i].find((d) => d !== null)
    if (firstNonNull) {
      const m = parseISO(firstNonNull.date).getMonth() + 1
      if (monthLabels.length === 0 || monthLabels[monthLabels.length - 1].month !== m) {
        monthLabels.push({ month: m, weekIdx: i })
      }
    }
  }

  return (
    <div className="space-y-2 overflow-x-auto pb-2">
      <div className="flex gap-0.5" style={{ minWidth: `${daysByWeek.length * 14}px` }}>
        {/* Weekday labels column */}
        <div className="flex flex-col gap-[2px] mr-1">
          <div className="h-3.5" /> {/* spacer for month row */}
          {WEEKDAY_LABELS.map((d, i) => (
            <div
              key={i}
              className="h-[10px] w-5 text-[8px] text-muted-foreground/60 flex items-center"
              aria-hidden="true"
            >
              {i % 2 === 0 ? d : ''}
            </div>
          ))}
        </div>

        {/* Week columns */}
        {daysByWeek.map((week, wi) => {
          const monthLabel = monthLabels.find((ml) => ml.weekIdx === wi)
          return (
            <div key={wi} className="flex flex-col gap-[2px]">
              {/* Month label */}
              <div className="h-3.5 text-[9px] text-muted-foreground/70 whitespace-nowrap">
                {monthLabel ? `${monthLabel.month}月` : ''}
              </div>
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="w-[10px] h-[10px] rounded-sm" />
                }
                const label = `${format(parseISO(day.date), 'yyyy年M月d日', { locale: ja })}: ${
                  day.totalSeconds > 0 ? formatSeconds(day.totalSeconds) : 'データなし'
                }`
                return (
                  <div
                    key={di}
                    role="gridcell"
                    className={cn('w-[10px] h-[10px] rounded-sm transition-opacity hover:opacity-70', LEVEL_CLASSES[day.level])}
                    aria-label={label}
                    title={label}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground justify-end">
        <span>少</span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div key={level} className={cn('w-[10px] h-[10px] rounded-sm', LEVEL_CLASSES[level])} />
        ))}
        <span>多</span>
      </div>
    </div>
  )
}
