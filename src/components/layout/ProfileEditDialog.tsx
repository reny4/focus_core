'use client'

import { useState, useTransition } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Props = {
  open: boolean
  currentDisplayName: string
  onClose: () => void
  onSuccess: (newDisplayName: string) => void
}

export function ProfileEditDialog({ open, currentDisplayName, onClose, onSuccess }: Props) {
  const [value, setValue] = useState(currentDisplayName)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleOpenChange(o: boolean) {
    if (!o && !isPending) {
      setError(null)
      setValue(currentDisplayName)
      onClose()
    }
  }

  function handleSave() {
    const trimmed = value.trim()
    if (!trimmed) {
      setError('名前を入力してください')
      return
    }
    if (trimmed.length > 50) {
      setError('50文字以内で入力してください')
      return
    }

    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/profile', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ displayName: trimmed }),
        })
        const data = await res.json()
        if (!data.ok) {
          setError(data.error?.message ?? '保存に失敗しました')
          return
        }
        onSuccess(trimmed)
        onClose()
      } catch {
        setError('通信エラーが発生しました')
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>プロフィール編集</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 py-2">
          <Label htmlFor="display-name">表示名</Label>
          <Input
            id="display-name"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            maxLength={50}
            placeholder="表示名を入力"
            disabled={isPending}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            キャンセル
          </Button>
          <Button onClick={handleSave} disabled={isPending || !value.trim()}>
            {isPending ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
