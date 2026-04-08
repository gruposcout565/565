import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'
import { createBeneficiario } from '@/lib/actions'
import { RAMAS } from '@/lib/types'

export default function NuevoProtagonistPage() {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/protagonistas" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
          <MdArrowBack size={16} /> Volver a Protagonistas
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Nuevo Protagonista</h1>
        <p className="text-slate-500 mt-1">Agregar un nuevo miembro al grupo</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form action={createBeneficiario} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre" required>
              <input name="nombre" required className={inputCls} />
            </Field>
            <Field label="Apellido" required>
              <input name="apellido" required className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="DNI / Documento">
              <input name="dni" className={inputCls} />
            </Field>
            <Field label="Fecha de Nacimiento">
              <input name="fecha_nacimiento" type="date" className={inputCls} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Rama" required>
              <select name="rama" required className={`${inputCls} bg-white`}>
                {RAMAS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Tipo de cuota" required>
            <div className="flex gap-4 mt-1">
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="radio" name="tipo_cuota" value="mensual" defaultChecked className="accent-primary" />
                Mensual
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="radio" name="tipo_cuota" value="trimestral" className="accent-primary" />
                Trimestral
              </label>
            </div>
          </Field>

          <div className="pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Datos de contacto</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Email">
                <input name="email" type="email" className={inputCls} />
              </Field>
              <Field label="Teléfono">
                <input name="telefono" type="tel" className={inputCls} />
              </Field>
              <Field label="Mail de contacto (familiar)">
                <input name="mail_contacto" type="email" className={inputCls} />
              </Field>
              <Field label="Teléfono de contacto (familiar)">
                <input name="telefono_contacto" type="tel" className={inputCls} />
              </Field>
              <Field label="Religión">
                <input name="religion" className={inputCls} />
              </Field>
              <Field label="Dirección">
                <input name="direccion" className={inputCls} />
              </Field>
              <Field label="Barrio">
                <input name="barrio" className={inputCls} />
              </Field>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <Field label="Fecha de Ingreso" required>
              <input name="fecha_ingreso" type="date" required defaultValue={today} className={inputCls} />
            </Field>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium">
              Guardar Protagonista
            </button>
            <Link href="/protagonistas" className="flex-1 text-center border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors">
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
