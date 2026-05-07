'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppHeader } from '@/components/layout/AppHeader'
import { MainLayout } from '@/components/layout/MainLayout'
import { BottomNavigation, type BottomTab } from '@/components/layout/BottomNavigation'
import { HelpButton } from '@/components/layout/HelpButton'
import { TimerPanel } from '@/components/focus/TimerPanel'
import { TaskPanel } from '@/components/tasks/TaskPanel'
import { StatsPanel } from '@/components/analytics/StatsPanel'
import { useActiveSession } from '@/hooks/useActiveSession'
import { useTutorial } from '@/hooks/useTutorial'
import type { FocusTaskDto } from '@/hooks/useFocusTasks'

type Props = {
  displayName: string
}

export function FocusHomeView({ displayName }: Props) {
  const router = useRouter()
  const { startTutorial } = useTutorial()
  const [selectedTask, setSelectedTask] = useState<FocusTaskDto | null>(null)
  const [activeTab, setActiveTab] = useState<BottomTab>('timer')

  const { data: sessionData } = useActiveSession()
  const hasActiveSession = sessionData?.exists ?? false

  const taskPanel = (
    <TaskPanel
      selectedTaskId={selectedTask?.id ?? null}
      isActiveSession={hasActiveSession}
      onSelectTask={(task) => {
        setSelectedTask(task)
        setActiveTab('timer')
      }}
    />
  )

  const timerPanel = <TimerPanel selectedTask={selectedTask} />
  const statsPanel = <StatsPanel />

  let mobileContent: React.ReactNode
  if (activeTab === 'timer') mobileContent = timerPanel
  else if (activeTab === 'tasks') mobileContent = taskPanel
  else mobileContent = statsPanel

  return (
    <>
      <MainLayout
        header={<AppHeader displayName={displayName} />}
        left={taskPanel}
        right={timerPanel}
        rightStats={statsPanel}
        mobileContent={mobileContent}
      />
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'stats') { router.push('/records'); return }
          setActiveTab(tab)
        }}
      />
      <HelpButton onStart={startTutorial} />
    </>
  )
}
