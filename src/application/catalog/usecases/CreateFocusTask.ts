import { v4 as uuidv4 } from 'uuid'
import { FocusTask } from '@/domain/catalog/entities/FocusTask'
import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'
import type { FocusTaskDto } from './ListFocusTasks'

export type CreateFocusTaskInput = {
  userId: UUID
  name: string
  tagId: UUID
}

export async function createFocusTask(
  input: CreateFocusTaskInput,
  deps: {
    focusTaskRepo: IFocusTaskRepository
    tagRepo: ITagRepository
  }
): Promise<Result<FocusTaskDto, UseCaseError>> {
  try {
    const tag = await deps.tagRepo.findById(input.tagId)
    if (!tag) return err(new UseCaseError('TAG_NOT_FOUND'))
    if (tag.userId !== input.userId) return err(new UseCaseError('UNAUTHORIZED'))
    if (tag.isArchived) return err(new UseCaseError('TAG_NOT_AVAILABLE'))

    const existing = await deps.focusTaskRepo.findActiveByUserIdAndTagId(
      input.userId,
      input.tagId
    )
    const duplicate = existing.find((t) => t.name.trim() === input.name.trim())
    if (duplicate) {
      return err(new UseCaseError('INVALID_REQUEST', '同名のタスクが既に存在します'))
    }

    const now = new Date()
    const saved = await deps.focusTaskRepo.save(
      new FocusTask(
        uuidv4() as UUID,
        input.userId,
        input.tagId,
        input.name.trim(),
        null,
        now,
        now
      )
    )
    return ok({ id: saved.id, name: saved.name, tagId: saved.tagId, tagName: tag.name, tagColor: tag.color })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
