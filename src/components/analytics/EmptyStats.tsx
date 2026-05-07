// HIG: Clarity — empty state encourages action

import { BarChart2Icon } from 'lucide-react'

export function EmptyStats({ message = 'まだデータがありません' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
      <BarChart2Icon className="w-10 h-10 text-muted-foreground/30" aria-hidden="true" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  )
}
