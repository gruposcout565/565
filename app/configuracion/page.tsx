import { redirect } from 'next/navigation'
import { MdSettings, MdHistory } from 'react-icons/md'
import { createServerClient } from '@/lib/supabase/server'
import { getCuotaActual, getHistorialCuota, getCurrentUserRole } from '@/lib/data'
import { updateCuota } from '@/lib/actions'

export default async function ConfiguracionPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const rol = await getCurrentUserRole(user.id)
  if (rol !== 'admin') redirect('/')

  const [cuotaActual, historial] = await Promise.all([
    getCuotaActual(),
    getHistorialCuota(),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <MdSettings size={28} /> Configuración
        </h1>
        <p className="text-slate-500 mt-1">Administración del sistema</p>
      </div>

      {/* Cuota actual */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Monto de Cuota Mensual</h2>
        <div className="flex flex-wrap gap-6 mb-5 text-sm text-slate-500">
          <div>
            Cuota mensual:{' '}
            <span className="text-xl font-bold text-slate-800">
              ${cuotaActual ? Number(cuotaActual.monto).toLocaleString('es-AR') : '—'}
            </span>
          </div>
          <div>
            Cuota trimestral por mes:{' '}
            <span className="text-xl font-bold text-slate-800">
              ${cuotaActual?.monto_trimestral_mes != null
                ? Number(cuotaActual.monto_trimestral_mes).toLocaleString('es-AR')
                : '—'}
            </span>
            {cuotaActual?.monto_trimestral_mes != null && (
              <span className="text-slate-400 text-xs ml-1">
                (total 3 meses: ${(Number(cuotaActual.monto_trimestral_mes) * 3).toLocaleString('es-AR')})
              </span>
            )}
          </div>
        </div>
        {cuotaActual?.descripcion && (
          <p className="text-xs text-slate-400 mb-4">Último cambio: {cuotaActual.descripcion}</p>
        )}

        <form action={updateCuota} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cuota mensual ($) <span className="text-red-500">*</span>
              </label>
              <input
                name="monto"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="Ej: 18"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trimestral por mes ($)
              </label>
              <input
                name="monto_trimestral_mes"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 15"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Descripción / Motivo
              </label>
              <input
                name="descripcion"
                type="text"
                placeholder="Ej: Actualización marzo 2026"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
          >
            Actualizar Cuota
          </button>
        </form>
      </div>

      {/* Historial */}
      {historial.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <MdHistory size={20} /> Historial de Cambios
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left">
                  <th className="pb-2 font-medium text-slate-500">Fecha</th>
                  <th className="pb-2 font-medium text-slate-500">Mensual</th>
                  <th className="pb-2 font-medium text-slate-500">Trimestral/mes</th>
                  <th className="pb-2 font-medium text-slate-500">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historial.map((c, i) => (
                  <tr key={c.id} className={i === 0 ? 'font-semibold text-slate-800' : 'text-slate-600'}>
                    <td className="py-2.5">
                      {new Date(c.created_at).toLocaleDateString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5">
                      ${Number(c.monto).toLocaleString('es-AR')}
                      {i === 0 && <span className="ml-2 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">vigente</span>}
                    </td>
                    <td className="py-2.5">
                      {c.monto_trimestral_mes != null ? `$${Number(c.monto_trimestral_mes).toLocaleString('es-AR')}` : '—'}
                    </td>
                    <td className="py-2.5 text-slate-500">{c.descripcion || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
