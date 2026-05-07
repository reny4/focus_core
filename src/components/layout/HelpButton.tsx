'use client'

// HIG: Deference — ヘルプボタンは控えめに常設。操作の邪魔をしない

import { CircleHelp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

type Props = {
  onStart: () => void
}

export function HelpButton({ onStart }: Props) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Button
            variant="ghost"
            size="icon"
            onClick={onStart}
            className="
              fixed bottom-20 right-4
              md:bottom-6 md:right-6
              size-10 rounded-full
              bg-background/80 backdrop-blur-sm
              border border-border
              shadow-sm
              text-muted-foreground
              hover:text-foreground
              transition-colors
              z-40
            "
            style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
            aria-label="使い方を見る"
          >
            <CircleHelp className="size-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">
          <p>使い方を見る</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
