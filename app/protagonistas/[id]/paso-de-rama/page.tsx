import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'
import { getBeneficiario } from '@/lib/data'
import { registrarPasoDeRama } from '@/lib/actions'
import { RAMAS, RAMA_COLORS, type Rama } from '@/lib/types'

export default async function PasoDeRamaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const protagonista = await getBeneficiario(id)
  const ramasDisponibles = RAMAS.filter((r) => r !== protagonista.rama)

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <Link href={`/protagonistas/${id}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
          <MdArrowBack size={16} /> Volver al Protagonista
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Paso de Rama</h1>
        <p className="text-slate-500 mt-1">
          {protagonista.apellido}, {protagonista.nombre}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        {/* Rama actual */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-400 uppercase tracking-wide mb-1">Rama actual</p>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${RAMA_COLORS[protagonista.rama as Rama]}`}>
            {protagonista.rama}
          </span>
        </div>

        <form action={registrarPasoDeRama} className="space-y-5">
          <input type="hidden" name="protagonista_id" value={id} />
          <input type="hidden" name="rama_anterior" value={protagonista.rama} />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nueva Rama <span className="text-brand-red">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ramasDisponibles.map((rama) => (
                <label
                  key={rama}
                  className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:border-primary hover:bg-primary-light transition-colors has-[:checked]:border-primary has-[:checked]:bg-primary-light"
                >
                  <input type="radio" name="rama_nueva" value={rama} required className="accent-primary" />
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RAMA_COLORS[rama as Rama]}`}>
                    {rama}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Notas (opcional)
            </label>
            <textarea
              name="notas"
              rows={3}
              placeholder="Ej: Paso a Scouts por edad, ceremonia realizada el..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary resize-none text-slate-800"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Registrar Paso de Rama
            </button>
            <Link
              href={`/protagonistas/${id}`}
              className="flex-1 text-center border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
