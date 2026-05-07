import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/infrastructure/supabase/types'

/**
 * handle_new_user Trigger が失敗した場合のフォールバック。
 * ログイン直後に1回だけ呼び出すこと。
 */
export async function ensureProfile(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<void> {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .single()

  if (data) return

  await supabase.from('profiles').upsert({
    id: userId,
    timezone: 'Asia/Tokyo',
  })

  await supabase.from('tags').upsert([
    { user_id: userId, name: '勉強', color: '#6366F1' },
    { user_id: userId, name: '読書', color: '#10B981' },
    { user_id: userId, name: '開発', color: '#8B5CF6' },
  ])
}
