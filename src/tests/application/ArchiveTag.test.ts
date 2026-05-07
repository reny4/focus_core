import { describe, it, expect, vi } from 'vitest'
import { archiveTag } from '@/application/catalog/usecases/ArchiveTag'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { Tag } from '@/domain/catalog/entities/Tag'
import { FocusTask } from '@/domain/catalog/entities/FocusTask'
import type { UUID } from '@/domain/shared/types/UUID'

const USER_ID = '00000000-0000-0000-0000-000000000001' as UUID
const TAG_ID = '00000000-0000-0000-0000-000000000002' as UUID
const TASK_ID = '00000000-0000-0000-0000-000000000003' as UUID
const OTHER_TASK_ID = '00000000-0000-0000-0000-000000000004' as UUID

function makeTag(overrides?: Partial<{ archivedAt: Date | null }>) {
  return new Tag(TAG_ID, USER_ID, 'テスト', '#3B82F6', overrides?.archivedAt ?? null, new Date(), new Date())
}

function makeTask(id: UUID = TASK_ID) {
  return new FocusTask(id, USER_ID, TAG_ID, 'タスク', null, new Date(), new Date())
}

function makeMocks(overrides?: {
  tag?: Tag | null
  activeTasks?: FocusTask[]
  activeSessionFocusTaskId?: string | null
}) {
  const tag = overrides?.tag ?? makeTag()
  const activeTasks = overrides?.activeTasks ?? [makeTask()]
  const focusTaskId = overrides?.activeSessionFocusTaskId ?? null

  const tagRepo: ITagRepository = {
    findById: vi.fn().mockResolvedValue(tag),
    findActiveByUserId: vi.fn().mockResolvedValue([]),
    save: vi.fn(),
    update: vi.fn().mockResolvedValue(tag),
  }

  const focusTaskRepo: IFocusTaskRepository = {
    findById: vi.fn(),
    findActiveByUserId: vi.fn(),
    findActiveByUserIdAndTagId: vi.fn().mockResolvedValue(activeTasks),
    save: vi.fn(),
    update: vi.fn().mockImplementation((t) => Promise.resolve(t)),
  }

  const focusSessionRepo: IFocusSessionRepository = {
    findActiveByUserId: vi.fn().mockResolvedValue(
      focusTaskId ? { focusTaskId } : null
    ),
    save: vi.fn(),
    update: vi.fn(),
  }

  return { tagRepo, focusTaskRepo, focusSessionRepo }
}

describe('archiveTag', () => {
  it('アクティブセッションがなければタグと関連タスクをアーカイブする', async () => {
    const { tagRepo, focusTaskRepo, focusSessionRepo } = makeMocks({
      activeSessionFocusTaskId: null,
    })
    const result = await archiveTag(
      { userId: USER_ID, tagId: TAG_ID },
      { tagRepo, focusTaskRepo, focusSessionRepo }
    )
    expect(result.ok).toBe(true)
    expect(tagRepo.update).toHaveBeenCalledTimes(1)
    expect(focusTaskRepo.update).toHaveBeenCalledTimes(1)
  })

  it('アクティブセッションのタスクが関係なければアーカイブを許可する', async () => {
    const { tagRepo, focusTaskRepo, focusSessionRepo } = makeMocks({
      activeTasks: [makeTask(TASK_ID)],
      activeSessionFocusTaskId: OTHER_TASK_ID,
    })
    const result = await archiveTag(
      { userId: USER_ID, tagId: TAG_ID },
      { tagRepo, focusTaskRepo, focusSessionRepo }
    )
    expect(result.ok).toBe(true)
  })

  it('アクティブセッションで使用中のタスクがあれば 409 を返す', async () => {
    const { tagRepo, focusTaskRepo, focusSessionRepo } = makeMocks({
      activeTasks: [makeTask(TASK_ID)],
      activeSessionFocusTaskId: TASK_ID,
    })
    const result = await archiveTag(
      { userId: USER_ID, tagId: TAG_ID },
      { tagRepo, focusTaskRepo, focusSessionRepo }
    )
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.error.code).toBe('TAG_IN_ACTIVE_SESSION')
  })

  it('既にアーカイブ済みのタグは FOCUS_TASK_NOT_AVAILABLE... 正確には TAG_NOT_AVAILABLE を返す', async () => {
    const archivedTag = makeTag({ archivedAt: new Date() })
    const { tagRepo, focusTaskRepo, focusSessionRepo } = makeMocks({ tag: archivedTag })
    const result = await archiveTag(
      { userId: USER_ID, tagId: TAG_ID },
      { tagRepo, focusTaskRepo, focusSessionRepo }
    )
    expect(result.ok).toBe(false)
    expect(result.ok === false && result.error.code).toBe('TAG_NOT_AVAILABLE')
  })
})
