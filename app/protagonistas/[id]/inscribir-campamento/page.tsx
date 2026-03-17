import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'
import { getBeneficiario, getCampamentos } from '@/lib/data'
import { inscribirCampamento } from '@/lib/actions'

export default async function InscribirCampamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [protagonista, campamentos] = await Promise.all([
    getBeneficiario(id),
    getCampamentos(true),
  ])

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800'

  return (
    <div className="max-w-xl mx-auto">
      <div className="mb-8">
        <Link href={`/protagonistas/${id}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
          <MdArrowBack size={16} /> Volver al Protagonista
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Inscribir a Campamento</h1>
        <p className="text-slate-500 mt-1">{protagonista.apellido}, {protagonista.nombre}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        {campamentos.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No hay campamentos activos disponibles</p>
            <Link href="/campamentos/nuevo" className="mt-2 inline-block text-primary hover:underline text-sm">
              Crear campamento
            </Link>
          </div>
        ) : (
          <form action={inscribirCampamento} className="space-y-5">
            <input type="hidden" name="beneficiario_id" value={id} />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Campamento <span className="text-brand-red">*</span>
              </label>
              <select name="campamento_id" required className={`${inputCls} bg-white`}>
                {campamentos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.precio_estimado ? ` — $${Number(c.precio_estimado).toLocaleString('es-AR')}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Monto a abonar ($) <span className="text-brand-red">*</span>
              </label>
              <input
                name="monto"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                defaultValue={campamentos[0]?.precio_estimado ?? ''}
                className={inputCls}
              />
              <p className="text-xs text-slate-400 mt-1">
                Precio estimado del campamento. Podés ajustarlo si hay descuentos o acuerdos.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
              <textarea name="notas" rows={2} className={`${inputCls} resize-none`} />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium">
                Inscribir
              </button>
              <Link href={`/protagonistas/${id}`} className="flex-1 text-center border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
