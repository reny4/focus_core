import { describe, it, expect, vi, afterEach } from 'vitest'
import { finishSession } from '@/application/focus/usecases/FinishSession'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { FocusSession } from '@/domain/focus/entities/FocusSession'
import { TargetDuration } from '@/domain/focus/value-objects/TargetDuration'
import { SessionSnapshot } from '@/domain/focus/value-objects/SessionSnapshot'

function makeActiveSession(startedAt: Date) {
  return FocusSession.startNew({
    id: '00000000-0000-0000-0000-000000000001' as any,
    userId: '00000000-0000-0000-0000-000000000002' as any,
    focusTaskId: '00000000-0000-0000-0000-000000000003' as any,
    tagId: '00000000-0000-0000-0000-000000000004' as any,
    snapshot: SessionSnapshot.create('DDD設計', '開発', '#8B5CF6'),
    targetDuration: TargetDuration.create(1500),
    startedAt,
  })
}

function makeMocks(activeSession: ReturnType<typeof FocusSession.startNew> | null) {
  const focusSessionRepo: IFocusSessionRepository = {
    save: vi.fn(),
    findActiveByUserId: vi.fn().mockResolvedValue(activeSession),
    update: vi.fn().mockResolvedValue(undefined),
  }
  return { focusSessionRepo }
}

const userId = '00000000-0000-0000-0000-000000000002' as any

describe('FinishSession', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('正常に finished になる', async () => {
    const startedAt = new Date('2026-01-01T10:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T10:25:00Z'))

    const mocks = makeMocks(makeActiveSession(startedAt))
    const result = await finishSession({ userId }, mocks)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.sessionId).toBe('00000000-0000-0000-0000-000000000001')
    }
  })

  it('actualDurationSeconds が計算される（1500秒）', async () => {
    const startedAt = new Date('2026-01-01T10:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T10:25:00Z'))

    const mocks = makeMocks(makeActiveSession(startedAt))
    const result = await finishSession({ userId }, mocks)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.actualDurationSeconds).toBe(1500)
    }
  })

  it('12時間超過時に 43200 秒に丸められる', async () => {
    const startedAt = new Date('2026-01-01T10:00:00Z')
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-01-01T23:00:00Z')) // +13h

    const mocks = makeMocks(makeActiveSession(startedAt))
    const result = await finishSession({ userId }, mocks)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.actualDurationSeconds).toBe(43200)
    }
  })

  it('active session がない場合は ACTIVE_SESSION_NOT_FOUND', async () => {
    const mocks = makeMocks(null)
    const result = await finishSession({ userId }, mocks)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('ACTIVE_SESSION_NOT_FOUND')
    }
  })
})
