import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/infrastructure/supabase/types'
import type { IFocusTaskRepository } from '@/domain/catalog/repositories/IFocusTaskRepository'
import { FocusTask } from '@/domain/catalog/entities/FocusTask'
import type { UUID } from '@/domain/shared/types/UUID'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'

type Row = Database['public']['Tables']['focus_tasks']['Row']

function rowToEntity(row: Row): FocusTask {
  return new FocusTask(
    row.id as UUID,
    row.user_id as UUID,
    row.tag_id as UUID,
    row.name,
    row.archived_at ? new Date(row.archived_at) : null,
    new Date(row.created_at),
    new Date(row.updated_at)
  )
}

export class SupabaseFocusTaskRepository implements IFocusTaskRepository {
  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {}

  async findById(id: UUID): Promise<FocusTask | null> {
    const { data, error } = await this.supabase
      .from('focus_tasks')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    if (!data) return null
    return rowToEntity(data)
  }

  async findActiveByUserId(userId: UUID): Promise<FocusTask[]> {
    const { data, error } = await this.supabase
      .from('focus_tasks')
      .select('*')
      .eq('user_id', userId)
      .is('archived_at', null)
      .order('created_at', { ascending: true })

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    return (data ?? []).map(rowToEntity)
  }

  async findActiveByUserIdAndTagId(userId: UUID, tagId: UUID): Promise<FocusTask[]> {
    const { data, error } = await this.supabase
      .from('focus_tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('tag_id', tagId)
      .is('archived_at', null)
      .order('created_at', { ascending: true })

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    return (data ?? []).map(rowToEntity)
  }

  async save(task: Omit<FocusTask, 'createdAt' | 'updatedAt'>): Promise<FocusTask> {
    const { data, error } = await this.supabase
      .from('focus_tasks')
      .insert({
        id: task.id,
        user_id: task.userId,
        tag_id: task.tagId,
        name: task.name,
        archived_at: task.archivedAt?.toISOString() ?? null,
      })
      .select('*')
      .single()

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    return rowToEntity(data)
  }

  async update(task: FocusTask): Promise<FocusTask> {
    const { data, error } = await this.supabase
      .from('focus_tasks')
      .update({
        name: task.name,
        tag_id: task.tagId,
        archived_at: task.archivedAt?.toISOString() ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', task.id)
      .eq('user_id', task.userId)
      .select('*')
      .single()

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    return rowToEntity(data)
  }
}
