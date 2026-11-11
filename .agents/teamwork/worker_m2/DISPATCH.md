# Worker M2 Dispatch: Socio Dossier & Interactive Digital Carné with Verifiable QR

## Milestone Scope
- **Milestone**: M2 - Socio Dossier & Interactive Digital Carné with Verifiable Dynamic QR Code
- **Assigned Files (Exclusive Ownership)**:
  - `src/components/socio/DigitalCarneCard.tsx`
  - `src/components/socio/SocioProfileView.tsx`
  - `src/components/socio/GaritaScannerModal.tsx`
  - `src/components/socio/VerifiableQRCode.tsx`
  - `src/components/socio/DependentsList.tsx`
  - `src/App.tsx` (wiring into the "Carné & Socio" navigation view)

## Mandatory Requirements
1. Implement the military socio profile (`SocioProfileView.tsx`) displaying:
   - Military rank, name, force/branch, promotion year, arm/specialty (Infantería, etc.).
   - Category badge: "Oficial Superior Activo" / "Socio Vitalicio".
   - Status indicators: "Cuota al Día", years of seniority, registered campus.
   - List of dependents (cónyuge, hijos) with access authorization badges.
2. Implement the interactive 3D digital card (`DigitalCarneCard.tsx`):
   - 3D flip animation on click or "Girar Carné" button (CSS `preserve-3d`, `rotateY(180deg)`).
   - Front side: Institutional colors and heraldic crest (CROE shield or Círculo Militar circular seal), officer photo, rank, full name, military identification number, gold metallic border, security hologram foil effect.
   - Back side: Magnetic stripe simulation, institutional regulations, issue/expiration dates, and the live Dynamic Verifiable QR code.
3. Implement `VerifiableQRCode.tsx`:
   - High-contrast SVG QR code rendered via `qrcode.react`.
   - Structured JSON payload containing `institution`, `socioCode`, `cedula`, `rango`, `nombres`, `categoria`, `vigencia`, `seguridadHash`, and timestamp.
   - Visual dynamic security indicator (ticking seconds / live pulse to prove it is not a static screenshot).
4. Implement `GaritaScannerModal.tsx` ("Simular Escáner en Garita / Control de Acceso"):
   - Demonstrates to military directors how a sentry or guard station operates at club entrance.
   - Laser scan animation and audio/visual feedback.
   - Sentry screen showing: "ACCESO AUTORIZADO - BIENVENIDO MI CORONEL", officer rank & photo, authorized vehicle license plate, registered family members, and button to log entry into local access history.
5. Verify that `npm run build` succeeds cleanly with 0 errors.

## 2026-11-09T02:07:02Z
You are Worker M2 (Socio Profile & Interactive Digital Carné with Verifiable QR).
Your working directory is: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m2\
Read the original request at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master project architecture at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\PROJECT.md
Read the UI/UX frontend survey report at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_1\handoff.md
Read your task dispatch at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m2\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You own exclusively:
`src/components/socio/DigitalCarneCard.tsx`, `src/components/socio/SocioProfileView.tsx`, `src/components/socio/GaritaScannerModal.tsx`, `src/components/socio/VerifiableQRCode.tsx`, `src/components/socio/DependentsList.tsx`, and the socio view wiring in `src/App.tsx`.

Your Mission:
1. Implement the complete, rich military socio dossier (`SocioProfileView.tsx`).
2. Implement the interactive 3D flippable digital card (`DigitalCarneCard.tsx`) with genuine 3D CSS flip rotation, military gold borders, holographic simulation, officer credentials, and dynamic QR code on the back.
3. Implement `VerifiableQRCode.tsx` using `qrcode.react` with structured cryptographically verifiable JSON payload and live dynamic anti-screenshot pulse.
4. Implement the interactive military sentry guard scanner simulator (`GaritaScannerModal.tsx`) showing laser scan line, authorization feedback, vehicle plate, and entry logging.
5. Wire these components cleanly into the "Carné & Socio" tab in `src/App.tsx`.
6. Run `npm run build` and verify 0 compilation errors.
7. Produce your handoff report at `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m2\handoff.md` and send a message when done.
