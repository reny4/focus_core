import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseFocusSessionRepository } from '@/infrastructure/repositories/SupabaseFocusSessionRepository'
import { discardSession } from '@/application/focus/usecases/DiscardSession'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import type { UUID } from '@/domain/shared/types/UUID'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const result = await discardSession(
    { userId: user.id as UUID },
    { focusSessionRepo: new SupabaseFocusSessionRepository(supabase) }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value)
}
