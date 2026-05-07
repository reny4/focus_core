'use client'

// HIG: Clarity — empty state is inviting, not just "no items"

import { ListTodoIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FocusTaskItem } from './FocusTaskItem'
import type { FocusTaskDto } from '@/hooks/useFocusTasks'

type Props = {
  tasks: FocusTaskDto[]
  isLoading: boolean
  selectedTaskId: string | null
  isActiveSession: boolean
  onSelect: (task: FocusTaskDto) => void
  onEdit: (task: FocusTaskDto) => void
  onArchive: (task: FocusTaskDto) => void
  onAdd: () => void
}

export function FocusTaskList({
  tasks,
  isLoading,
  selectedTaskId,
  isActiveSession,
  onSelect,
  onEdit,
  onArchive,
  onAdd,
}: Props) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-24">
        <p className="text-sm text-muted-foreground">読み込み中...</p>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12 px-4 text-center">
        <ListTodoIcon className="w-12 h-12 text-muted-foreground/40" aria-hidden="true" />
        <div className="space-y-1">
          <p className="text-sm font-semibold">タスクを追加しましょう</p>
          <p className="text-xs text-muted-foreground">
            集中したい作業を登録してください
          </p>
        </div>
        <Button
          className="rounded-lg min-h-[44px]"
          onClick={onAdd}
          aria-label="タスクを作成"
        >
          タスクを作成
        </Button>
      </div>
    )
  }

  return (
    <ul className="py-1">
      {tasks.map((task) => (
        <FocusTaskItem
          key={task.id}
          task={task}
          isSelected={task.id === selectedTaskId}
          isActiveSession={isActiveSession}
          onSelect={onSelect}
          onEdit={onEdit}
          onArchive={onArchive}
        />
      ))}
    </ul>
  )
}
