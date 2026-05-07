import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseFocusSessionRepository } from '@/infrastructure/repositories/SupabaseFocusSessionRepository'
import { getActiveSession } from '@/application/focus/usecases/GetActiveSession'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import type { UUID } from '@/domain/shared/types/UUID'

export async function GET() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const result = await getActiveSession(
    { userId: user.id as UUID },
    { focusSessionRepo: new SupabaseFocusSessionRepository(supabase) }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value)
}
