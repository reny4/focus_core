'use client'

import { useState } from 'react'
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
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handlePrestige() {
    setIsLoading(true)
    setError(null)
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
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    if (isLoading) return
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
          <AlertDialogCancel onClick={handleClose} disabled={isLoading}>
            キャンセル
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handlePrestige}
            disabled={isLoading}
            className="bg-[#6366F1] hover:bg-[#5254CC] text-white"
          >
            {isLoading ? '実行中...' : 'Prestige する'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
