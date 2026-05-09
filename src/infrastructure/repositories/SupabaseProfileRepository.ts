import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/infrastructure/supabase/types'
import type { IProfileRepository } from '@/domain/profile/repositories/IProfileRepository'
import type { UUID } from '@/domain/shared/types/UUID'

export class SupabaseProfileRepository implements IProfileRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async addXp(userId: UUID, amount: number): Promise<void> {
    const { data: profile, error: fetchError } = await this.supabase
      .from('profiles')
      .select('total_xp')
      .eq('id', userId)
      .single()

    if (fetchError || !profile) return

    const newTotal = profile.total_xp + amount
    await this.supabase
      .from('profiles')
      .update({ total_xp: newTotal })
      .eq('id', userId)
  }
}
