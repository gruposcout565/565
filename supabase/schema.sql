-- Grupo Scout Niño Jesús de Praga — Grupo 565
-- Schema completo (estado actual + migraciones)
-- Ejecutar en orden en Supabase SQL Editor

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- MIGRATION 1A — Tabla beneficiarios (protagonistas en la UI)
-- NOTA: La tabla se llama 'beneficiarios' internamente;
--       la UI muestra "Protagonistas" como nomenclatura.
-- ============================================================
CREATE TABLE IF NOT EXISTS beneficiarios (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT,
  email TEXT,
  telefono TEXT,
  mail_contacto TEXT,
  telefono_contacto TEXT,
  rama TEXT NOT NULL DEFAULT 'Lobatos y Lobeznas'
    CHECK (rama IN ('Lobatos y Lobeznas', 'Scouts', 'Caminantes', 'Rovers')),
  fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si la tabla ya existe, aplicar los cambios incrementalmente:
ALTER TABLE beneficiarios ADD COLUMN IF NOT EXISTS tipo_cuota TEXT NOT NULL DEFAULT 'mensual'
  CHECK (tipo_cuota IN ('mensual', 'trimestral'));
ALTER TABLE beneficiarios DROP CONSTRAINT IF EXISTS beneficiarios_rama_check;
UPDATE beneficiarios SET rama = 'Educadores' WHERE rama = 'Dirigentes';
UPDATE beneficiarios SET rama = 'Lobatos y Lobeznas' WHERE rama IN ('Lobatos', 'Lobeznos');
ALTER TABLE beneficiarios
  ADD CONSTRAINT beneficiarios_rama_check
    CHECK (rama IN ('Lobatos y Lobeznas', 'Scouts', 'Caminantes', 'Rovers'));
ALTER TABLE beneficiarios ADD COLUMN IF NOT EXISTS mail_contacto TEXT;
ALTER TABLE beneficiarios ADD COLUMN IF NOT EXISTS telefono_contacto TEXT;
ALTER TABLE beneficiarios ADD COLUMN IF NOT EXISTS religion TEXT;

CREATE INDEX IF NOT EXISTS idx_beneficiarios_activo ON beneficiarios(activo);
CREATE INDEX IF NOT EXISTS idx_beneficiarios_rama ON beneficiarios(rama);

ALTER TABLE beneficiarios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on beneficiarios" ON beneficiarios;
CREATE POLICY "Allow all on beneficiarios" ON beneficiarios FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1B — historial_rama
-- ============================================================
CREATE TABLE IF NOT EXISTS historial_rama (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  protagonista_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  rama_anterior TEXT NOT NULL,
  rama_nueva TEXT NOT NULL,
  notas TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_historial_rama_protagonista ON historial_rama(protagonista_id);
ALTER TABLE historial_rama ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on historial_rama" ON historial_rama;
CREATE POLICY "Allow all on historial_rama" ON historial_rama FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1C — campamentos
-- ============================================================
CREATE TABLE IF NOT EXISTS campamentos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  nombre TEXT NOT NULL,
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  precio_estimado DECIMAL(10,2),
  rama TEXT NOT NULL DEFAULT 'Grupal'
    CHECK (rama IN ('Lobatos y Lobeznas', 'Scouts', 'Caminantes', 'Rovers', 'Grupal', 'Ambas')),
  descripcion TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si la tabla ya existe, migrar rama:
ALTER TABLE campamentos DROP CONSTRAINT IF EXISTS campamentos_rama_check;
ALTER TABLE campamentos ADD CONSTRAINT campamentos_rama_check
  CHECK (rama IN ('Lobatos y Lobeznas', 'Scouts', 'Caminantes', 'Rovers', 'Grupal', 'Ambas'));

ALTER TABLE campamentos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on campamentos" ON campamentos;
CREATE POLICY "Allow all on campamentos" ON campamentos FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1D — meses_activos
-- Períodos válidos: abril (4) a noviembre (11) de cada año
-- ============================================================
CREATE TABLE IF NOT EXISTS meses_activos (
  anio INTEGER NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  PRIMARY KEY (anio, mes)
);

ALTER TABLE meses_activos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on meses_activos" ON meses_activos;
CREATE POLICY "Allow all on meses_activos" ON meses_activos FOR ALL USING (true) WITH CHECK (true);

-- Poblar meses activos (abril a noviembre)
INSERT INTO meses_activos (anio, mes)
VALUES
  (2025, 4),(2025, 5),(2025, 6),(2025, 7),
  (2025, 8),(2025, 9),(2025, 10),(2025, 11),
  (2026, 4),(2026, 5),(2026, 6),(2026, 7),
  (2026, 8),(2026, 9),(2026, 10),(2026, 11)
ON CONFLICT DO NOTHING;

-- ============================================================
-- MIGRATION 1E — Modificar tabla pagos
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  beneficiario_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  numero_comprobante BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
  monto DECIMAL(10, 2) NOT NULL,
  fecha_pago DATE NOT NULL DEFAULT CURRENT_DATE,
  periodo_mes INTEGER NOT NULL CHECK (periodo_mes BETWEEN 1 AND 12),
  periodo_anio INTEGER NOT NULL,
  concepto TEXT NOT NULL DEFAULT 'Cuota de membresía',
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Cheque')),
  tipo TEXT NOT NULL DEFAULT 'mensual'
    CHECK (tipo IN ('mensual', 'trimestral', 'campamento')),
  meses_cubiertos TEXT[],
  campamento_id UUID,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si ya existe, agregar columnas:
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS tipo TEXT NOT NULL DEFAULT 'mensual'
  CHECK (tipo IN ('mensual', 'trimestral', 'campamento'));
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS meses_cubiertos TEXT[];
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS campamento_id UUID REFERENCES campamentos(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_pagos_beneficiario_id ON pagos(beneficiario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_fecha_pago ON pagos(fecha_pago);
CREATE INDEX IF NOT EXISTS idx_pagos_tipo ON pagos(tipo);

ALTER TABLE pagos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on pagos" ON pagos;
CREATE POLICY "Allow all on pagos" ON pagos FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1F — comprobantes
-- ============================================================
CREATE TABLE IF NOT EXISTS comprobantes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  protagonista_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  pago_id UUID REFERENCES pagos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL DEFAULT 'cuota_mensual'
    CHECK (tipo IN ('cuota_mensual', 'cuota_trimestral', 'campamento')),
  numero_comprobante BIGINT GENERATED ALWAYS AS IDENTITY UNIQUE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  monto DECIMAL(10,2) NOT NULL,
  enviado_mail BOOLEAN NOT NULL DEFAULT false,
  enviado_wsp BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_comprobantes_protagonista ON comprobantes(protagonista_id);
CREATE INDEX IF NOT EXISTS idx_comprobantes_pago ON comprobantes(pago_id);
ALTER TABLE comprobantes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on comprobantes" ON comprobantes;
CREATE POLICY "Allow all on comprobantes" ON comprobantes FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1G — notas_credito
-- ============================================================
CREATE TABLE IF NOT EXISTS notas_credito (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  protagonista_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  concepto TEXT NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  saldo_restante DECIMAL(10,2) NOT NULL,
  campamento_aplicado_id UUID REFERENCES campamentos(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notas_credito_protagonista ON notas_credito(protagonista_id);
ALTER TABLE notas_credito ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on notas_credito" ON notas_credito;
CREATE POLICY "Allow all on notas_credito" ON notas_credito FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1H — auditoria_pagos
-- ============================================================
CREATE TABLE IF NOT EXISTS auditoria_pagos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  pago_id UUID REFERENCES pagos(id) ON DELETE SET NULL,
  accion TEXT NOT NULL CHECK (accion IN ('crear', 'editar', 'eliminar')),
  datos_anteriores JSONB,
  datos_nuevos JSONB,
  ip TEXT,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_auditoria_pago ON auditoria_pagos(pago_id);
CREATE INDEX IF NOT EXISTS idx_auditoria_fecha ON auditoria_pagos(fecha);
ALTER TABLE auditoria_pagos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on auditoria_pagos" ON auditoria_pagos;
CREATE POLICY "Allow all on auditoria_pagos" ON auditoria_pagos FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1I — usuarios_app (requiere Supabase Auth activo)
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios_app (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'readonly'
    CHECK (rol IN ('admin', 'educador', 'readonly')),
  rama TEXT CHECK (rama IN ('Lobatos y Lobeznas', 'Scouts', 'Caminantes', 'Rovers', 'Educadores', 'Ambas')),
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE usuarios_app ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on usuarios_app" ON usuarios_app;
CREATE POLICY "Allow all on usuarios_app" ON usuarios_app FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1J — cuota_config
-- Historial de montos de cuota. El vigente es el último registro.
-- ============================================================
CREATE TABLE IF NOT EXISTS cuota_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  monto DECIMAL(10,2) NOT NULL,
  monto_trimestral_mes DECIMAL(10,2),
  descripcion TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Si la tabla ya existe, agregar columna:
ALTER TABLE cuota_config ADD COLUMN IF NOT EXISTS monto_trimestral_mes DECIMAL(10,2);

ALTER TABLE cuota_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on cuota_config" ON cuota_config;
CREATE POLICY "Allow all on cuota_config" ON cuota_config FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1K — inscripciones_campamento
-- Genera la deuda del protagonista hacia un campamento
-- ============================================================
CREATE TABLE IF NOT EXISTS inscripciones_campamento (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  beneficiario_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  campamento_id UUID NOT NULL REFERENCES campamentos(id) ON DELETE CASCADE,
  monto DECIMAL(10,2) NOT NULL,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(beneficiario_id, campamento_id)
);

CREATE INDEX IF NOT EXISTS idx_inscripciones_beneficiario ON inscripciones_campamento(beneficiario_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_campamento ON inscripciones_campamento(campamento_id);
ALTER TABLE inscripciones_campamento ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on inscripciones_campamento" ON inscripciones_campamento;
CREATE POLICY "Allow all on inscripciones_campamento" ON inscripciones_campamento FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- MIGRATION 1L — cuotas_pendientes
-- Generadas por cron el 1ro de cada mes
-- ============================================================
CREATE TABLE IF NOT EXISTS cuotas_pendientes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  beneficiario_id UUID NOT NULL REFERENCES beneficiarios(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL CHECK (tipo IN ('mensual', 'trimestral')),
  meses_cubiertos TEXT[] NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE NOT NULL,
  pago_id UUID REFERENCES pagos(id) ON DELETE SET NULL,
  estado TEXT NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente', 'pagado', 'vencido')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cuotas_pendientes_beneficiario ON cuotas_pendientes(beneficiario_id);
CREATE INDEX IF NOT EXISTS idx_cuotas_pendientes_estado ON cuotas_pendientes(estado);
ALTER TABLE cuotas_pendientes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all on cuotas_pendientes" ON cuotas_pendientes;
CREATE POLICY "Allow all on cuotas_pendientes" ON cuotas_pendientes FOR ALL USING (true) WITH CHECK (true);

-- Insertar monto inicial si la tabla está vacía
INSERT INTO cuota_config (monto, monto_trimestral_mes, descripcion)
SELECT 0, 0, 'Monto inicial'
WHERE NOT EXISTS (SELECT 1 FROM cuota_config);
