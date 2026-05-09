import type { UUID } from '@/domain/shared/types/UUID'

export interface IProfileRepository {
  addXp(userId: UUID, amount: number): Promise<void>
}
