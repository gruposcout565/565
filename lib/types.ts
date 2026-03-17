// ============================================================
// TIPOS BASE
// ============================================================

export type Rama = 'Lobatos y Lobeznas' | 'Scouts' | 'Caminantes' | 'Rovers'
export type TipoCuota = 'mensual' | 'trimestral'
export type RamaCampamento = 'Lobatos y Lobeznas' | 'Scouts' | 'Caminantes' | 'Rovers' | 'Grupal'
export type MetodoPago = 'Efectivo' | 'Transferencia' | 'Cheque'
export type TipoPago = 'mensual' | 'trimestral' | 'campamento'
export type TipoComprobante = 'cuota_mensual' | 'cuota_trimestral' | 'campamento'
export type RolUsuario = 'admin' | 'educador' | 'readonly'
export type EstadoPago = 'al_dia' | 'adeuda' | 'adelantado'

// ============================================================
// CONSTANTES DE UI
// ============================================================

export const RAMAS: Rama[] = ['Lobatos y Lobeznas', 'Scouts', 'Caminantes', 'Rovers']
export const RAMAS_CAMPAMENTO: RamaCampamento[] = ['Lobatos y Lobeznas', 'Scouts', 'Caminantes', 'Rovers', 'Grupal']
export const METODOS_PAGO: MetodoPago[] = ['Efectivo', 'Transferencia', 'Cheque']
export const TIPOS_PAGO: { value: TipoPago; label: string }[] = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'campamento', label: 'Campamento' },
]
export const ROLES_USUARIO: RolUsuario[] = ['admin', 'educador', 'readonly']
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]
// Meses scout activos: abril (4) a noviembre (11)
export const MESES_SCOUT = [4, 5, 6, 7, 8, 9, 10, 11]

export const RAMA_COLORS: Record<Rama, string> = {
  'Lobatos y Lobeznas': 'bg-yellow-100 text-yellow-800',
  Scouts:    'bg-green-100 text-green-800',
  Caminantes:'bg-blue-100 text-blue-800',
  Rovers:    'bg-purple-100 text-purple-800',
}

export const ESTADO_PAGO_STYLES: Record<EstadoPago, { label: string; className: string }> = {
  al_dia:     { label: 'Al día',     className: 'bg-green-100 text-green-800' },
  adeuda:     { label: 'Adeuda',     className: 'bg-amber-100 text-amber-800' },
  adelantado: { label: 'Adelantado', className: 'bg-blue-100 text-blue-800' },
}

// ============================================================
// INTERFACES — PROTAGONISTAS (tabla: beneficiarios)
// ============================================================

export interface Protagonista {
  id: string
  nombre: string
  apellido: string
  dni?: string
  email?: string
  telefono?: string
  mail_contacto?: string
  telefono_contacto?: string
  rama: Rama
  fecha_ingreso: string
  activo: boolean
  tipo_cuota: TipoCuota
  created_at: string
}

/** Alias de compatibilidad con código anterior */
export type Beneficiario = Protagonista

// ============================================================
// INTERFACES — PAGOS
// ============================================================

export interface Pago {
  id: string
  beneficiario_id: string
  numero_comprobante: number
  monto: number
  fecha_pago: string
  periodo_mes: number
  periodo_anio: number
  concepto: string
  metodo_pago: MetodoPago
  tipo: TipoPago
  meses_cubiertos?: string[]
  campamento_id?: string
  notas?: string
  created_at: string
  beneficiarios?: Protagonista
}

// ============================================================
// INTERFACES — HISTORIAL DE RAMA
// ============================================================

export interface HistorialRama {
  id: string
  protagonista_id: string
  rama_anterior: Rama
  rama_nueva: Rama
  notas?: string
  fecha: string
}

// ============================================================
// INTERFACES — CAMPAMENTOS
// ============================================================

export interface Campamento {
  id: string
  nombre: string
  fecha_inicio: string
  fecha_fin: string
  precio_estimado?: number
  rama: RamaCampamento
  descripcion?: string
  activo: boolean
  created_at: string
}

// ============================================================
// INTERFACES — MESES ACTIVOS
// ============================================================

export interface MesActivo {
  anio: number
  mes: number
}

// ============================================================
// INTERFACES — COMPROBANTES
// ============================================================

export interface Comprobante {
  id: string
  protagonista_id: string
  pago_id?: string
  tipo: TipoComprobante
  numero_comprobante: number
  fecha: string
  monto: number
  enviado_mail: boolean
  enviado_wsp: boolean
  created_at: string
  beneficiarios?: Protagonista
  pagos?: Pago
}

// ============================================================
// INTERFACES — NOTAS DE CRÉDITO
// ============================================================

export interface NotaCredito {
  id: string
  protagonista_id: string
  monto: number
  concepto: string
  fecha: string
  saldo_restante: number
  campamento_aplicado_id?: string
  created_at: string
  beneficiarios?: Protagonista
}

// ============================================================
// INTERFACES — AUDITORÍA
// ============================================================

export interface AuditoriaPago {
  id: string
  pago_id?: string
  accion: 'crear' | 'editar' | 'eliminar'
  datos_anteriores?: Record<string, unknown>
  datos_nuevos?: Record<string, unknown>
  ip?: string
  fecha: string
}

// ============================================================
// INTERFACES — USUARIOS
// ============================================================

export interface UsuarioApp {
  id: string
  nombre: string
  rol: RolUsuario
  rama?: string
  activo: boolean
  created_at: string
}

// ============================================================
// HELPERS
// ============================================================

/** Calcula el estado de pago de un protagonista para un año dado */
export function calcularEstadoPago(
  pagos: Pago[],
  anio: number,
  mesActual: number
): EstadoPago {
  const mesesTranscurridos = MESES_SCOUT.filter((m) => m <= mesActual)
  const mesesFuturos = MESES_SCOUT.filter((m) => m > mesActual)

  // Coleccionar todos los meses cubiertos por los pagos del año
  const mesesPagados = new Set<number>()
  for (const pago of pagos) {
    if (pago.meses_cubiertos && pago.meses_cubiertos.length > 0) {
      for (const mc of pago.meses_cubiertos) {
        const [a, m] = mc.split('-').map(Number)
        if (a === anio) mesesPagados.add(m)
      }
    } else if (pago.periodo_anio === anio) {
      mesesPagados.add(pago.periodo_mes)
    }
  }

  const tieneDeuda = mesesTranscurridos.some((m) => !mesesPagados.has(m))
  const tieneAdelanto = mesesFuturos.some((m) => mesesPagados.has(m))

  if (tieneDeuda) return 'adeuda'
  if (tieneAdelanto && !tieneDeuda) return 'adelantado'
  return 'al_dia'
}
