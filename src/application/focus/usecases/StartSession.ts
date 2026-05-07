import { v4 as uuidv4 } from 'uuid'
import { FocusSession } from '@/domain/focus/entities/FocusSession'
import { TargetDuration } from '@/domain/focus/value-objects/TargetDuration'
import { SessionSnapshot } from '@/domain/focus/value-objects/SessionSnapshot'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { DomainError } from '@/domain/shared/errors/DomainError'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'

export type StartSessionInput = {
  userId: UUID
  focusTaskId: UUID
  targetDurationSeconds: number
}

export type StartSessionOutput = {
  sessionId: UUID
  startedAt: string
  targetDurationSeconds: number
  focusTaskId: UUID
  focusTaskName: string
  tagId: UUID
  tagName: string
  tagColor: string
}

export async function startSession(
  input: StartSessionInput,
  deps: {
    focusSessionRepo: IFocusSessionRepository
    focusTaskRepo: IFocusTaskRepository
    tagRepo: ITagRepository
  }
): Promise<Result<StartSessionOutput, UseCaseError>> {
  try {
    let targetDuration: TargetDuration
    try {
      targetDuration = TargetDuration.create(input.targetDurationSeconds)
    } catch {
      return err(new UseCaseError('INVALID_REQUEST', 'Invalid targetDurationSeconds'))
    }

    const focusTask = await deps.focusTaskRepo.findById(input.focusTaskId)
    if (!focusTask) return err(new UseCaseError('FOCUS_TASK_NOT_FOUND'))
    if (focusTask.userId !== input.userId) return err(new UseCaseError('UNAUTHORIZED'))
    if (focusTask.isArchived) return err(new UseCaseError('FOCUS_TASK_NOT_AVAILABLE'))

    const tag = await deps.tagRepo.findById(focusTask.tagId)
    if (!tag) return err(new UseCaseError('TAG_NOT_FOUND'))
    if (tag.userId !== input.userId) return err(new UseCaseError('UNAUTHORIZED'))
    if (tag.isArchived) return err(new UseCaseError('TAG_NOT_AVAILABLE'))

    const existing = await deps.focusSessionRepo.findActiveByUserId(input.userId)
    if (existing) return err(new UseCaseError('ACTIVE_SESSION_ALREADY_EXISTS'))

    const snapshot = SessionSnapshot.create(focusTask.name, tag.name, tag.color)

    const session = FocusSession.startNew({
      id: uuidv4() as UUID,
      userId: input.userId,
      focusTaskId: focusTask.id,
      tagId: tag.id,
      snapshot,
      targetDuration,
      startedAt: new Date(),
    })

    await deps.focusSessionRepo.save(session)

    return ok({
      sessionId: session.id,
      startedAt: session.startedAt.toISOString(),
      targetDurationSeconds: session.targetDuration.seconds,
      focusTaskId: session.focusTaskId,
      focusTaskName: session.snapshot.focusTaskName,
      tagId: session.tagId,
      tagName: session.snapshot.tagName,
      tagColor: session.snapshot.tagColor,
    })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    if (e instanceof DomainError) {
      return err(new UseCaseError('DOMAIN_RULE_VIOLATION', e.message))
    }
    console.error('[StartSession] Unexpected error:', e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
