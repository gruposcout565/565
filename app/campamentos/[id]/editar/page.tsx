import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'
import { getCampamento } from '@/lib/data'
import { updateCampamento } from '@/lib/actions'
import { RAMAS_CAMPAMENTO } from '@/lib/types'

export default async function EditarCampamentoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const c = await getCampamento(id)
  const updateWithId = updateCampamento.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href={`/campamentos/${id}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
          <MdArrowBack size={16} /> Volver al Campamento
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Editar Campamento</h1>
        <p className="text-slate-500 mt-1">{c.nombre}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form action={updateWithId} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre <span className="text-brand-red">*</span>
            </label>
            <input name="nombre" required defaultValue={c.nombre} className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de inicio <span className="text-brand-red">*</span></label>
              <input name="fecha_inicio" type="date" required defaultValue={c.fecha_inicio} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de fin <span className="text-brand-red">*</span></label>
              <input name="fecha_fin" type="date" required defaultValue={c.fecha_fin} className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio estimado ($)</label>
              <input name="precio_estimado" type="number" step="0.01" defaultValue={c.precio_estimado || ''} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rama <span className="text-brand-red">*</span></label>
              <select name="rama" required defaultValue={c.rama} className={`${inputCls} bg-white`}>
                {RAMAS_CAMPAMENTO.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea name="descripcion" rows={3} defaultValue={c.descripcion || ''} className={`${inputCls} resize-none`} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
            <input type="hidden" name="activo" value="false" />
            <label className="flex items-center gap-3 mt-1 cursor-pointer">
              <input type="checkbox" name="activo" value="true" defaultChecked={c.activo} className="w-4 h-4 accent-primary" />
              <span className="text-sm text-slate-700">Campamento activo</span>
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium">
              Guardar Cambios
            </button>
            <Link href={`/campamentos/${id}`} className="flex-1 text-center border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800'
