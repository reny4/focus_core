import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseProfileRepository } from '@/infrastructure/repositories/SupabaseProfileRepository'
import { updateProfile } from '@/application/catalog/usecases/UpdateProfile'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import { z } from 'zod'
import type { UUID } from '@/domain/shared/types/UUID'

const schema = z.object({
  displayName: z.string().min(1).max(50),
})

export async function PATCH(req: Request) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const body = await req.json().catch(() => null)
  const parsed = schema.safeParse(body)
  if (!parsed.success) return errorResponse('INVALID_REQUEST')

  const result = await updateProfile(
    { userId: user.id as UUID, displayName: parsed.data.displayName },
    { profileRepo: new SupabaseProfileRepository(supabase) }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(null)
}
