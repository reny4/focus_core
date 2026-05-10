'use client'

// HIG: Clarity — ナビゲーションクロムは最小限。アプリ名・ユーザー・サインアウトのみ
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { createClient } from '@/infrastructure/supabase/client'
import { GrowthIndicator } from '@/components/growth/GrowthIndicator'
import { PrestigeDialog } from '@/components/growth/PrestigeDialog'
import { ProfileEditDialog } from '@/components/layout/ProfileEditDialog'
import { useGrowth } from '@/hooks/useGrowth'

type Props = {
  displayName?: string
}

export function AppHeader({ displayName }: Props) {
  const router = useRouter()
  const { growth, refetch: refetchGrowth } = useGrowth()
  const [prestigeDialogOpen, setPrestigeDialogOpen] = useState(false)
  const [profileDialogOpen, setProfileDialogOpen] = useState(false)
  const [localDisplayName, setLocalDisplayName] = useState(displayName ?? '')

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handlePrestigeSuccess() {
    await refetchGrowth()
  }

  function handleProfileSuccess(newDisplayName: string) {
    setLocalDisplayName(newDisplayName)
    router.refresh()
  }

  const shownName = localDisplayName || displayName || ''

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b bg-background/80 backdrop-blur-sm sticky top-0 z-40">
      <span className="text-base font-semibold tracking-tight">Focus Core</span>

      <div className="flex items-center gap-3">
        {growth && (
          <GrowthIndicator
            level={growth.level}
            levelCap={growth.levelCap}
            progressRatio={growth.progressRatio}
            prestige={growth.prestige}
            canPrestige={growth.canPrestige}
            onPrestigeClick={() => setPrestigeDialogOpen(true)}
          />
        )}

        {/* User dropdown */}
        {shownName && (
          <DropdownMenu>
            <DropdownMenuTrigger
              className="hidden sm:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md px-1 py-0.5 outline-none"
              aria-label="ユーザーメニュー"
            >
              {shownName}
              <ChevronDown className="size-3 opacity-60" aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => setProfileDialogOpen(true)}>
                プロフィールを編集
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={handleSignOut}
              >
                サインアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Fallback sign-out when no displayName */}
        {!shownName && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9 rounded-lg"
            onClick={handleSignOut}
            aria-label="サインアウト"
          >
            <LogOut className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      <PrestigeDialog
        open={prestigeDialogOpen}
        onClose={() => setPrestigeDialogOpen(false)}
        onSuccess={handlePrestigeSuccess}
      />

      <ProfileEditDialog
        open={profileDialogOpen}
        currentDisplayName={shownName}
        onClose={() => setProfileDialogOpen(false)}
        onSuccess={handleProfileSuccess}
      />
    </header>
  )
}
