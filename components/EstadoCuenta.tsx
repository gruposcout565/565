'use client'

import { useState } from 'react'
import { MdTrendingUp, MdTrendingDown, MdAccountBalance } from 'react-icons/md'
import type { EstadoCuenta, MovimientoCuenta } from '@/lib/data'

function SaldoBadge({ saldo }: { saldo: number }) {
  const positivo = saldo >= 0
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${positivo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {positivo ? <MdTrendingUp size={13} /> : <MdTrendingDown size={13} />}
      {positivo ? '+' : ''}${saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
    </span>
  )
}

function TablaMovimientos({ movimientos }: { movimientos: MovimientoCuenta[] }) {
  if (movimientos.length === 0) {
    return <p className="text-slate-400 text-sm text-center py-4">Sin movimientos</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-left">
            <th className="pb-2 text-xs font-medium text-slate-400 uppercase tracking-wide">Fecha</th>
            <th className="pb-2 text-xs font-medium text-slate-400 uppercase tracking-wide">Concepto</th>
            <th className="pb-2 text-xs font-medium text-slate-400 uppercase tracking-wide text-right">Débito</th>
            <th className="pb-2 text-xs font-medium text-slate-400 uppercase tracking-wide text-right">Crédito</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {movimientos.map((m) => (
            <tr key={m.id}>
              <td className="py-2.5 text-slate-500 whitespace-nowrap">
                {new Date(m.fecha).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
              </td>
              <td className="py-2.5 text-slate-700">{m.concepto}</td>
              <td className="py-2.5 text-right text-red-700 font-medium">
                {m.tipo === 'debito' ? `$${m.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : ''}
              </td>
              <td className="py-2.5 text-right text-green-700 font-medium">
                {m.tipo === 'credito' ? `$${m.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}` : ''}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function EstadoCuentaView({ estado }: { estado: EstadoCuenta }) {
  const tabs = [
    { key: 'membresia', label: 'Membresía' },
    ...estado.campamentos.map((c) => ({ key: c.campamento.id, label: c.campamento.nombre })),
  ]

  const [tab, setTab] = useState('membresia')

  const currentCamp = estado.campamentos.find((c) => c.campamento.id === tab)
  const isMembresía = tab === 'membresia'
  const datos = isMembresía
    ? { movimientos: estado.membresia.movimientos, saldo: estado.membresia.saldo, debitos: estado.membresia.totalDebitos, creditos: estado.membresia.totalCreditos }
    : currentCamp
    ? { movimientos: currentCamp.movimientos, saldo: currentCamp.saldo, debitos: currentCamp.totalDebitos, creditos: currentCamp.totalCreditos }
    : null

  return (
    <div>
      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex gap-1 mb-4 border-b border-slate-100">
          {tabs.map((t) => {
            const saldoTab = t.key === 'membresia'
              ? estado.membresia.saldo
              : estado.campamentos.find(c => c.campamento.id === t.key)?.saldo ?? 0
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 -mb-px ${
                  tab === t.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                {t.label}
                <SaldoBadge saldo={saldoTab} />
              </button>
            )
          })}
        </div>
      )}

      {datos ? (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-red-50 rounded-lg p-3 text-center">
              <p className="text-xs text-red-500 font-medium uppercase tracking-wide">Deuda</p>
              <p className="text-base font-bold text-red-700 mt-0.5">
                ${datos.debitos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3 text-center">
              <p className="text-xs text-green-600 font-medium uppercase tracking-wide">Pagado</p>
              <p className="text-base font-bold text-green-700 mt-0.5">
                ${datos.creditos.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className={`rounded-lg p-3 text-center ${datos.saldo >= 0 ? 'bg-blue-50' : 'bg-amber-50'}`}>
              <p className={`text-xs font-medium uppercase tracking-wide ${datos.saldo >= 0 ? 'text-blue-500' : 'text-amber-600'}`}>Saldo</p>
              <p className={`text-base font-bold mt-0.5 ${datos.saldo >= 0 ? 'text-blue-700' : 'text-amber-700'}`}>
                {datos.saldo >= 0 ? '+' : ''}${datos.saldo.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <TablaMovimientos movimientos={datos.movimientos} />
        </>
      ) : (
        <div className="flex items-center justify-center py-8 text-slate-400 gap-2 text-sm">
          <MdAccountBalance size={18} />
          Sin movimientos
        </div>
      )}
    </div>
  )
}
