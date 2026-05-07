import { NextRequest } from 'next/server'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseFocusTaskRepository } from '@/infrastructure/repositories/SupabaseFocusTaskRepository'
import { SupabaseFocusSessionRepository } from '@/infrastructure/repositories/SupabaseFocusSessionRepository'
import { archiveFocusTask } from '@/application/catalog/usecases/ArchiveFocusTask'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import type { UUID } from '@/domain/shared/types/UUID'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ focusTaskId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const { focusTaskId } = await params

  const result = await archiveFocusTask(
    { userId: user.id as UUID, focusTaskId: focusTaskId as UUID },
    {
      focusTaskRepo: new SupabaseFocusTaskRepository(supabase),
      focusSessionRepo: new SupabaseFocusSessionRepository(supabase),
    }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value)
}
