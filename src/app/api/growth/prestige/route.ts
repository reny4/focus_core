import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseProfileRepository } from '@/infrastructure/repositories/SupabaseProfileRepository'
import { executePrestige } from '@/application/growth/usecases/ExecutePrestige'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import type { UUID } from '@/domain/shared/types/UUID'

export async function POST() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const result = await executePrestige(
    { userId: user.id as UUID },
    { profileRepo: new SupabaseProfileRepository(supabase) }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value)
}
