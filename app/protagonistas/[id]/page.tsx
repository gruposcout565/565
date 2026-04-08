import Link from 'next/link'
import { MdArrowBack, MdAdd, MdSwapHoriz, MdCheck, MdPriorityHigh, MdChevronRight, MdAccessTime, MdWarning } from 'react-icons/md'
import { FaWhatsapp, FaEnvelope } from 'react-icons/fa'
import { getBeneficiario, getPagosByBeneficiario, getHistorialRama, getCuotasPendientesByBeneficiario, getEstadoCuenta, getInscripcionesByBeneficiario, getDocumentosByProtagonista } from '@/lib/data'
import { EstadoCuentaView } from '@/components/EstadoCuenta'
import { deleteBeneficiario, desInscribirCampamento, enviarEmailCuotaVencida } from '@/lib/actions'
import { DocumentosSection } from '@/components/DocumentosSection'
import {
  RAMA_COLORS, ESTADO_PAGO_STYLES, MESES, MESES_SCOUT,
  calcularEstadoPago, type Rama, type EstadoPago,
} from '@/lib/types'
import { DeleteButton } from '@/components/DeleteButton'

export default async function ProtagonistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const [protagonista, pagos, historialRama, cuotasPendientes, estadoCuenta, inscripciones, documentos] = await Promise.all([
    getBeneficiario(id),
    getPagosByBeneficiario(id),
    getHistorialRama(id),
    getCuotasPendientesByBeneficiario(id),
    getEstadoCuenta(id),
    getInscripcionesByBeneficiario(id),
    getDocumentosByProtagonista(id),
  ])

  const deleteWithId = deleteBeneficiario.bind(null, id)
  const totalPagado = pagos.reduce((sum, p) => sum + Number(p.monto), 0)

  const now = new Date()
  const anioActual = now.getFullYear()
  const mesActual = now.getMonth() + 1
  const estado: EstadoPago = protagonista.activo
    ? calcularEstadoPago(pagos as never, anioActual, mesActual)
    : 'al_dia'
  const estadoInfo = ESTADO_PAGO_STYLES[estado]

  const fechaIngreso = new Date(protagonista.fecha_ingreso + 'T00:00:00').toLocaleDateString(
    'es-AR', { day: 'numeric', month: 'long', year: 'numeric' }
  )

  // Calcular estado mes a mes para el año actual
  const mesesPagados = new Set<number>()
  for (const pago of pagos) {
    if (pago.meses_cubiertos && pago.meses_cubiertos.length > 0) {
      for (const mc of pago.meses_cubiertos) {
        const [a, m] = mc.split('-').map(Number)
        if (a === anioActual) mesesPagados.add(m)
      }
    } else if (pago.periodo_anio === anioActual) {
      mesesPagados.add(pago.periodo_mes)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 mb-8">
        <div className="flex-1">
          <Link href="/protagonistas" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm">
            <MdArrowBack size={16} />
            Volver a Protagonistas
          </Link>
          <h1 className="text-3xl font-bold text-slate-800 mt-1">
            {protagonista.apellido}, {protagonista.nombre}
          </h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${RAMA_COLORS[protagonista.rama as Rama]}`}>
              {protagonista.rama}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${protagonista.activo ? 'bg-primary-light text-primary' : 'bg-slate-100 text-slate-500'}`}>
              {protagonista.activo ? 'Activo' : 'Inactivo'}
            </span>
            {protagonista.activo && (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estadoInfo.className}`}>
                {estadoInfo.label}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/protagonistas/${id}/paso-de-rama`} className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            <MdSwapHoriz size={16} /> Paso de Rama
          </Link>
          <Link href={`/protagonistas/${id}/editar`} className="border border-slate-200 text-slate-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium">
            Editar
          </Link>
          <Link href={`/pagos/nuevo?beneficiario=${id}`} className="inline-flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium">
            <MdAdd size={16} /> Registrar Pago
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna izquierda */}
        <div className="space-y-4">
          {/* Info personal */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Información</h2>
            <dl className="space-y-3">
              <InfoItem label="DNI" value={protagonista.dni || '—'} />
              {protagonista.fecha_nacimiento && (
                <InfoItem label="Fecha de nacimiento" value={new Date(protagonista.fecha_nacimiento + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })} />
              )}
              {protagonista.direccion && <InfoItem label="Dirección" value={protagonista.direccion} />}
              {protagonista.barrio && <InfoItem label="Barrio" value={protagonista.barrio} />}
              <InfoItem label="Email" value={protagonista.email || '—'} />
              <InfoItem label="Teléfono" value={protagonista.telefono || '—'} />
              {protagonista.mail_contacto && <InfoItem label="Mail contacto" value={protagonista.mail_contacto} />}
              {protagonista.telefono_contacto && <InfoItem label="Tel. contacto" value={protagonista.telefono_contacto} />}
              <InfoItem label="Tipo cuota" value={protagonista.tipo_cuota === 'trimestral' ? 'Trimestral' : 'Mensual'} />
              <InfoItem label="Ingreso" value={fechaIngreso} />
              <InfoItem label="Total pagado" value={`$${totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`} />
            </dl>
          </div>

          {/* Estado de cuotas año actual */}
          {protagonista.activo && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Cuotas {anioActual}</h2>
              <div className="grid grid-cols-2 gap-1.5">
                {MESES_SCOUT.map((mes) => {
                  const pagado = mesesPagados.has(mes)
                  const transcurrido = mes <= mesActual
                  const esFuturo = mes > mesActual
                  return (
                    <div
                      key={mes}
                      className={`text-xs px-2 py-1.5 rounded-md text-center font-medium flex items-center justify-center gap-0.5 ${
                        pagado
                          ? 'bg-green-100 text-green-800'
                          : transcurrido
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-50 text-slate-400'
                      }`}
                    >
                      {MESES[mes - 1].slice(0, 3)}
                      {pagado
                        ? <MdCheck size={11} />
                        : esFuturo
                        ? <span className="text-[10px]">·</span>
                        : <MdPriorityHigh size={11} />
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Cuotas pendientes */}
          {cuotasPendientes.filter(cp => cp.estado !== 'pagado').length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
                Cuotas Pendientes
              </h2>
              <div className="space-y-2">
                {cuotasPendientes.filter(cp => cp.estado !== 'pagado').map((cp) => {
                  const vencida = cp.estado === 'vencido'
                  const vto = new Date(cp.fecha_vencimiento + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
                  const wspHref = vencida ? buildWhatsappLink(protagonista, cp, vto) : null
                  return (
                    <div key={cp.id} className={`flex items-start justify-between p-2.5 rounded-lg text-xs ${vencida ? 'bg-red-50 border border-red-100' : 'bg-amber-50 border border-amber-100'}`}>
                      <div>
                        <div className={`font-medium ${vencida ? 'text-red-800' : 'text-amber-800'}`}>
                          {cp.tipo === 'trimestral' ? 'Trimestral' : 'Mensual'}
                          {' · '}
                          {cp.meses_cubiertos.map((m: string) => MESES[parseInt(m.split('-')[1]) - 1].slice(0, 3)).join(' - ')}
                        </div>
                        <div className={`mt-0.5 flex items-center gap-1 ${vencida ? 'text-red-600' : 'text-amber-600'}`}>
                          {vencida ? <MdWarning size={11} /> : <MdAccessTime size={11} />}
                          Vence {vto}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${vencida ? 'text-red-800' : 'text-amber-800'}`}>
                          ${Number(cp.monto).toLocaleString('es-AR')}
                        </span>
                        {wspHref && (
                          <a
                            href={wspHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Notificar por WhatsApp"
                            className="text-green-600 hover:text-green-800 transition-colors"
                          >
                            <FaWhatsapp size={16} />
                          </a>
                        )}
                        {vencida && (protagonista.mail_contacto || protagonista.email) && (
                          <form action={enviarEmailCuotaVencida.bind(null, cp.id, id)}>
                            <button
                              type="submit"
                              title="Notificar por email"
                              className="text-blue-500 hover:text-blue-700 transition-colors cursor-pointer"
                            >
                              <FaEnvelope size={15} />
                            </button>
                          </form>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Campamentos inscritos */}
          {inscripciones.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Campamentos</h2>
              <div className="space-y-2">
                {inscripciones.map((insc) => {
                  const camp = insc.campamentos as unknown as { id: string; nombre: string; activo: boolean }
                  const desinscribir = desInscribirCampamento.bind(null, insc.id, id, camp.id)
                  return (
                    <div key={insc.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-slate-800">{camp.nombre}</p>
                        <p className="text-xs text-slate-500">
                          ${Number(insc.monto).toLocaleString('es-AR')}
                          {!camp.activo && <span className="ml-1 text-slate-400">(inactivo)</span>}
                        </p>
                      </div>
                      <form action={desinscribir}>
                        <button
                          type="submit"
                          className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
                        >
                          Desinscribir
                        </button>
                      </form>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Eliminar */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <DeleteButton action={deleteWithId} />
          </div>
        </div>

        {/* Columna derecha */}
        <div className="lg:col-span-2 space-y-6">
          {/* Historial de pagos */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Historial de Pagos</h2>
              <Link href={`/pagos/nuevo?beneficiario=${id}`} className="inline-flex items-center gap-0.5 text-sm text-primary hover:underline font-medium">
                <MdAdd size={16} /> Nuevo pago
              </Link>
            </div>
            {pagos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-slate-400 text-sm">No hay pagos registrados</p>
                <Link href={`/pagos/nuevo?beneficiario=${id}`} className="inline-flex items-center gap-0.5 mt-2 text-primary hover:underline text-sm">
                  Registrar primer pago <MdChevronRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {pagos.map((pago) => (
                  <div key={pago.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                    <div>
                      <div className="font-medium text-slate-800 text-sm">
                        {pago.meses_cubiertos && pago.meses_cubiertos.length > 1
                          ? `Trimestral: ${pago.meses_cubiertos.map((mc: string) => MESES[parseInt(mc.split('-')[1]) - 1].slice(0,3)).join(' · ')}`
                          : `${MESES[pago.periodo_mes - 1]} ${pago.periodo_anio}`
                        }
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {pago.concepto} · {pago.metodo_pago} · Comp. #{String(pago.numero_comprobante).padStart(6, '0')}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-primary text-sm">
                        ${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                      <Link href={`/pagos/${pago.id}/comprobante`} className="text-xs text-primary hover:underline whitespace-nowrap">
                        Ver comp.
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Estado de Cuenta */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Estado de Cuenta</h2>
            <EstadoCuentaView estado={estadoCuenta} />
          </div>

          {/* Historial de Rama */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Historial de Rama</h2>
              <Link href={`/protagonistas/${id}/paso-de-rama`} className="inline-flex items-center gap-0.5 text-sm text-primary hover:underline font-medium">
                <MdAdd size={16} /> Paso de rama
              </Link>
            </div>
            {historialRama.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-4">Sin cambios de rama registrados</p>
            ) : (
              <div className="space-y-2">
                {historialRama.map((h) => (
                  <div key={h.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RAMA_COLORS[h.rama_anterior as Rama]}`}>
                          {h.rama_anterior}
                        </span>
                        <MdChevronRight size={16} className="text-slate-400" />
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${RAMA_COLORS[h.rama_nueva as Rama]}`}>
                          {h.rama_nueva}
                        </span>
                      </div>
                      {h.notas && <p className="text-xs text-slate-500 mt-1">{h.notas}</p>}
                    </div>
                    <span className="text-xs text-slate-400 whitespace-nowrap">
                      {new Date(h.fecha).toLocaleDateString('es-AR')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documentación */}
          <DocumentosSection protagonistaId={id} documentos={documentos} />
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

function buildWhatsappLink(
  protagonista: { nombre: string; apellido: string; telefono?: string; telefono_contacto?: string },
  cp: { tipo: string; meses_cubiertos: string[]; monto: number },
  vto: string,
) {
  const rawPhone = protagonista.telefono_contacto || protagonista.telefono
  if (!rawPhone) return null

  // Normalizar número argentino: quitar caracteres no numéricos, agregar código de país 54
  const digits = rawPhone.replace(/\D/g, '')
  const phone = digits.startsWith('54') ? digits : `54${digits.replace(/^0/, '')}`

  const meses = cp.meses_cubiertos
    .map((m: string) => MESES[parseInt(m.split('-')[1]) - 1])
    .join(', ')

  const mensaje =
    `Hola! Te contactamos del *Grupo Scout 565*. ` +
    `Queremos avisarte que ${protagonista.nombre} ${protagonista.apellido} tiene una cuota *vencida*: ` +
    `cuota ${cp.tipo} (${meses}) por *$${Number(cp.monto).toLocaleString('es-AR')}*, ` +
    `con fecha de vencimiento ${vto}. ` +
    `Por favor regularizá la situación a la brevedad. ¡Gracias!`

  return `https://wa.me/${phone}?text=${encodeURIComponent(mensaje)}`
}
