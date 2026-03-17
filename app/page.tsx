import Link from 'next/link'
import { MdPeople, MdCheckCircle, MdAttachMoney, MdWarning, MdChevronRight, MdReceiptLong } from 'react-icons/md'
import { getDashboardStats, getUltimosPagos, getProximoCampamento } from '@/lib/data'
import { MESES, RAMA_COLORS, type Rama } from '@/lib/types'
import type { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const [stats, ultimosPagos, proximoCampamento] = await Promise.all([
    getDashboardStats(),
    getUltimosPagos(5),
    getProximoCampamento(),
  ])

  const mesActual = MESES[new Date().getMonth()]
  const diasAlCampamento = proximoCampamento
    ? Math.ceil(
        (new Date(proximoCampamento.fecha_inicio).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
    : null

  return (
    <div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Protagonistas" value={stats.totalProtagonistas} icon={<MdPeople size={28} />} />
        <StatCard title="Activos" value={stats.activos} icon={<MdCheckCircle size={28} />} color="primary" />
        <StatCard
          title={`Recaudado ${mesActual}`}
          value={`$${stats.recaudadoMes.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`}
          icon={<MdAttachMoney size={28} />}
          color="yellow"
        />
        <StatCard
          title="Con deuda"
          value={stats.conDeuda}
          icon={<MdWarning size={28} />}
          color={stats.conDeuda > 0 ? 'red' : 'default'}
        />
      </div>

      {/* Fila principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Protagonistas con deuda */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Con Pagos Pendientes</h2>
            <Link href="/protagonistas?estado=adeuda" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          {stats.conDeuda === 0 ? (
            <div className="text-center py-4">
              <div className="flex items-center justify-center gap-1.5 text-green-600 font-medium text-sm">
                <MdCheckCircle size={16} /> Todos al día
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="text-4xl font-bold text-amber-600">{stats.conDeuda}</div>
              <div>
                <p className="text-sm text-slate-700 font-medium">protagonista{stats.conDeuda !== 1 ? 's' : ''}</p>
                <Link href="/protagonistas?estado=adeuda" className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline">
                  Ver listado <MdChevronRight size={14} />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Próximo campamento */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Próximo Campamento</h2>
          {proximoCampamento ? (
            <div>
              <p className="font-semibold text-slate-800">{proximoCampamento.nombre}</p>
              <p className="text-xs text-slate-500 mt-1">
                {new Date(proximoCampamento.fecha_inicio + 'T00:00:00').toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
              </p>
              {diasAlCampamento !== null && (
                <div className="mt-3 text-center bg-primary-light rounded-lg p-3">
                  <div className="text-3xl font-bold text-primary">{diasAlCampamento}</div>
                  <div className="text-xs text-primary/80 font-medium">días restantes</div>
                </div>
              )}
              <Link href={`/campamentos/${proximoCampamento.id}`} className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline mt-2">
                Ver detalle <MdChevronRight size={14} />
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-slate-400 text-sm">Sin campamentos próximos</p>
              <Link href="/campamentos/nuevo" className="inline-flex items-center gap-0.5 text-xs text-primary hover:underline mt-1">
                Planificar campamento <MdChevronRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Fila secundaria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Resumen por rama */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Resumen por Rama</h2>
          {Object.keys(stats.resumenRama).length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Sin datos</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(stats.resumenRama).map(([rama, datos]) => (
                <div key={rama} className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${RAMA_COLORS[rama as Rama] || 'bg-slate-100 text-slate-600'}`}>
                    {rama}
                  </span>
                  <div className="text-sm text-slate-600">
                    <span className="font-medium text-slate-800">{datos.activos}</span>
                    <span className="text-slate-400"> / {datos.total} activos</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos pagos */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">Últimos Pagos</h2>
          {ultimosPagos.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">Sin pagos registrados</p>
          ) : (
            <div className="space-y-2">
              {ultimosPagos.map((pago) => (
                <div key={pago.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {(pago.beneficiarios as { apellido: string; nombre: string } | null)?.apellido},{' '}
                      {(pago.beneficiarios as { apellido: string; nombre: string } | null)?.nombre}
                    </p>
                    <p className="text-xs text-slate-400">
                      {MESES[pago.periodo_mes - 1]} {pago.periodo_anio}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-primary">
                      ${Number(pago.monto).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                    <Link href={`/pagos/${pago.id}/comprobante`} className="text-slate-400 hover:text-primary">
                      <MdReceiptLong size={18} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  title, value, icon, color = 'default',
}: {
  title: string; value: string | number; icon: ReactNode
  color?: 'default' | 'primary' | 'yellow' | 'red'
}) {
  const colors = {
    default: 'bg-white border-slate-100',
    primary: 'bg-primary-light border-blue-100',
    yellow:  'bg-amber-50 border-amber-100',
    red:     'bg-red-50 border-red-100',
  }
  return (
    <div className={`rounded-xl shadow-sm border p-5 ${colors[color]}`}>
      <div className="text-slate-500">{icon}</div>
      <div className="text-2xl font-bold text-slate-800 mt-2">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{title}</div>
    </div>
  )
}
