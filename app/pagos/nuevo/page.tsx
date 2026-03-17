import Link from 'next/link'
import { MdArrowBack } from 'react-icons/md'
import { getBeneficiarios, getBeneficiario, getCampamentos, getCuotaActual } from '@/lib/data'
import { NuevoPagoForm } from '@/components/NuevoPagoForm'

export default async function NuevoPagoPage({
  searchParams,
}: {
  searchParams: Promise<{ beneficiario?: string }>
}) {
  const { beneficiario: beneficiarioId } = await searchParams
  const [protagonistas, preseleccionado, campamentos, cuota] = await Promise.all([
    getBeneficiarios(),
    beneficiarioId ? getBeneficiario(beneficiarioId) : null,
    getCampamentos(true),
    getCuotaActual(),
  ])

  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const today = now.toISOString().split('T')[0]

  const montoCuotaMensual = cuota ? Number(cuota.monto) : 0
  const montoCuotaTrimestralMes = cuota?.monto_trimestral_mes ? Number(cuota.monto_trimestral_mes) : 0

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <Link
          href={beneficiarioId ? `/protagonistas/${beneficiarioId}` : '/protagonistas'}
          className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm"
        >
          <MdArrowBack size={16} /> Volver
        </Link>
        <h1 className="text-3xl font-bold text-slate-800 mt-2">Registrar Pago</h1>
        {preseleccionado && (
          <p className="text-slate-500 mt-1">{preseleccionado.apellido}, {preseleccionado.nombre}</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <NuevoPagoForm
          protagonistas={protagonistas}
          campamentos={campamentos}
          preseleccionadoId={beneficiarioId}
          today={today}
          currentMonth={currentMonth}
          currentYear={currentYear}
          montoCuotaMensual={montoCuotaMensual}
          montoCuotaTrimestralMes={montoCuotaTrimestralMes}
          beneficiarioId={beneficiarioId}
        />
      </div>
    </div>
  )
}
