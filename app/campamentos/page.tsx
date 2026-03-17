import Link from 'next/link'
import { MdAdd, MdChevronRight, MdTimer } from 'react-icons/md'
import { getCampamentos } from '@/lib/data'

export const dynamic = 'force-dynamic'

export default async function CampamentosPage() {
  const campamentos = await getCampamentos()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Campamentos</h1>
          <p className="text-slate-500 mt-1">{campamentos.length} campamento(s)</p>
        </div>
        <Link
          href="/campamentos/nuevo"
          className="inline-flex items-center gap-1.5 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm"
        >
          <MdAdd size={18} /> Nuevo Campamento
        </Link>
      </div>

      {campamentos.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-16 text-center">
          <p className="text-slate-400 text-lg">Sin campamentos planificados</p>
          <Link href="/campamentos/nuevo" className="inline-flex items-center gap-0.5 mt-4 text-primary font-medium hover:underline">
            Planificar el primero <MdChevronRight size={18} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {campamentos.map((c) => {
            const inicio = new Date(c.fecha_inicio + 'T00:00:00')
            const fin = new Date(c.fecha_fin + 'T00:00:00')
            const diasRestantes = Math.ceil((inicio.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return (
              <div key={c.id} className={`bg-white rounded-xl shadow-sm border p-6 ${c.activo ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-800">{c.nombre}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.activo ? 'bg-primary-light text-primary' : 'bg-slate-100 text-slate-500'}`}>
                    {c.activo ? 'Activo' : 'Archivado'}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-1">
                  {inicio.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })} —{' '}
                  {fin.toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-400 mb-3">Rama: {c.rama}</p>
                {c.precio_estimado && (
                  <p className="text-sm font-medium text-primary mb-2">
                    ${Number(c.precio_estimado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </p>
                )}
                {c.activo && diasRestantes > 0 && (
                  <p className="inline-flex items-center gap-1 text-xs text-amber-600 font-medium mb-3">
                    <MdTimer size={14} /> {diasRestantes} días
                  </p>
                )}
                <Link href={`/campamentos/${c.id}`} className="inline-flex items-center gap-0.5 text-sm text-primary hover:underline font-medium">
                  Ver detalle <MdChevronRight size={16} />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
