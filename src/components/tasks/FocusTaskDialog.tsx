'use client'

// HIG: Clarity — label above input, inline errors, verb-labeled submit

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { DialogClose } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useTags } from '@/hooks/useTags'
import type { FocusTaskDto } from '@/hooks/useFocusTasks'

const schema = z.object({
  name: z.string().min(1, 'タスク名は必須です').max(50, '50文字以内で入力してください'),
  tagId: z.string().min(1, 'タグを選択してください'),
})
type FormValues = z.infer<typeof schema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editTarget?: FocusTaskDto | null
  onSubmit: (values: FormValues) => Promise<void>
  isSubmitting: boolean
}

export function FocusTaskDialog({ open, onOpenChange, editTarget, onSubmit, isSubmitting }: Props) {
  const { data: tagData } = useTags()
  const tags = tagData?.tags ?? []
  const isEdit = !!editTarget

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', tagId: '' },
  })

  const selectedTagId = watch('tagId')

  useEffect(() => {
    if (open) {
      reset({
        name: editTarget?.name ?? '',
        tagId: editTarget?.tagId ?? (tags[0]?.id ?? ''),
      })
    }
  }, [open, editTarget, tags, reset])

  const handleFormSubmit = handleSubmit(async (values) => {
    await onSubmit(values)
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'タスクを編集' : 'タスクを作成'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="task-name">タスク名</Label>
            <Input
              id="task-name"
              {...register('name')}
              placeholder="例: 英単語の復習"
              className="rounded-lg"
              autoFocus
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-tag">タグ</Label>
            <select
              id="task-tag"
              value={selectedTagId}
              onChange={(e) => setValue('tagId', e.target.value)}
              className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="" disabled>タグを選択</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
            {errors.tagId && (
              <p className="text-xs text-destructive">{errors.tagId.message}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose render={<Button type="button" variant="outline" />}>
              キャンセル
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="rounded-lg min-h-[44px]">
              {isEdit ? '保存する' : '作成する'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
