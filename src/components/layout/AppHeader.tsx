'use client'

// HIG: Clarity — ナビゲーションクロムは最小限。アプリ名・ユーザー・サインアウトのみ
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/infrastructure/supabase/client'
import { GrowthIndicator } from '@/components/growth/GrowthIndicator'
import { useGrowth } from '@/hooks/useGrowth'

type Props = {
  displayName?: string
}

export function AppHeader({ displayName }: Props) {
  const router = useRouter()
  const { growth } = useGrowth()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <span className="text-base font-semibold tracking-tight">Focus Core</span>

      <div className="flex items-center gap-3">
        <GrowthIndicator growth={growth} />
        {displayName && (
          <span className="hidden sm:block text-sm text-muted-foreground">
            {displayName}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="size-9 rounded-lg"
          onClick={handleSignOut}
          aria-label="サインアウト"
        >
          <LogOut className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}
