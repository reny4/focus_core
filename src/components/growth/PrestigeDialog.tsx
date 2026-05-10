'use client'

import { useState, useTransition } from 'react'
import { RotateCcw } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

type Props = {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PrestigeDialog({ open, onClose, onSuccess }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handlePrestige() {
    setError(null)
    startTransition(async () => {
      try {
        const res = await fetch('/api/growth/prestige', { method: 'POST' })
        const data = await res.json()
        if (!data.ok) {
          setError(data.error?.message ?? 'Prestigeに失敗しました')
          return
        }
        onSuccess()
        onClose()
      } catch {
        setError('通信エラーが発生しました')
      }
    })
  }

  function handleClose() {
    if (isPending) return
    setError(null)
    onClose()
  }

  return (
    <AlertDialog open={open} onOpenChange={(o) => { if (!o) handleClose() }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <RotateCcw className="size-4" aria-hidden="true" />
            Prestige
          </AlertDialogTitle>
          <AlertDialogDescription>
            Lv.100に達しました。Prestigeを実行するとLevelがリセットされ、
            ⭐が1つ増えます。蓄積されたXPはPrestige後も引き継がれます。
            この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm text-destructive px-1">{error}</p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleClose} disabled={isPending}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePrestige}
            disabled={isPending}
            className="bg-[#6366F1] hover:bg-[#5254CC] text-white"
          >
            {isPending ? '実行中...' : 'Prestige する'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
