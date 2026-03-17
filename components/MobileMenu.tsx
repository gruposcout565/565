'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MdMenu, MdClose, MdDashboard, MdPeople, MdPersonAdd, MdPayment, MdSchool, MdSettings } from 'react-icons/md'
import { GiFleurDeLys, GiCampingTent } from 'react-icons/gi'

const NAV_ITEMS = [
  { href: '/',              label: 'Dashboard',       icon: MdDashboard,   exact: true },
  { href: '/protagonistas', label: 'Protagonistas',   icon: MdPeople },
  { href: '/campamentos',   label: 'Campamentos',     icon: GiCampingTent },
  { href: '/educadores',    label: 'Educadores',      icon: MdSchool },
]

const QUICK_ACTIONS = [
  { href: '/protagonistas/nuevo', label: 'Nuevo Protagonista', icon: MdPersonAdd },
  { href: '/pagos/nuevo',         label: 'Registrar Pago',     icon: MdPayment },
  { href: '/campamentos/nuevo',   label: 'Nuevo Campamento',   icon: GiCampingTent },
]

export function MobileMenu({ isAdmin }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  // Cerrar al navegar
  useEffect(() => { setOpen(false) }, [pathname])

  // Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden p-1.5 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        aria-label="Abrir menú"
      >
        <MdMenu size={22} />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Panel */}
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col shadow-xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-primary text-white flex-shrink-0">
              <div className="flex items-center gap-2">
                <GiFleurDeLys size={20} />
                <span className="font-bold text-sm">Niño Jesús de Praga</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cerrar menú"
              >
                <MdClose size={20} />
              </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">
                Menú
              </p>
              {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact
                  ? pathname === href
                  : pathname === href || pathname.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary-light text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}
                  >
                    <Icon size={19} />
                    {label}
                  </Link>
                )
              })}
              {isAdmin && (
                <Link
                  href="/configuracion"
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${
                    pathname === '/configuracion' || pathname.startsWith('/configuracion/')
                      ? 'bg-primary-light text-primary'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  <MdSettings size={19} />
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
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                  >
                    <Icon size={19} />
                    {label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
