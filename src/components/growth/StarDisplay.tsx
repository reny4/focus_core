export function StarDisplay({ count, className }: { count: number; className?: string }) {
  if (count === 0) return null
  if (count <= 2) {
    return (
      <span className={className} aria-label={`Prestige ${count}回`}>
        {'⭐'.repeat(count)}
      </span>
    )
  }
  return (
    <span className={className} aria-label={`Prestige ${count}回`}>
      ⭐×{count}
    </span>
  )
}
