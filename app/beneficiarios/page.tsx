import Link from 'next/link'
import { getBeneficiarios } from '@/lib/data'
import { RAMAS, RAMA_COLORS, type Rama } from '@/lib/types'

export default async function BeneficiariosPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; rama?: string }>
}) {
  const { search, rama } = await searchParams
  const beneficiarios = await getBeneficiarios(search, rama)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Beneficiarios</h1>
          <p className="text-slate-500 mt-1">{beneficiarios.length} miembro(s) encontrado(s)</p>
        </div>
        <Link
          href="/beneficiarios/nuevo"
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
        >
          + Nuevo Beneficiario
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
        <form className="flex flex-col sm:flex-row gap-3">
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="flex-1 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <select
            name="rama"
            defaultValue={rama || 'all'}
            className="border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Todas las ramas</option>
            {RAMAS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            Buscar
          </button>
          {(search || (rama && rama !== 'all')) && (
            <Link
              href="/beneficiarios"
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm text-center"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {beneficiarios.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-16 text-center">
          <p className="text-slate-400 text-lg">No se encontraron beneficiarios</p>
          <Link
            href="/beneficiarios/nuevo"
            className="mt-4 inline-block text-primary font-medium hover:underline"
          >
            Agregar el primero →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Nombre
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                  DNI
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Rama
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                  Estado
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {beneficiarios.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-slate-800">
                      {b.apellido}, {b.nombre}
                    </div>
                    {b.email && <div className="text-xs text-slate-400 mt-0.5">{b.email}</div>}
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm hidden sm:table-cell">
                    {b.dni || '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RAMA_COLORS[b.rama as Rama]}`}
                    >
                      {b.rama}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        b.activo
                          ? 'bg-primary-light text-primary'
                          : 'bg-brand-red-light text-brand-red'
                      }`}
                    >
                      {b.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/beneficiarios/${b.id}`}
                      className="text-primary hover:underline text-sm font-medium"
                    >
                      Ver →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
