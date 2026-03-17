import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserRole } from '@/lib/data'
import { Sidebar } from './Sidebar'

export async function AppShell({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <div className="flex-1 flex">{children}</div>
  }

  const rol = await getCurrentUserRole(user.id)
  const isAdmin = rol === 'admin'

  return (
    <div className="flex flex-1 overflow-hidden">
      <Sidebar isAdmin={isAdmin} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 py-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
