import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/infrastructure/supabase/types'
import type { IFocusSessionRepository } from '@/domain/focus/repositories/IFocusSessionRepository'
import {
  FocusSession,
  type ActiveFocusSession,
  type FinishedFocusSession,
  type DiscardedFocusSession,
} from '@/domain/focus/entities/FocusSession'
import { TargetDuration } from '@/domain/focus/value-objects/TargetDuration'
import { ActualDuration } from '@/domain/focus/value-objects/ActualDuration'
import { SessionSnapshot } from '@/domain/focus/value-objects/SessionSnapshot'
import type { UUID } from '@/domain/shared/types/UUID'
import { UseCaseError } from '@/application/shared/errors/UseCaseError'

type Row = Database['public']['Tables']['focus_sessions']['Row']

function rowToEntity(row: Row): FocusSession {
  const snapshot = SessionSnapshot.create(
    row.focus_task_name_snapshot,
    row.tag_name_snapshot,
    row.tag_color_snapshot
  )
  const targetDuration = TargetDuration.create(row.target_duration_seconds)
  const actualDuration =
    row.actual_duration_seconds !== null
      ? ActualDuration.fromElapsed(row.actual_duration_seconds)
      : null

  return FocusSession.reconstruct({
    id: row.id as UUID,
    userId: row.user_id as UUID,
    focusTaskId: row.focus_task_id as UUID,
    tagId: row.tag_id as UUID,
    snapshot,
    targetDuration,
    startedAt: new Date(row.started_at),
    status: row.status as 'active' | 'finished' | 'discarded',
    endedAt: row.ended_at ? new Date(row.ended_at) : null,
    actualDuration,
  })
}

export class SupabaseFocusSessionRepository
  implements IFocusSessionRepository
{
  constructor(
    private readonly supabase: SupabaseClient<Database>
  ) {}

  async save(session: FocusSession): Promise<void> {
    const { error } = await this.supabase
      .from('focus_sessions')
      .insert({
        id: session.id,
        user_id: session.userId,
        focus_task_id: session.focusTaskId,
        focus_task_name_snapshot: session.snapshot.focusTaskName,
        tag_id: session.tagId,
        tag_name_snapshot: session.snapshot.tagName,
        tag_color_snapshot: session.snapshot.tagColor,
        target_duration_seconds: session.targetDuration.seconds,
        started_at: session.startedAt.toISOString(),
        status: session.status,
        ended_at: null,
        actual_duration_seconds: null,
      })

    if (error) {
      if (error.code === '23505') {
        throw new UseCaseError('ACTIVE_SESSION_ALREADY_EXISTS')
      }
      throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    }
  }

  async findActiveByUserId(userId: UUID): Promise<ActiveFocusSession | null> {
    const { data, error } = await this.supabase
      .from('focus_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .maybeSingle()

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
    if (!data) return null

    return rowToEntity(data) as ActiveFocusSession
  }

  async update(
    session: FinishedFocusSession | DiscardedFocusSession
  ): Promise<void> {
    const { error } = await this.supabase
      .from('focus_sessions')
      .update({
        status: session.status,
        ended_at: session.endedAt.toISOString(),
        actual_duration_seconds: session.actualDuration?.seconds ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.id)
      .eq('user_id', session.userId)

    if (error) throw new UseCaseError('PERSISTENCE_FAILED', error.message)
  }
}
