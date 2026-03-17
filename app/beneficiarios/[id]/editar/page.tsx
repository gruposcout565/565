import Link from 'next/link'
import { getBeneficiario } from '@/lib/data'
import { updateBeneficiario } from '@/lib/actions'
import { RAMAS } from '@/lib/types'

export default async function EditarBeneficiarioPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const b = await getBeneficiario(id)
  const updateWithId = updateBeneficiario.bind(null, id)

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link href={`/beneficiarios/${id}`} className="text-slate-400 hover:text-slate-600 text-sm">
          ← Volver al Beneficiario
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Editar Beneficiario</h1>
        <p className="text-slate-500 mt-1">
          {b.apellido}, {b.nombre}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <form action={updateWithId} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre" required>
              <input
                name="nombre"
                required
                defaultValue={b.nombre}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Apellido" required>
              <input
                name="apellido"
                required
                defaultValue={b.apellido}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="DNI / Documento">
              <input
                name="dni"
                defaultValue={b.dni || ''}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </Field>
            <Field label="Rama" required>
              <select
                name="rama"
                required
                defaultValue={b.rama}
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
              defaultValue={b.email || ''}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>

          <Field label="Teléfono">
            <input
              name="telefono"
              type="tel"
              defaultValue={b.telefono || ''}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>

          <Field label="Fecha de Ingreso" required>
            <input
              name="fecha_ingreso"
              type="date"
              required
              defaultValue={b.fecha_ingreso}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </Field>

          <Field label="Estado">
            <select
              name="activo"
              defaultValue={b.activo ? 'true' : 'false'}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-white"
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </Field>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Guardar Cambios
            </button>
            <Link
              href={`/beneficiarios/${id}`}
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
