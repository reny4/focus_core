import type { UUID } from '@/domain/shared/types/UUID'
import type { FocusTask } from '../entities/FocusTask'

export interface IFocusTaskRepository {
  findById(id: UUID): Promise<FocusTask | null>
  findActiveByUserId(userId: UUID): Promise<FocusTask[]>
  findActiveByUserIdAndTagId(userId: UUID, tagId: UUID): Promise<FocusTask[]>
  save(task: Omit<FocusTask, 'createdAt' | 'updatedAt'>): Promise<FocusTask>
  update(task: FocusTask): Promise<FocusTask>
}
