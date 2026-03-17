'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createEducador } from '@/lib/actions'
import { RAMAS, ROLES_USUARIO } from '@/lib/types'

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800'

export function EducadorForm() {
  const [rol, setRol] = useState<string>('educador')
  const necesitaCredenciales = rol === 'educador' || rol === 'admin'

  return (
    <form action={createEducador} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Nombre completo <span className="text-brand-red">*</span>
        </label>
        <input name="nombre" required className={inputCls} placeholder="Ej: María García" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Rol <span className="text-brand-red">*</span>
          </label>
          <select
            name="rol"
            required
            value={rol}
            onChange={(e) => setRol(e.target.value)}
            className={`${inputCls} bg-white`}
          >
            {ROLES_USUARIO.map((r) => (
              <option key={r} value={r}>
                {r === 'admin' ? 'Administrador' : r === 'educador' ? 'Educador' : 'Solo lectura'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Rama (opcional)</label>
          <select name="rama" className={`${inputCls} bg-white`}>
            <option value="">Todas las ramas</option>
            {RAMAS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {necesitaCredenciales && (
        <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
            Credenciales de acceso
          </p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Correo electrónico <span className="text-brand-red">*</span>
            </label>
            <input
              name="email"
              type="email"
              required={necesitaCredenciales}
              className={inputCls}
              placeholder="educador@scouts565.org"
              autoComplete="off"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Contraseña <span className="text-brand-red">*</span>
            </label>
            <input
              name="password"
              type="password"
              required={necesitaCredenciales}
              minLength={8}
              className={inputCls}
              placeholder="Mínimo 8 caracteres"
              autoComplete="new-password"
            />
          </div>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Crear Educador
        </button>
        <Link
          href="/educadores"
          className="flex-1 text-center border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}
