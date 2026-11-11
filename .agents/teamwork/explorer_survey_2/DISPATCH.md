# Explorer 2 Dispatch: Technical Architecture & Execution Plan Specifications

Investigate, structure, and document all technical specifications needed for `PLAN_EJECUCION_TECNICA.md`:
1. Comprehensive Data Model (ER Entities: Socios, Rangos/Grados Militares, Dependientes/Cargas, Membresías/Cuotas, Sedes/Instalaciones, Habitaciones/Canchas, Reservas, Pasarela de Pagos, Transacciones/Comprobantes, Convenios Interinstitucionales).
2. Multi-Tenant Architecture & White-Label Strategy (Tenant isolation, shared database schema vs tenant_id partitioning, theming engine, DNS/routing).
3. Local Payment Gateway Integration Specification (Payphone Ecuador & Kushki APIs, checkout widgets, backend webhook lifecycle, signature verification SHA256/HMAC, idempotency keys, financial reconciliation).
4. Full Roadmap & Phased Timeline covering all 11 Functional Modules + 2 Transversal Modules tailored to military club ecosystems in Ecuador (CROE & Círculo Militar):
   - M1: Portal del Socio y Expediente Militar
   - M2: Carné Digital y Control de Acceso QR/NFC
   - M3: Central de Reservas (Hospedaje, Salones, Canchas)
   - M4: Pasarela de Pagos y Recaudación (Payphone/Kushki)
   - M5: Gestión Financiera, Cuotas y Facturación Electrónica SRI
   - M6: Control de Alimentos, Bebidas y Restaurantes (POS)
   - M7: Eventos Institucionales y Protocolo Militar
   - M8: Convenios Interinstitucionales (CROE - Círculo Militar - FF.AA.)
   - M9: Escuela Deportiva y Actividades Recreativas
   - M10: Directorio y Comunicaciones Oficiales
   - M11: Portal de Bienestar y Beneficios para el Socio y Familia
   - T1 (Transversal): Seguridad, RBAC y Auditoría Forense
   - T2 (Transversal): Cumplimiento LOPDP (Ley Orgánica de Protección de Datos Personales del Ecuador)
5. Security, RBAC, Encryption, and LOPDP compliance architecture.

## 2026-11-09T01:47:36Z
You are Explorer 2 (Business Logic & Technical Architecture Explorer).
Your working directory is: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_2\
Read the original request at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md
Also read your task dispatch at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_2\DISPATCH.md

Your mission:
Survey and specify the complete technical architecture and plan details required for `PLAN_EJECUCION_TECNICA.md` and the application's underlying data model:
1. Entity-Relationship Data Model: Detailed entities and attributes for Socios militares, rangos, dependientes/cargas familiares, membresías y cuotas, sedes e inventario de instalaciones (hospedaje/cabañas, canchas tenis/pádel/fútbol, salones de eventos), reservas, transacciones de pago, convenios interinstitucionales.
2. Multi-tenant / White-label Shared Architecture: Isolation model, shared schema with tenant filtering, theme token resolution, auditability, data residency.
3. Ecuadorian Payment Gateways: Specification for Payphone Ecuador and Kushki integration (APIs, webhook signatures, idempotency, state machine, financial reconciliation).
4. Full roadmap and phasing for the 11 Functional Modules + 2 Transversal Modules tailored to military club ecosystems (CROE & Círculo Militar del Ecuador):
   - M1: Portal del Socio y Expediente Militar
   - M2: Carné Digital y Control de Acceso QR/NFC
   - M3: Central de Reservas (Hospedaje y Espacios Deportivos)
   - M4: Pasarela de Pagos y Recaudación (Payphone / Kushki)
   - M5: Gestión Financiera, Cuotas y Facturación Electrónica SRI
   - M6: Control de Alimentos, Bebidas y Restaurantes (POS)
   - M7: Eventos Institucionales y Protocolo Militar
   - M8: Convenios Interinstitucionales (CROE - Círculo Militar - FF.AA.)
   - M9: Escuela Deportiva y Actividades Recreativas
   - M10: Directorio y Comunicaciones Oficiales
   - M11: Portal de Bienestar y Beneficios para el Socio y Familia
   - T1: Seguridad, RBAC y Auditoría Forense
   - T2: Cumplimiento LOPDP (Ley Orgánica de Protección de Datos Personales de Ecuador)
5. Security, RBAC matrix, encryption at rest/transit, and LOPDP compliance measures.

Produce a comprehensive, structured handoff report in c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_2\handoff.md. Send a message when done.
