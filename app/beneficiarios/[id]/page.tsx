import Link from 'next/link'
import { getBeneficiario, getPagosByBeneficiario } from '@/lib/data'
import { deleteBeneficiario } from '@/lib/actions'
import { RAMA_COLORS, MESES, type Rama } from '@/lib/types'
import { DeleteButton } from '@/components/DeleteButton'

export default async function BeneficiarioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [beneficiario, pagos] = await Promise.all([
    getBeneficiario(id),
    getPagosByBeneficiario(id),
  ])

  const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0)
  const deleteWithId = deleteBeneficiario.bind(null, id)

  const fechaIngreso = new Date(beneficiario.fecha_ingreso + 'T00:00:00').toLocaleDateString(
    'es-AR',
    { day: 'numeric', month: 'long', year: 'numeric' }
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex-1">
          <Link href="/beneficiarios" className="text-slate-400 hover:text-slate-600 text-sm">
            ← Volver a Beneficiarios
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 mt-1">
            {beneficiario.apellido}, {beneficiario.nombre}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RAMA_COLORS[beneficiario.rama as Rama]}`}
            >
              {beneficiario.rama}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                beneficiario.activo
                  ? 'bg-primary-light text-primary'
                  : 'bg-brand-red-light text-brand-red'
              }`}
            >
              {beneficiario.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/beneficiarios/${id}/editar`}
            className="border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            Editar
          </Link>
          <Link
            href={`/pagos/nuevo?beneficiario=${id}`}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            + Registrar Pago
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Información</h2>
            <dl className="space-y-3">
              <InfoItem label="DNI" value={beneficiario.dni || '—'} />
              <InfoItem label="Email" value={beneficiario.email || '—'} />
              <InfoItem label="Teléfono" value={beneficiario.telefono || '—'} />
              <InfoItem label="Fecha de Ingreso" value={fechaIngreso} />
              <InfoItem
                label="Total Pagado"
                value={`$${totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
              />
              <InfoItem label="Pagos Registrados" value={`${pagos.length}`} />
            </dl>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <DeleteButton action={deleteWithId} />
          </div>
        </div>

        {/* Historial de Pagos */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-800">Historial de Pagos</h2>
              <Link
                href={`/pagos/nuevo?beneficiario=${id}`}
                className="text-sm text-primary hover:underline font-medium"
              >
                + Nuevo pago
              </Link>
            </div>

            {pagos.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-slate-400">No hay pagos registrados</p>
                <Link
                  href={`/pagos/nuevo?beneficiario=${id}`}
                  className="mt-2 inline-block text-primary font-medium hover:underline text-sm"
                >
                  Registrar primer pago →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {pagos.map((pago) => (
                  <div
                    key={pago.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div>
                      <div className="font-medium text-slate-800">
                        {MESES[pago.periodo_mes - 1]} {pago.periodo_anio}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {pago.concepto} · {pago.metodo_pago} · Comp.{' '}
                        #{String(pago.numero_comprobante).padStart(6, '0')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary">
                        ${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                      <Link
                        href={`/pagos/${pago.id}/comprobante`}
                        className="text-xs text-primary hover:underline whitespace-nowrap"
                      >
                        Ver comprobante
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-400 uppercase tracking-wide">{label}</dt>
      <dd className="text-slate-800 mt-0.5 text-sm">{value}</dd>
    </div>
  )
}
