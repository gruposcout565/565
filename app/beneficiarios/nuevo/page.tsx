import Link from 'next/link'
import { createBeneficiario } from '@/lib/actions'
import { RAMAS } from '@/lib/types'

export default function NuevoBeneficiarioPage() {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href="/beneficiarios" className="text-slate-400 hover:text-slate-600 text-sm">
          ← Volver a Beneficiarios
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Nuevo Beneficiario</h1>
        <p className="text-slate-500 mt-1">Agregar un nuevo miembro al grupo</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form action={createBeneficiario} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre" required>
              <input
                name="nombre"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Apellido" required>
              <input
                name="apellido"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="DNI / Documento">
              <input
                name="dni"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Rama" required>
              <select
                name="rama"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                {RAMAS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Email">
            <input
              name="email"
              type="email"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>

          <Field label="Teléfono">
            <input
              name="telefono"
              type="tel"
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>

          <Field label="Fecha de Ingreso" required>
            <input
              name="fecha_ingreso"
              type="date"
              required
              defaultValue={today}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Guardar Beneficiario
            </button>
            <Link
              href="/beneficiarios"
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

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label} {required && <span className="text-brand-red">*</span>}
      </label>
      {children}
    </div>
  )
}
