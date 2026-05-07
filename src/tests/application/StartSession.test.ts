import { describe, it, expect, vi } from 'vitest'
import { startSession } from '@/application/focus/usecases/StartSession'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import { FocusTask } from '@/domain/catalog/entities/FocusTask'
import { Tag } from '@/domain/catalog/entities/Tag'

function makeMocks(overrides?: {
  activeSession?: unknown
  focusTask?: FocusTask | null
  tag?: Tag | null
}) {
  const focusTask = new FocusTask(
    '00000000-0000-0000-0000-000000000003' as any,
    '00000000-0000-0000-0000-000000000002' as any,
    '00000000-0000-0000-0000-000000000004' as any,
    'DDD設計',
    null,
    new Date(),
    new Date(),
  )

  const tag = new Tag(
    '00000000-0000-0000-0000-000000000004' as any,
    '00000000-0000-0000-0000-000000000002' as any,
    '開発',
    '#8B5CF6',
    null,
    new Date(),
    new Date(),
  )

  const focusSessionRepo: IFocusSessionRepository = {
    save: vi.fn().mockResolvedValue(undefined),
    findActiveByUserId: vi.fn().mockResolvedValue(overrides?.activeSession ?? null),
    update: vi.fn().mockResolvedValue(undefined),
  }

  const focusTaskRepo: IFocusTaskRepository = {
    findById: vi.fn().mockResolvedValue(
      overrides?.focusTask !== undefined ? overrides.focusTask : focusTask
    ),
    findActiveByUserId: vi.fn(),
    findActiveByUserIdAndTagId: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  }

  const tagRepo: ITagRepository = {
    findById: vi.fn().mockResolvedValue(
      overrides?.tag !== undefined ? overrides.tag : tag
    ),
    findActiveByUserId: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  }

  return { focusSessionRepo, focusTaskRepo, tagRepo }
}

const validInput = {
  userId: '00000000-0000-0000-0000-000000000002' as any,
  focusTaskId: '00000000-0000-0000-0000-000000000003' as any,
  targetDurationSeconds: 1500,
}

describe('StartSession', () => {
  it('正常にセッションが作成される', async () => {
    const mocks = makeMocks()
    const result = await startSession(validInput, mocks)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.targetDurationSeconds).toBe(1500)
      expect(result.value.focusTaskName).toBe('DDD設計')
    }
  })

  it('Snapshot が保存される（tagName, tagColor を含む）', async () => {
    const mocks = makeMocks()
    const result = await startSession(validInput, mocks)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.tagName).toBe('開発')
      expect(result.value.tagColor).toBe('#8B5CF6')
    }
  })

  it('active session が既にある場合は失敗する', async () => {
    const mocks = makeMocks({ activeSession: {} })
    const result = await startSession(validInput, mocks)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('ACTIVE_SESSION_ALREADY_EXISTS')
    }
  })

  it('不正な targetDurationSeconds（59秒）は失敗する', async () => {
    const mocks = makeMocks()
    const result = await startSession({ ...validInput, targetDurationSeconds: 59 }, mocks)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_REQUEST')
    }
  })

  it('FocusTask が見つからない場合は失敗する', async () => {
    const mocks = makeMocks({ focusTask: null })
    const result = await startSession(validInput, mocks)
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('FOCUS_TASK_NOT_FOUND')
    }
  })
})
