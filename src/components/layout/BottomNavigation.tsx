'use client'

// HIG: Clarity — icon + label always; Deference — chrome stays out of the way

import { TimerIcon, ListTodoIcon, BarChart2Icon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BottomTab = 'timer' | 'tasks' | 'stats'

type Props = {
  activeTab: BottomTab
  onTabChange: (tab: BottomTab) => void
}

const TABS: { id: BottomTab; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'timer', label: 'タイマー', Icon: TimerIcon },
  { id: 'tasks', label: 'タスク', Icon: ListTodoIcon },
  { id: 'stats', label: '統計', Icon: BarChart2Icon },
]

export function BottomNavigation({ activeTab, onTabChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 border-t bg-background/80 backdrop-blur-sm md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="メインナビゲーション"
    >
      <div className="flex h-14">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            {...(id === 'stats' ? { 'data-tutorial': 'stats-tab' } : {})}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px] transition-colors',
              activeTab === id ? 'text-primary' : 'text-muted-foreground'
            )}
            onClick={() => onTabChange(id)}
            aria-label={label}
            aria-current={activeTab === id ? 'page' : undefined}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
