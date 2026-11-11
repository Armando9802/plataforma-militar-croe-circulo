# Project: Plataforma Web Multi-Tenant CROE & Círculo Militar del Ecuador

## Architecture
- **Paradigm**: Client-side Multi-Tenant Web Prototype (Autonomous, zero-config, runs offline locally).
- **Stack**: Vite + React 18 + TypeScript + Tailwind CSS + Lucide Icons + qrcode.react + canvas-confetti.
- **Data Persistence**: Type-safe browser `localStorage` + React Context (`TenantContext`, `ReservationContext`, `PaymentContext`).
- **Institutional Styling**: Dynamic CSS Custom Properties injected at root (`data-tenant="croe"` vs `data-tenant="circulo-militar"`).
- **Testing Architecture**: Dual-layer test harness:
  - Vitest + React Testing Library + JSDOM for in-process headless E2E verification (<3s).
  - Standalone Node 24 native CLI script (`node --test scripts/test-prototype.mjs`) for build/system/document validation.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Multi-Tenant Architecture & Switcher | Zero-reload institutional toggle between CROE and Círculo Militar | M1 | Survey (Explorer 1 & 2) |
| 2 | Visual Identity CROE | Palette granate `#8B1E24`, dorado `#D4AF37`, escudo con estrella y lema "EL PLACER DE SERVIR" | M1 | Survey (Explorer 1) |
| 3 | Visual Identity Círculo Militar | Palette azul marino `#1B365D`, dorado imperial `#C8A051`, sello circular institucional 1918 | M1 | Survey (Explorer 1) |
| 4 | Socio Militar Dossier & Profile | Hoja de vida militar, rango, arma/especialidad, estado de cuotas y cargas familiares | M2 | Survey (Explorer 1 & 2) |
| 5 | Interactive Digital Carné 3D | Carné digital con giro tridimensional, hologramas y acabado institucional | M2 | Survey (Explorer 1) |
| 6 | Verifiable Dynamic QR Code | Código QR criptográfico con datos del socio, hash SHA-256 y marca temporal | M2 | Survey (Explorer 1 & 3) |
| 7 | Garita Sentry Terminal Simulator | Simulador de terminal de guardia militar para verificar acceso QR en garita | M2 | Survey (Explorer 1) |
| 8 | Dual Reservation Catalog | Catálogo interactivo de Hospedaje (Cabañas/Suites) y Deportes (Tenis, Pádel, Canchas) | M3 | Survey (Explorer 1 & 2) |
| 9 | Availability & Date Selector | Selector de fechas/turnos con cálculo de estadía y prevención de colisiones | M3 | Survey (Explorer 1 & 3) |
| 10 | Pricing Engine & Discount Logic | Cálculo dinámico de tarifa socio militar vs invitados | M3 | Survey (Explorer 1 & 2) |
| 11 | Reservation Confirmation & Ledger | Confirmación y persistencia de reservas en localStorage ("Mis Reservas") | M3 | Survey (Explorer 1 & 3) |
| 12 | Dual Payment Gateway Simulation | Modal de pago unificado para Payphone Ecuador y Kushki | M4 | Survey (Explorer 1 & 2) |
| 13 | Payphone Mobile & Card Flow | Simulación de cobro móvil con número celular ecuatoriano y confirmación push | M4 | Survey (Explorer 1 & 2) |
| 14 | Kushki Card & 3DS Tokenization | Simulación de cobro con tarjeta, detección de franquicia y modal 3-D Secure | M4 | Survey (Explorer 1 & 2) |
| 15 | Digital Receipt & Legal Voucher | Comprobante digital SRI con Nº autorización, RUC, 15% IVA y botón de impresión | M4 | Survey (Explorer 1 & 2) |
| 16 | Comprehensive Technical Execution Plan | Documento `PLAN_EJECUCION_TECNICA.md` con ERD, multi-tenant RLS, pasarelas, roadmap 11+2 y LOPDP | M5 | Survey (Explorer 2) |
| 17 | Executive Presentation Documentation | `README.md` con instrucciones paso a paso para ejecutar y lucir la demo el martes | M5 | Survey (Explorer 1 & 2) |
| 18 | E2E Testing Suite (Tiers 1-4) | 75 casos de prueba automatizados verificando el 100% de los flujos del prototipo | E2E / M6 | Survey (Explorer 3) |
| 19 | Adversarial Coverage Hardening | Stress testing de límites, colisiones y seguridad (Tier 5) | M6 | Survey (Explorer 3) |
| 20 | Restaurant / Comedor por Turnos | Gestión/reserva diferenciando Desayuno, Almuerzo y Cena para CROE y Círculo | M7 | Survey (Explorer 1) |
| 21 | Eventos & Banquetes (PAX) | Gestión de eventos institucionales con PAX, montajes de salón y menús de gala | M7 | Survey (Explorer 1) |
| 22 | Catálogo Inventario 4 Categorías | Insumos/Descartables, Menaje/Cubiertos, Bebidas y Alimentos con stock por club | M7 | Survey (Explorer 2) |
| 23 | Explosión de Recetas (BoM) & Kardex | Descuento automático por turno/evento según comensales y registro en Kardex | M7 | Survey (Explorer 1 & 2) |
| 24 | Control Retorno/Rotura Menaje | Auditoría post-evento de vajilla sana retornada vs mermas/roturas cargadas | M7 | Survey (Explorer 2) |
| 25 | Motor de Carga Facturas SRI | Carga simulada de facturas PDF/XML, 3 presets de proveedores reales, stock bump | M7 | Survey (Explorer 2) |
| 26 | DDL & ERD Inventarios en Plan Técnico | 9 tablas relacionales, políticas RLS, triggers e índices en PLAN_EJECUCION_TECNICA.md | M8 | Survey (Explorer 3) |
| 27 | Modelos Matemáticos PMP & ROP | Formalización de costeo PMP, FIFO, stock de seguridad y punto de reorden | M8 | Survey (Explorer 3) |
| 28 | Guión Ejecutivo Demo en README | Instrucciones paso a paso para lucir turnos, economato y facturas el martes | M8 | Survey (Explorer 3) |
| 29 | Suite E2E Expandida (109 Tests) | 34 nuevos tests Tiers 1-4 para restaurante, inventario, facturas y kardex | M8 / M9 | Survey (Explorer 3) |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Testing Track | Harness, runner, 75 tests (Tiers 1-4), TEST_INFRA.md, TEST_READY.md | none | DONE |
| M1 | Core Setup & Dual Institutional Portals | Vite+React+TS+Tailwind, multi-tenant context, CROE & Círculo themes, switcher, shell | none | DONE |
| M2 | Socio Profile & Interactive Digital Carné QR | Socio dossier, 3D card, dynamic QR, sentry terminal simulator, dependents | M1 | DONE |
| M3 | Interactive Reservation Engine | Facilities catalog (Lodging & Sports), calendar picker, pricing, bookings ledger | M1 | DONE |
| M4 | Payment Gateway Simulation & Vouchers | Payphone & Kushki modal, 3DS, transaction state machine, 15% IVA voucher | M3 | DONE |
| M5 | Technical Plan & Executive Documentation | `PLAN_EJECUCION_TECNICA.md` (full ERD, RLS, payment specs, 11+2 roadmap, LOPDP) & `README.md` | none | DONE |
| M6 | Final Verification & E2E Test Pass (100%) | Full test suite execution (75/75), adversarial hardening, gate approval | M1, M2, M3, M4, M5, E2E | DONE |
| M7 | Restaurant Shifts, Events, Inventory & Invoice Engine | Types, contexts, views, BOM explosion, Kardex ledger, supplier invoices UI | M1, M3, M4 | DONE |
| M8 | Technical Plan Expansion, README & E2E Tests | PLAN_EJECUCION_TECNICA 9 tables DDL/PMP, README demo guide, 34 new tests | M7 | DONE |
| M9 | Final Review, Adversarial Stress & Forensic Audit | Reviewers, Challengers, Forensic Auditor verification and gate signoff | M7, M8 | DONE |

## Interface Contracts
### `TenantContext` ↔ UI Components
- State: `{ currentTenant: TenantConfig, setTenant: (id: TenantId) => void, isCroe: boolean, isCirculo: boolean }`
- CSS Tokens: `--color-primary`, `--color-primary-dark`, `--color-accent`, `--color-bg-subtle` dynamically injected on root.

### `ReservationContext` ↔ `PaymentContext`
- Booking Payload: `{ id: string, tenantId: TenantId, facilityId: string, facilityName: string, category: 'lodging' | 'sports', checkIn: string, checkOut: string, guests: number, subtotal: number, discount: number, vat: number, total: number, status: 'pending' | 'confirmed' }`
- Trigger Payment: `initiatePayment({ reservationId, amount, description, onSuccess, onCancel })`

### `PaymentContext` ↔ `DigitalReceiptModal`
- Transaction Result: `{ transactionId: string, authorizationCode: string, gateway: 'PAYPHONE' | 'KUSHKI', amount: number, vat: number, status: 'APPROVED', customerId: string, customerName: string, timestamp: string }`

### `InventoryContext` ↔ `RestaurantView` & `InventoryView`
- Inventory State: `{ items: InventoryItem[], kardex: KardexEntry[], formulas: RecipeFormula[], deductServiceConsumption: (...), processSupplierInvoice: (...), auditTablewareSettlement: (...) }`
- Ingestion Engine: `loadInvoicePreset(presetId: 'pronaca' | 'tesalia' | 'indurmesa')` / `parseUploadedInvoice(fileContent)`

## Code Layout
```
c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\
├── PLAN_EJECUCION_TECNICA.md          # Comprehensive technical plan deliverable
├── README.md                          # Executive demo instructions
├── TEST_INFRA.md                      # Test suite documentation
├── TEST_READY.md                      # Test readiness certification
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
├── index.html
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── context/
│   │   ├── TenantContext.tsx
│   │   ├── ReservationContext.tsx
│   │   └── PaymentContext.tsx
│   ├── types/
│   │   ├── tenant.ts
│   │   ├── socio.ts
│   │   ├── reservation.ts
│   │   └── payment.ts
│   ├── data/
│   │   ├── croeData.ts
│   │   ├── circuloData.ts
│   │   └── mockTransactions.ts
│   ├── components/
│   │   ├── common/ (Navbar, TenantSwitchBar, Footer)
│   │   ├── badges/ (CroeShieldSvg, CirculoSealSvg)
│   │   ├── socio/ (SocioProfileView, DigitalCarneCard, VerifiableQRCode, GaritaScannerModal)
│   │   ├── reservations/ (ReservationView, FacilityCard, AvailabilityModal, BookingSummaryModal)
│   │   └── payment/ (PaymentCheckoutModal, PayphoneForm, KushkiForm, DigitalReceiptModal)
│   └── utils/ (currency, dateUtils, storage, sriAlg)
├── tests/
│   ├── setup.ts
│   ├── vitest.config.ts
│   ├── helpers/
│   ├── tier1-feature-coverage/
│   ├── tier2-boundaries/
│   ├── tier3-cross-feature/
│   └── tier4-real-world/
└── scripts/
    └── test-prototype.mjs             # Node 24 native CLI verification
```
