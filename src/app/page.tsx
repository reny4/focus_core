import { redirect } from 'next/navigation'
import { createClient } from '@/infrastructure/supabase/server'
import { ensureProfile } from '@/lib/ensureProfile'
import { FocusHomeView } from './_components/FocusHomeView'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  await ensureProfile(supabase as any, user.id)

  const displayName =
    (user.user_metadata?.display_name as string | undefined) || user.email || ''

  return <FocusHomeView displayName={displayName} />
}
