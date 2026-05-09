import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { DomainError } from '@/domain/shared/errors/DomainError'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import type { IProfileRepository } from '@/domain/profile/repositories/IProfileRepository'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { UUID } from '@/domain/shared/types/UUID'

export type FinishSessionInput = {
  userId: UUID
}

export type FinishSessionOutput = {
  sessionId: UUID
  startedAt: string
  endedAt: string
  actualDurationSeconds: number
  targetDurationSeconds: number
  isOverTarget: boolean
  overrunSeconds: number
}

export async function finishSession(
  input: FinishSessionInput,
  deps: { focusSessionRepo: IFocusSessionRepository; profileRepo: IProfileRepository }
): Promise<Result<FinishSessionOutput, UseCaseError>> {
  try {
    const active = await deps.focusSessionRepo.findActiveByUserId(input.userId)
    if (!active) return err(new UseCaseError('ACTIVE_SESSION_NOT_FOUND'))

    const endedAt = new Date()
    const finished = active.finish(endedAt)

    await deps.focusSessionRepo.update(finished)

    // XP加算（ベストエフォート: 失敗してもセッション finish は巻き戻さない）
    try {
      await deps.profileRepo.addXp(input.userId, finished.actualDuration.seconds)
    } catch {
      console.error('[FinishSession] XP加算に失敗しました（セッションは保存済み）')
    }

    const overrunSeconds = Math.max(
      finished.actualDuration.seconds - finished.targetDuration.seconds,
      0
    )

    return ok({
      sessionId: finished.id,
      startedAt: finished.startedAt.toISOString(),
      endedAt: finished.endedAt.toISOString(),
      actualDurationSeconds: finished.actualDuration.seconds,
      targetDurationSeconds: finished.targetDuration.seconds,
      isOverTarget: finished.actualDuration.seconds > finished.targetDuration.seconds,
      overrunSeconds,
    })
  } catch (e) {
    if (e instanceof UseCaseError) return err(e)
    if (e instanceof DomainError) {
      return err(new UseCaseError('DOMAIN_RULE_VIOLATION', e.message))
    }
    console.error('[FinishSession] Unexpected error:', e)
    return err(new UseCaseError('UNKNOWN_ERROR'))
  }
}
