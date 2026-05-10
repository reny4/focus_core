import type { UUID } from '@/domain/shared/types/UUID'

export type ProfileSnapshot = {
  total_xp: number
  prestige_count: number
}

export interface IProfileRepository {
  getProfile(userId: UUID): Promise<ProfileSnapshot | null>
  addXp(userId: UUID, amount: number): Promise<void>
  prestige(userId: UUID): Promise<void>
  updateDisplayName(userId: UUID, displayName: string): Promise<void>
}
