'use client'

// HIG: Deference — 記録データが前に出る。chrome は最小限に。

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { format, addDays, addWeeks, subWeeks, addMonths, subMonths } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { AppHeader } from '@/components/layout/AppHeader'
import { DailyStats } from '@/components/analytics/DailyStats'
import { WeeklyStats } from '@/components/analytics/WeeklyStats'
import { MonthlyStats } from '@/components/analytics/MonthlyStats'
import { YearlyStats } from '@/components/analytics/YearlyStats'
import { YearHeatmap } from '@/components/analytics/YearHeatmap'
import { TagBreakdown } from '@/components/analytics/TagBreakdown'
import { ROUTES } from '@/lib/constants/routes'

function getMonday(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  return d
}

type YearSubTab = 'monthly' | 'heatmap' | 'tags'

type Props = { displayName: string }

export function RecordsView({ displayName }: Props) {
  const today = new Date()
  const [date, setDate] = useState(format(today, 'yyyy-MM-dd'))
  const [weekStart, setWeekStart] = useState(format(getMonday(today), 'yyyy-MM-dd'))
  const [monthDate, setMonthDate] = useState(today)
  const [year, setYear] = useState(today.getFullYear())
  const [yearSubTab, setYearSubTab] = useState<YearSubTab>('monthly')

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader displayName={displayName} />

      {/* Back navigation */}
      <div className="border-b px-4 md:px-6 h-10 flex items-center">
        <Link
          href={ROUTES.HOME}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          ホームへ戻る
        </Link>
      </div>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <Tabs defaultValue="daily">
            <TabsList className="w-full mb-2">
              <TabsTrigger value="daily" className="flex-1">日</TabsTrigger>
              <TabsTrigger value="weekly" className="flex-1">週</TabsTrigger>
              <TabsTrigger value="monthly" className="flex-1">月</TabsTrigger>
              <TabsTrigger value="yearly" className="flex-1">年</TabsTrigger>
            </TabsList>

            {/* 日次 */}
            <TabsContent value="daily" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDate(format(addDays(new Date(date), -1), 'yyyy-MM-dd'))}
                  aria-label="前日"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <span className="text-base font-medium">
                  {format(new Date(date), 'yyyy年M月d日（E）', { locale: ja })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
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
            <TabsContent value="weekly" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWeekStart(format(subWeeks(new Date(weekStart), 1), 'yyyy-MM-dd'))}
                  aria-label="前週"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <span className="text-base font-medium">
                  {format(new Date(weekStart), 'yyyy年M月d日', { locale: ja })}〜
                  {format(addDays(new Date(weekStart), 6), 'M月d日', { locale: ja })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
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
            <TabsContent value="monthly" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setMonthDate(subMonths(monthDate, 1))}
                  aria-label="前月"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <span className="text-base font-medium">
                  {format(monthDate, 'yyyy年M月', { locale: ja })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
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
            <TabsContent value="yearly" className="mt-6">
              <div className="flex items-center justify-between mb-6">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setYear((y) => y - 1)}
                  aria-label="前年"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                </Button>
                <span className="text-base font-medium">{year}年</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setYear((y) => y + 1)}
                  disabled={year >= today.getFullYear()}
                  aria-label="翌年"
                >
                  <ChevronRightIcon className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex gap-2 mb-6 border-b pb-2">
                {(['monthly', 'heatmap', 'tags'] as YearSubTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    className={`text-sm px-3 py-1.5 rounded transition-colors min-h-[36px] ${
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
      </main>
    </div>
  )
}
