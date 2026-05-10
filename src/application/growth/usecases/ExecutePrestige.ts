import { UseCaseError } from '@/application/shared/errors/UseCaseError'
import { calcGrowthStats } from '@/application/analytics/queries/GetGrowthStats'
import { ok, err, type Result } from '@/domain/shared/types/Result'
import type { IProfileRepository } from '@/domain/profile/repositories/IProfileRepository'
import type { UUID } from '@/domain/shared/types/UUID'

export type ExecutePrestigeInput = {
  userId: UUID
}

export type ExecutePrestigeOutput = {
  newPrestigeCount: number
  newLevel: number
}

export async function executePrestige(
  input: ExecutePrestigeInput,
  deps: { profileRepo: IProfileRepository }
): Promise<Result<ExecutePrestigeOutput, UseCaseError>> {
  try {
    const profile = await deps.profileRepo.getProfile(input.userId)
    if (!profile) return err(new UseCaseError('PERSISTENCE_FAILED'))

    const growth = calcGrowthStats(profile.total_xp, profile.prestige_count)
    if (!growth.canPrestige) {
      return err(new UseCaseError('DOMAIN_RULE_VIOLATION', 'Lv.100に到達していないためPrestigeできません'))
    }

    await deps.profileRepo.prestige(input.userId)

    const newPrestigeCount = profile.prestige_count + 1
    const newGrowth = calcGrowthStats(profile.total_xp, newPrestigeCount)

    return ok({ newPrestigeCount, newLevel: newGrowth.level })
  } catch {
    return err(new UseCaseError('PERSISTENCE_FAILED'))
  }
}
