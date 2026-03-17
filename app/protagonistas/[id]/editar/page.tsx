import Link from 'next/link'
import { MdArrowBack, MdLightbulb } from 'react-icons/md'
import { getBeneficiario } from '@/lib/data'
import { updateBeneficiario } from '@/lib/actions'
import { RAMAS, type TipoCuota } from '@/lib/types'

export default async function EditarProtagonistPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const p = await getBeneficiario(id)
  const updateWithId = updateBeneficiario.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href={`/protagonistas/${id}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
          <MdArrowBack size={16} /> Volver al Protagonista
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Editar Protagonista</h1>
        <p className="text-slate-500 mt-1">{p.apellido}, {p.nombre}</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form action={updateWithId} className="space-y-5">
          {/* Campo oculto para detectar cambio de rama */}
          <input type="hidden" name="rama_anterior" value={p.rama} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre" required>
              <input name="nombre" required defaultValue={p.nombre} className={inputCls} />
            </Field>
            <Field label="Apellido" required>
              <input name="apellido" required defaultValue={p.apellido} className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="DNI / Documento">
              <input name="dni" defaultValue={p.dni || ''} className={inputCls} />
            </Field>
            <Field label="Rama" required>
              <select name="rama" required defaultValue={p.rama} className={`${inputCls} bg-white`}>
                {RAMAS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Tipo de cuota" required>
            <div className="flex gap-4 mt-1">
              {(['mensual', 'trimestral'] as TipoCuota[]).map((tc) => (
                <label key={tc} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                  <input
                    type="radio"
                    name="tipo_cuota"
                    value={tc}
                    defaultChecked={(p.tipo_cuota || 'mensual') === tc}
                    className="accent-primary"
                  />
                  {tc.charAt(0).toUpperCase() + tc.slice(1)}
                </label>
              ))}
            </div>
          </Field>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos de contacto</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email">
                <input name="email" type="email" defaultValue={p.email || ''} className={inputCls} />
              </Field>
              <Field label="Teléfono">
                <input name="telefono" type="tel" defaultValue={p.telefono || ''} className={inputCls} />
              </Field>
              <Field label="Mail de contacto">
                <input name="mail_contacto" type="email" defaultValue={p.mail_contacto || ''} className={inputCls} />
              </Field>
              <Field label="Teléfono de contacto">
                <input name="telefono_contacto" type="tel" defaultValue={p.telefono_contacto || ''} className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <Field label="Fecha de Ingreso" required>
              <input name="fecha_ingreso" type="date" required defaultValue={p.fecha_ingreso} className={inputCls} />
            </Field>
            <Field label="Baja del grupo">
              <input type="hidden" name="activo" value="true" />
              <label className="flex items-center gap-3 mt-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="activo"
                  value="false"
                  defaultChecked={!p.activo}
                  className="w-4 h-4 accent-brand-red"
                />
                <span className="text-sm text-slate-700">Dar de baja (dejó de concurrir)</span>
              </label>
            </Field>
          </div>

          {/* Advertencia si la rama cambia */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <MdLightbulb size={16} className="inline mr-1" /> Si cambiás la rama desde este formulario, se registrará automáticamente en el historial de rama.
            También podés usar el botón <strong>"Paso de Rama"</strong> para un registro más detallado.
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium">
              Guardar Cambios
            </button>
            <Link href={`/protagonistas/${id}`} className="flex-1 text-center border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800'

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-brand-red">*</span>}
      </label>
      {children}
    </div>
  )
}
