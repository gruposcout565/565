import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { enviarAvisoCuota } from '@/lib/email'

function pad(n: number) {
  return String(n).padStart(2, '0')
}

// Semestral 1: Apr–Jul, vence 10 de mayo
// Semestral 2: Ago–Nov, vence 10 de sep
const SEMESTRES = {
  semestral_1: { mes_inicio: 4, meses: [4, 5, 6, 7], vencimiento: '05-10' },
  semestral_2: { mes_inicio: 8, meses: [8, 9, 10, 11], vencimiento: '09-10' },
}

type CuotaConfig = {
  monto: number
  monto_hermano1: number | null
  monto_hermano2: number | null
  monto_semestral1: number | null
  monto_semestral1_hermano1: number | null
  monto_semestral1_hermano2: number | null
  monto_semestral2: number | null
  monto_semestral2_hermano1: number | null
  monto_semestral2_hermano2: number | null
}

function calcularMonto(cuota: CuotaConfig, tipo: string, ordenHermano: number): number {
  const esH1 = ordenHermano === 2
  const esH2 = ordenHermano >= 3

  if (tipo === 'mensual') {
    if (esH2) return cuota.monto_hermano2 ?? cuota.monto
    if (esH1) return cuota.monto_hermano1 ?? cuota.monto
    return cuota.monto
  }
  if (tipo === 'semestral_1') {
    if (esH2) return cuota.monto_semestral1_hermano2 ?? cuota.monto_semestral1 ?? cuota.monto
    if (esH1) return cuota.monto_semestral1_hermano1 ?? cuota.monto_semestral1 ?? cuota.monto
    return cuota.monto_semestral1 ?? cuota.monto
  }
  if (tipo === 'semestral_2') {
    if (esH2) return cuota.monto_semestral2_hermano2 ?? cuota.monto_semestral2 ?? cuota.monto
    if (esH1) return cuota.monto_semestral2_hermano1 ?? cuota.monto_semestral2 ?? cuota.monto
    return cuota.monto_semestral2 ?? cuota.monto
  }
  return cuota.monto
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const mes = now.getMonth() + 1
  const anio = now.getFullYear()

  // Período scout: abril a noviembre
  const MESES_SCOUT = [4, 5, 6, 7, 8, 9, 10, 11]
  if (!MESES_SCOUT.includes(mes)) {
    return NextResponse.json({
      message: `Mes ${mes} fuera del período scout (abril–noviembre). Sin cuotas generadas.`,
      created: 0,
    })
  }

  const { data: cuota } = await supabase
    .from('cuota_config')
    .select('monto, monto_hermano1, monto_hermano2, monto_semestral1, monto_semestral1_hermano1, monto_semestral1_hermano2, monto_semestral2, monto_semestral2_hermano1, monto_semestral2_hermano2')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!cuota) {
    return NextResponse.json({ error: 'No hay cuota configurada' }, { status: 500 })
  }

  const { data: protagonistas } = await supabase
    .from('beneficiarios')
    .select('id, tipo_cuota, orden_hermano, nombre, apellido, email, mail_contacto')
    .eq('activo', true)

  if (!protagonistas?.length) {
    return NextResponse.json({ message: 'Sin protagonistas activos', created: 0 })
  }

  let created = 0

  for (const p of protagonistas) {
    const tipoCuota = (p.tipo_cuota || 'mensual') as string
    const ordenHermano: number = p.orden_hermano || 1

    if (tipoCuota === 'mensual') {
      const mesClave = `${anio}-${pad(mes)}`

      const { data: existing } = await supabase
        .from('cuotas_pendientes')
        .select('id')
        .eq('beneficiario_id', p.id)
        .eq('tipo', 'mensual')
        .contains('meses_cubiertos', [mesClave])
        .maybeSingle()

      if (!existing) {
        const monto = calcularMonto(cuota, 'mensual', ordenHermano)
        const nuevaCuota = {
          beneficiario_id: p.id,
          tipo: 'mensual',
          meses_cubiertos: [mesClave],
          monto,
          fecha_vencimiento: `${anio}-${pad(mes)}-10`,
        }
        await supabase.from('cuotas_pendientes').insert(nuevaCuota)
        created++
        await enviarAvisoCuota(p, nuevaCuota)
      }
    } else if (tipoCuota === 'semestral_1' || tipoCuota === 'semestral_2') {
      const semConfig = SEMESTRES[tipoCuota as keyof typeof SEMESTRES]

      // Solo generar en el mes de inicio del semestre
      if (mes !== semConfig.mes_inicio) continue

      const mesClave = `${anio}-${pad(semConfig.mes_inicio)}`

      const { data: existing } = await supabase
        .from('cuotas_pendientes')
        .select('id')
        .eq('beneficiario_id', p.id)
        .eq('tipo', tipoCuota)
        .contains('meses_cubiertos', [mesClave])
        .maybeSingle()

      if (!existing) {
        const monto = calcularMonto(cuota, tipoCuota, ordenHermano)
        const mesesCubiertos = semConfig.meses.map((m) => `${anio}-${pad(m)}`)
        const nuevaCuota = {
          beneficiario_id: p.id,
          tipo: tipoCuota,
          meses_cubiertos: mesesCubiertos,
          monto,
          fecha_vencimiento: `${anio}-${semConfig.vencimiento}`,
        }
        await supabase.from('cuotas_pendientes').insert(nuevaCuota)
        created++
        await enviarAvisoCuota(p, nuevaCuota)
      }
    }
  }

  return NextResponse.json({
    message: `Cron ejecutado: ${created} cuota(s) generada(s)`,
    mes,
    anio,
    created,
  })
}
