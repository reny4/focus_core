import { FocusTask } from '@/domain/catalog/entities/FocusTask'
import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'
import type { FocusTaskDto } from './ListFocusTasks'

export type UpdateFocusTaskInput = {
  userId: UUID
  focusTaskId: UUID
  name: string
  tagId: UUID
}

export async function updateFocusTask(
  input: UpdateFocusTaskInput,
  deps: {
    focusTaskRepo: IFocusTaskRepository
    tagRepo: ITagRepository
    focusSessionRepo: IFocusSessionRepository
  }
): Promise<Result<FocusTaskDto, UseCaseError>> {
  try {
    const focusTask = await deps.focusTaskRepo.findById(input.focusTaskId)
    if (!focusTask) return err(new UseCaseError('FOCUS_TASK_NOT_FOUND'))
    if (focusTask.userId !== input.userId) return err(new UseCaseError('UNAUTHORIZED'))
    if (focusTask.isArchived) return err(new UseCaseError('FOCUS_TASK_NOT_AVAILABLE'))

    const activeSession = await deps.focusSessionRepo.findActiveByUserId(input.userId)
    if (activeSession?.focusTaskId === focusTask.id) {
      return err(new UseCaseError('FOCUS_TASK_IN_ACTIVE_SESSION'))
    }

    const tag = await deps.tagRepo.findById(input.tagId)
    if (!tag) return err(new UseCaseError('TAG_NOT_FOUND'))
    if (tag.userId !== input.userId) return err(new UseCaseError('UNAUTHORIZED'))
    if (tag.isArchived) return err(new UseCaseError('TAG_NOT_AVAILABLE'))

    const existing = await deps.focusTaskRepo.findActiveByUserIdAndTagId(input.userId, input.tagId)
    const duplicate = existing.find(
      (t) => t.name.trim() === input.name.trim() && t.id !== input.focusTaskId
    )
    if (duplicate) {
      return err(new UseCaseError('INVALID_REQUEST', '同名のタスクが既に存在します'))
    }

    const updated = await deps.focusTaskRepo.update(
      new FocusTask(
        focusTask.id, focusTask.userId, input.tagId,
        input.name.trim(), null, focusTask.createdAt, new Date()
      )
    )
    return ok({ id: updated.id, name: updated.name, tagId: updated.tagId, tagName: tag.name, tagColor: tag.color })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
