// HIG: Depth — Desktop 3カラム / Mobile 1カラム + BottomNav
// left: タスクパネル, right: タイマー, rightStats: 統計パネル

type Props = {
  header: React.ReactNode
  left: React.ReactNode
  right: React.ReactNode
  rightStats: React.ReactNode
  mobileContent: React.ReactNode
}

export function MainLayout({ header, left, right, rightStats, mobileContent }: Props) {
  return (
    <div className="flex flex-col h-screen">
      {header}

      <div className="flex flex-1 overflow-hidden">
        {/* Left column — task panel (desktop only) */}
        <aside className="hidden md:flex w-64 shrink-0 flex-col border-r overflow-y-auto bg-white/[0.02] backdrop-blur-sm">
          {left}
        </aside>

        {/* Center column — timer (desktop only) */}
        <main className="hidden md:flex flex-1 flex-col overflow-y-auto border-r">
          {right}
        </main>

        {/* Right column — stats (desktop only) */}
        <aside data-tutorial="stats-panel" className="hidden md:flex w-80 shrink-0 flex-col overflow-y-auto bg-white/[0.02] backdrop-blur-sm">
          {rightStats}
        </aside>

        {/* Mobile — active tab content */}
        <div className="md:hidden flex flex-1 flex-col overflow-y-auto pb-14">
          {mobileContent}
        </div>
      </div>
    </div>
  )
}
