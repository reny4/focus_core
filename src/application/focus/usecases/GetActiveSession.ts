import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { DomainError } from '@/domain/shared/errors/DomainError'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { deriveTimerValues } from '@/lib/time/duration'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'

export type GetActiveSessionOutput =
  | {
      exists: true
      session: {
        sessionId: UUID
        focusTaskId: UUID
        focusTaskName: string
        tagId: UUID
        tagName: string
        tagColor: string
        targetDurationSeconds: number
        startedAt: string
        serverNow: string
        elapsedSeconds: number
        phase: 'counting_down' | 'counting_up'
        remainingSeconds: number
        overrunSeconds: number
        requiresReview: boolean
      }
    }
  | { exists: false; session: null }

export async function getActiveSession(
  input: { userId: UUID },
  deps: { focusSessionRepo: IFocusSessionRepository }
): Promise<Result<GetActiveSessionOutput, UseCaseError>> {
  try {
    const active = await deps.focusSessionRepo.findActiveByUserId(input.userId)

    if (!active) {
      return ok({ exists: false, session: null })
    }

    const serverNow = new Date()
    const elapsedSeconds = Math.floor(
      (serverNow.getTime() - active.startedAt.getTime()) / 1000
    )
    const derived = deriveTimerValues(elapsedSeconds, active.targetDuration.seconds)

    return ok({
      exists: true,
      session: {
        sessionId: active.id,
        focusTaskId: active.focusTaskId,
        focusTaskName: active.snapshot.focusTaskName,
        tagId: active.tagId,
        tagName: active.snapshot.tagName,
        tagColor: active.snapshot.tagColor,
        targetDurationSeconds: active.targetDuration.seconds,
        startedAt: active.startedAt.toISOString(),
        serverNow: serverNow.toISOString(),
        elapsedSeconds,
        phase: derived.phase as 'counting_down' | 'counting_up',
        remainingSeconds: derived.remainingSeconds,
        overrunSeconds: derived.overrunSeconds,
        requiresReview: derived.requiresReview,
      },
    })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    if (e instanceof DomainError) {
      return err(new UseCaseError('DOMAIN_RULE_VIOLATION', e.message))
    }
    console.error('[GetActiveSession] Unexpected error:', e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
