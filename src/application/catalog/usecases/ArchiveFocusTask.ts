import { FocusTask } from '@/domain/catalog/entities/FocusTask'
import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'

export type ArchiveFocusTaskInput = {
  userId: UUID
  focusTaskId: UUID
}

export async function archiveFocusTask(
  input: ArchiveFocusTaskInput,
  deps: {
    focusTaskRepo: IFocusTaskRepository
    focusSessionRepo: IFocusSessionRepository
  }
): Promise<Result<{ focusTaskId: UUID }, UseCaseError>> {
  try {
    const focusTask = await deps.focusTaskRepo.findById(input.focusTaskId)
    if (!focusTask) return err(new UseCaseError('FOCUS_TASK_NOT_FOUND'))
    if (focusTask.userId !== input.userId) return err(new UseCaseError('UNAUTHORIZED'))
    if (focusTask.isArchived) return err(new UseCaseError('FOCUS_TASK_NOT_AVAILABLE'))

    const activeSession = await deps.focusSessionRepo.findActiveByUserId(input.userId)
    if (activeSession?.focusTaskId === focusTask.id) {
      return err(new UseCaseError('FOCUS_TASK_IN_ACTIVE_SESSION'))
    }

    const serverNow = new Date()
    await deps.focusTaskRepo.update(
      new FocusTask(
        focusTask.id, focusTask.userId, focusTask.tagId, focusTask.name,
        serverNow, focusTask.createdAt, serverNow
      )
    )

    return ok({ focusTaskId: focusTask.id })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
