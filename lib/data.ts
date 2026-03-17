import { createServerClient } from './supabase/server'
import { calcularEstadoPago, MESES_SCOUT, type EstadoPago } from './types'

function dbError(error: { message: string; hint?: string }): never {
  throw new Error(`Error de base de datos: ${error.message}${error.hint ? ` (${error.hint})` : ''}`)
}

// ============================================================
// PROTAGONISTAS (tabla: beneficiarios)
// ============================================================

export async function getBeneficiarios(
  search?: string,
  rama?: string,
  activo?: string
) {
  const supabase = await createServerClient()
  let query = supabase.from('beneficiarios').select('*').order('apellido', { ascending: true })

  if (search) {
    query = query.or(
      `nombre.ilike.%${search}%,apellido.ilike.%${search}%,dni.ilike.%${search}%`
    )
  }
  if (rama && rama !== 'all') {
    query = query.eq('rama', rama)
  }
  if (activo && activo !== 'all') {
    query = query.eq('activo', activo === 'true')
  }

  const { data, error } = await query
  if (error) dbError(error)
  return data || []
}

/** Retorna protagonistas con su estado de pago calculado para el año dado */
export async function getBeneficiariosConEstado(
  anio: number,
  search?: string,
  rama?: string,
  activo?: string,
  estadoPago?: string
) {
  const supabase = await createServerClient()
  const mesActual = new Date().getMonth() + 1

  let query = supabase
    .from('beneficiarios')
    .select('*, pagos(periodo_mes, periodo_anio, meses_cubiertos, tipo)')
    .order('apellido', { ascending: true })

  if (search) {
    query = query.or(
      `nombre.ilike.%${search}%,apellido.ilike.%${search}%,dni.ilike.%${search}%`
    )
  }
  if (rama && rama !== 'all') query = query.eq('rama', rama)
  if (activo && activo !== 'all') query = query.eq('activo', activo === 'true')

  const { data, error } = await query
  if (error) dbError(error)

  const conEstado = (data || []).map((b) => {
    const pagos = (b.pagos || []) as Array<{
      periodo_mes: number
      periodo_anio: number
      meses_cubiertos?: string[]
      tipo: string
    }>
    const estado: EstadoPago = b.activo
      ? calcularEstadoPago(pagos as never, anio, mesActual)
      : 'al_dia'
    return { ...b, estado }
  })

  if (estadoPago && estadoPago !== 'all') {
    return conEstado.filter((b) => b.estado === estadoPago)
  }
  return conEstado
}

export async function getBeneficiario(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('beneficiarios')
    .select('*')
    .eq('id', id)
    .single()
  if (error) dbError(error)
  return data!
}

// ============================================================
// HISTORIAL DE RAMA
// ============================================================

export async function getHistorialRama(protagonistaId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('historial_rama')
    .select('*')
    .eq('protagonista_id', protagonistaId)
    .order('fecha', { ascending: false })
  if (error) dbError(error)
  return data || []
}

// ============================================================
// PAGOS
// ============================================================

export async function getPagosByBeneficiario(beneficiarioId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('pagos')
    .select('*')
    .eq('beneficiario_id', beneficiarioId)
    .order('fecha_pago', { ascending: false })
  if (error) dbError(error)
  return data || []
}

export async function getPago(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('pagos')
    .select('*, beneficiarios(*)')
    .eq('id', id)
    .single()
  if (error) dbError(error)
  return data!
}

export async function getUltimosPagos(limite = 5) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('pagos')
    .select('*, beneficiarios(nombre, apellido, rama)')
    .order('created_at', { ascending: false })
    .limit(limite)
  if (error) dbError(error)
  return data || []
}

// ============================================================
// CAMPAMENTOS
// ============================================================

export async function getCampamentos(soloActivos = false) {
  const supabase = await createServerClient()
  let query = supabase
    .from('campamentos')
    .select('*')
    .order('fecha_inicio', { ascending: true })
  if (soloActivos) query = query.eq('activo', true)
  const { data, error } = await query
  if (error) dbError(error)
  return data || []
}

export async function getCampamento(id: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('campamentos')
    .select('*')
    .eq('id', id)
    .single()
  if (error) dbError(error)
  return data!
}

export async function getProximoCampamento() {
  const supabase = await createServerClient()
  const hoy = new Date().toISOString().split('T')[0]
  const { data } = await supabase
    .from('campamentos')
    .select('*')
    .eq('activo', true)
    .gte('fecha_inicio', hoy)
    .order('fecha_inicio', { ascending: true })
    .limit(1)
    .single()
  return data || null
}

// ============================================================
// MESES ACTIVOS
// ============================================================

export async function getMesesActivos(anio: number) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('meses_activos')
    .select('mes')
    .eq('anio', anio)
    .order('mes', { ascending: true })
  if (error) dbError(error)
  return (data || []).map((r) => r.mes as number)
}

// ============================================================
// EDUCADORES / USUARIOS APP
// ============================================================

export async function getUsuariosApp() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('usuarios_app')
    .select('*')
    .order('nombre', { ascending: true })
  if (error) dbError(error)
  return data || []
}

// ============================================================
// ESTADO DE CUENTA
// ============================================================

export type MovimientoCuenta = {
  id: string
  tipo: 'debito' | 'credito'
  concepto: string
  monto: number
  fecha: string
  referencia?: string
}

export type EstadoCuentaCampamento = {
  campamento: { id: string; nombre: string }
  movimientos: MovimientoCuenta[]
  totalDebitos: number
  totalCreditos: number
  saldo: number
}

export type EstadoCuenta = {
  membresia: {
    movimientos: MovimientoCuenta[]
    totalDebitos: number
    totalCreditos: number
    saldo: number
  }
  campamentos: EstadoCuentaCampamento[]
}

export async function getEstadoCuenta(beneficiarioId: string): Promise<EstadoCuenta> {
  const supabase = await createServerClient()

  const [cuotasRes, pagosRes, notasRes, inscripcionesRes] = await Promise.all([
    supabase
      .from('cuotas_pendientes')
      .select('id, tipo, meses_cubiertos, monto, created_at')
      .eq('beneficiario_id', beneficiarioId)
      .order('created_at', { ascending: false }),
    supabase
      .from('pagos')
      .select('id, tipo, monto, fecha_pago, concepto, campamento_id, periodo_mes, periodo_anio, meses_cubiertos')
      .eq('beneficiario_id', beneficiarioId)
      .order('fecha_pago', { ascending: false }),
    supabase
      .from('notas_credito')
      .select('id, monto, concepto, fecha, campamento_aplicado_id')
      .eq('protagonista_id', beneficiarioId)
      .order('fecha', { ascending: false }),
    supabase
      .from('inscripciones_campamento')
      .select('id, monto, notas, created_at, campamento_id, campamentos(id, nombre)')
      .eq('beneficiario_id', beneficiarioId)
      .order('created_at', { ascending: false }),
  ])

  // ── Membresía ────────────────────────────────────────────
  const movMemb: MovimientoCuenta[] = []

  for (const cp of cuotasRes.data || []) {
    if (cp.tipo === 'mensual' || cp.tipo === 'trimestral') {
      movMemb.push({
        id: `cp-${cp.id}`,
        tipo: 'debito',
        concepto: cp.tipo === 'trimestral' ? 'Cuota trimestral' : 'Cuota mensual',
        monto: Number(cp.monto),
        fecha: cp.created_at,
      })
    }
  }

  for (const p of pagosRes.data || []) {
    if (p.tipo === 'mensual' || p.tipo === 'trimestral') {
      movMemb.push({
        id: `p-${p.id}`,
        tipo: 'credito',
        concepto: p.concepto || (p.tipo === 'trimestral' ? 'Cuota trimestral' : 'Cuota mensual'),
        monto: Number(p.monto),
        fecha: p.fecha_pago,
      })
    }
  }

  for (const n of notasRes.data || []) {
    if (!n.campamento_aplicado_id) {
      movMemb.push({
        id: `n-${n.id}`,
        tipo: 'credito',
        concepto: n.concepto || 'Nota de crédito',
        monto: Number(n.monto),
        fecha: n.fecha,
      })
    }
  }

  movMemb.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
  const debitosMemb = movMemb.filter(m => m.tipo === 'debito').reduce((s, m) => s + m.monto, 0)
  const creditosMemb = movMemb.filter(m => m.tipo === 'credito').reduce((s, m) => s + m.monto, 0)

  // ── Campamentos ──────────────────────────────────────────
  const campMap = new Map<string, EstadoCuentaCampamento>()

  for (const insc of inscripcionesRes.data || []) {
    const camp = insc.campamentos as unknown as { id: string; nombre: string }
    if (!campMap.has(insc.campamento_id)) {
      campMap.set(insc.campamento_id, {
        campamento: { id: camp.id, nombre: camp.nombre },
        movimientos: [],
        totalDebitos: 0,
        totalCreditos: 0,
        saldo: 0,
      })
    }
    campMap.get(insc.campamento_id)!.movimientos.push({
      id: `i-${insc.id}`,
      tipo: 'debito',
      concepto: `Inscripción${insc.notas ? ` — ${insc.notas}` : ''}`,
      monto: Number(insc.monto),
      fecha: insc.created_at,
    })
  }

  for (const p of pagosRes.data || []) {
    if (p.tipo === 'campamento' && p.campamento_id) {
      if (!campMap.has(p.campamento_id)) {
        campMap.set(p.campamento_id, {
          campamento: { id: p.campamento_id, nombre: 'Campamento' },
          movimientos: [],
          totalDebitos: 0,
          totalCreditos: 0,
          saldo: 0,
        })
      }
      campMap.get(p.campamento_id)!.movimientos.push({
        id: `p-${p.id}`,
        tipo: 'credito',
        concepto: p.concepto || 'Pago campamento',
        monto: Number(p.monto),
        fecha: p.fecha_pago,
      })
    }
  }

  for (const n of notasRes.data || []) {
    if (n.campamento_aplicado_id && campMap.has(n.campamento_aplicado_id)) {
      campMap.get(n.campamento_aplicado_id)!.movimientos.push({
        id: `n-${n.id}`,
        tipo: 'credito',
        concepto: n.concepto || 'Nota de crédito',
        monto: Number(n.monto),
        fecha: n.fecha,
      })
    }
  }

  const campamentos = Array.from(campMap.values()).map((c) => {
    c.movimientos.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
    c.totalDebitos = c.movimientos.filter(m => m.tipo === 'debito').reduce((s, m) => s + m.monto, 0)
    c.totalCreditos = c.movimientos.filter(m => m.tipo === 'credito').reduce((s, m) => s + m.monto, 0)
    c.saldo = c.totalCreditos - c.totalDebitos
    return c
  })

  return {
    membresia: {
      movimientos: movMemb,
      totalDebitos: debitosMemb,
      totalCreditos: creditosMemb,
      saldo: creditosMemb - debitosMemb,
    },
    campamentos,
  }
}

// ============================================================
// CUOTAS PENDIENTES
// ============================================================

export async function getCuotasPendientesByBeneficiario(beneficiarioId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('cuotas_pendientes')
    .select('*')
    .eq('beneficiario_id', beneficiarioId)
    .order('fecha_vencimiento', { ascending: true })
  if (error) dbError(error)
  return data || []
}

// ============================================================
// CUOTA CONFIG
// ============================================================

export async function getCuotaActual() {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('cuota_config')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()
  return data || null
}

export async function getHistorialCuota() {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('cuota_config')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) dbError(error)
  return data || []
}

export async function getCurrentUserRole(userId: string) {
  const supabase = await createServerClient()
  const { data } = await supabase
    .from('usuarios_app')
    .select('rol')
    .eq('id', userId)
    .single()
  return data?.rol as string | null
}

// ============================================================
// NOTAS DE CRÉDITO
// ============================================================

export async function getNotasCreditoByProtagonista(protagonistaId: string) {
  const supabase = await createServerClient()
  const { data, error } = await supabase
    .from('notas_credito')
    .select('*')
    .eq('protagonista_id', protagonistaId)
    .order('fecha', { ascending: false })
  if (error) dbError(error)
  return data || []
}

// ============================================================
// DASHBOARD
// ============================================================

export async function getDashboardStats() {
  const supabase = await createServerClient()
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  const [benRes, pagosRes] = await Promise.all([
    supabase.from('beneficiarios').select('activo, rama'),
    supabase.from('pagos').select('monto, fecha_pago, periodo_mes, periodo_anio'),
  ])

  const beneficiarios = benRes.data || []
  const pagos = pagosRes.data || []

  const totalProtagonistas = beneficiarios.length
  const activos = beneficiarios.filter((b) => b.activo).length

  const recaudadoMes = pagos
    .filter((p) => p.periodo_mes === currentMonth && p.periodo_anio === currentYear)
    .reduce((sum, p) => sum + Number(p.monto), 0)

  const recaudadoAnio = pagos
    .filter((p) => p.periodo_anio === currentYear)
    .reduce((sum, p) => sum + Number(p.monto), 0)

  // Protagonistas con deuda (los que no pagaron al menos un mes scout transcurrido)
  const { data: conPagos } = await supabase
    .from('beneficiarios')
    .select('id, nombre, apellido, rama, activo, pagos(periodo_mes, periodo_anio, meses_cubiertos)')
    .eq('activo', true)

  let conDeuda = 0
  const mesesTranscurridos = MESES_SCOUT.filter((m) => m <= currentMonth)

  for (const b of conPagos || []) {
    const estado = calcularEstadoPago(
      (b.pagos || []) as never,
      currentYear,
      currentMonth
    )
    if (estado === 'adeuda' && mesesTranscurridos.length > 0) conDeuda++
  }

  // Resumen por rama
  const resumenRama: Record<string, { total: number; activos: number }> = {}
  for (const b of beneficiarios) {
    if (!resumenRama[b.rama]) resumenRama[b.rama] = { total: 0, activos: 0 }
    resumenRama[b.rama].total++
    if (b.activo) resumenRama[b.rama].activos++
  }

  return {
    totalProtagonistas,
    activos,
    recaudadoMes,
    recaudadoAnio,
    conDeuda,
    resumenRama,
  }
}
