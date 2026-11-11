# Worker M1 Dispatch: Core Scaffolding & Dual Visual Identity Portals

## Milestone Scope
- **Milestone**: M1 - Core Scaffolding & Dual Institutional Portals
- **Assigned Files (Exclusive Ownership)**:
  - `package.json`
  - `vite.config.ts`
  - `tailwind.config.js`
  - `postcss.config.js`
  - `tsconfig.json`
  - `tsconfig.node.json`
  - `index.html`
  - `src/main.tsx`
  - `src/App.tsx`
  - `src/index.css`
  - `src/context/TenantContext.tsx`
  - `src/types/tenant.ts`
  - `src/types/socio.ts`
  - `src/types/reservation.ts`
  - `src/types/payment.ts`
  - `src/data/croeData.ts`
  - `src/data/circuloData.ts`
  - `src/components/common/Navbar.tsx`
  - `src/components/common/TenantSwitchBar.tsx`
  - `src/components/common/Footer.tsx`
  - `src/components/badges/CroeShieldSvg.tsx`
  - `src/components/badges/CirculoSealSvg.tsx`
  - `src/components/portal/InstitutionalHero.tsx`

## Mandatory Requirements
1. Scaffold clean, modern Vite + React 18/19 + TypeScript + Tailwind CSS application.
2. Install necessary dependencies: `lucide-react`, `qrcode.react`, `canvas-confetti`, `@types/canvas-confetti`. Also install dev dependencies for testing: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`.
3. Configure `npm run dev`, `npm run build`, and `npm test` in `package.json`.
4. Implement `TenantContext` providing zero-reload toggle between CROE (`'croe'`) and Círculo Militar (`'circulo-militar'`), dynamically updating CSS variables (`--color-primary`, `--color-primary-dark`, `--color-accent`, `--color-bg-subtle`) on root, and persisting choice in `localStorage`.
5. Implement institutional heraldry SVG components:
   - `CroeShieldSvg`: Heráldica CROE en granate `#8B1E24`, estrella dorada `#D4AF37`, laureles y filacteria con lema "EL PLACER DE SERVIR".
   - `CirculoSealSvg`: Sello circular institucional del Círculo Militar del Ecuador en azul marino `#1B365D`, dorado `#C8A051`, año fundacional 1918 y espadas cruzadas.
6. Implement `TenantSwitchBar` prominently in the top header with visual badges, active institution pill toggle, and keyboard shortcut `Alt + T`.
7. Verify that `npm run build` succeeds cleanly with 0 errors.


## 2026-11-09T01:54:15Z
[Message] timestamp=2026-11-09T01:54:15Z sender=86d5bd51-1540-4045-8cee-26d8db7ec2a5 priority=MESSAGE_PRIORITY_HIGH content=You are Worker M1 (Core Scaffolding & Dual Visual Identity Portals).
Your working directory is: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m1\
Read the original request at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master project architecture at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\PROJECT.md
Read the UI/UX frontend survey report at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_1\handoff.md
Read your task dispatch at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m1\DISPATCH.md


## 2026-11-09T02:05:03Z
[Message] timestamp=2026-11-09T02:05:03Z sender=86d5bd51-1540-4045-8cee-26d8db7ec2a5 priority=MESSAGE_PRIORITY_HIGH content=**Context**: Milestone M1 Progress Check
**Content**: Build artifacts (dist/) have been observed. Checking if your test verification and handoff report are ready.
**Action**: Please complete your handoff report in .agents/teamwork/worker_m1/handoff.md and report back your results.
