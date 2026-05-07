'use client'

// HIG: Clarity — inline editing pattern; Deference — minimal chrome

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PencilIcon, ArchiveIcon, PlusIcon, CheckIcon, XIcon } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useTags, useCreateTag, useUpdateTag, useArchiveTag, type TagDto } from '@/hooks/useTags'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

const TAG_COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
]

const schema = z.object({
  name: z.string().min(1, 'タグ名は必須です').max(20, '20文字以内で入力してください'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, '有効な色を選択してください'),
})
type FormValues = z.infer<typeof schema>

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

function TagForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel,
}: {
  defaultValues: FormValues
  onSubmit: (values: FormValues) => Promise<void>
  onCancel: () => void
  submitLabel: string
}) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues })

  const selectedColor = watch('color')

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="tag-name">タグ名</Label>
        <Input id="tag-name" {...register('name')} className="rounded-lg" autoFocus />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>カラー</Label>
        <div className="flex flex-wrap gap-2">
          {TAG_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center transition-transform',
                selectedColor === color && 'ring-2 ring-offset-2 ring-foreground scale-110'
              )}
              style={{ backgroundColor: color }}
              onClick={() => setValue('color', color)}
              aria-label={`色 ${color}`}
              aria-pressed={selectedColor === color}
            >
              {selectedColor === color && (
                <CheckIcon className="w-4 h-4 text-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="outline" size="sm" onClick={onCancel} className="flex-1">
          キャンセル
        </Button>
        <Button type="submit" size="sm" disabled={isSubmitting} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function TagRow({
  tag,
  onArchive,
}: {
  tag: TagDto
  onArchive: (tag: TagDto) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const { mutateAsync: updateTag } = useUpdateTag()

  const handleUpdate = async (values: FormValues) => {
    try {
      await updateTag({ tagId: tag.id, ...values })
      setIsEditing(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  if (isEditing) {
    return (
      <li className="px-4 py-3">
        <TagForm
          defaultValues={{ name: tag.name, color: tag.color }}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          submitLabel="保存する"
        />
      </li>
    )
  }

  return (
    <li>
      <div className="flex items-center min-h-[44px] px-4 gap-3">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: tag.color }}
          aria-hidden="true"
        />
        <span className="text-sm font-semibold flex-1">{tag.name}</span>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setIsEditing(true)}
          aria-label={`${tag.name} を編集`}
          className="text-muted-foreground"
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => onArchive(tag)}
          aria-label={`${tag.name} をアーカイブ`}
          className="text-muted-foreground"
        >
          <ArchiveIcon className="w-4 h-4" />
        </Button>
      </div>
      <Separator className="ml-10" />
    </li>
  )
}

export function TagManagerDialog({ open, onOpenChange }: Props) {
  const [isCreating, setIsCreating] = useState(false)
  const { data } = useTags()
  const tags = data?.tags ?? []
  const { mutateAsync: createTag } = useCreateTag()
  const { mutateAsync: archiveTag } = useArchiveTag()

  const handleCreate = async (values: FormValues) => {
    try {
      await createTag(values)
      setIsCreating(false)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  const handleArchive = async (tag: TagDto) => {
    try {
      await archiveTag(tag.id)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'エラーが発生しました')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>タグを管理</DialogTitle>
        </DialogHeader>

        <ul className="divide-y divide-border -mx-4">
          {tags.map((tag) => (
            <TagRow key={tag.id} tag={tag} onArchive={handleArchive} />
          ))}
        </ul>

        {tags.length === 0 && !isCreating && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            タグがありません
          </p>
        )}

        {isCreating ? (
          <div className="pt-2 border-t">
            <TagForm
              defaultValues={{ name: '', color: TAG_COLORS[0] }}
              onSubmit={handleCreate}
              onCancel={() => setIsCreating(false)}
              submitLabel="作成する"
            />
          </div>
        ) : (
          <Button
            variant="ghost"
            className="w-full gap-2 text-muted-foreground min-h-[44px]"
            onClick={() => setIsCreating(true)}
          >
            <PlusIcon className="w-4 h-4" />
            タグを追加
          </Button>
        )}
      </DialogContent>
    </Dialog>
  )
}
