import { describe, it, expect, vi } from 'vitest'
import { updateFocusTask } from '@/application/catalog/usecases/UpdateFocusTask'
import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { FocusTask } from '@/domain/catalog/entities/FocusTask'
import { Tag } from '@/domain/catalog/entities/Tag'
import type { UUID } from '@/domain/shared/types/UUID'

const USER_ID = '00000000-0000-0000-0000-000000000001' as UUID
const TASK_ID = '00000000-0000-0000-0000-000000000002' as UUID
const TAG_ID = '00000000-0000-0000-0000-000000000003' as UUID

function makeTask() {
  return new FocusTask(TASK_ID, USER_ID, TAG_ID, '旧タスク名', null, new Date(), new Date())
}

function makeTag() {
  return new Tag(TAG_ID, USER_ID, '開発', '#8B5CF6', null, new Date(), new Date())
}

function makeMocks(overrides?: { activeSessionFocusTaskId?: string | null }) {
  const focusTaskId = overrides?.activeSessionFocusTaskId ?? null

  const focusTaskRepo: IFocusTaskRepository = {
    findById: vi.fn().mockResolvedValue(makeTask()),
    findActiveByUserId: vi.fn(),
    findActiveByUserIdAndTagId: vi.fn().mockResolvedValue([makeTask()]),
    save: vi.fn(),
    update: vi.fn().mockImplementation((t) => Promise.resolve(t)),
  }

  const tagRepo: ITagRepository = {
    findById: vi.fn().mockResolvedValue(makeTag()),
    findActiveByUserId: vi.fn(),
    save: vi.fn(),
    update: vi.fn(),
  }

  const focusSessionRepo: IFocusSessionRepository = {
    findActiveByUserId: vi.fn().mockResolvedValue(
      focusTaskId ? { focusTaskId } : null
    ),
    save: vi.fn(),
    update: vi.fn(),
  }

  return { focusTaskRepo, tagRepo, focusSessionRepo }
}

describe('updateFocusTask', () => {
  it('タスク名を正常に更新する', async () => {
    const { focusTaskRepo, tagRepo, focusSessionRepo } = makeMocks()
    const result = await updateFocusTask(
      { userId: USER_ID, focusTaskId: TASK_ID, name: '新タスク名', tagId: TAG_ID },
      { focusTaskRepo, tagRepo, focusSessionRepo }
    )
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.value.name).toBe('新タスク名')
    }
  })

  it('アクティブセッションで使用中のタスクは更新できない', async () => {
    const { focusTaskRepo, tagRepo, focusSessionRepo } = makeMocks({
      activeSessionFocusTaskId: TASK_ID,
    })
    const result = await updateFocusTask(
      { userId: USER_ID, focusTaskId: TASK_ID, name: '新タスク名', tagId: TAG_ID },
      { focusTaskRepo, tagRepo, focusSessionRepo }
    )
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.error.code).toBe('FOCUS_TASK_IN_ACTIVE_SESSION')
  })
})
