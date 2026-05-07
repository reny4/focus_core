import { type NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseAnalyticsQueryService } from '@/infrastructure/queries/SupabaseAnalyticsQueryService'
import { successResponse, errorResponse } from '@/presentation/api/routeHelper'
import type { UUID } from '@/domain/shared/types/UUID'

const Schema = z.object({
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const parsed = Schema.safeParse(Object.fromEntries(request.nextUrl.searchParams))
  if (!parsed.success) return errorResponse('INVALID_REQUEST')

  const svc = new SupabaseAnalyticsQueryService(supabase)
  const result = await svc.getSessionHistory(user.id as UUID, parsed.data.from, parsed.data.to)
  return successResponse(result)
}
