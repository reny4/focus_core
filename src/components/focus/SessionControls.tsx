'use client'

// HIG: Clarity — ボタンは動詞で結果を表現。Discard は確認ダイアログで防護する
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type Props = {
  phase: 'idle' | 'counting_down' | 'counting_up'
  selectedFocusTaskId: string | null
  onStart: () => void
  onFinish: () => void
  onDiscard: () => void
  isStarting?: boolean
  isFinishing?: boolean
  isDiscarding?: boolean
}

export function SessionControls({
  phase,
  selectedFocusTaskId,
  onStart,
  onFinish,
  onDiscard,
  isStarting,
  isFinishing,
  isDiscarding,
}: Props) {
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false)

  if (phase === 'idle') {
    return (
      <Button
        className="h-11 w-full rounded-lg text-base font-semibold"
        onClick={onStart}
        disabled={!selectedFocusTaskId || isStarting}
        aria-label="集中セッションを開始する"
      >
        {isStarting ? '開始中...' : '集中を開始する'}
      </Button>
    )
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        <Button
          className="h-11 w-full rounded-lg text-base font-semibold"
          onClick={onFinish}
          disabled={isFinishing}
          aria-label="セッションを終了して記録する"
        >
          {isFinishing ? '記録中...' : '終了して記録する'}
        </Button>
        <Button
          variant="ghost"
          className="h-11 w-full rounded-lg text-muted-foreground hover:text-foreground"
          onClick={() => setShowDiscardConfirm(true)}
          disabled={isDiscarding}
          aria-label="セッションを破棄する"
        >
          破棄する
        </Button>
      </div>

      {/* Discard confirmation — AlertDialog per HIG: Cancel LEFT, Destructive RIGHT */}
      <AlertDialog open={showDiscardConfirm} onOpenChange={setShowDiscardConfirm}>
        <AlertDialogContent className="rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>セッションを破棄しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。記録は残りません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg min-h-[44px]">
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg min-h-[44px] bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                setShowDiscardConfirm(false)
                onDiscard()
              }}
            >
              破棄する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
