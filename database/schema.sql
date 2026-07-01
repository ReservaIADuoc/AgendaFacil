-- ============================================================
-- AGENDAFÁCIL – PostgreSQL 16 Schema + Seed Data
-- Author: Senior Data Architect (AgendaFácil)
-- Target: Railway PostgreSQL 16
-- Revisión: v1.0 – Diseño Completo + Datos Realistas
-- ============================================================
-- CONVENCIONES:
--   * Todas las PK son UUID v4 (gen_random_uuid())
--   * Timestamps siempre en UTC (TIMESTAMPTZ)
--   * ENUMs tipados en PostgreSQL para integridad referencial fuerte
--   * Todos los archivos binarios se almacenan en Object Storage (S3/R2)
--     la BD solo guarda metadata + file_key
-- ============================================================


-- ============================================================
-- 0. EXTENSIONES REQUERIDAS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- Búsqueda fuzzy por nombre
CREATE EXTENSION IF NOT EXISTS "unaccent";   -- Normalizar acentos en búsqueda


-- ============================================================
-- 1. TIPOS ENUM (Dominio de valores controlados)
-- ============================================================

CREATE TYPE appointment_status AS ENUM (
  'PENDING',
  'CONFIRMED',
  'CANCELLED_BY_CLIENT',
  'CANCELLED_BY_PROFESSIONAL',
  'COMPLETED',
  'NO_SHOW'
);

CREATE TYPE payment_status AS ENUM (
  'UNPAID',
  'PARTIAL',
  'PAID',
  'REFUNDED'
);

CREATE TYPE service_modality AS ENUM (
  'VIDEO',
  'PRESENCIAL'
);

CREATE TYPE client_status AS ENUM (
  'NEW',
  'ACTIVE',
  'INACTIVE',
  'BLOCKED'
);

CREATE TYPE notification_type AS ENUM (
  'NEW_BOOKING',
  'CANCELLATION',
  'REMINDER',
  'NEW_CLIENT',
  'PAYMENT_RECEIVED',
  'AI_INSIGHT'
);

CREATE TYPE attachment_category AS ENUM (
  'EXAM_RESULT',
  'PRESCRIPTION',
  'CONSENT_FORM',
  'CLINICAL_RECORD',
  'INVOICE',
  'OTHER'
);

CREATE TYPE ai_intent AS ENUM (
  'SCHEDULE_APPOINTMENT',
  'CANCEL_APPOINTMENT',
  'SUMMARIZE_NOTES',
  'GENERATE_INSIGHTS',
  'GENERAL_SUPPORT',
  'PREDICT_NOSHOW'
);

CREATE TYPE plan_type AS ENUM (
  'FREE',
  'PRO',
  'ENTERPRISE'
);

CREATE TYPE day_of_week AS ENUM (
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY'
);


-- ============================================================
-- 2. TABLA: professionals
-- Representa al profesional que usa el sistema.
-- Incluye tokens de integraciones externas (encriptados en app).
-- ============================================================
CREATE TABLE professionals (
  id                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name            VARCHAR(100)  NOT NULL,
  last_name             VARCHAR(100)  NOT NULL,
  email                 VARCHAR(255)  NOT NULL UNIQUE,
  password_hash         VARCHAR(255)  NOT NULL,
  phone                 VARCHAR(30),
  -- Identificador público para la URL de booking (ej: /book/valentina-rojas)
  username_slug         VARCHAR(100)  NOT NULL UNIQUE,
  -- Datos del perfil público
  bio                   TEXT,
  avatar_key            TEXT, -- Clave en S3/R2 del avatar
  specialty             VARCHAR(200),
  -- Plan de suscripción
  plan_type             plan_type     NOT NULL DEFAULT 'FREE',
  -- Configuración regional
  timezone              VARCHAR(100)  NOT NULL DEFAULT 'America/Santiago',
  -- Integración Google Calendar (tokens encriptados en capa de aplicación)
  google_calendar_token TEXT,
  google_calendar_id    VARCHAR(255),
  -- Integración Stripe para cobros
  stripe_account_id     VARCHAR(255),
  -- Estado del onboarding (muestra wizard en primer login)
  is_onboarded          BOOLEAN       NOT NULL DEFAULT FALSE,
  -- Política de cancelación (horas de anticipación mínimas)
  cancellation_policy_hours INT       NOT NULL DEFAULT 24,
  created_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Índice para búsqueda fuzzy de nombre completo
CREATE INDEX idx_professionals_name_trgm
  ON professionals
  USING gin ((first_name || ' ' || last_name) gin_trgm_ops);


-- ============================================================
-- 3. TABLA: schedules
-- Define los horarios de atención de cada profesional
-- por día de la semana.
-- ============================================================
CREATE TABLE schedules (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   UUID         NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  day_of_week       day_of_week  NOT NULL,
  start_time        TIME         NOT NULL,
  end_time          TIME         NOT NULL,
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_schedule_time CHECK (end_time > start_time),
  -- Un profesional no puede tener dos entradas para el mismo día
  UNIQUE (professional_id, day_of_week)
);


-- ============================================================
-- 4. TABLA: schedule_exceptions
-- Días bloqueados o con horario especial (vacaciones, feriados).
-- ============================================================
CREATE TABLE schedule_exceptions (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   UUID         NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  exception_date    DATE         NOT NULL,
  -- NULL = día completo bloqueado; si tiene valor, es un horario reducido
  start_time        TIME,
  end_time          TIME,
  reason            VARCHAR(255),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  UNIQUE (professional_id, exception_date)
);


-- ============================================================
-- 5. TABLA: services
-- Servicios que el profesional ofrece y que se muestran
-- en la página pública de reservas (/book/:slug).
-- ============================================================
CREATE TABLE services (
  id                  UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id     UUID              NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  name                VARCHAR(200)      NOT NULL,
  description         TEXT,
  duration_minutes    INT               NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  -- Tiempo de buffer entre citas (preparación / limpieza)
  buffer_minutes      INT               NOT NULL DEFAULT 0 CHECK (buffer_minutes >= 0),
  price               NUMERIC(10, 2)    NOT NULL DEFAULT 0 CHECK (price >= 0),
  currency            CHAR(3)           NOT NULL DEFAULT 'CLP',
  modality            service_modality  NOT NULL DEFAULT 'PRESENCIAL',
  -- Color hex para mostrar en el calendario del dashboard
  color_hex           CHAR(7)           NOT NULL DEFAULT '#C0987A',
  -- Icono del frontend (ej: 'video', 'building', 'activity')
  icon_name           VARCHAR(50)       DEFAULT 'calendar',
  is_active           BOOLEAN           NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_services_professional ON services(professional_id);


-- ============================================================
-- 6. TABLA: clients
-- Pacientes / clientes de un profesional.
-- Un client pertenece a un professional (multi-tenant).
-- ============================================================
CREATE TABLE clients (
  id                UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   UUID          NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  first_name        VARCHAR(100)  NOT NULL,
  last_name         VARCHAR(100)  NOT NULL,
  email             VARCHAR(255),
  phone             VARCHAR(30),
  birth_date        DATE,
  status            client_status NOT NULL DEFAULT 'NEW',
  -- Notas de gestión interna (no clínicas)
  internal_notes    TEXT,
  -- Datos de contacto de emergencia
  emergency_contact_name  VARCHAR(200),
  emergency_contact_phone VARCHAR(30),
  created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Un profesional no debería tener dos clientes con el mismo email
CREATE UNIQUE INDEX idx_clients_email_per_professional
  ON clients(professional_id, email)
  WHERE email IS NOT NULL;

-- Búsqueda fuzzy por nombre de cliente
CREATE INDEX idx_clients_name_trgm
  ON clients
  USING gin ((first_name || ' ' || last_name) gin_trgm_ops);

CREATE INDEX idx_clients_professional ON clients(professional_id);


-- ============================================================
-- 7. TABLA: appointments
-- Cita agendada. Corazón del sistema.
-- Vincula professional, client y service.
-- ============================================================
CREATE TABLE appointments (
  id                  UUID                PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id     UUID                NOT NULL REFERENCES professionals(id),
  client_id           UUID                NOT NULL REFERENCES clients(id),
  service_id          UUID                NOT NULL REFERENCES services(id),
  -- Hora de inicio y fin en UTC (calculado: start + duration + buffer)
  start_at            TIMESTAMPTZ         NOT NULL,
  end_at              TIMESTAMPTZ         NOT NULL,
  status              appointment_status  NOT NULL DEFAULT 'PENDING',
  payment_status      payment_status      NOT NULL DEFAULT 'UNPAID',
  -- Notas del formulario de reserva (ej: "primera sesión, me derivó mi médico")
  client_notes        TEXT,
  -- Notas internas del profesional sobre esta cita
  professional_notes  TEXT,
  -- Enlace de videollamada (Zoom, Meet, etc.)
  meeting_url         VARCHAR(1000),
  -- ID del evento en Google Calendar para sincronización bidireccional
  google_event_id     VARCHAR(255),
  -- Token único para que el cliente gestione su cita (/manage/:token)
  management_token    UUID                NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  -- Predicción IA de no-asistencia (0.0 a 1.0)
  ai_noshow_score     NUMERIC(4,3)        CHECK (ai_noshow_score >= 0 AND ai_noshow_score <= 1),
  cancelled_at        TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  CONSTRAINT chk_appointment_time CHECK (end_at > start_at)
);

-- Índices críticos para consultas frecuentes
CREATE INDEX idx_appointments_professional_date
  ON appointments(professional_id, start_at);

CREATE INDEX idx_appointments_client
  ON appointments(client_id);

CREATE INDEX idx_appointments_status
  ON appointments(professional_id, status);

-- Prevenir doble reserva: un professional no puede tener dos citas solapadas
-- (se valida también en la lógica de aplicación con un query de disponibilidad)
CREATE INDEX idx_appointments_overlap_check
  ON appointments(professional_id, start_at, end_at)
  WHERE status NOT IN ('CANCELLED_BY_CLIENT', 'CANCELLED_BY_PROFESSIONAL', 'NO_SHOW');


-- ============================================================
-- 8. TABLA: clinical_notes
-- Historial clínico del cliente.
-- Versiones inmutables (append-only por diseño).
-- ============================================================
CREATE TABLE clinical_notes (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID         NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  professional_id     UUID         NOT NULL REFERENCES professionals(id),
  -- Vinculada opcionalmente a una cita específica
  appointment_id      UUID         REFERENCES appointments(id) ON DELETE SET NULL,
  -- Contenido enriquecido en Markdown
  content_markdown    TEXT         NOT NULL,
  -- Flag si el contenido fue generado o modificado por la IA de Gemini
  is_ai_assisted      BOOLEAN      NOT NULL DEFAULT FALSE,
  -- Versión para historial de ediciones (1 = original)
  version             INT          NOT NULL DEFAULT 1,
  -- ID de la nota padre si es una revisión
  parent_note_id      UUID         REFERENCES clinical_notes(id),
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
  -- NO hay updated_at: las notas son inmutables. Se crea nueva versión.
);

CREATE INDEX idx_clinical_notes_client
  ON clinical_notes(client_id, created_at DESC);

CREATE INDEX idx_clinical_notes_appointment
  ON clinical_notes(appointment_id);


-- ============================================================
-- 9. TABLA: attachments
-- Archivos subidos a un cliente (exámenes, recetas, PDFs, etc.)
-- El archivo real vive en S3/Cloudflare R2.
-- La BD solo guarda metadata.
-- ============================================================
CREATE TABLE attachments (
  id                  UUID                 PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id           UUID                 NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  professional_id     UUID                 NOT NULL REFERENCES professionals(id),
  -- Vinculado opcionalmente a una cita
  appointment_id      UUID                 REFERENCES appointments(id) ON DELETE SET NULL,
  -- Nombre original del archivo (para mostrar al usuario)
  original_filename   VARCHAR(255)         NOT NULL,
  -- Clave única en el bucket S3 (ej: professionals/uuid/clients/uuid/timestamp-nombre.pdf)
  storage_key         VARCHAR(1000)        NOT NULL UNIQUE,
  -- Tipo MIME (application/pdf, image/jpeg, image/png, etc.)
  mime_type           VARCHAR(100)         NOT NULL,
  -- Tamaño en bytes (para mostrar y validar cuota)
  file_size_bytes     BIGINT               NOT NULL CHECK (file_size_bytes > 0),
  category            attachment_category  NOT NULL DEFAULT 'OTHER',
  description         TEXT,
  -- Flag para archivos confidenciales (requieren confirmación extra para ver)
  is_confidential     BOOLEAN              NOT NULL DEFAULT FALSE,
  uploaded_at         TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attachments_client
  ON attachments(client_id, uploaded_at DESC);

CREATE INDEX idx_attachments_professional
  ON attachments(professional_id);


-- ============================================================
-- 10. TABLA: notifications
-- Notificaciones dentro de la aplicación para el profesional.
-- (Panel de notificaciones del dashboard)
-- ============================================================
CREATE TABLE notifications (
  id                UUID                NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   UUID                NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  -- Referencia polimórfica al objeto relacionado
  related_entity_id UUID,
  type              notification_type   NOT NULL,
  title             VARCHAR(255)        NOT NULL,
  message           TEXT                NOT NULL,
  is_read           BOOLEAN             NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_professional_unread
  ON notifications(professional_id, is_read, created_at DESC);


-- ============================================================
-- 11. TABLA: ai_interactions
-- Historial de interacciones con Gemini (Copilot Chat).
-- Permite mantener contexto entre conversaciones
-- y auditar las acciones que la IA tomó.
-- ============================================================
CREATE TABLE ai_interactions (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id   UUID         NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  -- ID de la sesión de chat (para agrupar mensajes de una conversación)
  session_id        UUID         NOT NULL DEFAULT gen_random_uuid(),
  intent            ai_intent    NOT NULL DEFAULT 'GENERAL_SUPPORT',
  -- Mensaje del usuario
  user_message      TEXT         NOT NULL,
  -- Respuesta de Gemini
  ai_response       TEXT,
  -- Tokens consumidos (para monitorear costos)
  tokens_used       INT,
  -- Si la IA ejecutó una acción (ej: creó una cita), registramos qué hizo
  action_taken      VARCHAR(255),
  action_entity_id  UUID,
  -- Metadata adicional (contexto de la petición en JSON)
  context_data      JSONB,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ai_interactions_professional
  ON ai_interactions(professional_id, created_at DESC);

CREATE INDEX idx_ai_interactions_session
  ON ai_interactions(session_id);


-- ============================================================
-- 12. TRIGGERS – Mantenimiento automático de updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_professionals_updated_at
  BEFORE UPDATE ON professionals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- 13. TRIGGER – Auto-crear notificación al confirmar cita
-- ============================================================
CREATE OR REPLACE FUNCTION notify_on_appointment_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'CONFIRMED' AND (OLD.status IS DISTINCT FROM 'CONFIRMED') THEN
    INSERT INTO notifications (professional_id, related_entity_id, type, title, message)
    VALUES (
      NEW.professional_id,
      NEW.id,
      'NEW_BOOKING',
      'Cita Confirmada',
      'Se ha confirmado una nueva cita para el ' || TO_CHAR(NEW.start_at AT TIME ZONE 'America/Santiago', 'DD/MM/YYYY HH24:MI')
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointment_confirm_notification
  AFTER UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION notify_on_appointment_confirmed();


-- ============================================================
-- 14. TRIGGER – Auto-crear notificación cuando se cancela una cita
-- ============================================================
CREATE OR REPLACE FUNCTION notify_on_appointment_cancelled()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('CANCELLED_BY_CLIENT', 'CANCELLED_BY_PROFESSIONAL')
     AND OLD.status NOT IN ('CANCELLED_BY_CLIENT', 'CANCELLED_BY_PROFESSIONAL') THEN
    INSERT INTO notifications (professional_id, related_entity_id, type, title, message)
    VALUES (
      NEW.professional_id,
      NEW.id,
      'CANCELLATION',
      'Cita Cancelada',
      'Una cita programada para el ' ||
        TO_CHAR(NEW.start_at AT TIME ZONE 'America/Santiago', 'DD/MM/YYYY HH24:MI') ||
        ' ha sido cancelada.'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_appointment_cancel_notification
  AFTER UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION notify_on_appointment_cancelled();


-- ============================================================
-- 15. VISTAS ÚTILES PARA EL DASHBOARD Y LA IA
-- ============================================================

-- Vista: Próximas citas del día con info del cliente y servicio
CREATE VIEW v_upcoming_appointments AS
SELECT
  a.id,
  a.professional_id,
  a.start_at,
  a.end_at,
  a.status,
  a.payment_status,
  a.meeting_url,
  a.ai_noshow_score,
  c.first_name  || ' ' || c.last_name AS client_full_name,
  c.email       AS client_email,
  c.phone       AS client_phone,
  s.name        AS service_name,
  s.duration_minutes,
  s.modality,
  s.color_hex
FROM appointments a
JOIN clients  c ON c.id = a.client_id
JOIN services s ON s.id = a.service_id
WHERE a.status NOT IN ('CANCELLED_BY_CLIENT', 'CANCELLED_BY_PROFESSIONAL', 'COMPLETED', 'NO_SHOW');

-- Vista: KPIs mensuales para el panel de Analíticas
CREATE VIEW v_monthly_kpis AS
SELECT
  a.professional_id,
  DATE_TRUNC('month', a.start_at)                       AS month,
  COUNT(*)                                              AS total_appointments,
  COUNT(*) FILTER (WHERE a.status = 'COMPLETED')        AS completed,
  COUNT(*) FILTER (WHERE a.status = 'NO_SHOW')          AS no_shows,
  COUNT(*) FILTER (
    WHERE a.status IN ('CANCELLED_BY_CLIENT', 'CANCELLED_BY_PROFESSIONAL')
  )                                                     AS cancellations,
  SUM(s.price) FILTER (WHERE a.payment_status = 'PAID') AS revenue_paid,
  ROUND(
    COUNT(*) FILTER (WHERE a.status = 'COMPLETED')::NUMERIC
    / NULLIF(COUNT(*), 0) * 100, 1
  )                                                     AS attendance_rate_pct
FROM appointments a
JOIN services s ON s.id = a.service_id
GROUP BY a.professional_id, DATE_TRUNC('month', a.start_at);

-- Vista: Últimas notas clínicas de cada cliente (solo la más reciente)
CREATE VIEW v_latest_clinical_note AS
SELECT DISTINCT ON (client_id)
  id,
  client_id,
  professional_id,
  appointment_id,
  content_markdown,
  is_ai_assisted,
  version,
  created_at
FROM clinical_notes
ORDER BY client_id, created_at DESC;


-- ============================================================
-- 16. SEED DATA – Datos Realistas de Simulación
-- ============================================================

-- ---- PROFESIONAL ----
INSERT INTO professionals (
  id, first_name, last_name, email, password_hash, phone,
  username_slug, bio, specialty, plan_type, timezone, is_onboarded,
  cancellation_policy_hours
) VALUES (
  'a1b2c3d4-0001-0001-0001-000000000001',
  'Valentina', 'Rojas',
  'valentina.rojas@agendafacil.cl',
  -- Hash bcrypt de 'Password123!' (generado externamente)
  '$2b$12$examplehashplaceholderXXXXXXXXXXXXXXXXXXXXX',
  '+56 9 9876 5432',
  'valentina-rojas',
  'Psicóloga Clínica con más de 10 años de experiencia. Especialista en terapia cognitivo-conductual y trastornos de ansiedad.',
  'Psicología Clínica',
  'PRO',
  'America/Santiago',
  TRUE,
  24
);

-- ---- HORARIOS DE ATENCIÓN ----
INSERT INTO schedules (professional_id, day_of_week, start_time, end_time) VALUES
  ('a1b2c3d4-0001-0001-0001-000000000001', 'MONDAY',    '09:00', '18:00'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'TUESDAY',   '09:00', '18:00'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'WEDNESDAY',  '09:00', '13:00'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'THURSDAY',   '09:00', '18:00'),
  ('a1b2c3d4-0001-0001-0001-000000000001', 'FRIDAY',     '09:00', '15:00');

-- ---- SERVICIOS ----
INSERT INTO services (id, professional_id, name, description, duration_minutes, buffer_minutes, price, currency, modality, color_hex, icon_name) VALUES
  (
    'b1c2d3e4-0002-0002-0002-000000000001',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Consulta General',
    'Sesión estándar para tratar diversos temas personales y emocionales.',
    60, 10, 50000, 'CLP', 'VIDEO', '#C0987A', 'video'
  ),
  (
    'b1c2d3e4-0002-0002-0002-000000000002',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Terapia de Pareja',
    'Sesión conjunta orientada a mejorar la comunicación y resolver conflictos.',
    90, 15, 80000, 'CLP', 'PRESENCIAL', '#A9B3A2', 'building'
  ),
  (
    'b1c2d3e4-0002-0002-0002-000000000003',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Evaluación Inicial',
    'Primera entrevista para entender tu caso, tus objetivos y trazar un plan de trabajo.',
    45, 10, 40000, 'CLP', 'VIDEO', '#D9A05B', 'activity'
  );

-- ---- CLIENTES ----
INSERT INTO clients (id, professional_id, first_name, last_name, email, phone, birth_date, status) VALUES
  (
    'c1d2e3f4-0003-0003-0003-000000000004',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'Carlos', 'López', 'clopez@gmail.com', '+56 9 3333 2222',
    '1995-02-20', 'NEW'
  );

-- ---- CITAS (Simulando flujo real de estado) ----
INSERT INTO appointments (id, professional_id, client_id, service_id, start_at, end_at, status, payment_status, client_notes, ai_noshow_score)
VALUES
  (
    'd1e2f3a4-0004-0004-0004-000000000008',
    'a1b2c3d4-0001-0001-0001-000000000001',
    'c1d2e3f4-0003-0003-0003-000000000004',
    'b1c2d3e4-0002-0002-0002-000000000003',
    NOW() + INTERVAL '3 days' + INTERVAL '9 hours',
    NOW() + INTERVAL '3 days' + INTERVAL '9 hours' + INTERVAL '45 minutes',
    'PENDING', 'UNPAID', 'Primera vez. Lo derivó Dr. Martínez.', 0.30
  );

-- ---- NOTAS CLÍNICAS ----
-- (Sin notas por defecto; las notas se crean de manera dinámica)

-- ---- ARCHIVOS ADJUNTOS ----
-- (Sin adjuntos por defecto; se suben de manera dinámica)

-- ---- NOTIFICACIONES ----
INSERT INTO notifications (professional_id, related_entity_id, type, title, message, is_read) VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    'd1e2f3a4-0004-0004-0004-000000000008',
    'NEW_BOOKING',
    'Nueva Reserva',
    'Carlos López ha agendado "Evaluación Inicial" para el ' ||
      TO_CHAR((NOW() + INTERVAL '3 days' + INTERVAL '9 hours') AT TIME ZONE 'America/Santiago', 'DD/MM HH24:MI'),
    FALSE
  );

-- ---- INTERACCIÓN CON LA IA (Simulación del Copilot) ----
INSERT INTO ai_interactions (professional_id, session_id, intent, user_message, ai_response, tokens_used, action_taken, action_entity_id) VALUES
  (
    'a1b2c3d4-0001-0001-0001-000000000001',
    gen_random_uuid(),
    'GENERATE_INSIGHTS',
    'Analiza mis analíticas de este mes y dame un insight.',
    'Este mes has tenido citas activas y un registro de pacientes limpio. Tu tasa de asistencia es del 100%.',
    210,
    NULL,
    NULL
  );

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
