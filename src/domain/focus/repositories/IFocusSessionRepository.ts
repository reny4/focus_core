import type { UUID } from '@/domain/shared/types/UUID'
import type {
  FocusSession,
  ActiveFocusSession,
  FinishedFocusSession,
  DiscardedFocusSession,
} from '../entities/FocusSession'

export interface IFocusSessionRepository {
  save(session: FocusSession): Promise<void>
  findActiveByUserId(userId: UUID): Promise<ActiveFocusSession | null>
  update(session: FinishedFocusSession | DiscardedFocusSession): Promise<void>
}
