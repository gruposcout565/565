'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MdDashboard, MdPeople, MdPersonAdd, MdPayment, MdSchool, MdSettings } from 'react-icons/md'
import { GiCampingTent } from 'react-icons/gi'

const QUICK_ACTIONS = [
  { href: '/protagonistas/nuevo', label: 'Nuevo Protagonista', icon: MdPersonAdd },
  { href: '/pagos/nuevo',         label: 'Registrar Pago',     icon: MdPayment },
  { href: '/campamentos/nuevo',   label: 'Nuevo Campamento',   icon: GiCampingTent },
]

const NAV_ITEMS = [
  { href: '/',              label: 'Dashboard',       icon: MdDashboard,   exact: true },
  { href: '/protagonistas', label: 'Protagonistas',   icon: MdPeople },
  { href: '/campamentos',   label: 'Campamentos',     icon: GiCampingTent },
  { href: '/educadores',    label: 'Educadores',      icon: MdSchool },
]

export function Sidebar({ isAdmin }: { isAdmin?: boolean }) {
  const pathname = usePathname()

  return (
    <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-white border-r border-slate-100 overflow-y-auto">
      <nav className="flex-1 px-3 py-5 space-y-0.5">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
          Menú
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-light text-primary'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          )
        })}
        {isAdmin && (
          <Link
            href="/configuracion"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              pathname === '/configuracion' || pathname.startsWith('/configuracion/')
                ? 'bg-primary-light text-primary'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <MdSettings size={18} />
            Configuración
          </Link>
        )}
        <div className="pt-4 mt-2 border-t border-slate-100">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
            Acciones Rápidas
          </p>
          {QUICK_ACTIONS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </aside>
  )
}
