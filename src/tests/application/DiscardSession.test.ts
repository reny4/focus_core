import { describe, it, expect, vi } from 'vitest'
import { discardSession } from '@/application/focus/usecases/DiscardSession'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { FocusSession } from '@/domain/focus/entities/FocusSession'
import { TargetDuration } from '@/domain/focus/value-objects/TargetDuration'
import { SessionSnapshot } from '@/domain/focus/value-objects/SessionSnapshot'

function makeActiveSession() {
  return FocusSession.startNew({
    id: '00000000-0000-0000-0000-000000000001' as any,
    userId: '00000000-0000-0000-0000-000000000002' as any,
    focusTaskId: '00000000-0000-0000-0000-000000000003' as any,
    tagId: '00000000-0000-0000-0000-000000000004' as any,
    snapshot: SessionSnapshot.create('DDD設計', '開発', '#8B5CF6'),
    targetDuration: TargetDuration.create(1500),
    startedAt: new Date('2026-01-01T10:00:00Z'),
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

describe('DiscardSession', () => {
  it('正常に discarded になる', async () => {
    const mocks = makeMocks(makeActiveSession())
    const result = await discardSession({ userId }, mocks)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.sessionId).toBe('00000000-0000-0000-0000-000000000001')
      expect(result.value.discardedAt).toBeTruthy()
    }
  })

  it('update に渡された session の actualDuration が null', async () => {
    const mocks = makeMocks(makeActiveSession())
    await discardSession({ userId }, mocks)

    const updateCall = (mocks.focusSessionRepo.update as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(updateCall.actualDuration).toBeNull()
  })

  it('active session がない場合は ACTIVE_SESSION_NOT_FOUND', async () => {
    const mocks = makeMocks(null)
    const result = await discardSession({ userId }, mocks)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('ACTIVE_SESSION_NOT_FOUND')
    }
  })
})
