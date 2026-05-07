'use client'

// HIG: Deference — panel supports timer; panel actions are secondary

import { useState } from 'react'
import { PlusIcon, TagsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FocusTaskList } from './FocusTaskList'
import { FocusTaskDialog } from './FocusTaskDialog'
import { TagManagerDialog } from './TagManagerDialog'
import {
  useFocusTasks,
  useCreateFocusTask,
  useUpdateFocusTask,
  useArchiveFocusTask,
  type FocusTaskDto,
} from '@/hooks/useFocusTasks'
import { toast } from 'sonner'

type Props = {
  selectedTaskId: string | null
  isActiveSession: boolean
  onSelectTask: (task: FocusTaskDto | null) => void
}

export function TaskPanel({ selectedTaskId, isActiveSession, onSelectTask }: Props) {
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [tagDialogOpen, setTagDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<FocusTaskDto | null>(null)

  const { data, isLoading } = useFocusTasks()
  const tasks = data?.focusTasks ?? []

  const { mutateAsync: createTask, isPending: isCreating } = useCreateFocusTask()
  const { mutateAsync: updateTask, isPending: isUpdating } = useUpdateFocusTask()
  const { mutateAsync: archiveTask } = useArchiveFocusTask()

  const openCreateDialog = () => {
    setEditTarget(null)
    setTaskDialogOpen(true)
  }

  const openEditDialog = (task: FocusTaskDto) => {
    setEditTarget(task)
    setTaskDialogOpen(true)
  }

  const handleArchive = async (task: FocusTaskDto) => {
    try {
      await archiveTask(task.id)
      if (selectedTaskId === task.id) onSelectTask(null)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  const handleTaskSubmit = async (values: { name: string; tagId: string }) => {
    try {
      if (editTarget) {
        const updated = await updateTask({ focusTaskId: editTarget.id, ...values })
        if (selectedTaskId === editTarget.id) onSelectTask(updated)
      } else {
        await createTask(values)
      }
      setTaskDialogOpen(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 h-11 border-b shrink-0">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          タスク
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setTagDialogOpen(true)}
            aria-label="タグを管理"
            className="text-muted-foreground"
          >
            <TagsIcon className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={openCreateDialog}
            aria-label="タスクを追加"
            className="text-muted-foreground"
          >
            <PlusIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto">
        <FocusTaskList
          tasks={tasks}
          isLoading={isLoading}
          selectedTaskId={selectedTaskId}
          isActiveSession={isActiveSession}
          onSelect={onSelectTask}
          onEdit={openEditDialog}
          onArchive={handleArchive}
          onAdd={openCreateDialog}
        />
      </div>

      <FocusTaskDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          setTaskDialogOpen(open)
          if (!open) setEditTarget(null)
        }}
        editTarget={editTarget}
        onSubmit={handleTaskSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <TagManagerDialog
        open={tagDialogOpen}
        onOpenChange={setTagDialogOpen}
      />
    </div>
  )
}
