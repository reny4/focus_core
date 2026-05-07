import { NextRequest } from 'next/server'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseFocusTaskRepository } from '@/infrastructure/repositories/SupabaseFocusTaskRepository'
import { SupabaseTagRepository } from '@/infrastructure/repositories/SupabaseTagRepository'
import { SupabaseFocusSessionRepository } from '@/infrastructure/repositories/SupabaseFocusSessionRepository'
import { updateFocusTask } from '@/application/catalog/usecases/UpdateFocusTask'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import { UpdateFocusTaskSchema } from '@/presentation/api/validation'
import type { UUID } from '@/domain/shared/types/UUID'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ focusTaskId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const { focusTaskId } = await params
  const body = await request.json().catch(() => null)
  const parsed = UpdateFocusTaskSchema.safeParse(body)
  if (!parsed.success) return errorResponse('INVALID_REQUEST')

  const result = await updateFocusTask(
    {
      userId: user.id as UUID,
      focusTaskId: focusTaskId as UUID,
      name: parsed.data.name,
      tagId: parsed.data.tagId as UUID,
    },
    {
      focusTaskRepo: new SupabaseFocusTaskRepository(supabase),
      tagRepo: new SupabaseTagRepository(supabase),
      focusSessionRepo: new SupabaseFocusSessionRepository(supabase),
    }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value)
}
