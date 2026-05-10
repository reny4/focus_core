import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/infrastructure/supabase/types'
import type { IProfileRepository, ProfileSnapshot } from '@/domain/profile/repositories/IProfileRepository'
import type { UUID } from '@/domain/shared/types/UUID'

export class SupabaseProfileRepository implements IProfileRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async getProfile(userId: UUID): Promise<ProfileSnapshot | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('total_xp, prestige_count')
      .eq('id', userId)
      .single()

    if (error || !data) return null
    return { total_xp: data.total_xp, prestige_count: data.prestige_count }
  }

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

  async prestige(userId: UUID): Promise<void> {
    const profile = await this.getProfile(userId)
    if (!profile) throw new Error('Profile not found')

    await this.supabase
      .from('profiles')
      .update({ prestige_count: profile.prestige_count + 1 })
      .eq('id', userId)
  }

  async updateDisplayName(userId: UUID, displayName: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .update({ display_name: displayName })
      .eq('id', userId)

    if (error) throw new Error(error.message)
  }
}
