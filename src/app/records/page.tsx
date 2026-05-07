import { redirect } from 'next/navigation'
import { createClient } from '@/infrastructure/supabase/server'
import { ensureProfile } from '@/lib/ensureProfile'
import { RecordsView } from './_components/RecordsView'

export const metadata = { title: '記録 | Focus Core' }

export default async function RecordsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await ensureProfile(supabase as any, user.id)

  const displayName =
    (user.user_metadata?.display_name as string | undefined) || user.email || ''

  return <RecordsView displayName={displayName} />
}
