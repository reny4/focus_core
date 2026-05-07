import { NextRequest } from 'next/server'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseTagRepository } from '@/infrastructure/repositories/SupabaseTagRepository'
import { SupabaseFocusTaskRepository } from '@/infrastructure/repositories/SupabaseFocusTaskRepository'
import { SupabaseFocusSessionRepository } from '@/infrastructure/repositories/SupabaseFocusSessionRepository'
import { archiveTag } from '@/application/catalog/usecases/ArchiveTag'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import type { UUID } from '@/domain/shared/types/UUID'

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ tagId: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const { tagId } = await params

  const result = await archiveTag(
    { userId: user.id as UUID, tagId: tagId as UUID },
    {
      tagRepo: new SupabaseTagRepository(supabase),
      focusTaskRepo: new SupabaseFocusTaskRepository(supabase),
      focusSessionRepo: new SupabaseFocusSessionRepository(supabase),
    }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value)
}
