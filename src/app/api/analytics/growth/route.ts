import { createClient } from '@/infrastructure/supabase/server'
import { SupabaseAnalyticsQueryService } from '@/infrastructure/queries/SupabaseAnalyticsQueryService'
import { successResponse, errorResponse } from '@/presentation/api/routeHelper'
import type { UUID } from '@/domain/shared/types/UUID'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return errorResponse('UNAUTHENTICATED')

  const svc = new SupabaseAnalyticsQueryService(supabase)
  const result = await svc.getGrowthStats(user.id as UUID)
  return successResponse(result)
}
