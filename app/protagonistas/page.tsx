import Link from 'next/link'
import { MdAdd, MdChevronRight } from 'react-icons/md'
import { getBeneficiariosConEstado } from '@/lib/data'
import { RAMAS, RAMA_COLORS, ESTADO_PAGO_STYLES, type Rama, type EstadoPago } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default async function ProtagonistasPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; rama?: string; activo?: string; estado?: string }>
}) {
  const { search, rama, activo, estado } = await searchParams
  const anio = new Date().getFullYear()
  const protagonistas = await getBeneficiariosConEstado(anio, search, rama, activo, estado)

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Protagonistas</h1>
          <p className="text-slate-500 mt-1">{protagonistas.length} protagonista(s) encontrado(s)</p>
        </div>
        <Link
          href="/protagonistas/nuevo"
          className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
        >
          <MdAdd size={18} /> Nuevo Protagonista
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6">
        <form className="flex flex-wrap gap-3">
          <input
            name="search"
            defaultValue={search}
            placeholder="Buscar por nombre, apellido o DNI..."
            className="flex-1 min-w-48 border border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800"
          />
          <select
            name="rama"
            defaultValue={rama || 'all'}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 bg-white"
          >
            <option value="all">Todas las ramas</option>
            {RAMAS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select
            name="activo"
            defaultValue={activo || 'all'}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 bg-white"
          >
            <option value="all">Activos e inactivos</option>
            <option value="true">Solo activos</option>
            <option value="false">Solo inactivos</option>
          </select>
          <select
            name="estado"
            defaultValue={estado || 'all'}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary text-slate-800 bg-white"
          >
            <option value="all">Todos los estados</option>
            <option value="al_dia">Al día</option>
            <option value="adeuda">Adeuda</option>
            <option value="adelantado">Adelantado</option>
          </select>
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            Buscar
          </button>
          {(search || (rama && rama !== 'all') || (activo && activo !== 'all') || (estado && estado !== 'all')) && (
            <Link
              href="/protagonistas"
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-sm"
            >
              Limpiar
            </Link>
          )}
        </form>
      </div>

      {protagonistas.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-16 text-center">
          <p className="text-slate-400 text-lg">No se encontraron protagonistas</p>
          <Link href="/protagonistas/nuevo" className="inline-flex items-center gap-0.5 mt-4 text-primary font-medium hover:underline">
            Agregar el primero <MdChevronRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Protagonista</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">DNI</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Rama</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Cuotas</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {protagonistas.map((p) => {
                const estadoInfo = ESTADO_PAGO_STYLES[p.estado as EstadoPago]
                return (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{p.apellido}, {p.nombre}</div>
                      {p.mail_contacto && <div className="text-xs text-slate-400 mt-0.5">{p.mail_contacto}</div>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm hidden sm:table-cell">{p.dni || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RAMA_COLORS[p.rama as Rama]}`}>
                        {p.rama}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.activo ? 'bg-primary-light text-primary' : 'bg-slate-100 text-slate-500'}`}>
                        {p.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      {p.activo && estadoInfo && (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.className}`}>
                          {estadoInfo.label}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/protagonistas/${p.id}`} className="inline-flex items-center gap-0.5 text-primary hover:underline text-sm font-medium">
                        Ver <MdChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
