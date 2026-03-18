import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'
import { createCampamento } from '@/lib/actions'
import { RAMAS_CAMPAMENTO } from '@/lib/types'

export default function NuevoCampamentoPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/campamentos" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
          <MdArrowBack size={16} /> Volver a Campamentos
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Nuevo Campamento</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form action={createCampamento} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nombre <span className="text-brand-red">*</span>
            </label>
            <input name="nombre" required className={inputCls} placeholder="Ej: Campamento de Invierno 2025" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha de inicio <span className="text-brand-red">*</span>
              </label>
              <input name="fecha_inicio" type="date" required className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Fecha de fin <span className="text-brand-red">*</span>
              </label>
              <input name="fecha_fin" type="date" required className={inputCls} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Precio estimado ($)</label>
              <input name="precio_estimado" type="number" step="0.01" min="0" className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Rama <span className="text-brand-red">*</span>
              </label>
              <select name="rama" required className={`${inputCls} bg-white`}>
                {RAMAS_CAMPAMENTO.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lugar</label>
            <input name="lugar" className={inputCls} placeholder="Ej: Parque Provincial Ernesto Tornquist" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
            <textarea name="descripcion" rows={3} className={`${inputCls} resize-none`} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium">
              Guardar Campamento
            </button>
            <Link href="/campamentos" className="flex-1 text-center border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800'
