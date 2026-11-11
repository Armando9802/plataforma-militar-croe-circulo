# Handoff Report: UI/UX Design System & Frontend Architecture Specification

**Agent**: Explorer 1 (`explorer_survey_1`)  
**Mission**: Frontend Architecture, Multi-Tenant UI Design System, and Interactive Component Specifications for CROE and Círculo Militar del Ecuador.  
**Destination**: Orchestrator (`86d5bd51-1540-4045-8cee-26d8db7ec2a5`) & Implementation Workers.  
**Date**: 2026-11-09T01:52:00Z  

---

## 1. Observation

### 1.1 Direct File Observations
From reviewing `ORIGINAL_REQUEST.md` (lines 12–23):
> - **CROE (Club de Recreación de Oficiales del Ejército):** Identidad con escudo C.R.O.E, estrella dorada, lema "EL PLACER DE SERVIR" y paleta institucional en rojo vino/granate (`#8B1E24`), dorado y gris oscuro.
> - **Círculo Militar del Ecuador:** Identidad con sello circular institucional y paleta en azul marino profundo (`#1B365D` / `#1E3A8A`), dorado y blanco.
> - **R2. Módulos clave interactivos para la demostración:**
>   1. **Portal del Socio y Carné Digital:** Expediente del socio militar, categoría activa y carné digital interactivo con código QR verificable.
>   2. **Sistema de Reservas:** Flujo interactivo de consulta de disponibilidad, selección de fechas y reserva tanto de habitaciones de hospedaje como de canchas y espacios recreativos.
>   3. **Simulación de Pasarela de Pagos:** Flujo simulado de cobro integrado (Payphone / Kushki) con selección de método de pago, confirmación de transacción y generación de comprobante digital emitido.

From `DISPATCH.md` (lines 4–12):
> "1. CROE Identity: Wine red `#8B1E24`, gold accents, dark gray, shield emblem, motto 'EL PLACER DE SERVIR'.  
> 2. Círculo Militar del Ecuador Identity: Deep navy blue `#1B365D` / `#1E3A8A`, gold accents, white, circular seal.  
> 3. Tenant switching architecture (seamless toggle/route, state preservation).  
> 4. Component breakdown: Header/Navbar with crest & switcher; Socio Dossier & Interactive Digital Carné with verifiable QR; Reservation Wizard; Checkout & Simulated Payment Modal (Payphone & Kushki).  
> 5. Recommended stack & setup: Vite + React + TypeScript + Tailwind CSS."

From runtime environment check:
- OS: Windows 11
- Node.js runtime: `v24.14.0`
- NPM package manager: `11.9.0`

---

## 2. Logic Chain

```
[Observation: 2 Distinct Military Institutions with Unique Palettes & Insignias]
        │
        ▼
[Step 1: Multi-Tenant Design System with CSS Variables & Data Attributes]
        │
        ├──> CROE Theme: Wine Red (#8B1E24), Gold (#D4AF37), Charcoal (#1A1D20) + Shield Emblem
        └──> Círculo Militar Theme: Navy Blue (#1B365D), Royal Gold (#C8A051), Pure White + Circular Seal
        │
        ▼
[Step 2: Zero-Reload Client-Side Tenant Switching Context]
        │
        ├──> TenantContext provides { currentTenant, switchTenant, tenantConfig }
        └──> Injects CSS custom properties on document.documentElement for instant skinning
        │
        ▼
[Step 3: Component Specifications for the 3 Priority Flows]
        │
        ├──> Flow 1: Socio Dossier + 3D Flippable Digital Carné + Dynamic QR + Reception Guard Scanner Simulator
        ├──> Flow 2: Multi-Facility Reservation Engine (Lodging Suites vs Sports Courts/Pools) + Calendar + Pricing Engine
        └──> Flow 3: Dual Payment Gateway Simulator (Payphone & Kushki) + Real-time 3DS/Push Auth + Printable Legal Voucher
        │
        ▼
[Step 4: Scaffolding, Fast-Boot Stack Selection & Directory Hierarchy]
        │
        └──> Vite 5/6 + React 18 + TypeScript + Tailwind CSS + Lucide Icons + qrcode.react + canvas-confetti
```

---

## 3. Institutional Visual Identities & Design Tokens

### 3.1 CROE (Club de Recreación de Oficiales del Ejército)
- **Institutional Name**: Club de Recreación de Oficiales del Ejército (C.R.O.E.)
- **Motto**: *"EL PLACER DE SERVIR"*
- **Core Values**: Camaradería militar, recreación familiar, hospitalidad y servicio distinguido.
- **Color Palette Specification**:
  | Token | HEX | RGB | Tailwind Semantic Role | Description |
  |---|---|---|---|---|
  | `--color-primary` | `#8B1E24` | `rgb(139, 30, 36)` | `bg-croe-primary` | Rojo vino / granate militar profundo |
  | `--color-primary-dark` | `#6A1318` | `rgb(106, 19, 24)` | `bg-croe-dark` | Granate oscuro para bordes y headers |
  | `--color-primary-light` | `#A82930` | `rgb(168, 41, 48)` | `bg-croe-light` | Granate brillante para hover / activos |
  | `--color-accent` | `#D4AF37` | `rgb(212, 175, 55)` | `bg-croe-gold` | Oro militar metálico para insignias y estrellas |
  | `--color-accent-light` | `#F3E5AB` | `rgb(243, 229, 171)` | `bg-croe-champagne` | Dorado champán para brillos y relieves |
  | `--color-neutral-dark` | `#1A1D20` | `rgb(26, 29, 32)` | `bg-croe-charcoal` | Gris grafito / carbón militar para tipografía |
  | `--color-surface` | `#FFFFFF` | `rgb(255, 255, 255)` | `bg-white` | Blanco marfil / tarjetas limpias |
  | `--color-bg-subtle` | `#F8F9FA` | `rgb(248, 249, 250)` | `bg-slate-50` | Fondo general de la aplicación |

- **Insignia Specification (SVG Shield Emblem)**:
  - Forma: Escudo heráldico medieval con bordura dorada de doble línea.
  - Jefe/Superior: Arco de honor con letras repujadas **"C.R.O.E."**
  - Centro: Gran estrella militar dorada de cinco puntas (**★**) con faceteado tridimensional (sombra interior e iluminación superior) rodeada de dos ramas de laurel en semicírculo.
  - Base / Filacteria: Cinta heráldica ondulante dorada con la inscripción grabada: **"EL PLACER DE SERVIR"**.

### 3.2 Círculo Militar del Ecuador
- **Institutional Name**: Círculo Militar del Ecuador
- **Tradition**: Fundado en 1918 (Más de un siglo de historia y honor institucional).
- **Motto / Slogan**: *"TRADICIÓN, HONOR Y FRATERNIDAD"*
- **Color Palette Specification**:
  | Token | HEX | RGB | Tailwind Semantic Role | Description |
  |---|---|---|---|---|
  | `--color-primary` | `#1B365D` | `rgb(27, 54, 93)` | `bg-circulo-primary` | Azul marino naval ecuatoriano |
  | `--color-primary-dark` | `#11233D` | `rgb(17, 35, 61)` | `bg-circulo-dark` | Azul medianoche para contrastes de fondo |
  | `--color-primary-light` | `#254B82` | `rgb(37, 75, 130)` | `bg-circulo-light` | Azul real para hover y selecciones |
  | `--color-accent` | `#C8A051` | `rgb(200, 160, 81)` | `bg-circulo-gold` | Oro imperial con matiz cobrizo |
  | `--color-accent-light` | `#E8D5A7` | `rgb(232, 213, 167)` | `bg-circulo-gold-light` | Oro pálido para orlas y bordes de honor |
  | `--color-neutral-dark` | `#0B1320` | `rgb(11, 19, 32)` | `bg-circulo-midnight` | Negro azulado profundo para textos |
  | `--color-surface` | `#FFFFFF` | `rgb(255, 255, 255)` | `bg-white` | Blanco puro |
  | `--color-bg-subtle` | `#F0F4F8` | `rgb(240, 244, 248)` | `bg-sky-50/50` | Gris azulado sutil |

- **Insignia Specification (SVG Circular Seal)**:
  - Forma: Sello circular concéntrico heráldico de 3 anillos.
  - Orla Exterior: Dentado dorado estilo medalla militar con bisel reflectivo.
  - Anillo Intermedio: Fondo azul marino con texto arqueado en mayúsculas serif: **"CÍRCULO MILITAR DEL ECUADOR"** arriba, y **"FUNDADO EN 1918"** abajo, separados por dos estrellas doradas.
  - Centro Interior: Sol radiante ecuatoriano con dos espadas militares cruzadas en metal plateado con empuñaduras doradas, ceñidas por una corona de laureles triunfales.

---

## 4. Multi-Tenant Switching Architecture

### 4.1 State Management & Dynamic CSS Variables
The architecture operates on a client-side **Zero-Reload Dynamic Tenant Context**. Switching between CROE and Círculo Militar occurs in **0ms** without re-fetching network bundles, resetting forms, or breaking in-flight reservation steps.

```typescript
// src/types/tenant.ts
export type TenantId = 'croe' | 'circulo-militar';

export interface TenantConfig {
  id: TenantId;
  name: string;
  shortName: string;
  legalEntity: string;
  ruc: string;
  motto: string;
  foundedYear?: string;
  domain: string;
  theme: {
    primaryColor: string;
    primaryDark: string;
    primaryLight: string;
    accentColor: string;
    accentLight: string;
    textColor: string;
    bgSubtle: string;
    gradientHero: string;
    badgeBg: string;
    badgeText: string;
  };
  contact: {
    address: string;
    city: string;
    phone: string;
    email: string;
  };
  facilities: Facility[];
  defaultSocio: SocioProfile;
}
```

### 4.2 Dynamic CSS Variable Injection
Upon selecting an institution, the `TenantContext` updates `document.documentElement` attributes and CSS variables:
```typescript
// Inside TenantContext.tsx useEffect
useEffect(() => {
  const root = document.documentElement;
  root.setAttribute('data-tenant', currentTenant.id);
  root.style.setProperty('--primary', currentTenant.theme.primaryColor);
  root.style.setProperty('--primary-dark', currentTenant.theme.primaryDark);
  root.style.setProperty('--primary-light', currentTenant.theme.primaryLight);
  root.style.setProperty('--accent', currentTenant.theme.accentColor);
  root.style.setProperty('--accent-light', currentTenant.theme.accentLight);
  root.style.setProperty('--bg-subtle', currentTenant.theme.bgSubtle);
  localStorage.setItem('selected_tenant', currentTenant.id);
}, [currentTenant]);
```

### 4.3 Executive Switcher Component (`TenantSwitchBar.tsx`)
Positioned prominently in the top navigation bar with:
- **Interactive Pill Toggle**: Visual toggle button showing both shields with active glowing rings.
- **Badge Indicator**: "Vista Oficial CROE" vs "Vista Círculo Militar".
- **Instant Tooltip**: *"Alternar vista institucional para comparar experiencia multi-entidad en vivo"*.
- **Quick Switch Keyboard Shortcut**: `Alt + T` for seamless demonstration during the executive presentation.

---

## 5. Detailed Component Breakdown for the 3 Priority Flows

### 5.1 Flow 1: Portal del Socio & Interactive Digital Carné with Verifiable QR

#### Component Hierarchy:
```
SocioPortal/
├── SocioHeaderSummary.tsx         # Military rank, photo, member status badge, seniority
├── SocioStatsRibbon.tsx           # Cuotas al día, Antigüedad (años), Reservas activas, Cargas
├── DigitalCard/
│   ├── DigitalCardContainer.tsx   # 3D perspective flip container (front/back flip animation)
│   ├── CardFront.tsx              # Institutional shield, military rank, photo, chip, gold border
│   ├── CardBack.tsx               # Magnetic strip, security hologram, terms, Dynamic QR code
│   └── FlipButton.tsx             # Interactive flip control with 3D rotation transition
├── QRScannerSimulationModal.tsx   # "Simular Escáner en Garita": Mock security terminal
├── FamilyDependentsCard.tsx       # Spouse & children access passes & biometric enrollment status
└── SocioFinancialStatusCard.tsx   # Membership fee status ($25.00/mo) with "Pagar Cuota" CTA
```

#### Detailed Flow & Interaction Mechanics:
1. **Interactive 3D Flip**: Clicking on the card or the "Girar Carné" button rotates the card 180 degrees using CSS 3D transforms (`preserve-3d`, `rotateY(180deg)`).
2. **Verifiable Dynamic QR Code**:
   - Rendered using `qrcode.react` (SVG mode for crisp rendering at any zoom level).
   - Generates a cryptographically structured payload:
   ```json
   {
     "institution": "CROE",
     "socioCode": "MIL-EC-2026-9842",
     "cedula": "1714859621",
     "rango": "CRNL. DE E.M.",
     "nombres": "CARLOS ALBERTO MENDOZA SILVA",
     "categoria": "OFICIAL SUPERIOR ACTIVO",
     "vigencia": "2026-12-31",
     "seguridadHash": "SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
     "timestamp": "2026-11-09T01:50:00Z"
   }
   ```
3. **Mock Garita / Security Terminal Simulator (`QRScannerSimulationModal.tsx`)**:
   - Demonstrates to executives how a military club sentry or reception desk operates.
   - When the executive clicks *"Simular Escaneo en Garita / Control de Acceso"*, a modal pops up showing a ruggedized military tablet interface:
     - Sound effect / visual green laser scan animation.
     - Status: **"ACCESO VÁLIDO - BIENVENIDO MI CORONEL"** in prominent green beacon.
     - Displays allowed dependents and registered vehicle plate (`PDF-4921`).
     - "Registrar Ingreso": Adds entry record to local activity log.

---

### 5.2 Flow 2: Interactive Reservation Engine (Lodging vs Sports / Facilities)

#### Component Hierarchy:
```
ReservationEngine/
├── ReservationHeader.tsx          # Institutional intro, policy alerts, check-in instructions
├── FacilityTypeSelector.tsx       # Dual-mode tab: [ 🏨 Hospedaje y Cabañas ] vs [ 🎾 Deportes y Recreación ]
├── FacilityFilterBar.tsx          # Filters: Capacity (1-8 pax), Facility subtype, Price range
├── ResourceCatalogGrid.tsx        # Grid of resource cards with photos, amenities, badges
│   └── ResourceCard.tsx           # Photo, title, capacity tag, member rate, "Consultar Disponibilidad" CTA
├── BookingWizardModal.tsx         # 3-step modal wizard:
│   ├── Step1_DatePicker.tsx       # Interactive calendar with real-time day/hour availability slots
│   ├── Step2_GuestsDetails.tsx    # Guests selector (Socios, Dependientes, Invitados externos)
│   └── Step3_CostSummary.tsx      # Subtotal, Member discount (40%), Taxes, "Confirmar Reserva"
├── ReservationSuccessModal.tsx    # Booking voucher, locator code (e.g., RSV-CROE-7841), CTA to Pay
└── MyBookingsDrawer.tsx           # Sliding drawer showing all active and past bookings from localStorage
```

#### Supported Facilities per Institution:
- **CROE Facilities**:
  - *Hospedaje*: Cabaña Familiar Andina (6 pax), Suite Ejecutiva de Oficiales (2 pax), Habitación Confort Doble (4 pax).
  - *Deportes & Recreación*: Cancha de Tenis Arcilla 1, Cancha de Pádel Panorámica, Piscina Climatizada Semi-Olímpica, Pérgola BBQ Familiar 3, Cancha de Fútbol 11 Césped Natural.
- **Círculo Militar Facilities**:
  - *Hospedaje*: Suite de Honor Círculo Militar (2 pax), Habitación Clásica Oficial (2 pax), Cabaña Campestre Valle de los Chillos (8 pax).
  - *Deportes & Recreación*: Cancha de Squash 1, Cancha de Tenis Rápida, Pista Atlética Militar, Salón de Armas (Eventos), Cancha de Pádel Techada.

#### Interactive Calculation Logic:
- **Base Rate**: e.g., Cabaña Familiar: $65.00/noche (Tarifa Socio) vs $110.00/noche (Invitado).
- **Sports Courts**: $0.00/hora para socios en horario ordinario (beneficio de membresía); $8.00/hora para iluminación nocturna o invitados.
- **Live LocalStorage Persistence**: Updates `croe_reservations` and `circulo_reservations` collections instantly.

---

### 5.3 Flow 3: Dual Payment Gateway Simulation (Payphone & Kushki) + Digital Voucher

#### Component Hierarchy:
```
PaymentModal/
├── CheckoutModal.tsx              # Main container triggered by reservations or membership debt
├── OrderSummaryCard.tsx           # Line-item breakdown, Ecuadorian 15% IVA calculation, total USD
├── GatewaySelectorTabs.tsx        # Branded selector: [ Payphone (Ecuador) ] vs [ Kushki (Latam) ]
├── PayphoneSimulator/
│   ├── PayphoneMethodToggle.tsx   # [ Pagar con App Payphone ] vs [ Tarjeta Directa ]
│   ├── PayphoneAppPrompt.tsx      # Phone input (+593 9X XXX XXXX), "Enviar Cobro", simulated push countdown
│   └── PayphoneQRDisplay.tsx      # Dynamic QR for simulated app camera scan
├── KushkiSimulator/
│   ├── KushkiCreditCardForm.tsx   # Luhn-validated card input, brand auto-detect (Visa/MC/Diners), CVV, Expiry
│   ├── KushkiInstallmentsDropdown # 1 Cuota corriente, 3 meses sin intereses, 6 meses con intereses
│   └── Kushki3DSSecureModal.tsx   # Simulated OTP verification SMS sent to mobile
├── TransactionProcessingView.tsx  # High-fidelity loading animation: "Cifrando...", "Aprobando...", "Aprobado"
├── DigitalVoucherModal.tsx         # Legal Ecuadorian electronic receipt (SRI compliant format)
│   ├── VoucherHeader.tsx          # Institutional RUC, resolution number, institutional crest
│   ├── VoucherMetadata.tsx        # Auth number (e.g. AUTH-PAYPHONE-98214), Date/Time, Reference
│   ├── VoucherLineItems.tsx       # Subtotal, 15% IVA, Descuento Militar, Total Cobrado
│   └── VoucherActionButtons.tsx   # "Imprimir Comprobante" (window.print), "Descargar PDF", "Finalizar"
```

#### Detailed Gateway Specifications:
1. **Payphone Ecuador (`#F37021`)**:
   - Simulates Ecuador's predominant mobile payment app.
   - Flow A (App Push): Officer enters cell `0998765432`. System triggers a simulated notification: *"Solicitud de pago enviada al smartphone del socio"*. An interactive button *"Simular Aprobación en Celular"* allows immediate resolution.
   - Flow B (Tarjeta): Standard credit/debit card processing under Payphone tokenized security.
2. **Kushki Ecuador (`#002B49` / `#FF2B6D`)**:
   - Simulates Kushki's private card tokenization vault.
   - Features real card format masking (`#### #### #### ####`), automatic card brand logo badge (Visa, Mastercard, Diners Club, Discover, Alia), and 3D-Secure modal simulation.
3. **Electronic Voucher Compliance**:
   - Generates exact Ecuadorian electronic receipt fields:
     - RUC Institucional (e.g., `1790012345001`).
     - Clave de Acceso / Número de Autorización (49 dígitos numéricos).
     - Desglose con Tarifa IVA 15% vigente en Ecuador desde mayo 2024.
     - Botón de impresión con estilos CSS `@media print` para renderizado perfecto en hojas A4 o tirilla térmica.

---

## 6. Technical Stack Recommendation & Scaffolding

### 6.1 Recommended Stack & Rationale
| Component | Technology | Rationale |
|---|---|---|
| **Build Tool & Bundler** | **Vite 5 / 6** | Ultra-fast startup (<300ms), instant HMR, zero-config ES modules, 100% reliable on Windows. |
| **Framework** | **React 18 / 19** | Industry standard, robust concurrent rendering, maximal compatibility with component libraries. |
| **Language** | **TypeScript 5.x** | Strict typing for multi-tenant data contracts, avoiding runtime errors during live pitch. |
| **Styling** | **Tailwind CSS 3.4** | Utility-first CSS variables support, instant institutional theme swapping via custom CSS tokens. |
| **Icons** | **Lucide React** | Lightweight, tree-shakeable vector icons (Shield, Trophy, Calendar, CreditCard, QrCode, CheckCircle2, Award). |
| **QR Code Engine** | **`qrcode.react`** | Pure browser SVG/Canvas QR generator without external network calls or image APIs. |
| **Interactive Delight** | **`canvas-confetti`** | Delights executives when payment succeeds or digital carné verifies access. |
| **Data Persistence** | **Browser LocalStorage + React Context** | 100% autonomous; runs completely offline without Docker, PostgreSQL, or cloud dependencies. |

### 6.2 Proposed Directory Scaffolding
```
projecto-hernan-fonseca/
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── favicon.ico
│   └── military-pattern.svg
├── src/
│   ├── App.tsx                        # Root application with layout & routing
│   ├── main.tsx                       # React DOM mount point
│   ├── index.css                      # Tailwind directives & CSS custom variables
│   │
│   ├── context/
│   │   ├── TenantContext.tsx          # Multi-tenant state, switcher, theme injector
│   │   ├── ReservationContext.tsx     # Availability, cart, active reservations
│   │   └── PaymentContext.tsx         # Payment simulation state, transactions history
│   │
│   ├── types/
│   │   ├── tenant.ts                  # TenantConfig, Institution types
│   │   ├── socio.ts                   # SocioProfile, MilitaryRank, Dependents
│   │   ├── reservation.ts             # Facility, Booking, DateRange, TimeSlot
│   │   └── payment.ts                 # GatewayProvider, Transaction, Receipt
│   │
│   ├── data/
│   │   ├── croeData.ts                # CROE mock data (facilities, socio, config)
│   │   ├── circuloData.ts             # Círculo Militar mock data (facilities, socio, config)
│   │   └── mockTransactions.ts        # Seed transactions & active bookings
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.tsx             # Header with institutional crest, nav links, switcher
│   │   │   ├── TenantSwitchBar.tsx    # Live toggle between CROE and Círculo Militar
│   │   │   ├── Footer.tsx             # Military club footer with legal RUC & contacts
│   │   │   └── Modal.tsx              # Accessible dialog overlay wrapper
│   │   │
│   │   ├── badges/
│   │   │   ├── CroeShieldSvg.tsx      # High-fidelity SVG of CROE heraldic shield
│   │   │   └── CirculoSealSvg.tsx     # High-fidelity SVG of Círculo Militar circular seal
│   │   │
│   │   ├── socio/
│   │   │   ├── SocioProfileView.tsx   # Socio dossier & military records
│   │   │   ├── DigitalCarneCard.tsx   # 3D flippable military carné with gold trim
│   │   │   ├── VerifiableQRCode.tsx   # Dynamic QR code generator
│   │   │   ├── GaritaScannerModal.tsx # Guard station terminal simulator
│   │   │   └── DependentsList.tsx     # Family members access list
│   │   │
│   │   ├── reservations/
│   │   │   ├── ReservationView.tsx    # Main booking portal
│   │   │   ├── FacilityFilter.tsx     # Lodging vs Sports toggle & capacity filters
│   │   │   ├── FacilityCard.tsx       # Individual facility presentation card
│   │   │   ├── AvailabilityModal.tsx  # Calendar picker & time slot selector
│   │   │   └── BookingSummaryModal.tsx# Cost breakdown & confirmation
│   │   │
│   │   └── payment/
│   │       ├── PaymentCheckoutModal.tsx # Unified Payphone / Kushki checkout dialog
│   │       ├── PayphoneForm.tsx       # Payphone app / card simulation
│   │       ├── KushkiForm.tsx         # Kushki 3DS tokenized form
│   │       ├── ProcessingSpinner.tsx  # Multi-stage bank authorization animation
│   │       └── DigitalReceiptModal.tsx# Printable Ecuadorian electronic voucher
│   │
│   └── utils/
│       ├── currency.ts                # USD currency formatter ($0.00)
│       ├── dateUtils.ts               # Spanish locale date formats
│       └── storage.ts                 # Type-safe localStorage wrapper
```

---

## 7. Sample Data Contracts & Seed Entities

### 7.1 Military Socio Profile Example (CROE)
```typescript
export const MOCK_SOCIO_CROE: SocioProfile = {
  id: "SOC-CROE-0094",
  codigoMilitar: "MIL-EC-2026-9842",
  cedula: "1714859621",
  grado: "CRNL. DE E.M.",
  apellidos: "MENDOZA SILVA",
  nombres: "CARLOS ALBERTO",
  arma: "INFANTERÍA",
  estadoSocio: "ACTIVO",
  categoria: "OFICIAL SUPERIOR",
  fechaIngreso: "2004-08-15",
  antiguedadAnios: 22,
  cuotaAlDia: true,
  ultimaCuotaPagada: "Noviembre 2026",
  sedeHabitual: "Sede Recreativa Cumbayá",
  dependientes: [
    { id: "DEP-01", nombres: "MARÍA ELENA ALARCÓN DE MENDOZA", parentesco: "CÓNYUGE", carneAutorizado: true },
    { id: "DEP-02", nombres: "MATEO SEBASTIÁN MENDOZA ALARCÓN", parentesco: "HIJO", carneAutorizado: true }
  ]
};
```

### 7.2 Military Socio Profile Example (Círculo Militar)
```typescript
export const MOCK_SOCIO_CIRCULO: SocioProfile = {
  id: "SOC-CIR-0182",
  codigoMilitar: "MIL-EC-1998-4410",
  cedula: "1709823415",
  grado: "VALM. (S.P.)",
  apellidos: "VALLEJO CORONEL",
  nombres: "PATRICIO RENATO",
  arma: "ARMADA / ESTADO MAYOR",
  estadoSocio: "ACTIVO",
  categoria: "SOCIO VITALICIO",
  fechaIngreso: "1998-03-20",
  antiguedadAnios: 28,
  cuotaAlDia: true,
  ultimaCuotaPagada: "Noviembre 2026",
  sedeHabitual: "Sede Social Quito - La Carolina",
  dependientes: [
    { id: "DEP-03", nombres: "BEATRIZ TERESA DEL POZO DE VALLEJO", parentesco: "CÓNYUGE", carneAutorizado: true }
  ]
};
```

---

## 8. Caveats & Assumptions

1. **Read-Only Scope**: This report is strictly architectural and specification-focused. In accordance with Explorer role instructions, no production source code has been altered during this survey.
2. **Offline-First Requirement**: To guarantee zero failure during the live executive meeting on Tuesday, all payment gateways, QR verifications, and reservation states are designed to operate 100% in-browser using local storage hydration, while strictly preserving realistic API schemas (Payphone v3 & Kushki v2 formats).
3. **Ecuadorian Tax Context**: All financial calculations implement the official **15% IVA** applicable in Ecuador as of 2024–2026.
4. **SVG Vector Integrity**: To prevent broken images or missing assets in offline or air-gapped laptop demonstrations, all shields and emblems are specified as standalone React SVG components rather than external bitmap URLs.

---

## 9. Conclusion

The frontend architecture and multi-tenant UI design system are completely specified and ready for direct implementation:
1. **Identities**: Complete color tokens, typography rules, and SVG vector insignia formulas for both CROE (`#8B1E24`, shield, "EL PLACER DE SERVIR") and Círculo Militar (`#1B365D`, circular seal, 1918).
2. **Multi-Tenancy**: Zero-reload dynamic theming via React Context and CSS Custom Properties.
3. **Core Interactive Flows**:
   - Flow 1 (Socio & Carné QR): 3D flippable card, verifiable dynamic QR, guard station tablet simulation.
   - Flow 2 (Reservations): Lodging vs Sports courts, calendar availability, military pricing engine, local storage persistence.
   - Flow 3 (Payment Simulation): Payphone app/card + Kushki 3DS tokenized checkout + legal 15% IVA electronic voucher.
4. **Execution Stack**: Vite + React 18 + TypeScript + Tailwind CSS + Lucide Icons + `qrcode.react` + `canvas-confetti`.

---

## 10. Verification Method

To independently verify this frontend specification once implemented by the build team:

### Step 1: Scaffolding and Dependencies Verification
```bash
# Verify node and npm compatibility
node -v   # Expected v24.14.0 or >= v18.0.0
npm -v    # Expected >= 9.0.0

# Verify development server execution
npm run dev
# Expected output: Local: http://localhost:5173/ (starts in < 500ms)
```

### Step 2: Verification Checklist of Interactive Flows
1. **Tenant Switch Verification**:
   - Open browser at `http://localhost:5173/`.
   - Click the tenant switch toggle in the top bar.
   - Verify instantaneous transition from CROE (granate/vino `#8B1E24`, shield, "EL PLACER DE SERVIR") to Círculo Militar (navy blue `#1B365D`, circular seal).
2. **Socio & QR Verification**:
   - Navigate to "Portal del Socio".
   - Click on the digital carné: verify smooth 3D flip animation.
   - Click "Simular Escáner en Garita": verify security terminal modal opens and reads the dynamic QR code successfully.
3. **Reservation Engine Verification**:
   - Navigate to "Reservas".
   - Toggle between "Hospedaje" and "Deportes".
   - Select a date range and confirm booking.
   - Verify the booking appears in "Mis Reservas" stored in `localStorage`.
4. **Payment Gateway Simulation Verification**:
   - Proceed to checkout from reservation.
   - Test **Payphone**: Enter mobile number `0998765432`, click "Enviar Cobro", then click "Simular Aprobación".
   - Test **Kushki**: Fill test card `4500 0000 0000 0001`, select 3 cuotas, complete 3DS simulation.
   - Verify Digital Voucher generates with Nº de Autorización, RUC, and 15% IVA.
