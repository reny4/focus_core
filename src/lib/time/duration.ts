import { MAX_ACTUAL_DURATION_SECONDS } from '@/lib/constants/duration'

/** 秒 → "HH:MM:SS" 形式 */
export function formatSeconds(seconds: number): string {
  const abs = Math.abs(Math.floor(seconds))
  const h = Math.floor(abs / 3600)
  const m = Math.floor((abs % 3600) / 60)
  const s = abs % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** 分 → 秒 */
export function minutesToSeconds(minutes: number): number {
  return minutes * 60
}

/** elapsedSeconds から導出値を計算する */
export function deriveTimerValues(
  elapsedSeconds: number,
  targetDurationSeconds: number
) {
  const phase =
    elapsedSeconds < targetDurationSeconds ? 'counting_down' : 'counting_up'
  const remainingSeconds = Math.max(targetDurationSeconds - elapsedSeconds, 0)
  const overrunSeconds   = Math.max(elapsedSeconds - targetDurationSeconds, 0)
  const requiresReview   = elapsedSeconds >= 21600
  const reachedMaxDuration = elapsedSeconds >= MAX_ACTUAL_DURATION_SECONDS

  return { phase, remainingSeconds, overrunSeconds, requiresReview, reachedMaxDuration }
}
