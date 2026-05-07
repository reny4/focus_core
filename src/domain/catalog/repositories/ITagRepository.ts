import type { UUID } from '@/domain/shared/types/UUID'
import type { Tag } from '../entities/Tag'

export interface ITagRepository {
  findById(id: UUID): Promise<Tag | null>
  findActiveByUserId(userId: UUID): Promise<Tag[]>
  save(tag: Omit<Tag, 'createdAt' | 'updatedAt'>): Promise<Tag>
  update(tag: Tag): Promise<Tag>
}
