'use client'

// HIG: Clarity — row labels are verbs; Depth — inset separator after icon

import { MoreHorizontalIcon, PencilIcon, ArchiveIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import type { FocusTaskDto } from '@/hooks/useFocusTasks'

type Props = {
  task: FocusTaskDto
  isSelected: boolean
  isActiveSession: boolean
  onSelect: (task: FocusTaskDto) => void
  onEdit: (task: FocusTaskDto) => void
  onArchive: (task: FocusTaskDto) => void
}

export function FocusTaskItem({
  task,
  isSelected,
  isActiveSession,
  onSelect,
  onEdit,
  onArchive,
}: Props) {
  return (
    <li>
      <div className="flex items-center min-h-[44px] pr-1">
        <button
          type="button"
          className={cn(
            'flex items-center gap-3 flex-1 min-h-[44px] px-4 text-left transition-colors',
            isSelected ? 'bg-primary/10' : 'hover:bg-muted'
          )}
          onClick={() => onSelect(task)}
          aria-pressed={isSelected}
        >
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: task.tagColor }}
            aria-hidden="true"
          />
          <span className="text-sm font-semibold flex-1 truncate">{task.name}</span>
          <span className="text-xs text-muted-foreground shrink-0">{task.tagName}</span>
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="shrink-0 mr-1 text-muted-foreground"
                aria-label={`${task.name} の操作`}
                disabled={isActiveSession}
              />
            }
          >
            <MoreHorizontalIcon className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(task)}>
              <PencilIcon className="w-4 h-4" />
              編集
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={() => onArchive(task)}>
              <ArchiveIcon className="w-4 h-4" />
              アーカイブ
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator className="ml-9" />
    </li>
  )
}
