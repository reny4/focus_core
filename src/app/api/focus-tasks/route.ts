import { NextRequest } from 'next/server'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseFocusTaskRepository } from '@/infrastructure/repositories/SupabaseFocusTaskRepository'
import { SupabaseTagRepository } from '@/infrastructure/repositories/SupabaseTagRepository'
import { listFocusTasks } from '@/application/catalog/usecases/ListFocusTasks'
import { createFocusTask } from '@/application/catalog/usecases/CreateFocusTask'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import { CreateFocusTaskSchema } from '@/presentation/api/validation'
import type { UUID } from '@/domain/shared/types/UUID'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const result = await listFocusTasks(
    { userId: user.id as UUID },
    {
      focusTaskRepo: new SupabaseFocusTaskRepository(supabase),
      tagRepo: new SupabaseTagRepository(supabase),
    }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const body = await request.json().catch(() => null)
  const parsed = CreateFocusTaskSchema.safeParse(body)
  if (!parsed.success) return errorResponse('INVALID_REQUEST')

  const result = await createFocusTask(
    { userId: user.id as UUID, name: parsed.data.name, tagId: parsed.data.tagId as UUID },
    {
      focusTaskRepo: new SupabaseFocusTaskRepository(supabase),
      tagRepo: new SupabaseTagRepository(supabase),
    }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value, 201)
}
