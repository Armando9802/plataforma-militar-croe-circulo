# PLAN DE EJECUCIÓN TÉCNICA Y ARQUITECTURA INTEGRAL
## PLATAFORMA TECNOLÓGICA MULTI-TENANT PARA CLUBES MILITARES DEL ECUADOR
### Club de Recreación de Oficiales del Ejército (CROE) & Círculo Militar del Ecuador

---

**Código de Documento:** PET-MIL-EC-2026-V1  
**Versión:** 1.0.0 — Edición Definitiva para Negociación y Cierre de Directorio  
**Fecha de Emisión:** 9 de Noviembre de 2026  
**Clasificación de Seguridad:** Confidencial / Propuesta Técnico-Estratégica  
**Destinatarios:** 
- Consejo Directivo y Presidencia del C.R.O.E. (Quito / Salinas / Los Chillos)
- Consejo Directivo y Presidencia del Círculo Militar del Ecuador (Quito / Valles)
- Comisiones de Fiscalización, Transformación Digital y Bienestar Castrense

---

## 1. RESUMEN EJECUTIVO Y OBJETIVOS ESTRATÉGICOS

### 1.1. Contexto Institucional y Desafío Tecnológico
Las Fuerzas Armadas del Ecuador cuentan con dos de las instituciones sociales, recreacionales y culturales más insignes de la República: el **Club de Recreación de Oficiales del Ejército (CROE)** y el **Círculo Militar del Ecuador** (fundado en 1918). Ambas instituciones administran un patrimonio inmobiliario estratégico compuesto por sedes campestres, complejos vacacionales de playa, canchas deportivas de alto rendimiento, salones de honor protocolar y comedores institucionales.

A pesar de su trascendencia, la gestión operativa actual enfrenta cuellos de botella que limitan su eficiencia:
1. **Falta de interoperabilidad y convenios automatizados:** Dificultad para que un oficial del Ejército asociado a CROE disfrute con agilidad de las instalaciones del Círculo Militar y viceversa, sin trámites burocráticos engorrosos ni duplicidad de cuotas.
2. **Vulnerabilidades en el control de acceso en garitas:** El uso de credenciales físicas o carnés plastificados tradicionales permite la suplantación de identidad, el préstamo de credenciales no autorizadas y carece de registro en tiempo real de acompañantes y vehículos.
3. **Mora en recaudación de aportaciones y pagos de reservas:** Falta de integración nativa con los rieles de pago electrónicos predilectos en Ecuador (**Payphone** y **Kushki**), obligando a transferencias bancarias manuales que demoran días en conciliarse.
4. **Exigencia regulatoria y tributaria estricta:** Necesidad de emitir comprobantes electrónicos autorizados por el **Servicio de Rentas Internas (SRI)** con tarifa de IVA vigente (15%) y dar estricto cumplimiento a la **Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP)**, protegiendo con rigor de seguridad nacional la identidad y rango de los miembros de las Fuerzas Armadas.

### 1.2. Propósito del Plan de Ejecución Técnica
El presente documento define la arquitectura integral, el modelo de datos relacional en PostgreSQL, la estrategia de aislamiento multi-tenant con **Row Level Security (RLS)**, la integración de pasarelas de pago ecuatorianas con conciliación automatizada, el cronograma de ejecución para los **11 Módulos Funcionales + 2 Transversales**, y las políticas de ciberseguridad castrense. Este plan constituye el compromiso de ingeniería para ejecutar la plataforma con excelencia, garantizando un retorno de inversión tangible y una modernización de primer nivel para la familia militar ecuatoriana.

---

## 2. MODELO DE DATOS ENTIDAD-RELACIÓN (ER) Y ESPECIFICACIÓN POSTGRESQL

La arquitectura de datos se fundamenta en un motor relacional **PostgreSQL 15+**, optimizado para integridad referencial estricta, consultas geoespaciales y concurrencia transaccional mediante control de concurrencia multiversión (MVCC).

### 2.1. Diagrama de Relación Global de Entidades

#### 2.1.1. Diagrama de Entidades Base (Membresías, Sedes, Reservas y Pagos)

```
+---------------------------------------------------------------------------------------------------+
|                                            tenants                                                |
|  PK: id (UUID) | code (VARCHAR) | legal_name | ruc | primary_color | secondary_color | theme_json  |
+---------------------------------------------------------------------------------------------------+
         | 1                                               | 1                           | 1
         |                                                 |                             |
         v *                                               v *                           v *
+--------------------+                            +--------------------+        +--------------------+
| military_branches  |                            |      campuses      |        | inter_institutional|
| PK: id (INT)       |                            | PK: id (UUID)      |        |     agreements     |
| FK: branch_id      |                            | PK: id (UUID)      |        | PK: id (UUID)      |
+--------------------+                            | FK: tenant_id      |        | FK: issuing_tenant |
         | 1                                      +--------------------+        | FK: beneficiary_t. |
         v *                                               | 1                  +--------------------+
+--------------------+                                     v *
|   military_ranks   |                            +--------------------+
| PK: id (INT)       |                            |     facilities     |
| FK: branch_id      |                            | PK: id (UUID)      |
+--------------------+                            | FK: tenant_id      |
         | 1                                      | FK: campus_id      |
         |                                        +--------------------+
         v *                                               | 1
+--------------------+                                     |
|      members       |<----------------+                   |
| PK: id (UUID)      |                 |                   |
| FK: tenant_id      |                 |                   |
| FK: rank_id        |                 |                   |
+--------------------+                 |                   |
    | 1            | 1                 |                   |
    |              |                   |                   |
    v *            v *                 |                   v *
+------------+ +--------------------+  |          +--------------------+
| dependents | |  membership_dues   |  |          |    reservations    |
| PK: (UUID) | | PK: id (UUID)      |  |          | PK: id (UUID)      |
| FK: member | | FK: tenant_id      |  |          | FK: tenant_id      |
+------------+ | FK: member_id      |  |          | FK: member_id      |
               +--------------------+  |          | FK: facility_id    |
                         | 1           |          +--------------------+
                         |             |                   | 1
                         +-------------+----+              |
                                       |    |              |
                                       v *  v *            v *
                               +-----------------------------------+
                               |       payment_transactions        |
                               | PK: id (UUID)                     |
                               | FK: tenant_id | FK: member_id     |
                               | FK: reservation_id | dues_id      |
                               +-----------------------------------+
                                                 | 1
                                                 v 1
                               +-----------------------------------+
                               |      electronic_invoices_sri      |
                               | PK: id (UUID)                     |
                               | FK: tenant_id | FK: transaction_id|
                               | access_key (CHAR 49) | auth_no    |
                               +-----------------------------------+
```

#### 2.1.2. Diagrama de Relación Extendido (Economato, Inventarios, Menaje, Fichas Técnicas y Facturación SRI)

```
+---------------------------------------------------------------------------------------------------+
|                                            tenants                                                |
|  PK: id (UUID) | code (VARCHAR) | legal_name | ruc | primary_color | secondary_color | theme_json  |
+---------------------------------------------------------------------------------------------------+
         | 1                                               | 1                           | 1
         v *                                               v *                           v *
+--------------------+                            +--------------------+        +--------------------+
|   inv_categorias   |                            |      campuses      |        | inv_facturas_      |
| PK: id (UUID)      |                            | PK: id (UUID)      |        |   adquisicion      |
| FK: tenant_id      |                            | FK: tenant_id      |        | PK: id (UUID)      |
| code, name, icon   |                            +--------------------+        | FK: tenant_id      |
+--------------------+                                     | 1                  | ruc_proveedor, auth|
         | 1                                               v *                  +--------------------+
         |                                        +--------------------+                 | 1
         v *                                      |    inv_bodegas     |                 |
+------------------------------------+            | PK: id (UUID)      |                 v *
|           inv_articulos            |            | FK: tenant_id      |        +--------------------+
| PK: id (UUID)                      |            | FK: campus_id      |        | inv_factura_       |
| FK: tenant_id | FK: categoria_id   |<-----------| code, name, type   |        |   detalles         |
| sku, name, unit, current_stock     | 1        * +--------------------+        | PK: id (UUID)      |
| reorder_point, pmp_cost, returnable|                     | 1                  | FK: factura_id     |
+------------------------------------+                     |                    | FK: articulo_id    |
       | 1            | 1                                  |                    +--------------------+
       |              +-------------------+                |
       v *                                v *              v *
+--------------------+           +---------------------------------------------+
| inv_receta_detalles|           |            inv_kardex_movimientos           |
| PK: id (UUID)      |           | PK: id (UUID)                               |
| FK: receta_id      |           | FK: tenant_id | FK: bodega_id               |
| FK: articulo_id    |           | FK: articulo_id                             |
| cantidad_pax       |           | tipo_movimiento: ENTRADA, SALIDA_TURNO, etc.|
| factor_merma       |           | cantidad, costo_unitario, saldo_stock       |
+--------------------+           +---------------------------------------------+
       ^ *                                                 ^ *
       | 1                                                 | 1
+------------------------------------+           +---------------------------------------------+
|    inv_recetas_fichas_tecnicas     |           |         inv_eventos_consumo_menaje          |
| PK: id (UUID)                      |           | PK: id (UUID)                               |
| FK: tenant_id                      |           | FK: tenant_id | FK: reservation_id          |
| tipo_servicio: TURNO_DESAYUNO, etc.|           | FK: articulo_id (menaje)                    |
| nombre, descripcion, activo        |           | cant_despachada, cant_devuelta, cant_rotura |
+------------------------------------+           | costo_reposicion, total_cargo_socio         |
                                                 +---------------------------------------------+
```

---

### 2.2. Definición Formal de Esquema DDL (12 Tablas Principales)

A continuación se detalla la definición DDL de las doce tablas principales, con sus restricciones de integridad, valores por defecto, checks de validación militar y reglas de clave foránea.

```sql
-- ============================================================================
-- EXTENSIONES REQUERIDAS
-- ============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABLA: tenants (Instituciones / Clubes Militares)
-- ============================================================================
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(30) NOT NULL UNIQUE, -- 'CROE', 'CIRCULO_MILITAR'
    legal_name VARCHAR(150) NOT NULL,
    trade_name VARCHAR(120) NOT NULL,
    ruc CHAR(13) NOT NULL UNIQUE, -- Validado con Módulo 11 (Sociedades Privadas/Públicas)
    main_office_address TEXT NOT NULL,
    support_phone VARCHAR(30) NOT NULL,
    support_email VARCHAR(120) NOT NULL,
    logo_light_url TEXT NOT NULL,
    logo_dark_url TEXT NOT NULL,
    crest_svg TEXT, -- Vector heráldico en SVG
    primary_color CHAR(7) NOT NULL DEFAULT '#8B1E24', -- CROE: #8B1E24, Círculo: #1B365D
    secondary_color CHAR(7) NOT NULL DEFAULT '#D4AF37', -- Dorado Insignia
    accent_color CHAR(7) NOT NULL DEFAULT '#1F2937',
    motto VARCHAR(255) NOT NULL, -- ej. "EL PLACER DE SERVIR"
    theme_tokens JSONB NOT NULL DEFAULT '{}'::jsonb,
    billing_settings JSONB NOT NULL DEFAULT '{
        "sri_environment": 1, -- 1: Pruebas, 2: Producción
        "establishment_code": "001",
        "emission_point_code": "001",
        "requires_electronic_signature": true,
        "vat_rate": 0.15
    }'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_tenant_ruc_length CHECK (length(ruc) = 13)
);

-- ============================================================================
-- 2. TABLA: military_branches (Fuerzas y Ramas Institucionales)
-- ============================================================================
CREATE TABLE military_branches (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE, -- 'EJERCITO', 'ARMADA', 'FAE', 'POLICIA', 'CIVIL'
    name VARCHAR(100) NOT NULL,
    formal_salute VARCHAR(80),
    crest_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================================
-- 3. TABLA: military_ranks (Grados y Escalafón Militar de las FF.AA.)
-- ============================================================================
CREATE TABLE military_ranks (
    id SERIAL PRIMARY KEY,
    branch_id INT NOT NULL REFERENCES military_branches(id) ON DELETE RESTRICT,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(80) NOT NULL, -- ej. "General de Ejército", "Coronel", "Mayor", "Capitán"
    abbreviation VARCHAR(20) NOT NULL, -- ej. "Grab.", "Crnl.", "Myr.", "Cap."
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'OFICIAL_GENERAL', 
        'OFICIAL_SUPERIOR', 
        'OFICIAL_ALTERNO', 
        'TROPA_SUPERIOR', 
        'TROPA', 
        'HONORARIO', 
        'CIVIL_ASOCIADO'
    )),
    seniority_order INT NOT NULL, -- Orden protocolar de prelación para eventos y reservas
    insignia_icon_url TEXT,
    CONSTRAINT uq_branch_rank UNIQUE (branch_id, code)
);

-- ============================================================================
-- 4. TABLA: members (Padrón General de Socios)
-- ============================================================================
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    user_id UUID, -- Referencia a tabla auth/users si aplica
    cedula CHAR(10) NOT NULL,
    military_id VARCHAR(30) NOT NULL, -- Número de carné militar / ISSFA
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    rank_id INT NOT NULL REFERENCES military_ranks(id) ON DELETE RESTRICT,
    military_status VARCHAR(30) NOT NULL CHECK (military_status IN (
        'ACTIVO', 
        'PASIVO_RETIRADO', 
        'MONTEPIO', 
        'HONORARIO', 
        'DISPONIBILIDAD'
    )),
    military_specialty VARCHAR(100), -- ej. "Infantería", "Caballería Blindada", "Artillería", "Ingeniería", "Comunicaciones"
    esmil_promotion VARCHAR(80), -- Promoción de egreso (ej. "Promoción 78")
    membership_number VARCHAR(40) NOT NULL,
    membership_status VARCHAR(20) NOT NULL DEFAULT 'AL_DIA' CHECK (membership_status IN (
        'AL_DIA', 
        'EN_MORA', 
        'SUSPENDIDO', 
        'RETIRADO', 
        'FALLECIDO'
    )),
    birth_date DATE NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    home_address TEXT,
    avatar_url TEXT,
    digital_card_hash_secret VARCHAR(128) NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'), -- Clave privada TOTP
    monthly_due_amount DECIMAL(10,2) NOT NULL DEFAULT 35.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_member_tenant_cedula UNIQUE (tenant_id, cedula),
    CONSTRAINT uq_member_tenant_membership_number UNIQUE (tenant_id, membership_number),
    CONSTRAINT chk_member_cedula_len CHECK (length(cedula) = 10)
);

CREATE INDEX idx_members_tenant_status ON members(tenant_id, membership_status);
CREATE INDEX idx_members_cedula ON members(cedula);
CREATE INDEX idx_members_rank ON members(rank_id);

-- ============================================================================
-- 5. TABLA: dependents (Cargas Familiares de Socios)
-- ============================================================================
CREATE TABLE dependents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    relationship VARCHAR(20) NOT NULL CHECK (relationship IN (
        'CONYUGE', 
        'HIJO', 
        'HIJA', 
        'PADRE', 
        'MADRE', 
        'CARGA_ESPECIAL'
    )),
    cedula CHAR(10) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    gender CHAR(1) CHECK (gender IN ('M', 'F')),
    blood_type VARCHAR(5),
    avatar_url TEXT,
    is_authorized_club_entry BOOLEAN NOT NULL DEFAULT true,
    is_sports_school_enrolled BOOLEAN NOT NULL DEFAULT false,
    special_medical_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_dependent_tenant_cedula UNIQUE (tenant_id, cedula)
);

CREATE INDEX idx_dependents_member ON dependents(member_id);

-- ============================================================================
-- 6. TABLA: campuses (Sedes Físicas y Complejos Recreacionales)
-- ============================================================================
CREATE TABLE campuses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(30) NOT NULL, -- ej. 'LOS_CHILLOS', 'SALINAS', 'QUITO_CENTRO'
    name VARCHAR(120) NOT NULL,
    city VARCHAR(60) NOT NULL,
    province VARCHAR(60) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(30),
    email VARCHAR(120),
    geo_latitude DECIMAL(10,8),
    geo_longitude DECIMAL(11,8),
    manager_name VARCHAR(120), -- Oficial Comandante o Administrador de Sede
    operating_hours JSONB NOT NULL DEFAULT '{"monday_closed": true, "tue_sun": "08:00 - 20:00"}'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_tenant_campus_code UNIQUE (tenant_id, code)
);

-- ============================================================================
-- 7. TABLA: facilities (Instalaciones, Cabañas, Suites y Canchas)
-- ============================================================================
CREATE TABLE facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
    category VARCHAR(30) NOT NULL CHECK (category IN (
        'HOSPEDAJE', 
        'CANCHA_DEPORTIVA', 
        'SALON_EVENTOS', 
        'PISCINA', 
        'AREA_BBQ'
    )),
    code VARCHAR(30) NOT NULL, -- ej. 'CAB-01', 'CANCHA-PADEL-1', 'SUITE-PRES'
    name VARCHAR(120) NOT NULL,
    description TEXT,
    capacity_persons INT NOT NULL DEFAULT 4,
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    daily_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    inter_club_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Tarifa de cortesía para club hermano
    guest_surcharge_rate DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    requires_deposit BOOLEAN NOT NULL DEFAULT false,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    maintenance_status VARCHAR(20) NOT NULL DEFAULT 'OPERATIVO' CHECK (maintenance_status IN (
        'OPERATIVO', 
        'MANTENIMIENTO', 
        'FUERA_SERVICIO'
    )),
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb, -- Características técnicas (iluminación, camas, wifi)
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_campus_facility_code UNIQUE (campus_id, code)
);

CREATE INDEX idx_facilities_campus_cat ON facilities(campus_id, category);

-- ============================================================================
-- 8. TABLA: reservations (Reservas de Hospedaje, Deportes y Eventos)
-- ============================================================================
CREATE TABLE reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    reservation_code VARCHAR(35) NOT NULL, -- ej. 'CROE-RES-2026-00891'
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    facility_id UUID NOT NULL REFERENCES facilities(id) ON DELETE RESTRICT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('HOSPEDAJE', 'DEPORTE', 'EVENTO')),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    attendees_count INT NOT NULL DEFAULT 1,
    vehicle_plate VARCHAR(15), -- Placa de vehículo para garita
    military_protocol_required BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(10,2) NOT NULL, -- 15% IVA Ecuador
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(25) NOT NULL DEFAULT 'PENDIENTE_PAGO' CHECK (status IN (
        'BORRADOR', 
        'PENDIENTE_PAGO', 
        'CONFIRMADA', 
        'CHECK_IN', 
        'CHECK_OUT', 
        'FINALIZADA', 
        'CANCELADA', 
        'NO_SHOW'
    )),
    payment_deadline TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_reservation_code UNIQUE (tenant_id, reservation_code),
    CONSTRAINT chk_reservation_times CHECK (end_time > start_time)
);

CREATE INDEX idx_reservations_facility_times ON reservations(facility_id, start_time, end_time);
CREATE INDEX idx_reservations_member ON reservations(member_id);
CREATE INDEX idx_reservations_status ON reservations(tenant_id, status);

-- ============================================================================
-- 9. TABLA: membership_dues (Emisión y Cobranza de Cuotas Sociales)
-- ============================================================================
CREATE TABLE membership_dues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    period_year SMALLINT NOT NULL CHECK (period_year BETWEEN 2020 AND 2100),
    period_month SMALLINT NOT NULL CHECK (period_month BETWEEN 1 AND 12),
    base_amount DECIMAL(10,2) NOT NULL,
    surcharge_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_due DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (payment_status IN (
        'PENDIENTE', 
        'PAGADO', 
        'VENCIDO', 
        'EXONERADO'
    )),
    collection_method VARCHAR(30) CHECK (collection_method IN (
        'DESCUENTO_ROL_ISSFA', 
        'PASARELA_PAYPHONE', 
        'PASARELA_KUSHKI', 
        'DEBITO_BANCARIO', 
        'VENTANILLA'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_member_due_period UNIQUE (tenant_id, member_id, period_year, period_month)
);

CREATE INDEX idx_membership_dues_status ON membership_dues(tenant_id, payment_status);

-- ============================================================================
-- 10. TABLA: payment_transactions (Transacciones de Pasarela y Recaudación)
-- ============================================================================
CREATE TABLE payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE RESTRICT,
    reservation_id UUID REFERENCES reservations(id) ON DELETE SET NULL,
    dues_id UUID REFERENCES membership_dues(id) ON DELETE SET NULL,
    gateway VARCHAR(20) NOT NULL CHECK (gateway IN (
        'PAYPHONE', 
        'KUSHKI', 
        'ISSFA_ROL', 
        'TRANSFERENCIA_DIRECTA'
    )),
    gateway_transaction_id VARCHAR(100), -- ID provisto por Payphone o Kushki
    client_transaction_id VARCHAR(64) NOT NULL UNIQUE, -- UUIDv4 generado por la plataforma
    authorization_code VARCHAR(50), -- Código de autorización bancaria
    card_brand VARCHAR(30), -- 'VISA', 'MASTERCARD', 'DINERS', 'DISCOVER', 'PACIFICARD'
    card_last_digits CHAR(4),
    payment_type VARCHAR(20) DEFAULT 'DEFERRED' CHECK (payment_type IN ('CURRENT', 'DEFERRED')),
    deferred_months INT DEFAULT 0,
    has_interest BOOLEAN DEFAULT false,
    amount_without_vat DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    amount_with_vat DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    vat_tax DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Tarifa 15% IVA
    total_amount DECIMAL(10,2) NOT NULL,
    gateway_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    gateway_vat_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    net_received DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'INITIATED' CHECK (status IN (
        'INITIATED', 
        'PENDING_GATEWAY', 
        'APPROVED', 
        'REJECTED', 
        'REFUNDED', 
        'EXPIRED'
    )),
    idempotency_key VARCHAR(128) NOT NULL UNIQUE, -- Blindaje contra cobros duplicados
    raw_webhook_payload JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    settled_at TIMESTAMPTZ,
    CONSTRAINT chk_payment_target CHECK (reservation_id IS NOT NULL OR dues_id IS NOT NULL)
);

CREATE INDEX idx_payment_transactions_tenant_status ON payment_transactions(tenant_id, status);
CREATE INDEX idx_payment_client_tx ON payment_transactions(client_transaction_id);

-- ============================================================================
-- 11. TABLA: electronic_invoices_sri (Comprobantes Tributarios Electrónicos)
-- ============================================================================
CREATE TABLE electronic_invoices_sri (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    transaction_id UUID NOT NULL UNIQUE REFERENCES payment_transactions(id) ON DELETE RESTRICT,
    access_key CHAR(49) NOT NULL UNIQUE, -- Clave de 49 dígitos del SRI
    authorization_number VARCHAR(49),
    document_type CHAR(2) NOT NULL DEFAULT '01', -- '01': Factura, '04': Nota de Crédito
    establishment_code CHAR(3) NOT NULL, -- ej. '001'
    emission_point_code CHAR(3) NOT NULL, -- ej. '001'
    sequential_number CHAR(9) NOT NULL, -- ej. '000000891'
    customer_identification VARCHAR(13) NOT NULL, -- Cédula o RUC
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    customer_address TEXT,
    subtotal_0 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    subtotal_15 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    vat_15 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    sri_status VARCHAR(20) NOT NULL DEFAULT 'GENERADO' CHECK (sri_status IN (
        'GENERADO', 
        'FIRMADO_XML', 
        'ENVIADO_SRI', 
        'AUTORIZADO', 
        'RECHAZADO', 
        'DEVUELTA'
    )),
    sri_error_message TEXT,
    xml_signed_url TEXT,
    ride_pdf_url TEXT,
    authorized_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX idx_invoices_access_key ON electronic_invoices_sri(access_key);
CREATE INDEX idx_invoices_tenant_seq ON electronic_invoices_sri(tenant_id, establishment_code, emission_point_code, sequential_number);

-- ============================================================================
-- 12. TABLA: inter_institutional_agreements (Convenios CROE - Círculo Militar)
-- ============================================================================
CREATE TABLE inter_institutional_agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    issuing_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    beneficiary_tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    reciprocal_lodging_discount_pct DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    reciprocal_sports_discount_pct DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    booking_lead_time_days INT NOT NULL DEFAULT 15,
    max_active_reservations_per_officer INT NOT NULL DEFAULT 2,
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT chk_different_tenants CHECK (issuing_tenant_id <> beneficiary_tenant_id),
    CONSTRAINT chk_validity_dates CHECK (valid_to >= valid_from)
);

-- ============================================================================
-- 2.3. DEFINICIÓN DDL DEL MÓDULO DE INVENTARIOS, ECONOMATO Y RECEPCIÓN DE FACTURAS (9 TABLAS)
-- ============================================================================

-- ============================================================================
-- 13. TABLA: inv_categorias (Categorías de Almacén y Economato)
-- ============================================================================
CREATE TABLE inv_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(30) NOT NULL, -- 'INSUMOS_DESCARTABLES', 'MENAJE_CUBIERTOS', 'BEBIDAS', 'ALIMENTOS_COCINA'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Package',
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_inv_cat_tenant_code UNIQUE (tenant_id, code)
);

-- ============================================================================
-- 14. TABLA: inv_bodegas (Almacenes Físicos por Campus y Club Militar)
-- ============================================================================
CREATE TABLE inv_bodegas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
    code VARCHAR(30) NOT NULL, -- ej. 'BOD-CENTRAL-QUI', 'BOD-ECON-CUM', 'BOD-ARMENIA'
    name VARCHAR(120) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'BODEGA_GENERAL', 
        'ECONOMATO_COCINA', 
        'BAR_PISCINA', 
        'BODEGA_MENAJE_PROTOCOLAR',
        'ALMACEN_TRANSITO'
    )),
    manager_user_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_tenant_bodega_code UNIQUE (tenant_id, code)
);

-- ============================================================================
-- 15. TABLA: inv_articulos (Maestro de Artículos, Existencias y Costos)
-- ============================================================================
CREATE TABLE inv_articulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    categoria_id UUID NOT NULL REFERENCES inv_categorias(id) ON DELETE RESTRICT,
    sku VARCHAR(40) NOT NULL, -- ej. 'ALM-PROT-RES', 'BEB-GASE-COLA', 'MEN-TENED-GALA'
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(20) NOT NULL CHECK (unit_of_measure IN (
        'UNIDAD', 'DOCENA', 'KG', 'LIBRA', 'LITRO', 'PAQUETE', 'CAJA', 'BOTELLA'
    )),
    is_returnable BOOLEAN NOT NULL DEFAULT false, -- true para menaje, cristalería y vajilla
    replacement_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Costo de cobro al socio por rotura
    pmp_cost DECIMAL(10,4) NOT NULL DEFAULT 0.0000, -- Precio Medio Ponderado ($/unidad)
    last_purchase_cost DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    current_stock DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    min_stock DECIMAL(12,2) NOT NULL DEFAULT 10.00,
    reorder_point DECIMAL(12,2) NOT NULL DEFAULT 25.00, -- Punto de Reorden (ROP)
    max_stock DECIMAL(12,2) NOT NULL DEFAULT 100.00,
    lead_time_days INT NOT NULL DEFAULT 3, -- Días de entrega del proveedor
    barcode VARCHAR(60),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_inv_art_tenant_sku UNIQUE (tenant_id, sku),
    CONSTRAINT chk_stock_non_negative CHECK (current_stock >= 0)
);

CREATE INDEX idx_inv_articulos_tenant_cat ON inv_articulos(tenant_id, categoria_id);
CREATE INDEX idx_inv_articulos_reorder ON inv_articulos(tenant_id, current_stock, reorder_point);

-- ============================================================================
-- 16. TABLA: inv_recetas_fichas_tecnicas (Fichas Técnicas Turnos & Banquetes)
-- ============================================================================
CREATE TABLE inv_recetas_fichas_tecnicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(40) NOT NULL, -- ej. 'FICHA-TURNO-ALMUERZO', 'FICHA-BANQUETE-GALA'
    name VARCHAR(150) NOT NULL,
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN (
        'TURNO_DESAYUNO', 
        'TURNO_ALMUERZO', 
        'TURNO_CENA', 
        'EVENTO_BANQUETE', 
        'EVENTO_COCTEL', 
        'PARRILLADA_CAMPESTRE'
    )),
    description TEXT,
    standard_portion_pax INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_receta_tenant_code UNIQUE (tenant_id, code)
);

-- ============================================================================
-- 17. TABLA: inv_receta_detalles (Explosión de Insumos por Persona / PAX)
-- ============================================================================
CREATE TABLE inv_receta_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receta_id UUID NOT NULL REFERENCES inv_recetas_fichas_tecnicas(id) ON DELETE CASCADE,
    articulo_id UUID NOT NULL REFERENCES inv_articulos(id) ON DELETE RESTRICT,
    quantity_per_pax DECIMAL(10,4) NOT NULL, -- Cantidad unitaria requerida por persona
    waste_allowance_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- % merma técnica
    notes TEXT,
    CONSTRAINT uq_receta_articulo UNIQUE (receta_id, articulo_id)
);

-- ============================================================================
-- 18. TABLA: inv_kardex_movimientos (Libro Mayor de Movimientos Perpetuos)
-- ============================================================================
CREATE TABLE inv_kardex_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    bodega_id UUID NOT NULL REFERENCES inv_bodegas(id) ON DELETE RESTRICT,
    articulo_id UUID NOT NULL REFERENCES inv_articulos(id) ON DELETE RESTRICT,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN (
        'ENTRADA_COMPRA', 
        'SALIDA_TURNO_DESAYUNO', 
        'SALIDA_TURNO_ALMUERZO', 
        'SALIDA_TURNO_CENA', 
        'SALIDA_EVENTO_BANQUETE', 
        'RETORNO_MENAJE', 
        'ROTURA_MENAJE', 
        'MERMA_COCINA', 
        'AJUSTE_INVENTARIO', 
        'TRANSFERENCIA_BODEGA'
    )),
    reference_document VARCHAR(100), -- Clave de factura, N.º turno o ID reserva
    quantity DECIMAL(12,2) NOT NULL,
    unit_cost DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    previous_stock DECIMAL(12,2) NOT NULL,
    new_stock DECIMAL(12,2) NOT NULL,
    resulting_pmp DECIMAL(10,4) NOT NULL,
    movement_timestamp TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    user_id UUID,
    observations TEXT
);

CREATE INDEX idx_kardex_tenant_art_fecha ON inv_kardex_movimientos(tenant_id, articulo_id, movement_timestamp DESC);

-- ============================================================================
-- 19. TABLA: inv_eventos_consumo_menaje (Control de Menaje y Roturas en Eventos)
-- ============================================================================
CREATE TABLE inv_eventos_consumo_menaje (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    articulo_id UUID NOT NULL REFERENCES inv_articulos(id) ON DELETE RESTRICT,
    dispatched_quantity INT NOT NULL, -- Menaje entregado a salón
    returned_quantity INT NOT NULL DEFAULT 0, -- Menaje devuelto íntegro
    damaged_broken_quantity INT NOT NULL DEFAULT 0, -- Roto o inutilizado
    lost_quantity INT NOT NULL DEFAULT 0, -- Extraviado
    unit_charge_cost DECIMAL(10,2) NOT NULL, -- Costo de reposición
    total_billed_to_member DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    audit_status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (audit_status IN (
        'PENDIENTE', 'REVISADO_PARCIAL', 'CONCILIADO', 'FACTURADO_ROTURA'
    )),
    audited_by_user_id UUID,
    audited_at TIMESTAMPTZ,
    CONSTRAINT chk_menaje_quantities CHECK (
        returned_quantity + damaged_broken_quantity + lost_quantity <= dispatched_quantity
    )
);

CREATE INDEX idx_menaje_reservation ON inv_eventos_consumo_menaje(reservation_id);

-- ============================================================================
-- 20. TABLA: inv_facturas_adquisicion (Ingreso de Facturas de Proveedores SRI)
-- ============================================================================
CREATE TABLE inv_facturas_adquisicion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    bodega_id UUID NOT NULL REFERENCES inv_bodegas(id) ON DELETE RESTRICT,
    supplier_ruc CHAR(13) NOT NULL,
    supplier_name VARCHAR(150) NOT NULL, -- ej. 'PRONACA', 'TESALIA SPRINGS', 'INDURMESA'
    invoice_number VARCHAR(17) NOT NULL, -- ej. '001-002-000045892'
    access_key CHAR(49) NOT NULL UNIQUE, -- Clave de acceso SRI 49 dígitos
    authorization_number VARCHAR(49),
    issue_date DATE NOT NULL,
    subtotal_0 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    subtotal_15 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_15 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    reception_status VARCHAR(20) NOT NULL DEFAULT 'BORRADOR' CHECK (reception_status IN (
        'BORRADOR', 'VERIFICADO_SRI', 'INGRESADO_KARDEX', 'ANULADO'
    )),
    xml_payload TEXT,
    received_by_user_id UUID,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ============================================================================
-- 21. TABLA: inv_factura_detalles (Líneas de Factura de Compra Recibida)
-- ============================================================================
CREATE TABLE inv_factura_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id UUID NOT NULL REFERENCES inv_facturas_adquisicion(id) ON DELETE CASCADE,
    articulo_id UUID NOT NULL REFERENCES inv_articulos(id) ON DELETE RESTRICT,
    supplier_item_code VARCHAR(60),
    description VARCHAR(200) NOT NULL,
    quantity_received DECIMAL(12,2) NOT NULL CHECK (quantity_received > 0),
    unit_cost DECIMAL(10,4) NOT NULL CHECK (unit_cost >= 0),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    lot_number VARCHAR(50),
    expiration_date DATE,
    CONSTRAINT uq_factura_articulo UNIQUE (factura_id, articulo_id)
);
```

---

### 2.4. Modelos Matemáticos de Valoración Contable (PMP/FIFO), Optimización de Existencias y Explosión BoM

#### 2.4.1. Ecuación Formal de Precio Medio Ponderado (PMP - NIC 2)
De acuerdo a la Norma Internacional de Contabilidad N.º 2 (NIC 2 - Inventarios) y el régimen tributario del SRI de la República del Ecuador, los almacenes y economatos militares aplican el método de **Precio Medio Ponderado (PMP)** continuo para la valuación de existencias.

Al registrarse una compra o ingreso a bodega de $Q_{in}$ unidades con costo unitario de adquisición $C_{in}$, teniendo un saldo de existencias previo $Q_{prev}$ con valor ponderado $PMP_{prev}$:

1. **Nuevo Saldo Físico:**
   $$Q_{final} = Q_{prev} + Q_{in}$$

2. **Nuevo Precio Medio Ponderado:**
   $$PMP_{final} = \frac{(Q_{prev} \times PMP_{prev}) + (Q_{in} \times C_{in})}{Q_{final}}$$

3. **Regla Inmutable para Egresos:**
   Toda salida por consumo de comanda de restaurante (`SALIDA_TURNO_*`) o evento institucional (`SALIDA_EVENTO_BANQUETE`) se valoriza al $PMP_{actual}$ vigente al momento de la transacción:
   $$\text{CostoSalida} = Q_{salida} \times PMP_{actual}$$
   El valor unitario del inventario remanente permanece invariable tras la salida.

#### 2.4.2. Gestión FIFO / PEPS por Lotes para Perecibles
Para artículos clasificados como alimentos perecibles (carnes de res, pollo, mariscos, lácteos y verduras de corte):
- Cada lote recibido vía factura SRI registra `lot_number` y `expiration_date` en `inv_factura_detalles`.
- El motor de sugerencia de cocina implementa la regla **FIFO (First In, First Out / Primero en Entrar, Primero en Salir)**, alertando a los mayordomos de cocina para dar salida prioritaria a los lotes con fecha de caducidad más cercana.

#### 2.4.3. Algoritmo de Punto de Reorden ($ROP$) y Stock de Seguridad ($SS$)
Para impedir quiebres de existencias durante la atención de ranchos de tropa, comedores de oficiales o banquetes institucionales:

1. **Stock de Seguridad ($SS$):**
   $$SS = Z \times \sigma_d \times \sqrt{L}$$
   - $Z$: Coeficiente de nivel de servicio castrense (estándar $Z = 1.65$ para un 95% de confiabilidad contra quiebres).
   - $\sigma_d$: Desviación estándar del consumo diario.
   - $L$: Tiempo de entrega del proveedor en días (*Lead Time*).

2. **Punto de Reorden ($ROP$):**
   $$ROP = (d \times L) + SS$$
   - $d$: Tasa de demanda o consumo promedio diario.

3. **Semáforo Institucional de Existencias:**
   - **Crítico / Peligro (Rojo):** $\text{Stock} \le SS$ (Desencadena alerta urgente al departamento de compras).
   - **Reorden Requerido (Amarillo):** $SS < \text{Stock} \le ROP$ (Se sugiere emitir orden de reposición).
   - **Nivel Óptimo (Verde):** $ROP < \text{Stock} \le \text{Stock}_{max}$.
   - **Sobrestock (Azul):** $\text{Stock} > \text{Stock}_{max}$ (Riesgo de inmovilización de capital o merma de perecibles).

#### 2.4.4. Algoritmo de Explosión de Recetas (Bill of Materials) por Turno y Banquete (PAX)
Para un servicio de comedor diario o banquete institucional con $N$ comensales (PAX) y una ficha técnica asignada $R$:

1. **Descuento de Insumos Consumibles (Alimentos, Bebidas y Descartables):**
   $$\forall i \in \text{Ingredientes}(R): \quad \Delta Q(i) = -1 \times \left[ N \times q_{pax}(i) \times \left(1 + \frac{\text{merma}(i)}{100}\right) \right]$$
   - $q_{pax}(i)$: Cantidad neta requerida por comensal (ej. 0.25 kg de lomo fino, 1 botella de gaseosa, 2 servilletas).
   - $\text{merma}(i)$: Factor porcentual de merma técnica o desperdicio en cocción/manipulación.

2. **Asignación y Custodia de Menaje Retornable:**
   Para artículos clasificados como vajilla o cubertería de gala ($m \in \text{Menaje}(R)$):
   $$Q_{despachado}(m) = N \times q_{pax}(m)$$
   Las existencias en bodega disminuyen temporalmente en $Q_{despachado}(m)$ y se transfiere la custodia al supervisor del evento mediante acta digital.

#### 2.4.5. Auditoría de Menaje Post-Evento y Liquidación de Roturas
Al finalizar la recepción militar o banquete:
1. **Balance de Menaje Físico:**
   $$\text{Roturas}(m) = \max\left(0, Q_{despachado}(m) - Q_{devuelto}(m)\right)$$
2. **Reingreso a Bodega:**
   Se asienta un movimiento `RETORNO_MENAJE` en el Kardex por las piezas en buen estado ($Q_{devuelto}(m)$), reestableciendo el stock en almacén.
3. **Merma por Rotura y Débito Financiero al Socio:**
   Se asienta un movimiento `ROTURA_MENAJE` por la diferencia y se liquida el cargo económico:
   $$\text{CargoFinancieroSocio} = \sum_m \left( \text{Roturas}(m) \times \text{CostoReposicion}(m) \right)$$
   Este cargo se incorpora automáticamente a la factura final del evento o a la planilla mensual de cuotas del socio oficial.

---

### 2.5. Red de Bodegas Físicas Multi-Tenant por Campus Militar

Cada institución castrense opera sus propias bodegas y centros de consumo, aisladas estrictamente mediante `tenant_id`:

1. **CROE (Club de Recreación de Oficiales del Ejército):**
   - **Sede Central / Cumbayá (Quito):**
     * `BOD-CROE-CUM-01` (Bodega General Central): Almacenamiento de secos, abarrotes y descartables.
     * `BOD-CROE-CUM-ECO` (Economato de Cocina Cumbayá): Frigoríficos, carnes y preparación de minutas.
     * `BOD-CROE-CUM-MEN` (Bodega de Menaje y Cubertería de Gala): Vajilla con filo dorado y cristalería.
   - **Complejo Recreacional Sangolquí (Valle de Los Chillos):**
     * `BOD-CROE-SAN-01` (Bodega de Alimentos y Bebidas Sangolquí): Víveres para restaurante y parrilladas campestres.
     * `BOD-CROE-SAN-BAR` (Bar Piscina y Kiosco Recreacional).
   - **Complejo Vacacional Salinas (Santa Elena):**
     * `BOD-CROE-SAL-01` (Almacén General Costa): Insumos de hostelería, desayunos y mantenimiento de cabañas.

2. **Círculo Militar del Ecuador:**
   - **Sede Central / Edificio Orellana (Quito):**
     * `BOD-CIRC-ORE-01` (Bodega Central Orellana): Abastecimiento principal, conservas y licores de protocolo.
     * `BOD-CIRC-ORE-RES` (Restaurante Oficiales Orellana): Cocina para almuerzos ejecutivos y cenas de gala.
   - **Complejo Social y Deportivo La Armenia (Valle de Los Chillos):**
     * `BOD-CIRC-ARM-01` (Bodega General La Armenia): Insumos recreativos, cafetería y canchas.
     * `BOD-CIRC-ARM-MEN` (Bodega Protocolar Gran Salón): Menaje con sello heráldico de 1918 para eventos de hasta 500 PAX.

---

### 2.6. Pipeline de Ingesta de Facturas Electrónicas SRI y Arquitectura POS/Banquetes

#### 2.6.1. Pipeline de Ingesta XML SRI (Abastecimiento a Bodega)
El flujo automatizado de recepción de mercadería permite registrar adquisiciones sin digitación manual propensa a error:

1. **Carga y Validación de Esquema XML:**
   - El bodeguero militar carga el comprobante electrónico XML emitido por el distribuidor (ej. Pronaca, Tesalia Springs, Indurmesa).
   - El motor valida el esquema XML contra la especificación XSD del SRI versión 1.1.0/2.1.0 (Comprobante Factura).
2. **Extracción Automática de Metadatos Tributarios:**
   - **RUC del Proveedor:** 13 dígitos numéricos (validación con módulo 11).
   - **Clave de Acceso SRI:** 49 dígitos numéricos (incluye fecha de emisión, tipo comprobante `01`, RUC, tipo ambiente, serie, secuencial, código numérico y dígito verificador).
   - **Desglose Impositivo:** Subtotal 0% (alimentos no procesados), Subtotal 15% (procesados y enseres), Monto del IVA 15% y Total a Pagar.
3. **Mapeo de Ítems al Catálogo Institucional:**
   - El motor busca coincidencia por código de proveedor o SKU interno (`inv_articulos`).
   - Si el artículo existe, se asocian las unidades recibidas y costo unitario pactado.
4. **Transacción Atómica de Ingreso en Base de Datos:**
   - Se inserta la cabecera en `inv_facturas_adquisicion` con estado `INGRESADO_KARDEX`.
   - Se insertan las líneas en `inv_factura_detalles`.
   - Se genera el movimiento `ENTRADA_COMPRA` en `inv_kardex_movimientos` para cada ítem.
   - Se incrementa `current_stock` en `inv_articulos` y se recalcula el `pmp_cost` según la fórmula NIC 2.

#### 2.6.2. Arquitectura de Integración POS y Comandas de Restaurante
1. **Comanda Digital en Sala:** Los meseros militares en comedores registran consumos desde tablets o terminales táctiles POS.
2. **Impacto en Tiempo Real:** Al confirmar la comanda, se dispara un webhook interno hacia el motor de inventarios para descontar existencias de forma inmediata, evitando discrepancias entre la cocina y la bodega.
3. **Cierre de Caja y Conciliación:** Al término de cada turno (Desayuno, Almuerzo, Cena), el sistema genera el reporte de consumos teóricos vs físicos, facilitando arqueos diarios y auditorías de mermas.

### 3.1. Justificación del Modelo: Shared Database con PostgreSQL Row Level Security (RLS)
Tras evaluar los tres paradigmas de multi-tenancy (Base de datos separada, Esquema separado por tenant y Base de datos compartida con discriminador y RLS), se determinó que **Shared Database / Shared Schema con RLS** es la opción técnica superior para los clubes militares de Ecuador:
1. **Viabilidad de Convenios Recíprocos (M8):** Permite ejecutar consultas directas entre la oferta de cabañas del CROE en Salinas y los socios del Círculo Militar sin costosas réplicas de datos ni sincronizaciones asíncronas propensas a fallas.
2. **Eficiencia en Costos de Infraestructura:** Reduce en un 65% el gasto de aprovisionamiento en la nube (AWS RDS / Azure PostgreSQL / Supabase Enterprise) frente al modelo de bases de datos duplicadas.
3. **Mantenimiento y Auditoría Centralizada:** Las migraciones de base de datos se aplican una sola vez de forma atómica para ambos clubes, asegurando consistencia de versiones y facilitando auditorías forenses consolidadas.

### 3.2. Implementación de Políticas de Seguridad a Nivel de Fila (RLS DDL)

El aislamiento de datos no depende del código de la aplicación. Se aplica en el motor de base de datos a través de `PostgreSQL Row Level Security`.

```sql
-- ============================================================================
-- FUNCIÓN DETERMINISTA PARA OBTENER EL TENANT EN SESIÓN
-- ============================================================================
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
BEGIN
    RETURN NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- ACTIVACIÓN DE RLS Y CREACIÓN DE POLÍTICAS POR TABLA
-- ============================================================================

-- Tabla members
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_members_isolation ON members
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla dependents
ALTER TABLE dependents ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_dependents_isolation ON dependents
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla campuses
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_campuses_isolation ON campuses
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id());

-- Tabla facilities
ALTER TABLE facilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_facilities_isolation ON facilities
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id() OR is_active = true); -- Visible para consultas de reciprocidad

-- Tabla reservations
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_reservations_isolation ON reservations
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla membership_dues
ALTER TABLE membership_dues ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_dues_isolation ON membership_dues
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla payment_transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_payments_isolation ON payment_transactions
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla electronic_invoices_sri
ALTER TABLE electronic_invoices_sri ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_invoices_isolation ON electronic_invoices_sri
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- ============================================================================
-- ACTIVACIÓN DE RLS PARA TABLAS DE INVENTARIO, ECONOMATO Y FACTURAS
-- ============================================================================

-- Tabla inv_categorias
ALTER TABLE inv_categorias ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_inv_categorias_isolation ON inv_categorias
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla inv_bodegas
ALTER TABLE inv_bodegas ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_inv_bodegas_isolation ON inv_bodegas
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla inv_articulos
ALTER TABLE inv_articulos ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_inv_articulos_isolation ON inv_articulos
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla inv_recetas_fichas_tecnicas
ALTER TABLE inv_recetas_fichas_tecnicas ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_inv_recetas_isolation ON inv_recetas_fichas_tecnicas
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla inv_receta_detalles (Aislamiento heredado vía FK a receta)
ALTER TABLE inv_receta_detalles ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_inv_receta_detalles_isolation ON inv_receta_detalles
    AS RESTRICTIVE
    USING (receta_id IN (SELECT id FROM inv_recetas_fichas_tecnicas WHERE tenant_id = current_tenant_id()))
    WITH CHECK (receta_id IN (SELECT id FROM inv_recetas_fichas_tecnicas WHERE tenant_id = current_tenant_id()));

-- Tabla inv_kardex_movimientos
ALTER TABLE inv_kardex_movimientos ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_inv_kardex_isolation ON inv_kardex_movimientos
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla inv_eventos_consumo_menaje
ALTER TABLE inv_eventos_consumo_menaje ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_inv_menaje_isolation ON inv_eventos_consumo_menaje
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla inv_facturas_adquisicion
ALTER TABLE inv_facturas_adquisicion ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_inv_facturas_isolation ON inv_facturas_adquisicion
    AS RESTRICTIVE
    USING (tenant_id = current_tenant_id())
    WITH CHECK (tenant_id = current_tenant_id());

-- Tabla inv_factura_detalles (Aislamiento heredado vía FK a factura)
ALTER TABLE inv_factura_detalles ENABLE ROW LEVEL SECURITY;
CREATE POLICY rls_inv_factura_detalles_isolation ON inv_factura_detalles
    AS RESTRICTIVE
    USING (factura_id IN (SELECT id FROM inv_facturas_adquisicion WHERE tenant_id = current_tenant_id()))
    WITH CHECK (factura_id IN (SELECT id FROM inv_facturas_adquisicion WHERE tenant_id = current_tenant_id()));
```

### 3.3. Middleware de Resolución de Tenant en el Backend
Cada petición entrante se analiza en el middleware de la API antes de tocar la base de datos:

```typescript
// middleware/tenantResolver.ts
import { Request, Response, NextFunction } from 'express';
import { pool } from '../database';

export async function tenantResolverMiddleware(req: Request, res: Response, next: NextFunction) {
  const host = req.headers.host || '';
  let tenantCode = 'CROE'; // Default institucional

  if (host.includes('circulomilitar') || req.headers['x-tenant-code'] === 'CIRCULO_MILITAR') {
    tenantCode = 'CIRCULO_MILITAR';
  } else if (host.includes('croe') || req.headers['x-tenant-code'] === 'CROE') {
    tenantCode = 'CROE';
  }

  try {
    // Obtener UUID del tenant en caché de memoria o DB
    const tenantQuery = await pool.query('SELECT id, code, legal_name FROM tenants WHERE code = $1', [tenantCode]);
    if (tenantQuery.rows.length === 0) {
      return res.status(404).json({ error: 'Tenant militar no registrado' });
    }

    const tenant = tenantQuery.rows[0];
    req.tenant = tenant;

    // Envolver la sesión de base de datos con el tenant actual
    const client = await pool.connect();
    await client.query(`SET LOCAL app.current_tenant_id = '${tenant.id}'`);
    req.dbClient = client;

    res.on('finish', () => client.release());
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Falla al resolver el contexto institucional' });
  }
}
```

### 3.4. Sistema de Diseño White-Label y Tokens Visuales
El prototipo y la solución final inyectan tokens de CSS dinámicamente según el tenant activo, garantizando la identidad heráldica correspondiente:

```html
<!-- Inyección en el elemento raíz del DOM -->
<div id="root" data-tenant="croe"> <!-- o data-tenant="circulo-militar" -->
```

| Variable de Diseño | Identidad CROE | Identidad Círculo Militar del Ecuador |
| :--- | :--- | :--- |
| **`--color-primary`** | `#8B1E24` (Rojo Granate / Vino Tinto Ejército) | `#1B365D` (Azul Marino Profundo Institucional) |
| **`--color-primary-dark`**| `#671418` (Granate Oscuro de Gala) | `#12243F` (Azul Noche Protocolar) |
| **`--color-accent`** | `#D4AF37` (Oro Insignia / Galón Militar) | `#C8A051` (Dorado Imperial Tradición 1918) |
| **`--color-bg-subtle`** | `#FFF7F7` (Gris Cálido con tinte rubí) | `#F0F4F8` (Blanco Humo Azulado) |
| **Emblema Central** | Escudo cuartelado con estrella dorada central | Sello circular de laureles y escudo de armas |
| **Lema Oficial** | *"EL PLACER DE SERVIR"* | *"UNIÓN, HONOR Y TRADICIÓN"* |
| **Tipografía de Título** | `Cinzel, Georgia, serif` | `Montserrat, sans-serif` |

---

## 4. INTEGRACIÓN DE PASARELAS DE PAGO Y FACTURACIÓN ELECTRÓNICA SRI

### 4.1. Payphone Ecuador: Flujo de Botón de Pagos y Notificación Push
Payphone es la pasarela ecuatoriana líder para transacciones directas en billetera móvil y tarjeta de crédito/débito bancarias (Visa/Mastercard de Banco Pichincha, Guayaquil, Pacífico, Internacional, etc.).

#### A. Especificación API Prepare Button
Para iniciar un cobro de cuota social o reserva de cabaña, el backend genera el cobro contra el endpoint oficial:
- **Endpoint:** `POST https://pay.payphonetodoesposible.com/api/button/Prepare`
- **Headers:** 
  - `Authorization: Bearer <TOKEN_DE_TENANT_PAYPHONE>`
  - `Content-Type: application/json`
- **Payload Técnico (Valores en centavos de dólar según especificación Payphone):**
```json
{
  "responseUrl": "https://clubes.ec/api/v1/payments/payphone/callback",
  "cancellationUrl": "https://clubes.ec/api/v1/payments/payphone/cancel",
  "amount": 11500,
  "amountWithoutTax": 0,
  "amountWithTax": 10000,
  "tax": 1500,
  "service": 0,
  "tip": 0,
  "currency": "USD",
  "clientTransactionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "reference": "Reserva Cabaña Salinas CROE-RES-2026-00891",
  "email": "crnl.mendoza@ejercito.mil.ec",
  "phoneNumber": "0998765432",
  "documentId": "1712345678"
}
```

#### B. Especificación API Confirmación Server-to-Server
Cuando el socio militar completa el pago en la pasarela o en su aplicación móvil Payphone, la pasarela redirecciona al usuario al backend institucional. El servidor ejecuta de inmediato la validación obligatoria:
- **Endpoint:** `POST https://pay.payphonetodoesposible.com/api/button/Confirm`
- **Payload:**
```json
{
  "id": 849302,
  "clientTxId": "f47ac10b-58cc-4372-a567-0e02b2c3d479"
}
```
- **Validación del Estado:** Solo si la respuesta contiene `statusCode: 3` (`Approved`), se procede a actualizar `payment_transactions.status = 'APPROVED'` y confirmar la reserva de la cabaña.

---

### 4.2. Kushki Ecuador: Tokenización, Pagos Diferidos y Validación HMAC

Kushki ofrece soporte integral para pagos diferidos en cooperativas y banca privada ecuatoriana (3, 6 y 12 meses con y sin intereses), crucial para membresías anuales o eventos en salones de honor.

#### A. Tokenización Segura en Frontend
El front-end nunca toca los datos del número de tarjeta. Se emplea la librería oficial de Kushki:
```javascript
const kushki = new Kushki({
  merchantId: tenantBillingSettings.kushkiPublicMerchantId,
  inTestEnvironment: true
});

kushki.requestToken({
  amount: { subtotalIva: 100.00, subtotalIva0: 0, iva: 15.00 },
  currency: 'USD',
  card: { name, number, cvc, expiryMonth, expiryYear }
}, (response) => {
  if (response.token) {
    enviarTokenAlBackend(response.token, mesesDiferido);
  }
});
```

#### B. Validación Criptográfica del Webhook de Kushki (HMAC-SHA256)
Para asegurar que las notificaciones no sean alteradas o interceptadas:
```typescript
import * as crypto from 'crypto';

export function verifyKushkiWebhookSignature(
  rawBody: string, 
  signatureHeader: string, 
  webhookSecret: string
): boolean {
  const calculatedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(calculatedSignature, 'utf-8'),
    Buffer.from(signatureHeader, 'utf-8')
  );
}
```

---

### 4.3. Máquina de Estados de Pagos y Conciliación Nocturna 02:00 AM

```
              +---------------------------------------------+
              |                  INITIATED                  |
              +---------------------------------------------+
                                     |
                                     v
              +---------------------------------------------+
              |               PENDING_GATEWAY               |
              +---------------------------------------------+
                   /                 |                   \
                  /                  |                    \
                 v                   v                     v
      +--------------------+ +---------------+ +--------------------+
      |      REJECTED      | |    EXPIRED    | |      APPROVED      |
      +--------------------+ +---------------+ +--------------------+
                                                         |
                                                         v
                                               +--------------------+
                                               |    INVOICED_SRI    |
                                               +--------------------+
                                                         | (En caso de anulación)
                                                         v
                                               +--------------------+
                                               |      REFUNDED      |
                                               +--------------------+
```

#### Job de Conciliación Financiera (Cron 02:00 AM UTC-5 Ecuador):
El cron institucional:
1. Conecta vía SFTP o API con los servidores de Payphone y Kushki.
2. Descarga el reporte consolidado de lotes liquidados del día anterior.
3. Cruza cada transacción contra la base de datos usando `client_transaction_id`.
4. Valida los valores netos recibidos restando comisiones operativas (ej. 3.99% + $0.20 + IVA sobre comisiones) y retenciones de ley (1.75% fuente y 70% de IVA retenido a emisores).
5. En caso de descuadres mayores a $0.01, envía alerta cifrada al Auditor Financiero del Club.

---

### 4.4. Generación de Facturación Electrónica SRI (Módulo 11)

La emisión de facturas para los clubes cumple la ficha técnica oficial del SRI:

#### Algoritmo Oficial de Clave de Acceso de 49 Dígitos:
```
Campo 1: Fecha de emisión (8 dígitos: DDMMAAAA)
Campo 2: Tipo de comprobante (2 dígitos: '01' para Factura)
Campo 3: RUC de la institución (13 dígitos)
Campo 4: Tipo de ambiente (1 dígito: '1' pruebas, '2' producción)
Campo 5: Serie (Establecimiento + Punto de Emisión, 6 dígitos: ej. '001001')
Campo 6: Número secuencial (9 dígitos: ej. '000000891')
Campo 7: Código numérico de seguridad (8 dígitos aleatorios)
Campo 8: Tipo de emisión (1 dígito: '1' normal)
Campo 9: Dígito verificador (1 dígito calculado con Módulo 11)
```

```typescript
// utils/sriModulo11.ts
export function calculateSriModulo11(clave48: string): number {
  const factores = [2, 3, 4, 5, 6, 7];
  let suma = 0;
  let factorIndex = 0;

  for (let i = clave48.length - 1; i >= 0; i--) {
    suma += parseInt(clave48[i], 10) * factores[factorIndex];
    factorIndex = (factorIndex + 1) % factores.length;
  }

  const residuo = suma % 11;
  const digitoVerificador = 11 - residuo;

  if (digitoVerificador === 11) return 0;
  if (digitoVerificador === 10) return 1;
  return digitoVerificador;
}
```

---

## 5. HOJA DE RUTA DETALLADA: 11 MÓDULOS FUNCIONALES + 2 TRANSVERSALES

La plataforma se despliega a lo largo de **10 meses organizados en 5 fases estratégicas**, cubriendo el 100% de los requerimientos operativos de ambos clubes:

```
+-------------------------------------------------------------------------------------------------------+
| FASE 0: Prototipo Interactivo & Validación Directiva (Semana 1 - Hito de Negociación de Martes)       |
+-------------------------------------------------------------------------------------------------------+
| FASE 1: Núcleo Operativo, Carné Digital TOTP y Garita (Meses 1 - 2)                                  |
|   - M1: Portal del Socio y Expediente Militar                                                         |
|   - M2: Carné Digital 3D y Control de Acceso Garita QR/NFC                                            |
|   - T1: Seguridad, RBAC y Auditoría Forense                                                           |
|   - T2: Cumplimiento LOPDP Ecuador                                                                    |
+-------------------------------------------------------------------------------------------------------+
| FASE 2: Central de Reservas & Recaudación Digital (Meses 3 - 4)                                       |
|   - M3: Central de Reservas (Cabañas Salinas, Suites Los Chillos, Canchas Pádel/Tenis)                |
|   - M4: Pasarela de Pagos (Payphone & Kushki Producción)                                              |
|   - M5: Gestión Financiera, Cuotas y Facturación Electrónica SRI (IVA 15%)                            |
+-------------------------------------------------------------------------------------------------------+
| FASE 3: Operación en Sedes, Restaurantes POS & Protocolo Militar (Meses 5 - 6)                        |
|   - M6: Control de Alimentos, Bebidas y Restaurantes (Comanderos POS en Sedes)                        |
|   - M7: Eventos Institucionales, Aniversarios y Protocolo Militar Castrense                           |
+-------------------------------------------------------------------------------------------------------+
| FASE 4: Convenios Interinstitucionales & Deporte Integral (Meses 7 - 8)                               |
|   - M8: Convenios Interinstitucionales (CROE - Círculo Militar - FF.AA.)                              |
|   - M9: Escuela Deportiva y Cursos Vacacionales para Cargas                                           |
|   - M10: Directorio Oficial y Comunicaciones de Presidencia                                           |
+-------------------------------------------------------------------------------------------------------+
| FASE 5: Portal de Bienestar, Apps Nativas & Certificación LOPDP (Meses 9 - 10)                        |
|   - M11: Portal de Bienestar, Auxilio Funerario y Convenios Comerciales                               |
|   - Apps Nativas Móviles (iOS Apple Wallet / Android Google Wallet)                                   |
|   - Auditoría Externa de Seguridad y Certificación Final LOPDP                                        |
+-------------------------------------------------------------------------------------------------------+
```

### 5.1. Desglose Exhaustivo de Módulos

#### M1: Portal del Socio y Expediente Militar
- **Alcance:** Digitalización integral de la hoja de vida castrense de oficiales activos, pasivos y montepío.
- **Campos Específicos:** Cédula, carné militar, arma o servicio (Infantería, Caballería, Aviación del Ejército, Marina, etc.), promoción de graduación (ESMIL / ESSUNA / ESMA), registro de cargas familiares con verificación de parentesco.
- **Entregables:** Perfil interactivo, panel de actualización de datos, consulta de aportaciones históricas.

#### M2: Carné Digital 3D y Control de Acceso Garita QR/NFC
- **Alcance:** Sustitución de credenciales físicas por carné digital interactivo con renderizado 3D y código QR dinámico TOTP.
- **Seguridad QR:** La semilla criptográfica cambia cada 45 segundos, imposibilitando el uso de capturas de pantalla de WhatsApp.
- **Terminal de Garita:** Aplicación táctil optimizada para que los Clases y Oficiales de Guardia en garitas militares escaneen el QR, verifiquen foto del titular, confirmen cargas autorizadas y registren placa del vehículo.

#### M3: Central de Reservas (Hospedaje Vacacional y Espacios Deportivos)
- **Alcance:** Motor de reservas con prevención de colisiones horarias en tiempo real.
- **Catálogo:** Cabañas en Salinas, Suites en Valle de Los Chillos, canchas de pádel, canchas de arcilla de tenis, fútbol sintético y salones de banquetes.
- **Reglas de Prelación:** Algoritmo que prioriza a oficiales en servicio activo o socios según antigüedad militar para feriados de alta demanda (Carnaval, Semana Santa, Fin de Año).

#### M4: Pasarela de Pagos y Recaudación Integrada
- **Alcance:** Integración certificada con Payphone y Kushki en ambiente de producción con soporte de tarjetas nacionales e internacionales.
- **Funcionalidades:** Cobro por enlace web, cobro por push celular y opciones de diferido sin intereses. Emisión inmediata del comprobante digital.

#### M5: Gestión Financiera, Cuotas y Facturación Electrónica SRI
- **Alcance:** Automatización del ciclo de cobro de membresías mensuales.
- **SRI:** Conexión con los WebServices de Recepción y Autorización del SRI, firma electrónica `.p12`, generación de XML firmado y envío automático del RIDE PDF al correo del oficial militar.
- **Integración ISSFA:** Generación de archivos planos de descuento bancario y rol de pago militar.

#### M6: Control de Alimentos, Bebidas, Turnos de Restaurante y Economato (POS Sedes)
- **Alcance:** Sistema integral de comandas digitales y control de economato para comedores de oficiales, cafeterías, ranchos y bares de piscina en las sedes sociales.
- **Gestión por Turnos de Comedor:** Operación segmentada en tres turnos diarios de rancho y restaurante: **Desayuno**, **Almuerzo** y **Cena**, con menús institucionales y control de cupos comensales.
- **Explosión Instantánea de Insumos (Bill of Materials):** Al ejecutarse un turno o comanda, el motor calcula y deduce automáticamente del inventario físico (`inv_articulos`) las porciones de carnes, guarniciones, bebidas y descartables conforme a la ficha técnica (`inv_recetas_fichas_tecnicas`).
- **Kardex Perpetuo y Costeo PMP:** Asiento contable automático de salidas en el Kardex (`inv_kardex_movimientos`) valorizadas al Precio Medio Ponderado (PMP - NIC 2), con alertas visuales de semáforo (Punto de Reorden - ROP y Stock de Seguridad).
- **Motor de Ingesta de Facturas SRI (Abastecimiento):** Pipeline de recepción de comprobantes electrónicos XML/PDF de distribuidores autorizados (Pronaca, Tesalia, Indurmesa). Extrae RUC, Clave de Acceso de 49 dígitos, desglosa IVA al 15% y genera el movimiento de `ENTRADA_COMPRA` recalculando el costo ponderado.
- **Formas de Pago:** Cargo directo a la cuenta mensual del socio (post-pago con límite de crédito por grado militar) o pago inmediato con tarjeta/Payphone en la mesa.

#### M7: Eventos Institucionales, Banquetes Protocolarios y Control de Menaje
- **Alcance:** Módulo de reservación y logística para ceremonias castrenses: ascensos de grado, aniversarios de promoción, matrimonios de oficiales y banquetes institucionales de alta capacidad (PAX).
- **Planificación por Comensales (PAX):** Selector dinámico de asistentes que escala de manera matemática la explosión de insumos gastronómicos, menús de gala, distribución de mesas (banquete redondo, imperial en U, auditorio) y dotación de personal.
- **Custodia y Auditoría de Menaje Post-Evento:** Control estricto de vajilla protocolar, cubertería de gala y cristalería fina (`es_retornable = true`). Genera la hoja de ruta de entrega a salón y el acta de recepción física al cierre del evento (`inv_eventos_consumo_menaje`), detectando piezas íntegras vs roturas o pérdidas.
- **Liquidación Automática de Roturas:** Cálculo instantáneo del recargo por menaje deteriorado al costo de reposición unitario pactado, debitándolo directamente al contrato de reserva o a la planilla del oficial militar responsable.
- **Requerimientos Especiales:** Checklist protocolar de guardia de honor, podio con escudo institucional, estandarte nacional, edecán militar y minuta de gala aprobada.

#### M8: Convenios Interinstitucionales (CROE - Círculo Militar - FF.AA.)
- **Alcance:** Motor de reciprocidad inter-clubes.
- **Operación:** Un socio de CROE puede reservar cabañas en las instalaciones del Círculo Militar con un descuento preferencial de convenio (ej. 20%) sin tener que afiliarse de forma duplicada. Compensación financiera mensual automatizada entre ambas tesorerías.

#### M9: Escuela Deportiva y Cursos Vacacionales para Cargas Familiares
- **Alcance:** Inscripción y gestión de academias de tenis, natación, fútbol y equitación militar para hijos y nietos de socios.
- **Administración:** Control de asistencias de instructores, evaluación técnica y cobro de matrículas mensuales.

#### M10: Directorio Oficial y Comunicaciones de Presidencia
- **Alcance:** Canal oficial de noticias, circulares, órdenes de la presidencia militar y convocatorias a Asambleas Generales de Socios.
- **Notificaciones:** Envío multicanal (Email certificado, notificaciones push móviles y cartelera digital interactiva).

#### M11: Portal de Bienestar, Beneficios y Convenios Comerciales
- **Alcance:** Directorio exclusivo de beneficios comerciales negociados: descuentos en universidades, clínicas privadas, aerolíneas y funerarias en convenio con las prestaciones del ISSFA.

#### T1 (Transversal): Seguridad, RBAC y Auditoría Forense
- **Alcance:** Control de acceso granular basado en 8 roles institucionales. Trazabilidad inmutable de cada transacción y consulta de datos.

#### T2 (Transversal): Cumplimiento LOPDP Ecuador
- **Alcance:** Implementación técnica de las directrices del Registro Oficial Suplemento 459 (Ley Orgánica de Protección de Datos Personales del Ecuador).

---

### 5.2. Matriz de Asignación de Recursos y Equipo de Ingeniería

| Rol en el Proyecto | Dedicación | Responsabilidades Clave |
| :--- | :---: | :--- |
| **Director Técnico de Proyecto (Tech Lead)** | 100% | Arquitectura general, revisión de código, cumplimiento de hitos y enlace directivo. |
| **Ingeniero Backend Senior (PostgreSQL / Node)** | 100% | RLS, DDL, APIs transaccionales, webhooks de pago y microservicio SRI. |
| **Ingeniero Frontend Senior (React / TypeScript)** | 100% | Interfaz de usuario, carné 3D, responsive design y portal garita. |
| **Especialista en Seguridad & DPO / LOPDP** | 50% | Auditoría de vulnerabilidades, cifrado KMS, políticas ARCO-POL y certificación. |
| **Ingeniero QA & Automatización de Pruebas** | 100% | Pruebas unitarias, pruebas E2E (Vitest / Playwright), pruebas de carga y estrés. |
| **Liaison de Enlace Militar & Soporte Operativo** | 50% | Levantamiento de procesos en sedes, pruebas con Clases de guardia y capacitación. |

---

## 6. SEGURIDAD CASTRENSE, MATRIZ RBAC Y CUMPLIMIENTO LOPDP

### 6.1. Matriz de Control de Acceso Basada en Roles (8 Roles Militares y Administrativos)

| # | Rol Institucional | Perfil Propio | Carné QR Garita | Reservas Hospedaje/Canchas | Cobros / Facturas SRI | POS Restaurante | Protocolo Eventos | Admin Tenant | Auditoría Forense |
|---|---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 1 | **Super Administrador TI** | Total | Total | Total | Total | Total | Total | Total | Solo Lectura |
| 2 | **Presidente / Directorio** | Consulta | Consulta | Consulta | Reportes Ejecutivos | Reportes | Aprueba | Configuración | Auditoría |
| 3 | **Administrador de Sede** | Consulta | Supervisa | Gestiona Cupos | Valida Pagos | Supervisa | Coordina | Sede Propia | No |
| 4 | **Oficial / Clase de Guardia** | No | Escanea y Valida | Consulta Ingresos | No | No | Lista Acceso | No | No |
| 5 | **Cajero / Mesero POS** | No | Valida Identidad | No | Cobra en Sitio | Comanda | No | No | No |
| 6 | **Socio Militar Titular** | Total | Su Carné 3D | Reserva y Cancela | Paga y Descarga RIDE| Cargo Cuenta | Solicita | No | No |
| 7 | **Carga Familiar Autorizada** | Consulta | Su Carné QR | Consulta Cupos | No | No | No | No | No |
| 8 | **Oficial DPO / Auditor LOPDP** | No | No | No | No | No | No | No | Total Inmutable|

---

### 6.2. Criptografía del Carné Digital QR Rotativo (TOTP)
Para garantizar la inviolabilidad del acceso a las sedes militares y evitar la práctica común de reenviar capturas de pantalla de carnés por mensajería móvil:
1. El carné digital utiliza el algoritmo **TOTP (RFC 6238)** con un paso de tiempo de **45 segundos**.
2. La carga útil del código QR se genera y firma mediante HMAC-SHA256:
   $$\text{Signature} = \text{HMAC-SHA256}(K, \text{member\_id} \parallel \text{timestamp\_slot} \parallel \text{tenant\_id})$$
3. El terminal del oficial de guardia en la garita militar contiene la clave pública de validación o valida localmente el token sin requerir que la base de datos exponga los secretos. Si el token tiene una antigüedad mayor a 90 segundos (tolerancia de 2 ventanas de tiempo), el acceso vehicular/peatonal es denegado de forma inmediata con alarma sonora.

---

### 6.3. Marco de Cumplimiento de la Ley Orgánica de Protección de Datos Personales (LOPDP Ecuador)

De conformidad con el **Registro Oficial Suplemento 459 del 26 de mayo de 2021**:
1. **Tratamiento de Datos Sensibles Militares:** Los datos de escalafón militar, unidades asignadas y cédulas de oficiales gozan de categoría de protección especial, implementando cifrado en reposo con algoritmo **AES-256** administrado bajo claves en custodia rotativa.
2. **Procedimiento de Derechos ARCO-POL:**
   - La plataforma incluye el módulo digital para que cualquier socio o dependiente ejerza sus derechos de **A**cceso, **R**ectificación, **C**ancelación, **O**posición y **P**ortabilidad de sus datos.
   - El sistema emite un acuse de recibo con código de seguimiento y garantiza la tramitación legal en un lapso no superior a los **15 días hábiles** fijados por el marco legal ecuatoriano.
3. **Notificación de Brechas de Seguridad en 72 Horas:**
   - En cumplimiento del artículo 43 de la LOPDP, ante cualquier incidente que comprometa la confidencialidad de la base de datos castrense, el sistema activa el protocolo de contingencia que genera el informe técnico formal para la Autoridad de Protección de Datos Personales del Ecuador dentro de las **72 horas** posteriores a su detección.
4. **Registro de Actividades de Tratamiento (RAT):** Se formaliza el libro de registro digital con las finalidades legítimas del tratamiento: administración social, facturación tributaria y seguridad física en instalaciones.

---

## 7. MATRIZ DE RIESGOS TÉCNICOS Y ESTRATEGIAS DE MITIGACIÓN

| Riesgo Técnico / Operativo | Probabilidad | Impacto | Estrategia de Mitigación Implementada |
| :--- | :---: | :---: | :--- |
| **Caída de conectividad en Garitas de Sede Salinas o Los Chillos** | Media | Alto | Funcionamiento offline del escáner garita con caché criptográfica de llaves públicas y sincronización diferida al reanudar enlace. |
| **Indisponibilidad del WebService de Autorización del SRI** | Alta | Medio | Cola de contingencia asíncrona (RabbitMQ/BullMQ) que almacena el XML firmado y reintenta la autorización cada 15 minutos sin detener la reserva. |
| **Intentos de suplantación de identidad mediante capturas de carné** | Alta | Alto | Rotación criptográfica TOTP cada 45 segundos con marca de agua dinámica y hora sincronizada por NTP. |
| **Cobro duplicado por doble clic del socio en pasarela** | Media | Alto | Llave de idempotencia obligatoria (`idempotency_key = UUID`) en la capa de base de datos de transacciones de pago. |
| **Resistencia al cambio en oficiales en servicio pasivo** | Media | Medio | Interfaz ultra-intuitiva con botones de alto contraste, asistencia asistida por WhatsApp institucional y manuales visuales paso a paso. |

---

## 8. CONCLUSIÓN Y DICTAMEN DE VIABILIDAD TÉCNICA

El presente **Plan de Ejecución Técnica y Arquitectura Integral** demuestra que la plataforma multi-tenant para el **CROE** y el **Círculo Militar del Ecuador** es:
1. **Completamente Viable:** Utiliza estándares de industria consolidados (PostgreSQL RLS, React, TypeScript, APIs REST seguras) y se acopla con exactitud a la normativa ecuatoriana (SRI e IVA al 15%, Payphone, Kushki y LOPDP).
2. **Económicamente Eficiente:** El modelo de base de datos compartida y marca blanca optimiza al máximo la inversión tecnológica, habilitando de inmediato la interoperabilidad entre ambos clubes.
3. **Estratégicamente Valiosa:** Protege con los más altos estándares de ciberseguridad la identidad de los oficiales de las Fuerzas Armadas y proporciona una experiencia digital digna del prestigio y tradición de ambas entidades castrenses.

---
*Fin del Documento Técnico Oficial — Plataforma Multi-Tenant CROE & Círculo Militar del Ecuador.*
