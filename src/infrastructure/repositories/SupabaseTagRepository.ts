import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/infrastructure/supabase/types'
import type { ITagRepository } from '@/domain/catalog/repositories/ITagRepository'
import { Tag } from '@/domain/catalog/entities/Tag'
import type { UUID } from '@/domain/shared/types/UUID'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'

type Row = Database['public']['Tables']['tags']['Row']

function rowToEntity(row: Row): Tag {
  return new Tag(
    row.id as UUID,
    row.user_id as UUID,
    row.name,
    row.color,
    row.archived_at ? new Date(row.archived_at) : null,
    new Date(row.created_at),
    new Date(row.updated_at)
  )
}

export class SupabaseTagRepository implements ITagRepository {
  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {}

  async findById(id: UUID): Promise<Tag | null> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    if (!data) return null
    return rowToEntity(data)
  }

  async findActiveByUserId(userId: UUID): Promise<Tag[]> {
    const { data, error } = await this.supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('created_at', { ascending: true })

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    return (data ?? []).map(rowToEntity)
  }

  async save(tag: Omit<Tag, 'createdAt' | 'updatedAt'>): Promise<Tag> {
    const { data, error } = await this.supabase
      .from('tags')
      .insert({
        id: tag.id,
        user_id: tag.userId,
        name: tag.name,
        color: tag.color,
        archived_at: tag.archivedAt?.toISOString() ?? null,
      })
      .select('*')
      .single()

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    return rowToEntity(data)
  }

  async update(tag: Tag): Promise<Tag> {
    const { data, error } = await this.supabase
      .from('tags')
      .update({
        name: tag.name,
        color: tag.color,
        archived_at: tag.archivedAt?.toISOString() ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', tag.id)
      .eq('user_id', tag.userId)
      .select('*')
      .single()

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    return rowToEntity(data)
  }
}
