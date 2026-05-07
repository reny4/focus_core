import { describe, it, expect } from 'vitest'
import { FocusSession } from '@/domain/focus/entities/FocusSession'
import { TargetDuration } from '@/domain/focus/value-objects/TargetDuration'
import { SessionSnapshot } from '@/domain/focus/value-objects/SessionSnapshot'
import { DomainError } from '@/domain/shared/errors/DomainError'

function makeActiveSession(overrides?: Partial<Parameters<typeof FocusSession.startNew>[0]>) {
  const snapshot = SessionSnapshot.create('DDD設計', '開発', '#8B5CF6')
  const targetDuration = TargetDuration.create(1500)
  const startedAt = new Date('2026-01-01T10:00:00Z')
  return FocusSession.startNew({
    id: '00000000-0000-0000-0000-000000000001' as any,
    userId: '00000000-0000-0000-0000-000000000002' as any,
    focusTaskId: '00000000-0000-0000-0000-000000000003' as any,
    tagId: '00000000-0000-0000-0000-000000000004' as any,
    snapshot,
    targetDuration,
    startedAt,
    ...overrides,
  })
}

describe('FocusSession', () => {
  describe('startNew', () => {
    it('active ステータスで作成される', () => {
      const session = makeActiveSession()
      expect(session.status).toBe('active')
    })

    it('endedAt が null である', () => {
      const session = makeActiveSession()
      expect(session.endedAt).toBeNull()
    })

    it('actualDuration が null である', () => {
      const session = makeActiveSession()
      expect(session.actualDuration).toBeNull()
    })
  })

  describe('finish()', () => {
    it('active → finished に遷移できる', () => {
      const session = makeActiveSession()
      const endedAt = new Date('2026-01-01T10:25:00Z')
      const finished = session.finish(endedAt)
      expect(finished.status).toBe('finished')
    })

    it('endedAt が保存される', () => {
      const session = makeActiveSession()
      const endedAt = new Date('2026-01-01T10:25:00Z')
      const finished = session.finish(endedAt)
      expect(finished.endedAt).toEqual(endedAt)
    })

    it('actualDuration が計算される（1500秒）', () => {
      const session = makeActiveSession()
      const endedAt = new Date('2026-01-01T10:25:00Z') // +25min = 1500s
      const finished = session.finish(endedAt)
      expect(finished.actualDuration?.seconds).toBe(1500)
    })

    it('12時間を超える場合は 43200 秒に丸める', () => {
      const session = makeActiveSession()
      const endedAt = new Date('2026-01-01T23:00:00Z') // +13h
      const finished = session.finish(endedAt)
      expect(finished.actualDuration?.seconds).toBe(43200)
    })

    it('finished セッションを再度 finish できない', () => {
      const session = makeActiveSession()
      const finished = session.finish(new Date('2026-01-01T10:25:00Z'))
      expect(() => finished.finish(new Date())).toThrow(DomainError)
    })

    it('discarded セッションを finish できない', () => {
      const session = makeActiveSession()
      const discarded = session.discard(new Date('2026-01-01T10:05:00Z'))
      expect(() => discarded.finish(new Date())).toThrow(DomainError)
    })
  })

  describe('discard()', () => {
    it('active → discarded に遷移できる', () => {
      const session = makeActiveSession()
      const discarded = session.discard(new Date('2026-01-01T10:05:00Z'))
      expect(discarded.status).toBe('discarded')
    })

    it('actualDuration が null のまま', () => {
      const session = makeActiveSession()
      const discarded = session.discard(new Date('2026-01-01T10:05:00Z'))
      expect(discarded.actualDuration).toBeNull()
    })

    it('finished セッションを discard できない', () => {
      const session = makeActiveSession()
      const finished = session.finish(new Date('2026-01-01T10:25:00Z'))
      expect(() => finished.discard(new Date())).toThrow(DomainError)
    })
  })

  describe('deriveTimerPhase()', () => {
    it('経過時間 < 目標時間 → counting_down', () => {
      const session = makeActiveSession() // targetDuration = 1500s
      const now = new Date('2026-01-01T10:10:00Z') // +600s
      expect(session.deriveTimerPhase(now)).toBe('counting_down')
    })

    it('経過時間 >= 目標時間 → counting_up', () => {
      const session = makeActiveSession()
      const now = new Date('2026-01-01T10:30:00Z') // +1800s > 1500s
      expect(session.deriveTimerPhase(now)).toBe('counting_up')
    })

    it('ちょうど目標時間 → counting_up', () => {
      const session = makeActiveSession()
      const now = new Date('2026-01-01T10:25:00Z') // +1500s
      expect(session.deriveTimerPhase(now)).toBe('counting_up')
    })
  })
})
