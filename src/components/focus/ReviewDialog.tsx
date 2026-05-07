'use client'

// HIG: Depth — Bottom Sheet として soft interruption。タイマーは背後で動き続ける
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { formatSeconds } from '@/lib/time/duration'

type Props = {
  open: boolean
  elapsedSeconds: number
  onContinue: () => void
  onFinish: () => void
  onDiscard: () => void
}

export function ReviewDialog({
  open,
  elapsedSeconds,
  onContinue,
  onFinish,
  onDiscard,
}: Props) {
  const hours = Math.floor(elapsedSeconds / 3600)
  const elapsed = formatSeconds(elapsedSeconds)

  return (
    // onOpenChange no-op prevents Escape/outside-click from closing
    <Sheet open={open} onOpenChange={() => {}}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="rounded-t-2xl rounded-b-none px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-0"
      >
        {/* Drag handle indicator */}
        <div className="mx-auto mb-6 mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/20" aria-hidden="true" />

        <div className="space-y-1 mb-6">
          <h2 className="text-base font-semibold">
            {hours}時間を超えて集中しています
          </h2>
          <p className="text-sm text-muted-foreground">
            経過時間: {elapsed}。タイマーは動き続けています。
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="outline"
            className="h-11 w-full rounded-lg"
            onClick={onContinue}
          >
            このまま継続する
          </Button>
          <Button
            className="h-11 w-full rounded-lg font-semibold"
            onClick={onFinish}
          >
            終了して記録する
          </Button>
          <Button
            variant="ghost"
            className="h-11 w-full rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDiscard}
          >
            破棄する
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
