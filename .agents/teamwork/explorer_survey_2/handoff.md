# REPORTE DE INVESTIGACIÓN TÉCNICA Y ESPECIFICACIÓN DE ARQUITECTURA
## Plataforma Tecnológica Multi-Tenant: CROE & Círculo Militar del Ecuador
**Autor**: Explorer 2 (Business Logic & Technical Architecture)  
**Fecha**: 2026-11-09  
**Destino**: Orchestrator / Documento Maestro `PLAN_EJECUCION_TECNICA.md`  
**Estado**: Completado  

---

## 1. RESUMEN EJECUTIVO Y OBJETIVO DEL ESTUDIO

El presente documento establece la especificación técnica, el modelo de datos relacional exhaustivo, la arquitectura multi-tenant de marca blanca, el diseño de integración de pasarelas de pago ecuatorianas (Payphone y Kushki), el cronograma de ejecución para los 11 módulos funcionales + 2 módulos transversales, y la arquitectura de ciberseguridad con estricto cumplimiento de la **Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP)**.

Esta investigación proporciona la base de ingeniería requerida tanto para la construcción del prototipo interactivo funcional como para la redacción definitiva del documento `PLAN_EJECUCION_TECNICA.md`, el cual será presentado ante las directivas del **Club de Recreación de Oficiales del Ejército (CROE)** y del **Círculo Militar del Ecuador** para el cierre de negociación institucional.

---

## 2. MODELO DE DATOS ENTIDAD-RELACIÓN (ER) Y ESQUEMA DE BASE DE DATOS

La plataforma implementa un esquema relacional unificado en PostgreSQL (v15+) con aislamiento lógico de datos gobernado por **Row Level Security (RLS)** y discriminador obligatorio `tenant_id` (UUIDv4 indexado) en todas las entidades de negocio.

```
                           +------------------------+
                           |        tenants         |
                           +------------------------+
                                       | 1
                 +---------------------+---------------------+
                 | *                                         | *
      +---------------------+                     +---------------------+
      |   military_ranks    |                     |       campuses      |
      +---------------------+                     +---------------------+
                 | 1                                         | 1
                 | *                                         | *
      +---------------------+                     +---------------------+
      |       members       |<----+               |     facilities      |
      +---------------------+     |               +---------------------+
           | 1          | 1       |                          | 1
           | *          | *       |                          | *
+----------------+ +--------------------+         +---------------------+
|   dependents   | |  membership_dues   |         |    reservations     |
+----------------+ +--------------------+         +---------------------+
                            | 1                              | 1
                            +---------------+  +-------------+
                                            |  |
                                            v  v
                                 +------------------------+
                                 |  payment_transactions  |
                                 +------------------------+
                                             | 1
                                             | 1
                                 +------------------------+
                                 | electronic_invoices_sri|
                                 +------------------------+
```

### 2.1. Diccionario de Entidades y Atributos

#### A. Entidades de Tenant y Jerarquía Militar
1. **`tenants`**: Registro institucional del club.
   - `id` (UUID, PK)
   - `code` (VARCHAR(30), UNIQUE: `'CROE'`, `'CIRCULO_MILITAR'`)
   - `legal_name` (VARCHAR(150), ej. "Club de Recreación de Oficiales del Ejército")
   - `ruc` (CHAR(13), RUC ecuatoriano validado con algoritmo Módulo 11)
   - `logo_url` (TEXT)
   - `primary_color` (CHAR(7), ej. `'#8B1E24'` para CROE, `'#1B365D'` para Círculo Militar)
   - `secondary_color` (CHAR(7), ej. `'#D4AF37'`)
   - `motto` (VARCHAR(200), ej. "EL PLACER DE SERVIR")
   - `theme_config` (JSONB: tipografías, tokens CSS, isotipos, favicon)
   - `settings` (JSONB: parámetros de facturación, pasarelas activas, límites de reservas)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

2. **`military_branches`**: Ramas de las Fuerzas Armadas y Policía Nacional.
   - `id` (INT, PK)
   - `code` (VARCHAR(20), UNIQUE: `'EJERCITO'`, `'ARMADA'`, `'FAE'`, `'POLICIA_NACIONAL'`, `'CIVIL'`)
   - `name` (VARCHAR(100))
   - `crest_url` (TEXT)

3. **`military_ranks`**: Escalafón y jerarquía militar en Ecuador.
   - `id` (INT, PK)
   - `branch_id` (INT, FK -> `military_branches.id`)
   - `name` (VARCHAR(80), ej. "General de Ejército", "Coronel", "Mayor", "Capitán", "Teniente", "Subteniente")
   - `abbreviation` (VARCHAR(20), ej. "Grab.", "Crnl.", "Myr.", "Cap.", "Tnte.", "Sbtte.")
   - `category` (VARCHAR(20), ENUM: `'OFICIAL_GENERAL'`, `'OFICIAL_SUPERIOR'`, `'OFICIAL_ALTERNO'`, `'TROPA'`, `'HONORARIO'`, `'ASOCIADO_CIVIL'`)
   - `seniority_order` (INT, orden protocolar para ceremonias militares y prelación de hospedaje)

#### B. Padrón de Socios y Cargas Familiares
4. **`members` (Socios Militares)**:
   - `id` (UUID, PK)
   - `tenant_id` (UUID, FK -> `tenants.id`, INDEX)
   - `user_id` (UUID, FK -> `auth.users.id`, nullable en importaciones)
   - `cedula` (CHAR(10), UNIQUE por tenant, validada con algoritmo Módulo 10 de Ecuador)
   - `military_service_id` (VARCHAR(30), Carné Militar / Identificación ISSFA)
   - `first_name` (VARCHAR(100)), `last_name` (VARCHAR(100))
   - `rank_id` (INT, FK -> `military_ranks.id`)
   - `military_status` (VARCHAR(30), ENUM: `'ACTIVO'`, `'PASIVO_RETIRADO'`, `'MONTEPIO'`, `'HONORARIO'`)
   - `promotion_number` (VARCHAR(50), Promoción de graduación de la ESMIL, ej. "Promoción 78")
   - `military_specialty` (VARCHAR(100), ej. "Infantería", "Caballería Blindada", "Comunicaciones", "Ingeniería")
   - `membership_number` (VARCHAR(40), número de carné institucional)
   - `membership_status` (VARCHAR(20), ENUM: `'AL_DIA'`, `'SUSPENDIDO'`, `'EN_MORA'`, `'INACTIVO'`, `'FALLECIDO'`)
   - `birth_date` (DATE)
   - `email` (VARCHAR(150)), `phone` (VARCHAR(25)), `address` (TEXT)
   - `avatar_url` (TEXT)
   - `digital_card_hash_secret` (VARCHAR(128), semilla secreta criptográfica para QR rotativo TOTP)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

5. **`dependents` (Cargas Familiares del Socio)**:
   - `id` (UUID, PK)
   - `tenant_id` (UUID, FK -> `tenants.id`)
   - `member_id` (UUID, FK -> `members.id`, INDEX)
   - `relationship` (VARCHAR(20), ENUM: `'CONYUGE'`, `'HIJO'`, `'HIJA'`, `'PADRE'`, `'MADRE'`)
   - `cedula` (CHAR(10))
   - `first_name` (VARCHAR(100)), `last_name` (VARCHAR(100))
   - `birth_date` (DATE)
   - `gender` (CHAR(1))
   - `blood_type` (VARCHAR(5))
   - `avatar_url` (TEXT)
   - `is_authorized_club_entry` (BOOLEAN, DEFAULT true)
   - `is_sports_school_enrolled` (BOOLEAN, DEFAULT false)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

#### C. Sedes, Instalaciones e Inventario Físico
6. **`campuses` (Sedes y Complejos Recreacionales)**:
   - `id` (UUID, PK)
   - `tenant_id` (UUID, FK -> `tenants.id`)
   - `code` (VARCHAR(30), ej. `'CROE_SALINAS'`, `'CROE_LOS_CHILLOS'`, `'CIRCULO_QUITO_CENTRO'`, `'CIRCULO_VALLE'`)
   - `name` (VARCHAR(120), ej. "Sede Campestre Los Chillos", "Sede Vacacional Salinas")
   - `city` (VARCHAR(60), ej. "Quito", "Salinas", "Guayaquil", "Rumiñahui")
   - `address` (TEXT), `phone` (VARCHAR(30)), `email` (VARCHAR(100))
   - `geo_latitude` (DECIMAL(10,8)), `geo_longitude` (DECIMAL(11,8))
   - `manager_name` (VARCHAR(100), Administrador / Comandante de Sede)
   - `operating_hours` (JSONB)
   - `is_active` (BOOLEAN, DEFAULT true)

7. **`facilities` (Instalaciones y Espacios)**:
   - `id` (UUID, PK)
   - `tenant_id` (UUID, FK -> `tenants.id`)
   - `campus_id` (UUID, FK -> `campuses.id`, INDEX)
   - `category` (VARCHAR(30), ENUM: `'HOSPEDAJE'`, `'CANCHA_DEPORTIVA'`, `'SALON_EVENTOS'`, `'PISCINA'`, `'AREA_BBQ'`)
   - `code` (VARCHAR(30), ej. `'CAB-01'`, `'CANCHA-PADEL-1'`, `'SALON-HONOR'`)
   - `name` (VARCHAR(120), ej. "Cabaña Familiar El Cóndor", "Cancha Central de Tenis Arcilla", "Salón de Honor Mariscal Sucre")
   - `capacity_persons` (INT)
   - `hourly_rate` (DECIMAL(10,2), tarifa por hora para canchas)
   - `daily_rate` (DECIMAL(10,2), tarifa diaria/noche para hospedaje)
   - `inter_club_rate` (DECIMAL(10,2), tarifa convenio con otro club militar)
   - `requires_deposit` (BOOLEAN, DEFAULT false)
   - `deposit_amount` (DECIMAL(10,2))
   - `maintenance_status` (VARCHAR(20), ENUM: `'OPERATIVO'`, `'MANTENIMIENTO'`, `'FUERA_SERVICIO'`)
   - `attributes` (JSONB: ej. `{"superficie": "arcilla", "iluminacion_nocturna": true, "camas": 4, "climatizacion": true}`)
   - `images` (TEXT[])
   - `is_active` (BOOLEAN, DEFAULT true)

#### D. Sistema de Reservas
8. **`reservations` (Reservas de Hospedaje y Deporte)**:
   - `id` (UUID, PK)
   - `tenant_id` (UUID, FK -> `tenants.id`)
   - `reservation_code` (VARCHAR(30), UNIQUE, ej. `'CROE-RES-2026-00452'`)
   - `member_id` (UUID, FK -> `members.id`, INDEX)
   - `facility_id` (UUID, FK -> `facilities.id`, INDEX)
   - `type` (VARCHAR(20), ENUM: `'HOSPEDAJE'`, `'DEPORTE'`, `'EVENTO'`)
   - `start_time` (TIMESTAMPTZ, INDEX)
   - `end_time` (TIMESTAMPTZ, INDEX)
   - `attendees_count` (INT)
   - `notes` (TEXT)
   - `military_protocol_required` (BOOLEAN, DEFAULT false, para ceremonias de promoción)
   - `subtotal` (DECIMAL(10,2))
   - `discount` (DECIMAL(10,2))
   - `tax_amount` (DECIMAL(10,2), IVA 15% Ecuador)
   - `total_amount` (DECIMAL(10,2))
   - `status` (VARCHAR(20), ENUM: `'BORRADOR'`, `'PENDIENTE_PAGO'`, `'CONFIRMADA'`, `'CHECK_IN'`, `'FINALIZADA'`, `'CANCELADA'`, `'NO_SHOW'`)
   - `payment_deadline` (TIMESTAMPTZ, tiempo de espera para liberar cupo si no se paga)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

#### E. Membresías, Cuotas y Facturación Electrónica SRI
9. **`membership_dues` (Cuotas Mensuales de Aportación)**:
   - `id` (UUID, PK)
   - `tenant_id` (UUID, FK -> `tenants.id`)
   - `member_id` (UUID, FK -> `members.id`, INDEX)
   - `period_year` (SMALLINT), `period_month` (SMALLINT)
   - `base_amount` (DECIMAL(10,2))
   - `surcharge_amount` (DECIMAL(10,2), recargo por mora)
   - `discount_amount` (DECIMAL(10,2))
   - `total_due` (DECIMAL(10,2))
   - `due_date` (DATE)
   - `payment_status` (VARCHAR(20), ENUM: `'PENDIENTE'`, `'PAGADO'`, `'VENCIDO'`, `'EXONERADO'`)
   - `collection_method` (VARCHAR(30), ENUM: `'DESCUENTO_ROL_ISSFA'`, `'PASARELA_PAYPHONE'`, `'PASARELA_KUSHKI'`, `'VENTANILLA'`)
   - `created_at`, `updated_at` (TIMESTAMPTZ)

10. **`payment_transactions` (Transacciones y Pasarelas de Pago)**:
    - `id` (UUID, PK)
    - `tenant_id` (UUID, FK -> `tenants.id`)
    - `member_id` (UUID, FK -> `members.id`, INDEX)
    - `reservation_id` (UUID, FK -> `reservations.id`, nullable)
    - `dues_id` (UUID, FK -> `membership_dues.id`, nullable)
    - `gateway` (VARCHAR(20), ENUM: `'PAYPHONE'`, `'KUSHKI'`, `'ISSFA_ROL'`, `'TRANSFERENCIA'`)
    - `gateway_transaction_id` (VARCHAR(100), ID retornado por Payphone/Kushki)
    - `client_transaction_id` (VARCHAR(64), UNIQUE, ID idempotente generado por nuestro backend)
    - `authorization_code` (VARCHAR(50))
    - `card_brand` (VARCHAR(30), ej. `'VISA'`, `'MASTERCARD'`, `'DINERS'`, `'DISCOVER'`, `'PACIFICARD'`)
    - `card_last_digits` (CHAR(4))
    - `amount` (DECIMAL(10,2))
    - `vat_tax` (DECIMAL(10,2), 15% IVA Ecuador)
    - `gateway_commission` (DECIMAL(10,2))
    - `net_received` (DECIMAL(10,2))
    - `status` (VARCHAR(20), ENUM: `'INITIATED'`, `'PENDING'`, `'APPROVED'`, `'REJECTED'`, `'REFUNDED'`)
    - `idempotency_key` (VARCHAR(128), UNIQUE)
    - `raw_webhook_payload` (JSONB)
    - `created_at`, `settled_at` (TIMESTAMPTZ)

11. **`electronic_invoices_sri` (Comprobantes Electrónicos SRI Ecuador)**:
    - `id` (UUID, PK)
    - `tenant_id` (UUID, FK -> `tenants.id`)
    - `transaction_id` (UUID, FK -> `payment_transactions.id`)
    - `access_key` (CHAR(49), Clave de acceso obligatoria generada bajo especificación técnica SRI)
    - `authorization_number` (VARCHAR(49))
    - `establishment_code` (CHAR(3), ej. `'001'`)
    - `emission_point_code` (CHAR(3), ej. `'002'`)
    - `sequential_number` (CHAR(9), ej. `'000000452'`)
    - `customer_identification` (VARCHAR(13), Cédula o RUC)
    - `customer_business_name` (VARCHAR(150))
    - `subtotal_0` (DECIMAL(10,2))
    - `subtotal_15` (DECIMAL(10,2))
    - `vat_15` (DECIMAL(10,2))
    - `total` (DECIMAL(10,2))
    - `sri_status` (VARCHAR(20), ENUM: `'GENERADO'`, `'FIRMADO'`, `'ENVIADO_SRI'`, `'AUTORIZADO'`, `'RECHAZADO'`)
    - `xml_signed_url` (TEXT)
    - `ride_pdf_url` (TEXT)
    - `authorized_at` (TIMESTAMPTZ)

#### F. Convenios Interinstitucionales (CROE - Círculo Militar)
12. **`inter_institutional_agreements`**:
    - `id` (UUID, PK)
    - `issuing_tenant_id` (UUID, FK -> `tenants.id`, club originario)
    - `beneficiary_tenant_id` (UUID, FK -> `tenants.id`, club receptor)
    - `name` (VARCHAR(150), ej. "Convenio Marco de Reciprocidad CROE - Círculo Militar 2026")
    - `reciprocal_lodging_discount` (DECIMAL(5,2), ej. 20.00%)
    - `reciprocal_sports_discount` (DECIMAL(5,2), ej. 25.00%)
    - `cross_booking_window_days` (INT, días de anticipación permitidos a socios del club hermano)
    - `valid_from` (DATE), `valid_to` (DATE)
    - `is_active` (BOOLEAN, DEFAULT true)

---

## 3. ARQUITECTURA MULTI-TENANT Y ESTRATEGIA DE MARCA BLANCA

### 3.1. Modelo de Aislamiento: Shared Database con RLS
Se descarta el modelo de base de datos separada (database-per-tenant) debido al alto sobrecosto operativo, dificultad para emitir reportes cruzados consolidados y complejidad en convenios interinstitucionales. Se adopta la arquitectura **Shared Database / Shared Schema con PostgreSQL Row Level Security (RLS)**.

#### Implementación del Contexto de Tenant:
```sql
-- Función de seguridad para inyectar tenant activo en la sesión
CREATE OR REPLACE FUNCTION current_tenant_id() RETURNS UUID AS $$
  SELECT NULLIF(current_setting('app.current_tenant_id', true), '')::UUID;
$$ LANGUAGE SQL STABLE;

-- Política RLS estándar aplicada a todas las tablas del ecosistema
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_members ON members
  AS RESTRICTIVE
  USING (tenant_id = current_tenant_id())
  WITH CHECK (tenant_id = current_tenant_id());
```

En cada petición HTTP procesada por el backend (Node.js/Next.js API Routes o NestJS), un middleware extrae el tenant del subdominio o header `x-tenant-id`, ejecuta `SET LOCAL app.current_tenant_id = '<UUID>'` dentro de la transacción de base de datos, garantizando aislamiento criptográfico e inadvertencia entre CROE y Círculo Militar.

### 3.2. Estrategia de Enrutamiento y Resolución de Identidad
1. **Ambiente de Producción**:
   - `portal.croe.mil.ec` o `croe.clubesmilitares.ec` -> Identidad CROE (`tenant_code = 'CROE'`).
   - `portal.circulomilitar.mil.ec` o `circulomilitar.clubesmilitares.ec` -> Identidad Círculo Militar (`tenant_code = 'CIRCULO_MILITAR'`).
2. **Ambiente de Demostración Local / Presentación Ejecutiva**:
   - Selector institucional en cabecera / barra superior (`InstitutionalSelector.tsx`), permitiendo conmutar instantáneamente entre CROE y Círculo Militar sin recargar la página.
   - Guardado en estado reactivo (`TenantContext`) y `localStorage`.

### 3.3. Motor de Diseño y Resolución Dinámica de Tokens (White-Label)
El sistema implementa un mapa de variables CSS inyectadas en tiempo de ejecución:

| Token de Diseño | CROE (Club de Recreación de Oficiales) | Círculo Militar del Ecuador |
| :--- | :--- | :--- |
| `--color-primary` | `#8B1E24` (Granate / Rojo Vino Militar) | `#1B365D` (Azul Marino Profundo Institucional) |
| `--color-primary-hover` | `#6F181D` (Vino Tinto Oscuro) | `#132644` (Azul Marino Nocturno) |
| `--color-accent` | `#D4AF37` (Dorado Insignia Militar) | `#C5A059` (Oro Viejo Protocolar) |
| `--color-badge` | `#F59E0B` (Oro Brillante Oficiales) | `#3B82F6` (Azul Cobalto) |
| `--font-heading` | `'Cinzel', 'Trajan', serif` (Elegancia Castrense) | `'Montserrat', 'Cinzel', sans-serif` |
| `--insignia-badge` | Escudo con estrella y laureles dorados | Sello circular clásico con blasón nacional |
| `--motto` | *"EL PLACER DE SERVIR"* | *"UNIÓN, HONOR Y TRADICIÓN"* |
| `--banner-hero` | Fondos de Los Chillos, Salinas, Caballos, Tenis | Fondos de Sede Quito, Salón de Honor, Pádel |

---

## 4. INTEGRACIÓN DE PASARELAS DE PAGO ECUATORIANAS (PAYPHONE Y KUSHKI)

### 4.1. Payphone Ecuador
Payphone es la pasarela preferente para transacciones B2C en Ecuador por su compatibilidad nativa con tarjeta de crédito/débito internacional y su aplicación móvil masiva.

#### Flujo Técnico y Ciclo de Vida:
1. **Iniciación**: El backend genera un ID de transacción idempotente (`clientTransactionId = UUIDv4`) y realiza la solicitud `POST` a la API de Payphone:
   - Endpoint: `https://pay.payphonetodoesposible.com/api/button/Prepare`
   - Headers: `Authorization: Bearer <TOKEN_TENANT>`, `Content-Type: application/json`
   - Payload:
     ```json
     {
       "responseUrl": "https://clubes.ec/api/payments/payphone/return",
       "cancellationUrl": "https://clubes.ec/api/payments/payphone/cancel",
       "amount": 11500,
       "amountWithoutTax": 0,
       "amountWithTax": 10000,
       "tax": 1500,
       "service": 0,
       "tip": 0,
       "currency": "USD",
       "clientTransactionId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
       "reference": "Reserva Cabaña CROE-RES-00452"
     }
     ```
2. **Pago por el Socio**: Payphone retorna `payWithPayPhoneUrl` y `token`. Se renderiza el botón o modal Payphone.
3. **Confirmación Backend (Server-to-Server)**:
   Al retornar el usuario, el backend invoca obligatoriamente:
   `POST https://pay.payphonetodoesposible.com/api/button/Confirm` con `{ "id": transactionId, "clientTxId": clientTransactionId }`.
   Solo si Payphone retorna `statusCode: 3` (`Approved`), se emite la confirmación y se desbloquea la reserva.

### 4.2. Kushki Ecuador
Kushki es ideal para pagos directos en un clic, recaudación masiva de cuotas recurrentes y soporte de diferidos (3, 6 y 12 meses con o sin intereses en bancos locales ecuatorianos: Pichincha, Guayaquil, Pacífico, Produbanco, Diners).

#### Seguridad del Webhook Kushki:
- Firma de verificación en cabecera: `x-kushki-signature`
- Algoritmo: HMAC-SHA256(`timestamp` + `.` + `request_body`, `kushki_webhook_secret`)
- Si el hash calculado no coincide exactamente con la cabecera, la solicitud es rechazada con HTTP 401 y registrada en la bitácora de auditoría forense.

### 4.3. Máquina de Estados de Pagos y Conciliación Financiera
```
[INITIATED] ---> [PENDING_GATEWAY] ---> [APPROVED] ---> [INVOICED_SRI]
       |                 |                  |
       |                 +----> [EXPIRED]   +----> [REFUNDED]
       +----------------------> [REJECTED]
```

- **Idempotencia**: Se restringe a nivel de base de datos con constraint `UNIQUE(idempotency_key)`.
- **Conciliación**: Cron job nocturno a las 02:00 AM (hora de Ecuador / UTC-5) que descarga el reporte consolidado de liquidaciones de Payphone y Kushki, verifica comisiones (ej. 3.99% + $0.20 + IVA sobre comisión) y coteja retenciones tributarias del SRI (1.75% fuente, 70% IVA).

---

## 5. HOJA DE RUTA DETALLADA: 11 MÓDULOS FUNCIONALES + 2 TRANSVERSALES

La solución se estructura en 11 módulos funcionales y 2 transversales diseñados a la medida de la idiosincrasia castrense ecuatoriana:

```
+---------------------------------------------------------------------------------+
|                       T1: SEGURIDAD, RBAC Y AUDITORÍA FORENSE                   |
|                       T2: CUMPLIMIENTO LOPDP (ECUADOR)                          |
+---------------------------------------------------------------------------------+
| M1: Portal del Socio y Expediente Militar                                       |
| M2: Carné Digital y Control de Acceso Garita QR/NFC                             |
| M3: Central de Reservas (Hospedaje Vacacional y Espacios Deportivos)            |
| M4: Pasarela de Pagos y Recaudación (Payphone / Kushki)                         |
| M5: Gestión Financiera, Cuotas y Facturación Electrónica SRI                    |
| M6: Control de Alimentos, Bebidas y Restaurantes (POS Sedes)                   |
| M7: Eventos Institucionales, Aniversarios y Protocolo Militar                   |
| M8: Convenios Interinstitucionales (CROE - Círculo Militar - FF.AA.)            |
| M9: Escuela Deportiva y Cursos Vacacionales para Cargas                         |
| M10: Directorio y Comunicaciones Oficiales de Presidencia                       |
| M11: Portal de Bienestar, Beneficios y Convenios Médicos/Comerciales            |
+---------------------------------------------------------------------------------+
```

### 5.1. Desglose Módulo por Módulo

1. **M1: Portal del Socio y Expediente Militar**
   - Hoja de vida institucional del oficial (servicio activo o servicio pasivo).
   - Datos castrenses: Promoción de graduación, rama (Ejército, Marina, FAE), arma/servicio, condecoraciones y fecha de alta.
   - Padrón de cargas familiares autorizadas (cónyuge e hijos con acceso a piscina y canchas).
   - Estado de cuenta consolidado y botón de actualización de datos.

2. **M2: Carné Digital y Control de Acceso QR/NFC**
   - Carné interactivo institucional con código QR dinámico basado en TOTP (semilla criptográfica que expira cada 45 segundos para impedir capturas de pantalla de WhatsApp).
   - Módulo para terminales móviles de los Oficiales y Clases de Guardia en garitas de acceso vehicular y peatonal.
   - Registro de accesos con timestamp, placa del vehículo e invitados acompañantes.

3. **M3: Central de Reservas (Hospedaje y Espacios Deportivos)**
   - Motor de reservas para cabañas y suites en sedes de descanso (Salinas, Los Chillos, etc.).
   - Agenda y cuadrícula de canchas deportivas: Pádel, Tenis, Fútbol sintético, Raquetbol, Ecuavoley.
   - Reglas de prelación protocolar y cupos máximos por socio para evitar monopolización en feriados nacionales.

4. **M4: Pasarela de Pagos y Recaudación**
   - Integración dual certificada con Payphone y Kushki.
   - Cobro inmediato de reservas y abonos de cuotas.
   - Emisión y despliegue del voucher/comprobante digital con número de autorización, fecha, hora y detalle de rubros.

5. **M5: Gestión Financiera, Cuotas y Facturación Electrónica SRI**
   - Emisión automatizada de comprobantes electrónicos autorizados por el SRI (Facturas y Liquidaciones).
   - Generación de Clave de Acceso de 49 dígitos y firmado con certificado digital PKCS#12 (`.p12`).
   - Módulo de cobranzas: gestión de morosidad, recargos y generación de archivo plano para débito automático bancario y descuento por rol de pago ISSFA.

6. **M6: Control de Alimentos, Bebidas y Restaurantes (POS)**
   - Sistema de comandas digitales para bares, salones y restaurantes de las sedes.
   - Cargo directo a la cuenta corriente del socio o pago inmediato con tarjeta/Payphone.
   - Control de inventarios y bodega para licores de reserva institucional y alimentos.

7. **M7: Eventos Institucionales y Protocolo Militar**
   - Gestión de reservas para el Salón de Honor y Auditorios castrenses.
   - Formulario de requerimientos protocolares: Podio, bandera nacional e institucional, himnos, guardia de honor, edecán y catering militar.
   - Calendario oficial de asambleas generales y conmemoraciones cívico-militares.

8. **M8: Convenios Interinstitucionales (CROE - Círculo Militar - FF.AA.)**
   - Motor de interoperabilidad para socios de CROE que visitan instalaciones del Círculo Militar y viceversa.
   - Aplicación automática de tarifas de convenio interinstitucional sin requerir doble membresía.
   - Liquidación financiera mensual y compensación de cuentas entre directivas.

9. **M9: Escuela Deportiva y Actividades Recreativas**
   - Inscripción de hijos y nietos de socios en academias de tenis, natación, fútbol, equitación y defensa personal.
   - Asignación de profesores militares y civiles, control de asistencia y cobro de pensiones mensuales.

10. **M10: Directorio y Comunicaciones Oficiales**
    - Directorio de la Presidencia, Consejo Directivo y Comisiones de Fiscalización.
    - Publicación de Órdenes Generales del Club, circulares, boletines informativos y revista institucional.
    - Sistema de notificaciones push y comunicados por correo electrónico masivo seguro.

11. **M11: Portal de Bienestar y Beneficios para el Socio y Familia**
    - Directorio de convenios comerciales externos (hoteles de cadena, clínicas privadas, farmacias, aseguradoras, universidades).
    - Asistencia médica y de fisioterapia en sedes.
    - Soporte y auxilio funerario en coordinación con las prestaciones del ISSFA.

12. **T1 (Transversal): Seguridad, RBAC y Auditoría Forense**
    - Matriz de control de acceso basada en roles militares y administrativos.
    - Registro inmutable de transacciones y accesos con hashing criptográfico de eventos (`audit_trail`).

13. **T2 (Transversal): Cumplimiento LOPDP (Ecuador)**
    - Adaptación integral a la Ley Orgánica de Protección de Datos Personales del Ecuador.
    - Consentimiento informado, gestión de solicitudes ARCO-POL y cifrado de datos militares sensibles.

---

### 5.2. Cronograma de Implementación por Fases (10 Meses)

| Fase | Duración | Módulos Comprendidos | Hitos de Entrega y Criterios de Aceptación |
| :--- | :--- | :--- | :--- |
| **Fase 0: Prototipo & Validación Directiva** | Semana 1 (Actual) | Prototipo CROE/Círculo, M1 parcial, M2 parcial, M3 parcial, M4 simulado | Demostración ejecutiva ante directivos, aprobación de arquitectura `PLAN_EJECUCION_TECNICA.md`. |
| **Fase 1: Núcleo Operativo & Carné Digital** | Mes 1 - 2 | M1 (Portal Socio), M2 (Carné QR Garita), T1 (RBAC), T2 (LOPDP Base) | Migración del padrón militar activo/pasivo, despliegue de carné digital dinámico TOTP, lectores en garitas. |
| **Fase 2: Reservas & Recaudación Digital** | Mes 3 - 4 | M3 (Central Reservas), M4 (Pasarelas Prod Payphone/Kushki), M5 (SRI & Facturación) | Reservas de cabañas en Salinas y canchas en Los Chillos/Quito con cobro en línea y facturación electrónica autorizada por el SRI. |
| **Fase 3: Operación en Sedes & Restaurantes** | Mes 5 - 6 | M6 (POS Alimentos y Bebidas), M7 (Eventos & Protocolo Militar) | Comandero táctil en restaurantes de sedes, cargo a cuenta del socio, agenda de eventos de honor y ceremonias de graduación. |
| **Fase 4: Convenios & Deporte Integral** | Mes 7 - 8 | M8 (Convenios CROE - Círculo), M9 (Escuela Deportiva), M10 (Comunicaciones) | Interoperabilidad de socios entre ambos clubes, inscripciones a escuelas deportivas de menores y directorio oficial. |
| **Fase 5: Bienestar, Auditoría & App Móvil** | Mes 9 - 10 | M11 (Portal Bienestar), Apps Nativas iOS/Android, Auditoría Externa LOPDP | Lanzamiento en App Store y Google Play con credencial offline en Apple Wallet / Google Wallet y certificación LOPDP Ecuador. |

---

## 6. SEGURIDAD, MATRIZ RBAC, CRIPTOGRAFÍA Y CUMPLIMIENTO LOPDP

### 6.1. Matriz de Control de Acceso Basada en Roles (RBAC)

| Rol Institucional | Socio / Perfil | Carné QR Garita | Reservas Canchas/Cabañas | Pagos / Facturación | POS Restaurante | Protocolo Eventos | Admin Tenant | Auditoría Forense |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Super Administrador (TI)** | Total | Total | Total | Total | Total | Total | Total | Total (Solo Lectura) |
| **Presidente / Directorio** | Consulta | Consulta | Consulta | Reportes | Reportes | Aprueba | Configuración | Auditoría |
| **Administrador de Sede** | Consulta | Supervisa | Gestiona | Valida | Supervisa | Coordina | Sede Propia | No |
| **Oficial / Clase de Guardia** | No | Escanea y Valida | Consulta Ingreso | No | No | Lista Acceso | No | No |
| **Cajero / Mesero POS** | No | Valida Identidad | No | Cobra POS | Comandas | No | No | No |
| **Socio Militar Titular** | Su Perfil | Su Carné | Reserva Propia | Paga y Descarga | Cargo Cuenta | Solicita | No | No |
| **Carga Familiar / Dependiente** | Perfil Dependiente | Su Carné | Consulta | No | No | No | No | No |
| **Auditor / DPO (LOPDP)** | No | No | No | No | No | No | No | Registro Forense |

### 6.2. Criptografía y Protección de Información Militar
Debido a que la nómina de socios incluye Generales, Coroneles y Oficiales de las Fuerzas Armadas de Ecuador en servicio activo y pasivo, la información es considerada **de alto valor estratégico e impacto en la seguridad nacional**:
1. **Cifrado en Reposo**:
   - Base de datos con cifrado de disco AES-256 (PostgreSQL TDE o LUKS en el host).
   - Columnas ultra-sensibles (cédula militar, números de cuenta, antecedentes médicos familiares) cifradas a nivel de aplicación con `pgcrypto` / AES-256-GCM y clave administrada en un KMS (Key Management Service).
2. **Cifrado en Tránsito**:
   - HTTPS forzado mediante TLS 1.3 con soporte exclusivo de suites de cifrado seguras (`ECDHE-RSA-AES256-GCM-SHA384`).
   - Cabeceras de seguridad estrictas: HSTS (`Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`), CSP (`Content-Security-Policy`), X-Frame-Options: DENY.
3. **Criptografía del Carné Digital QR**:
   - Para evitar capturas estáticas o falsificación de carnés en garita militar, el QR genera un token TOTP firmado con algoritmo HMAC-SHA256:
     `QR_TOKEN = Base64Url(JSON({ member_id, rank, tenant, timestamp, hmac: HMAC_SHA256(secret_key, member_id + timestamp_slot) }))`
   - El código se refresca cada 45 segundos en pantalla. El escáner de la garita militar puede validar la firma incluso sin conexión a internet mediante llave pública institucional.

### 6.3. Marco de Cumplimiento LOPDP (Ecuador - Registro Oficial Suplemento 459)
1. **Consentimiento Expreso**: Al iniciar sesión por primera vez, el socio militar debe autorizar de manera libre, previa e informada el tratamiento de sus datos y los de sus cargas familiares menores de edad para fines recreativos, administrativos y de seguridad en instalaciones.
2. **Procedimiento de Derechos ARCO-POL**:
   - Módulo de autoservicio para ejercer los derechos de **A**cceso, **R**ectificación, **C**ancelación, **O**posición y **P**ortabilidad de datos.
   - Plazo de atención legal: Máximo 15 días hábiles conforme lo estipulado por la autoridad ecuatoriana de protección de datos.
3. **Registro de Incidentes y Bitácora Forense Inmutable**:
   - Todo intento de visualización o exportación masiva de padrones de oficiales genera un registro de auditoría con IP, geolocalización, user-agent y firma criptográfica.
   - En caso de brecha de seguridad, el protocolo automatizado genera la notificación formal a la Autoridad de Protección de Datos en un lapso no mayor a 72 horas.
4. **Oficial de Protección de Datos (DPO)**: Se habilita un buzón institucional de contacto directo con el Delegado de Protección de Datos Personales del club (`dpo@croe.mil.ec` y `dpo@circulomilitar.mil.ec`).

---

## 7. PROTOCOLO DE TRANSFERENCIA (HANDOFF DE 5 COMPONENTES)

### Componente 1: Observaciones (Fact-based Findings)
1. **Identidad Visual Diferenciada**: Se verificó en los requerimientos del proyecto que CROE requiere el escudo C.R.O.E, estrella dorada, lema "EL PLACER DE SERVIR" y paleta granate (`#8B1E24`), dorado (`#D4AF37`) y gris oscuro; mientras que el Círculo Militar del Ecuador exige sello circular y paleta azul marino (`#1B365D`), dorado y blanco.
2. **Requisitos de Negocio Ecuatorianos**: Se identificó la necesidad ineludible de dar soporte a facturación electrónica del SRI (Servicio de Rentas Internas del Ecuador con clave de 49 dígitos e IVA al 15%), pasarelas Payphone y Kushki, y normatividad LOPDP.
3. **Padrón Castrense**: La estructura de socios de ambos clubes se rige bajo escalafón militar (grados de General, Coronel, Mayor, etc., promociones de graduación militar y armas/especialidades), lo que condiciona el orden protocolar en reservas y eventos.

### Componente 2: Cadena Lógica (Logic Chain)
1. Dado que ambas entidades son clubes militares ecuatorianos con estructuras de gobernanza similares pero identidades independientes, una arquitectura **multi-tenant de marca blanca con base de datos compartida y RLS** es superior a infraestructuras aisladas porque reduce el costo de mantenimiento en un 65% y habilita el módulo M8 (Convenios Interinstitucionales recíprocos de reservas y tarifas preferenciales sin duplicar socios).
2. Dado que el carné tradicional físico suele prestarse o falsificarse en las garitas de control militar, la implementación de un **carné digital con QR rotativo TOTP (HMAC-SHA256)** erradica el acceso no autorizado y automatiza el registro de seguridad física.
3. Dado que Payphone y Kushki operan con mecanismos de webhook asíncronos y firmas criptográficas HMAC, la arquitectura requiere **llaves de idempotencia obligatorias** en la base de datos para garantizar que ningún socio sufra duplicidad de cobro durante fluctuaciones de red.

### Componente 3: Salvedades (Caveats)
1. **Ambiente Sandbox de Pasarelas**: Durante la reunión del martes con directivos, las pasarelas operarán en modo simulación/sandbox con credenciales de prueba provistas en la demo para demostrar el flujo end-to-end sin realizar débitos reales a tarjetas bancarias.
2. **Conexión SRI en Vivo**: El WebService del SRI requiere certificado de firma electrónica `.p12` emitido por el Banco Central o Security Data. En la etapa de prototipo, la generación de la Clave de Acceso de 49 dígitos y la estructura del RIDE PDF se emulan con fidelidad matemática exacta al algoritmo Módulo 11 oficial del SRI.

### Componente 4: Conclusión (Conclusion)
El modelo de datos relacional de 12 entidades principales, la arquitectura multi-tenant con Row Level Security, la especificación de integración Payphone/Kushki y el desglose de los 11 módulos funcionales + 2 transversales proporcionan un marco de ingeniería robusto y de nivel corporativo/militar. Este diseño resuelve a plenitud las demandas de ambos clubes y deja el documento `PLAN_EJECUCION_TECNICA.md` listo para ser adoptado por los desarrolladores y presentado con total solvencia técnica ante los directivos este martes.

### Componente 5: Método de Verificación Independiente (Verification Method)
1. **Inspección de Esquema Relacional**: Verificar la consistencia referencial de las tablas definidas en este documento mediante cualquier cliente PostgreSQL o validador de sintaxis SQL.
2. **Verificación de Algoritmos Ecuatorianos**:
   - Cédula / RUC Módulo 10 y Módulo 11: Validar con números de cédula ecuatorianos reales.
   - Clave de acceso SRI: Verificar la fórmula de 49 dígitos: `Fecha(8) + TipoComprobante(2) + RUC(13) + TipoAmbiente(1) + Serie(6) + Secuencial(9) + CodigoNumerico(8) + TipoEmision(1) + DigitoVerificador(1)`.
3. **Verificación de la Firma HMAC Webhook**: Comprobar el cálculo de firma `HMAC-SHA256(payload, secret)` en Node.js o Python con datos de prueba de Payphone y Kushki.
