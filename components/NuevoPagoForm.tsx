'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { MdEdit } from 'react-icons/md'
import { createPago } from '@/lib/actions'
import { MESES, METODOS_PAGO, TIPOS_PAGO } from '@/lib/types'

const TRIMESTRES = [
  { label: 'Abril - Mayo - Junio',        meses: [4, 5, 6],  periodoMes: 4  },
  { label: 'Julio - Agosto - Septiembre', meses: [7, 8, 9],  periodoMes: 7  },
  { label: 'Octubre - Noviembre',         meses: [10, 11],   periodoMes: 10 },
]

type Protagonista = { id: string; apellido: string; nombre: string; rama: string }
type Campamento = {
  id: string
  nombre: string
  precio_estimado?: number | null
  fecha_inicio: string
}

interface Props {
  protagonistas: Protagonista[]
  campamentos: Campamento[]
  preseleccionadoId?: string
  today: string
  currentMonth: number
  currentYear: number
  montoCuotaMensual: number
  montoCuotaTrimestralMes: number
  beneficiarioId?: string
}

export function NuevoPagoForm({
  protagonistas,
  campamentos,
  preseleccionadoId,
  today,
  currentMonth,
  currentYear,
  montoCuotaMensual,
  montoCuotaTrimestralMes,
  beneficiarioId,
}: Props) {
  const [tipo, setTipo] = useState('mensual')
  const [trimestreIdx, setTrimestreIdx] = useState(0)
  const [anioTrimestre, setAnioTrimestre] = useState(currentYear)
  const [campamentoId, setCampamentoId] = useState(campamentos[0]?.id || '')
  const [editarMonto, setEditarMonto] = useState(false)
  const [montoManual, setMontoManual] = useState('')
  const [concepto, setConcepto] = useState('Cuota mensual')

  const trimestre = TRIMESTRES[trimestreIdx]
  const esCuota = tipo === 'mensual' || tipo === 'trimestral'
  const esCampamento = tipo === 'campamento'

  const campamentoSeleccionado = useMemo(
    () => campamentos.find((c) => c.id === campamentoId) ?? null,
    [campamentos, campamentoId]
  )

  // Período derivado del campamento (mes y año de fecha_inicio)
  const campamentoPeriodoMes = useMemo(() => {
    if (!campamentoSeleccionado) return currentMonth
    return parseInt(campamentoSeleccionado.fecha_inicio.split('-')[1], 10)
  }, [campamentoSeleccionado, currentMonth])

  const campamentoPeriodoAnio = useMemo(() => {
    if (!campamentoSeleccionado) return currentYear
    return parseInt(campamentoSeleccionado.fecha_inicio.split('-')[0], 10)
  }, [campamentoSeleccionado, currentYear])

  const montoCalculado = useMemo(() => {
    if (tipo === 'mensual') return montoCuotaMensual
    if (tipo === 'trimestral') return montoCuotaTrimestralMes * trimestre.meses.length
    if (tipo === 'campamento') return campamentoSeleccionado?.precio_estimado ?? 0
    return 0
  }, [tipo, trimestre, montoCuotaMensual, montoCuotaTrimestralMes, campamentoSeleccionado])

  const tieneAutoMonto = esCuota || (esCampamento && (campamentoSeleccionado?.precio_estimado ?? 0) > 0)

  const mesesCubiertosStr = useMemo(() => {
    if (tipo !== 'trimestral') return ''
    return trimestre.meses
      .map((m) => `${anioTrimestre}-${String(m).padStart(2, '0')}`)
      .join(',')
  }, [tipo, trimestre, anioTrimestre])

  function conceptoDefault(t: string, campId?: string) {
    if (t === 'mensual') return 'Cuota mensual'
    if (t === 'trimestral') return 'Cuota trimestral'
    if (t === 'nota_credito') return ''
    if (t === 'campamento') {
      const camp = campamentos.find((c) => c.id === (campId ?? campamentoId))
      return camp ? `Campamento ${camp.nombre}` : 'Campamento'
    }
    return ''
  }

  function handleTipoChange(v: string) {
    setTipo(v)
    setEditarMonto(false)
    setMontoManual('')
    setConcepto(conceptoDefault(v))
  }

  function handleCampamentoChange(id: string) {
    setCampamentoId(id)
    setEditarMonto(false)
    setMontoManual('')
    setConcepto(conceptoDefault('campamento', id))
  }

  const montoValue = tieneAutoMonto && !editarMonto
    ? String(montoCalculado)
    : editarMonto ? montoManual : ''

  return (
    <form action={createPago} className="space-y-5">
      {/* Protagonista */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Protagonista <span className="text-brand-red">*</span>
        </label>
        <select
          name="beneficiario_id"
          required
          defaultValue={preseleccionadoId || ''}
          className={`${inputCls} bg-white`}
        >
          <option value="" disabled>Seleccionar protagonista...</option>
          {protagonistas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.apellido}, {p.nombre} — {p.rama}
            </option>
          ))}
        </select>
      </div>

      {/* Tipo de Pago */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Tipo de Pago <span className="text-brand-red">*</span>
        </label>
        <select
          name="tipo"
          required
          value={tipo}
          onChange={(e) => handleTipoChange(e.target.value)}
          className={`${inputCls} bg-white`}
        >
          {TIPOS_PAGO.filter((t) => t.value !== 'campamento' || campamentos.length > 0).map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Campamento — selector requerido */}
      {esCampamento && (
        <>
          {campamentos.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Campamento <span className="text-brand-red">*</span>
              </label>
              <select
                name="campamento_id"
                required
                value={campamentoId}
                onChange={(e) => handleCampamentoChange(e.target.value)}
                className={`${inputCls} bg-white`}
              >
                {campamentos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                    {c.precio_estimado ? ` — $${Number(c.precio_estimado).toLocaleString('es-AR')}` : ''}
                  </option>
                ))}
              </select>
              {campamentoSeleccionado && (
                <p className="text-xs text-slate-400 mt-1">
                  Inicio: {new Date(campamentoSeleccionado.fecha_inicio + 'T00:00:00').toLocaleDateString('es-AR')}
                  {' · '}Período: {MESES[campamentoPeriodoMes - 1]} {campamentoPeriodoAnio}
                </p>
              )}
            </div>
          )}
          {/* Hidden period from campamento */}

          <input type="hidden" name="periodo_mes" value={campamentoPeriodoMes} />
          <input type="hidden" name="periodo_anio" value={campamentoPeriodoAnio} />
        </>
      )}

      {/* Período — mensual */}
      {tipo === 'mensual' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mes <span className="text-brand-red">*</span>
            </label>
            <select name="periodo_mes" required defaultValue={currentMonth} className={`${inputCls} bg-white`}>
              {MESES.map((mes, i) => (
                <option key={i + 1} value={i + 1}>{mes}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Año <span className="text-brand-red">*</span>
            </label>
            <input
              name="periodo_anio"
              type="number"
              required
              defaultValue={currentYear}
              min={2000}
              max={2100}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* Período — trimestral */}
      {tipo === 'trimestral' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Trimestre <span className="text-brand-red">*</span>
              </label>
              <select
                value={trimestreIdx}
                onChange={(e) => setTrimestreIdx(Number(e.target.value))}
                className={`${inputCls} bg-white`}
              >
                {TRIMESTRES.map((t, i) => (
                  <option key={i} value={i}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Año <span className="text-brand-red">*</span>
              </label>
              <input
                value={anioTrimestre}
                onChange={(e) => setAnioTrimestre(Number(e.target.value))}
                type="number"
                min={2000}
                max={2100}
                className={inputCls}
              />
            </div>
          </div>
          <input type="hidden" name="periodo_mes" value={trimestre.periodoMes} />
          <input type="hidden" name="periodo_anio" value={anioTrimestre} />
          <input type="hidden" name="meses_cubiertos" value={mesesCubiertosStr} />
        </>
      )}

      {/* Período — nota_credito */}
      {tipo === 'nota_credito' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mes <span className="text-brand-red">*</span>
            </label>
            <select name="periodo_mes" required defaultValue={currentMonth} className={`${inputCls} bg-white`}>
              {MESES.map((mes, i) => (
                <option key={i + 1} value={i + 1}>{mes}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Año <span className="text-brand-red">*</span>
            </label>
            <input
              name="periodo_anio"
              type="number"
              required
              defaultValue={currentYear}
              min={2000}
              max={2100}
              className={inputCls}
            />
          </div>
        </div>
      )}

      {/* Monto */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-slate-700">
            Monto ($) <span className="text-brand-red">*</span>
          </label>
          {tieneAutoMonto && (
            <label className="flex items-center gap-1.5 text-xs text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={editarMonto}
                onChange={(e) => {
                  setEditarMonto(e.target.checked)
                  if (e.target.checked) setMontoManual(String(montoCalculado))
                }}
                className="w-3.5 h-3.5 accent-primary"
              />
              <MdEdit size={13} />
              Editar monto
            </label>
          )}
        </div>
        <input
          name="monto"
          type="number"
          required
          step="0.01"
          min="0"
          readOnly={tieneAutoMonto && !editarMonto}
          value={tieneAutoMonto ? montoValue : undefined}
          onChange={tieneAutoMonto ? (e) => editarMonto && setMontoManual(e.target.value) : undefined}
          placeholder="0.00"
          className={`${inputCls} ${tieneAutoMonto && !editarMonto ? 'bg-slate-50 text-slate-600' : ''}`}
        />
        {tieneAutoMonto && !editarMonto && montoCalculado > 0 && (
          <p className="text-xs text-slate-400 mt-1">
            {tipo === 'mensual' && `Cuota mensual: $${montoCuotaMensual}`}
            {tipo === 'trimestral' && `$${montoCuotaTrimestralMes}/mes × ${trimestre.meses.length} meses = $${montoCalculado}`}
            {tipo === 'campamento' && `Precio estimado del campamento`}
          </p>
        )}
      </div>

      {/* Método y Fecha */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Método de Pago <span className="text-brand-red">*</span>
          </label>
          <select name="metodo_pago" required className={`${inputCls} bg-white`}>
            {METODOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Fecha de Pago</label>
          <input name="fecha_pago" type="date" defaultValue={today} className={inputCls} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Concepto</label>
        <input
          name="concepto"
          value={concepto}
          onChange={(e) => setConcepto(e.target.value)}
          placeholder="Sin concepto"
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Notas (opcional)</label>
        <textarea name="notas" rows={2} className={`${inputCls} resize-none`} />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-primary-dark transition-colors font-medium"
        >
          Registrar y Ver Comprobante
        </button>
        <Link
          href={beneficiarioId ? `/protagonistas/${beneficiarioId}` : '/protagonistas'}
          className="flex-1 text-center border border-slate-200 text-slate-600 py-2.5 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Cancelar
        </Link>
      </div>
    </form>
  )
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary text-slate-800'
