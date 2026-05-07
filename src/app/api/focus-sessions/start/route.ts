import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseFocusSessionRepository } from '@/infrastructure/repositories/SupabaseFocusSessionRepository'
import { SupabaseFocusTaskRepository } from '@/infrastructure/repositories/SupabaseFocusTaskRepository'
import { SupabaseTagRepository } from '@/infrastructure/repositories/SupabaseTagRepository'
import { startSession } from '@/application/focus/usecases/StartSession'
import { successResponse, errorResponse, useCaseErrorResponse } from '@/presentation/api/routeHelper'
import type { UUID } from '@/domain/shared/types/UUID'

const StartSessionRequestSchema = z.object({
  focusTaskId: z.string().uuid(),
  targetDurationSeconds: z.number().int().min(60).max(43200),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const body = await request.json().catch(() => null)
  const parsed = StartSessionRequestSchema.safeParse(body)
  if (!parsed.success) return errorResponse('INVALID_REQUEST')

  const result = await startSession(
    {
      userId: user.id as UUID,
      focusTaskId: parsed.data.focusTaskId as UUID,
      targetDurationSeconds: parsed.data.targetDurationSeconds,
    },
    {
      focusSessionRepo: new SupabaseFocusSessionRepository(supabase),
      focusTaskRepo: new SupabaseFocusTaskRepository(supabase),
      tagRepo: new SupabaseTagRepository(supabase),
    }
  )

  if (!result.ok) return useCaseErrorResponse(result.error)
  return successResponse(result.value, 201)
}
