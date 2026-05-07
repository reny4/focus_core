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
  const from = new Date(`${dateString}T00:00:00`)
  const to   = new Date(`${dateString}T00:00:00`)
  to.setDate(to.getDate() + 1)

  const toUtc = (localDate: Date) => {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false,
    })
    const utcMs = localDate.getTime()
    const tzOffsetMs = utcMs - new Date(
      formatter.format(localDate).replace(/(\d+)\/(\d+)\/(\d+),\s/, '$3-$1-$2T') + 'Z'
    ).getTime()
    return new Date(utcMs - tzOffsetMs)
  }

  return { from: toUtc(from), to: toUtc(to) }
}
