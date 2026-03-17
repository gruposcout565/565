import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'
import { getCampamento } from '@/lib/data'

export default async function CampamentoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const campamento = await getCampamento(id)

  const inicio = new Date(campamento.fecha_inicio + 'T00:00:00')
  const fin = new Date(campamento.fecha_fin + 'T00:00:00')
  const duracionDias = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24)) + 1
  const diasRestantes = Math.ceil((inicio.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-8">
        <div className="flex-1">
          <Link href="/campamentos" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
            <MdArrowBack size={16} /> Volver a Campamentos
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 mt-1">{campamento.nombre}</h1>
          <div className="flex items-center gap-2 mt-2">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${campamento.activo ? 'bg-primary-light text-primary' : 'bg-slate-100 text-slate-500'}`}>
              {campamento.activo ? 'Activo' : 'Archivado'}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              Rama: {campamento.rama}
            </span>
          </div>
        </div>
        <Link
          href={`/campamentos/${id}/editar`}
          className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
        >
          Editar
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <InfoCard label="Fecha de inicio" value={inicio.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} />
        <InfoCard label="Fecha de fin" value={fin.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} />
        <InfoCard label="Duración" value={`${duracionDias} día${duracionDias !== 1 ? 's' : ''}`} />
        {campamento.precio_estimado && (
          <InfoCard label="Precio estimado" value={`$${Number(campamento.precio_estimado).toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} />
        )}
        {diasRestantes > 0 && (
          <InfoCard label="Días restantes" value={`${diasRestantes} días`} highlight />
        )}
      </div>

      {campamento.descripcion && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">Descripción</h2>
          <p className="text-slate-700 text-sm leading-relaxed">{campamento.descripcion}</p>
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${highlight ? 'bg-primary-light border-blue-100' : 'bg-white border-slate-100 shadow-sm'}`}>
      <p className="text-xs text-slate-400 uppercase tracking-wide">{label}</p>
      <p className={`font-bold mt-1 ${highlight ? 'text-primary text-2xl' : 'text-slate-800'}`}>{value}</p>
    </div>
  )
}
