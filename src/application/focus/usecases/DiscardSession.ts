import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { DomainError } from '@/domain/shared/errors/DomainError'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'

export type DiscardSessionInput = {
  userId: UUID
}

export type DiscardSessionOutput = {
  sessionId: UUID
  discardedAt: string
}

export async function discardSession(
  input: DiscardSessionInput,
  deps: { focusSessionRepo: IFocusSessionRepository }
): Promise<Result<DiscardSessionOutput, UseCaseError>> {
  try {
    const active = await deps.focusSessionRepo.findActiveByUserId(input.userId)
    if (!active) return err(new UseCaseError('ACTIVE_SESSION_NOT_FOUND'))

    const endedAt = new Date()
    const discarded = active.discard(endedAt)

    await deps.focusSessionRepo.update(discarded)

    return ok({
      sessionId: discarded.id,
      discardedAt: discarded.endedAt.toISOString(),
    })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    if (e instanceof DomainError) {
      return err(new UseCaseError('DOMAIN_RULE_VIOLATION', e.message))
    }
    console.error('[DiscardSession] Unexpected error:', e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
