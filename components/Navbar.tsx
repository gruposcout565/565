import Link from 'next/link'
import { GiFleurDeLys } from 'react-icons/gi'
import { createServerClient } from '@/lib/supabase/server'
import { getCurrentUserRole } from '@/lib/data'
import { signOut } from '@/app/login/actions'
import { MobileMenu } from './MobileMenu'

export async function Navbar() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const rol = await getCurrentUserRole(user.id)
  const isAdmin = rol === 'admin'

  return (
    <nav className="flex-shrink-0 bg-primary text-white shadow-md print:hidden z-10">
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MobileMenu isAdmin={isAdmin} />
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <GiFleurDeLys size={22} />
            <span className="font-bold text-base tracking-tight">Niño Jesús de Praga</span>
            <span className="text-white/50 text-xs font-normal hidden sm:inline">— Grupo 565</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-white/60 text-xs hidden sm:block truncate max-w-[180px]">
            {user.email}
          </span>
          <form action={signOut}>
            <button
              type="submit"
              className="text-white/75 hover:text-white transition-colors text-sm font-medium border border-white/20 rounded-md px-3 py-1 hover:border-white/40"
            >
              Salir
            </button>
          </form>
        </div>
      </div>
    </nav>
  )
}
