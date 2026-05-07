import { NextRequest } from 'next/server'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseTagRepository } from '@/infrastructure/repositories/SupabaseTagRepository'
import { SupabaseFocusSessionRepository } from '@/infrastructure/repositories/SupabaseFocusSessionRepository'
import { updateTag } from '@/application/catalog/usecases/UpdateTag'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import { UpdateTagSchema } from '@/presentation/api/validation'
import type { UUID } from '@/domain/shared/types/UUID'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const { tagId } = await params
  const body = await request.json().catch(() => null)
  const parsed = UpdateTagSchema.safeParse(body)
  if (!parsed.success) return errorResponse('INVALID_REQUEST')

  const result = await updateTag(
    { userId: user.id as UUID, tagId: tagId as UUID, name: parsed.data.name, color: parsed.data.color },
    {
      tagRepo: new SupabaseTagRepository(supabase),
      focusSessionRepo: new SupabaseFocusSessionRepository(supabase),
    }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value)
}
