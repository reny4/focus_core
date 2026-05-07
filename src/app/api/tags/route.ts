import { NextRequest } from 'next/server'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseTagRepository } from '@/infrastructure/repositories/SupabaseTagRepository'
import { listTags } from '@/application/catalog/usecases/ListTags'
import { createTag } from '@/application/catalog/usecases/CreateTag'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import { CreateTagSchema } from '@/presentation/api/validation'
import type { UUID } from '@/domain/shared/types/UUID'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const result = await listTags(
    { userId: user.id as UUID },
    { tagRepo: new SupabaseTagRepository(supabase) }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const body = await request.json().catch(() => null)
  const parsed = CreateTagSchema.safeParse(body)
  if (!parsed.success) return errorResponse('INVALID_REQUEST')

  const result = await createTag(
    { userId: user.id as UUID, name: parsed.data.name, color: parsed.data.color },
    { tagRepo: new SupabaseTagRepository(supabase) }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value, 201)
}
