'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerClient } from './supabase/server'
import { createAdminClient } from './supabase/admin'
import type { Rama, MetodoPago, TipoPago, TipoCuota, RolUsuario } from './types'

function dbError(error: { message: string; hint?: string }): never {
  throw new Error(
    `Error de base de datos: ${error.message}${error.hint ? ` (${error.hint})` : ''}`
  )
}

function revalidateProtagonistas(id?: string) {
  revalidatePath('/protagonistas')
  revalidatePath('/beneficiarios')
  if (id) {
    revalidatePath(`/protagonistas/${id}`)
    revalidatePath(`/beneficiarios/${id}`)
  }
  revalidatePath('/')
}

// ============================================================
// PROTAGONISTAS
// ============================================================

export async function createBeneficiario(formData: FormData) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('beneficiarios').insert({
    nombre: formData.get('nombre') as string,
    apellido: formData.get('apellido') as string,
    dni: (formData.get('dni') as string) || null,
    email: (formData.get('email') as string) || null,
    telefono: (formData.get('telefono') as string) || null,
    mail_contacto: (formData.get('mail_contacto') as string) || null,
    telefono_contacto: (formData.get('telefono_contacto') as string) || null,
    religion: (formData.get('religion') as string) || null,
    rama: formData.get('rama') as Rama,
    fecha_ingreso: formData.get('fecha_ingreso') as string,
    tipo_cuota: (formData.get('tipo_cuota') as TipoCuota) || 'mensual',
    activo: true,
  })
  if (error) dbError(error)
  revalidateProtagonistas()
  redirect('/protagonistas')
}

export async function updateBeneficiario(id: string, formData: FormData) {
  const supabase = await createServerClient()

  const ramaAnteriorRaw = formData.get('rama_anterior') as string | null
  const ramaNueva = formData.get('rama') as Rama

  const { error } = await supabase
    .from('beneficiarios')
    .update({
      nombre: formData.get('nombre') as string,
      apellido: formData.get('apellido') as string,
      dni: (formData.get('dni') as string) || null,
      email: (formData.get('email') as string) || null,
      telefono: (formData.get('telefono') as string) || null,
      mail_contacto: (formData.get('mail_contacto') as string) || null,
      telefono_contacto: (formData.get('telefono_contacto') as string) || null,
      religion: (formData.get('religion') as string) || null,
      rama: ramaNueva,
      fecha_ingreso: formData.get('fecha_ingreso') as string,
      tipo_cuota: (formData.get('tipo_cuota') as TipoCuota) || 'mensual',
      activo: formData.get('activo') !== 'false',
    })
    .eq('id', id)
  if (error) dbError(error)

  if (ramaAnteriorRaw && ramaAnteriorRaw !== ramaNueva) {
    await supabase.from('historial_rama').insert({
      protagonista_id: id,
      rama_anterior: ramaAnteriorRaw,
      rama_nueva: ramaNueva,
      notas: `Actualizado desde formulario de edición`,
    })
  }

  revalidateProtagonistas(id)
  redirect(`/protagonistas/${id}`)
}

export async function deleteBeneficiario(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from('beneficiarios').delete().eq('id', id)
  if (error) dbError(error)
  revalidateProtagonistas()
  redirect('/protagonistas')
}

// ============================================================
// PASO DE RAMA
// ============================================================

export async function registrarPasoDeRama(formData: FormData) {
  const supabase = await createServerClient()
  const protagonistaId = formData.get('protagonista_id') as string
  const ramaAnterior = formData.get('rama_anterior') as Rama
  const ramaNueva = formData.get('rama_nueva') as Rama
  const notas = (formData.get('notas') as string) || null

  if (ramaAnterior === ramaNueva) {
    throw new Error('La rama nueva debe ser diferente a la actual')
  }

  const { error: errUpdate } = await supabase
    .from('beneficiarios')
    .update({ rama: ramaNueva })
    .eq('id', protagonistaId)
  if (errUpdate) dbError(errUpdate)

  const { error: errHistorial } = await supabase.from('historial_rama').insert({
    protagonista_id: protagonistaId,
    rama_anterior: ramaAnterior,
    rama_nueva: ramaNueva,
    notas,
  })
  if (errHistorial) dbError(errHistorial)

  revalidateProtagonistas(protagonistaId)
  redirect(`/protagonistas/${protagonistaId}`)
}

// ============================================================
// PAGOS
// ============================================================

export async function createPago(formData: FormData) {
  const supabase = await createServerClient()
  const beneficiarioId = formData.get('beneficiario_id') as string
  const tipo = (formData.get('tipo') as TipoPago) || 'mensual'

  let mesesCubiertos: string[] | null = null
  if (tipo === 'trimestral') {
    const raw = formData.get('meses_cubiertos') as string
    mesesCubiertos = raw ? raw.split(',').map((s) => s.trim()) : null
  } else {
    const mes = formData.get('periodo_mes') as string
    const anio = formData.get('periodo_anio') as string
    if (mes && anio) {
      mesesCubiertos = [`${anio}-${String(mes).padStart(2, '0')}`]
    }
  }

  const { data, error } = await supabase
    .from('pagos')
    .insert({
      beneficiario_id: beneficiarioId,
      monto: parseFloat(formData.get('monto') as string),
      fecha_pago: formData.get('fecha_pago') as string,
      periodo_mes: parseInt(formData.get('periodo_mes') as string),
      periodo_anio: parseInt(formData.get('periodo_anio') as string),
      concepto: (formData.get('concepto') as string) || 'Cuota de membresía',
      metodo_pago: formData.get('metodo_pago') as MetodoPago,
      tipo,
      meses_cubiertos: mesesCubiertos,
      campamento_id: (formData.get('campamento_id') as string) || null,
      notas: (formData.get('notas') as string) || null,
    })
    .select()
    .single()
  if (error) dbError(error)

  await supabase.from('auditoria_pagos').insert({
    pago_id: data!.id,
    accion: 'crear',
    datos_nuevos: data,
  })

  // Marcar cuota pendiente como pagada si coincide
  if (mesesCubiertos && mesesCubiertos.length > 0) {
    const { data: pendientes } = await supabase
      .from('cuotas_pendientes')
      .select('id, meses_cubiertos')
      .eq('beneficiario_id', beneficiarioId)
      .eq('estado', 'pendiente')
    if (pendientes) {
      for (const cp of pendientes) {
        const cubre = mesesCubiertos.every((m: string) => cp.meses_cubiertos.includes(m))
        if (cubre) {
          await supabase
            .from('cuotas_pendientes')
            .update({ estado: 'pagado', pago_id: data!.id })
            .eq('id', cp.id)
          break
        }
      }
    }
  }

  revalidateProtagonistas(beneficiarioId)
  redirect(`/pagos/${data!.id}/comprobante`)
}

// ============================================================
// CAMPAMENTOS
// ============================================================

export async function createCampamento(formData: FormData) {
  const supabase = await createServerClient()
  const rama = formData.get('rama') as string
  const precioEstimado = parseFloat(formData.get('precio_estimado') as string) || 0

  const { data: camp, error } = await supabase
    .from('campamentos')
    .insert({
      nombre: formData.get('nombre') as string,
      fecha_inicio: formData.get('fecha_inicio') as string,
      fecha_fin: formData.get('fecha_fin') as string,
      precio_estimado: precioEstimado || null,
      rama,
      descripcion: (formData.get('descripcion') as string) || null,
      activo: true,
    })
    .select('id')
    .single()
  if (error) dbError(error)

  // Auto-inscribir protagonistas activos de la rama correspondiente
  let query = supabase.from('beneficiarios').select('id').eq('activo', true)
  if (rama !== 'Grupal' && rama !== 'Ambas') query = query.eq('rama', rama)
  const { data: protagonistas } = await query

  if (protagonistas?.length) {
    await supabase.from('inscripciones_campamento').insert(
      protagonistas.map((p) => ({
        beneficiario_id: p.id,
        campamento_id: camp!.id,
        monto: precioEstimado,
      }))
    )
  }

  revalidatePath('/campamentos')
  revalidatePath('/protagonistas')
  revalidatePath('/')
  redirect('/campamentos')
}

// ============================================================
// EDUCADORES / USUARIOS APP
// ============================================================

export async function createEducador(formData: FormData) {
  const nombre = formData.get('nombre') as string
  const rol = formData.get('rol') as RolUsuario
  const rama = (formData.get('rama') as string) || null
  const email = (formData.get('email') as string) || null
  const password = (formData.get('password') as string) || null

  const admin = createAdminClient()

  // Crear usuario en Supabase Auth si tiene credenciales
  let userId: string
  if (email && password) {
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })
    if (authError) throw new Error(`Error al crear acceso: ${authError.message}`)
    userId = authData.user.id
  } else {
    throw new Error('Email y contraseña son obligatorios')
  }

  // Insertar en usuarios_app
  const { error } = await admin.from('usuarios_app').insert({
    id: userId,
    nombre,
    rol,
    rama,
    activo: true,
  })
  if (error) {
    // Rollback: eliminar el usuario de Auth si falla la inserción
    await admin.auth.admin.deleteUser(userId)
    throw new Error(`Error al guardar educador: ${error.message}`)
  }

  revalidatePath('/educadores')
  redirect('/educadores')
}

export async function deleteEducador(id: string) {
  const admin = createAdminClient()
  // Eliminar de Auth (CASCADE elimina usuarios_app por la FK)
  const { error } = await admin.auth.admin.deleteUser(id)
  if (error) throw new Error(`Error al eliminar: ${error.message}`)
  revalidatePath('/educadores')
  redirect('/educadores')
}

// ============================================================
// INSCRIPCIONES CAMPAMENTO
// ============================================================

export async function inscribirCampamento(formData: FormData) {
  const supabase = await createServerClient()
  const beneficiarioId = formData.get('beneficiario_id') as string
  const campamentoId = formData.get('campamento_id') as string
  const monto = parseFloat(formData.get('monto') as string)
  const notas = (formData.get('notas') as string) || null

  const { error } = await supabase.from('inscripciones_campamento').insert({
    beneficiario_id: beneficiarioId,
    campamento_id: campamentoId,
    monto,
    notas,
  })
  if (error) dbError(error)

  revalidateProtagonistas(beneficiarioId)
  revalidatePath(`/campamentos/${campamentoId}`)
  redirect(`/protagonistas/${beneficiarioId}`)
}

export async function desInscribirCampamento(inscripcionId: string, beneficiarioId: string, campamentoId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('inscripciones_campamento')
    .delete()
    .eq('id', inscripcionId)
  if (error) dbError(error)

  revalidateProtagonistas(beneficiarioId)
  revalidatePath(`/campamentos/${campamentoId}`)
  redirect(`/protagonistas/${beneficiarioId}`)
}

// ============================================================
// CUOTA CONFIG
// ============================================================

export async function updateCuota(formData: FormData) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: userData } = await supabase
    .from('usuarios_app')
    .select('rol')
    .eq('id', user.id)
    .single()
  if (userData?.rol !== 'admin') throw new Error('Solo los administradores pueden configurar la cuota')

  const montoTrimestralMes = formData.get('monto_trimestral_mes') as string
  const { error } = await supabase.from('cuota_config').insert({
    monto: parseFloat(formData.get('monto') as string),
    monto_trimestral_mes: montoTrimestralMes ? parseFloat(montoTrimestralMes) : null,
    descripcion: (formData.get('descripcion') as string) || null,
  })
  if (error) dbError(error)
  revalidatePath('/configuracion')
  revalidatePath('/')
}

export async function updateCampamento(id: string, formData: FormData) {
  const supabase = await createServerClient()
  const { error } = await supabase
    .from('campamentos')
    .update({
      nombre: formData.get('nombre') as string,
      fecha_inicio: formData.get('fecha_inicio') as string,
      fecha_fin: formData.get('fecha_fin') as string,
      precio_estimado: parseFloat(formData.get('precio_estimado') as string) || null,
      rama: formData.get('rama') as string,
      descripcion: (formData.get('descripcion') as string) || null,
      activo: formData.get('activo') !== 'false',
    })
    .eq('id', id)
  if (error) dbError(error)
  revalidatePath('/campamentos')
  revalidatePath(`/campamentos/${id}`)
  redirect(`/campamentos/${id}`)
}
