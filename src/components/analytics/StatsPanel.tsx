'use client'

// HIG: Deference — パネルは補助。コンテンツが前に出る

import { useState } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { format, addDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { DailyStats } from './DailyStats'
import { WeeklyStats } from './WeeklyStats'
import { MonthlyStats } from './MonthlyStats'
import { YearlyStats } from './YearlyStats'
import { YearHeatmap } from './YearHeatmap'
import { TagBreakdown } from './TagBreakdown'

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = (day === 0 ? -6 : 1 - day)
  d.setDate(d.getDate() + diff)
  return d
}

type YearSubTab = 'monthly' | 'heatmap' | 'tags'

export function StatsPanel() {
  const today = new Date()
  const [date, setDate] = useState(format(today, 'yyyy-MM-dd'))
  const [weekStart, setWeekStart] = useState(format(getMonday(today), 'yyyy-MM-dd'))
  const [monthDate, setMonthDate] = useState(today)
  const [year, setYear] = useState(today.getFullYear())
  const [yearSubTab, setYearSubTab] = useState<YearSubTab>('monthly')

  return (
    <div className="flex flex-col gap-4 p-4">
      <Tabs defaultValue="daily">
        <TabsList className="w-full">
          <TabsTrigger value="daily" className="flex-1">日</TabsTrigger>
          <TabsTrigger value="weekly" className="flex-1">週</TabsTrigger>
          <TabsTrigger value="monthly" className="flex-1">月</TabsTrigger>
          <TabsTrigger value="yearly" className="flex-1">年</TabsTrigger>
        </TabsList>

        {/* 日次 */}
        <TabsContent value="daily" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDate(format(addDays(new Date(date), -1), 'yyyy-MM-dd'))}
              aria-label="前日"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(new Date(date), 'M月d日（E）', { locale: ja })}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDate(format(addDays(new Date(date), 1), 'yyyy-MM-dd'))}
              disabled={date >= format(today, 'yyyy-MM-dd')}
              aria-label="翌日"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <DailyStats date={date} />
        </TabsContent>

        {/* 週次 */}
        <TabsContent value="weekly" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setWeekStart(format(subWeeks(new Date(weekStart), 1), 'yyyy-MM-dd'))}
              aria-label="前週"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(new Date(weekStart), 'M/d', { locale: ja })}〜
              {format(addDays(new Date(weekStart), 6), 'M/d', { locale: ja })}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setWeekStart(format(addWeeks(new Date(weekStart), 1), 'yyyy-MM-dd'))}
              disabled={weekStart >= format(getMonday(today), 'yyyy-MM-dd')}
              aria-label="翌週"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <WeeklyStats startDate={weekStart} />
        </TabsContent>

        {/* 月次 */}
        <TabsContent value="monthly" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMonthDate(subMonths(monthDate, 1))}
              aria-label="前月"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">
              {format(monthDate, 'yyyy年M月', { locale: ja })}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMonthDate(addMonths(monthDate, 1))}
              disabled={
                monthDate.getFullYear() >= today.getFullYear() &&
                monthDate.getMonth() >= today.getMonth()
              }
              aria-label="翌月"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>
          <MonthlyStats year={monthDate.getFullYear()} month={monthDate.getMonth() + 1} />
        </TabsContent>

        {/* 年次 */}
        <TabsContent value="yearly" className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setYear((y) => y - 1)}
              aria-label="前年"
            >
              <ChevronLeftIcon className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium">{year}年</span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setYear((y) => y + 1)}
              disabled={year >= today.getFullYear()}
              aria-label="翌年"
            >
              <ChevronRightIcon className="w-4 h-4" />
            </Button>
          </div>

          {/* 年サブタブ */}
          <div className="flex gap-2 mb-4 border-b pb-2">
            {(['monthly', 'heatmap', 'tags'] as YearSubTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`text-xs px-2 py-1 rounded transition-colors min-h-[36px] ${
                  yearSubTab === tab
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted'
                }`}
                onClick={() => setYearSubTab(tab)}
              >
                {tab === 'monthly' ? '月別グラフ' : tab === 'heatmap' ? 'ヒートマップ' : 'タグ別'}
              </button>
            ))}
          </div>

          {yearSubTab === 'monthly' && <YearlyStats year={year} />}
          {yearSubTab === 'heatmap' && <YearHeatmap year={year} />}
          {yearSubTab === 'tags' && (
            <TagBreakdown from={`${year}-01-01`} to={`${year}-12-31`} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
