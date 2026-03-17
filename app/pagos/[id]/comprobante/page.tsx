import Link from 'next/link'
import { GiFleurDeLys } from 'react-icons/gi'
import { MdArrowBack, MdAdd } from 'react-icons/md'
import { getPago } from '@/lib/data'
import { MESES, RAMA_COLORS, type Rama } from '@/lib/types'
import { PrintButton } from '@/components/PrintButton'

export default async function ComprobantePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const pago = await getPago(id)
  const beneficiario = pago.beneficiarios

  const fechaPago = new Date(pago.fecha_pago + 'T00:00:00').toLocaleDateString('es-AR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
  const numeroComp = String(pago.numero_comprobante).padStart(6, '0')

  const periodoLabel = pago.meses_cubiertos && pago.meses_cubiertos.length > 1
    ? pago.meses_cubiertos
        .map((mc: string) => MESES[parseInt(mc.split('-')[1]) - 1])
        .join(' · ')
    : `${MESES[pago.periodo_mes - 1]} ${pago.periodo_anio}`

  return (
    <div className="max-w-2xl mx-auto">
      {/* Controles — ocultos al imprimir */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <Link href={`/protagonistas/${beneficiario.id}`} className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
          <MdArrowBack size={16} />
          Volver al Protagonista
        </Link>
        <div className="flex items-center gap-3">
          <Link href={`/pagos/nuevo?beneficiario=${beneficiario.id}`} className="inline-flex items-center gap-1 text-sm text-primary hover:underline font-medium">
            <MdAdd size={16} />
            Nuevo pago
          </Link>
          <PrintButton />
        </div>
      </div>

      {/* Comprobante */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 print:shadow-none print:border-0 print:rounded-none print:p-0">
        {/* Encabezado */}
        <div className="text-center pb-6 mb-6 border-b-2 border-primary">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="text-primary">
              <GiFleurDeLys size={40} />
            </div>
            <div className="text-left">
              <h1 className="text-2xl font-bold text-primary">Niño Jesús de Praga</h1>
              <p className="text-slate-500 text-sm">Grupo Scout 565</p>
            </div>
          </div>
          <div className="mt-3 inline-block bg-primary text-white px-6 py-1 rounded-full text-sm font-semibold tracking-wide">
            COMPROBANTE DE PAGO
          </div>
        </div>

        {/* Número y fecha */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wide">N° Comprobante</p>
            <p className="text-2xl font-bold text-slate-800">#{numeroComp}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Fecha de emisión</p>
            <p className="text-slate-800 font-medium">{fechaPago}</p>
          </div>
        </div>

        {/* Datos del protagonista */}
        <div className="bg-slate-50 rounded-lg p-5 mb-6">
          <h2 className="text-xs text-slate-400 uppercase tracking-wide font-semibold mb-3">
            Datos del Protagonista
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400">Apellido y Nombre</p>
              <p className="font-semibold text-slate-800">{beneficiario.apellido}, {beneficiario.nombre}</p>
            </div>
            {beneficiario.dni && (
              <div>
                <p className="text-xs text-slate-400">DNI</p>
                <p className="font-medium text-slate-800">{beneficiario.dni}</p>
              </div>
            )}
            <div>
              <p className="text-xs text-slate-400">Rama</p>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RAMA_COLORS[beneficiario.rama as Rama]}`}>
                {beneficiario.rama}
              </span>
            </div>
            {beneficiario.email && (
              <div>
                <p className="text-xs text-slate-400">Email</p>
                <p className="text-slate-800 text-sm">{beneficiario.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Detalle del pago */}
        <div className="border border-slate-200 rounded-lg overflow-hidden mb-6">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Concepto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Período</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-4 py-4 text-slate-800">{pago.concepto}</td>
                <td className="px-4 py-4 text-slate-800">{periodoLabel}</td>
                <td className="px-4 py-4 text-right font-bold text-primary text-lg">
                  ${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Total y método */}
        <div className="flex justify-between items-end mb-8">
          <div className="space-y-1">
            <p className="text-sm text-slate-500">
              Método: <span className="text-slate-700 font-medium">{pago.metodo_pago}</span>
            </p>
            {pago.notas && (
              <p className="text-sm text-slate-500">Notas: <span className="text-slate-700">{pago.notas}</span></p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wide">Total Abonado</p>
            <p className="text-4xl font-bold text-primary">
              ${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Firmas */}
        <div className="grid grid-cols-2 gap-12 pt-8 border-t border-slate-200">
          <div className="text-center">
            <div className="h-14"></div>
            <div className="border-t border-slate-400 pt-2">
              <p className="text-xs text-slate-500">Firma del Tesorero</p>
            </div>
          </div>
          <div className="text-center">
            <div className="h-14"></div>
            <div className="border-t border-slate-400 pt-2">
              <p className="text-xs text-slate-500">Sello del Grupo</p>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Comprobante válido como recibo de pago de membresía — Grupo Scout Niño Jesús de Praga (Grupo 565)
        </p>
      </div>
    </div>
  )
}
