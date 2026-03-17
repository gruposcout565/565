---
name: proyecto_scout_565
description: Sistema de gestión de membresías para el Grupo Scout 565
type: project
---

Sistema de gestión para Grupo Scout 565, construido con Next.js 16 + Supabase.

**Why:** El grupo necesita gestionar una lista de beneficiarios (miembros) y generar comprobantes de pago por membresía.

**How to apply:** Al proponer cambios, mantener el stack Next.js App Router + Server Actions + Supabase service role key en servidor.

## Stack
- Next.js 16 (App Router, Turbopack)
- Supabase (PostgreSQL)
- Tailwind CSS v4
- TypeScript

## Estructura clave
- `lib/data.ts` — funciones de lectura (llamadas desde Server Components)
- `lib/actions.ts` — Server Actions para mutations (create/update/delete)
- `lib/supabase/server.ts` — cliente Supabase con service role key
- `supabase/schema.sql` — schema a ejecutar en Supabase

## Tablas Supabase
- `beneficiarios`: id, nombre, apellido, dni, email, telefono, rama, fecha_ingreso, activo
- `pagos`: id, beneficiario_id, numero_comprobante (auto-identity), monto, fecha_pago, periodo_mes, periodo_anio, concepto, metodo_pago, notas

## Ramas del grupo
Lobatos, Scouts, Caminantes, Rovers, Dirigentes

## Pendiente para el usuario
1. Crear proyecto en Supabase en https://supabase.com
2. Copiar `.env.local.example` → `.env.local` y completar las 3 variables
3. Ejecutar `supabase/schema.sql` en el SQL Editor de Supabase
4. Correr `npm run dev`
