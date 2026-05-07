import { Tag } from '@/domain/catalog/entities/Tag'
import { FocusTask } from '@/domain/catalog/entities/FocusTask'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'

export type ArchiveTagInput = {
  userId: UUID
  tagId: UUID
}

export async function archiveTag(
  input: ArchiveTagInput,
  deps: {
    tagRepo: ITagRepository
    focusTaskRepo: IFocusTaskRepository
    focusSessionRepo: IFocusSessionRepository
  }
): Promise<Result<{ tagId: UUID }, UseCaseError>> {
  try {
    const tag = await deps.tagRepo.findById(input.tagId)
    if (!tag) return err(new UseCaseError('TAG_NOT_FOUND'))
    if (tag.userId !== input.userId) return err(new UseCaseError('UNAUTHORIZED'))
    if (tag.isArchived) return err(new UseCaseError('TAG_NOT_AVAILABLE'))

    const [activeTasks, activeSession] = await Promise.all([
      deps.focusTaskRepo.findActiveByUserIdAndTagId(input.userId, input.tagId),
      deps.focusSessionRepo.findActiveByUserId(input.userId),
    ])

    // If any active task is currently in use by an active session → block
    if (activeSession) {
      const inUse = activeTasks.some((t) => t.id === activeSession.focusTaskId)
      if (inUse) return err(new UseCaseError('TAG_IN_ACTIVE_SESSION'))
    }

    const serverNow = new Date()

    // Archive the tag
    await deps.tagRepo.update(
      new Tag(tag.id, tag.userId, tag.name, tag.color, serverNow, tag.createdAt, serverNow)
    )

    // Cascade: archive all active FocusTasks for this tag
    await Promise.all(
      activeTasks.map((task) =>
        deps.focusTaskRepo.update(
          new FocusTask(
            task.id, task.userId, task.tagId, task.name,
            serverNow, task.createdAt, serverNow
          )
        )
      )
    )

    return ok({ tagId: tag.id })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
