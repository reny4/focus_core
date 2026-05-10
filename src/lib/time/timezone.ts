/**
 * ユーザーの timezone における 1 日の開始・終了を UTC Date として返す
 *
 * @example
 * getDayRangeUtc('2026-05-04', 'Asia/Tokyo')
 * // → { from: Date('2026-05-03T15:00:00Z'), to: Date('2026-05-04T15:00:00Z') }
 */
export function getDayRangeUtc(
  dateString: string, // YYYY-MM-DD
  timezone: string
): { from: Date; to: Date } {
  return {
    from: midnightUtc(dateString, timezone),
    to: midnightUtc(shiftDay(dateString, 1), timezone),
  }
}

/**
 * dateString (YYYY-MM-DD) の timezone における 00:00:00 を UTC Date として返す。
 * サーバーのローカルタイムゾーンに依存しない実装。
 */
function midnightUtc(dateString: string, timezone: string): Date {
  const [y, mo, d] = dateString.split('-').map(Number)
  // 正午 UTC を基点にする（DST 切替日でも必ず目的の日付の中に収まる）
  const probeMs = Date.UTC(y, mo - 1, d, 12, 0, 0)
  // sv-SE ロケールは "YYYY-MM-DD HH:MM:SS" 形式を返すため扱いやすい
  const localStr = new Date(probeMs).toLocaleString('sv-SE', { timeZone: timezone })
  // ローカル時刻文字列を UTC として解釈し、実際の UTC との差分 (offsetMs) を求める
  const localAsUtcMs = new Date(localStr.replace(' ', 'T') + 'Z').getTime()
  const offsetMs = localAsUtcMs - probeMs
  // timezone の真夜中 = YYYY-MM-DDT00:00:00 (fake UTC) − offset
  return new Date(Date.UTC(y, mo - 1, d) - offsetMs)
}

function shiftDay(dateString: string, days: number): string {
  const [y, mo, d] = dateString.split('-').map(Number)
  const shifted = new Date(Date.UTC(y, mo - 1, d + days))
  return [
    shifted.getUTCFullYear(),
    String(shifted.getUTCMonth() + 1).padStart(2, '0'),
    String(shifted.getUTCDate()).padStart(2, '0'),
  ].join('-')
}
