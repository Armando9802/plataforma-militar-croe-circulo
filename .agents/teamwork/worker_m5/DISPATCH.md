# Worker M5 Dispatch: Technical Plan & Executive Documentation

## Milestone Scope
- **Milestone**: M5 - Technical Plan (`PLAN_EJECUCION_TECNICA.md`) & Presentation Guide (`README.md`)
- **Assigned Files (Exclusive Ownership)**:
  - `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\PLAN_EJECUCION_TECNICA.md`
  - `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\README.md`

## Mandatory Requirements
1. Author `PLAN_EJECUCION_TECNICA.md` in the project root based on the detailed architectural specifications delivered by Explorer 2 (`.agents/teamwork/explorer_survey_2/handoff.md`), containing:
   - Detailed Entity-Relationship (ER) model with 12 core tables (PostgreSQL types, PK/FK, indexes, constraints, military ranks, dependents, campuses, facilities, reservations, payments, SRI invoices, inter-club agreements).
   - Multi-tenant / white-label shared architecture with Row Level Security (RLS) via `tenant_id`, dynamic CSS variable injection, domain routing, and cross-club reciprocity.
   - Local Ecuadorian payment gateway integration specifications:
     - Payphone Ecuador (Button Prepare/Confirm API, 15% IVA SRI calculation, mobile push flow).
     - Kushki Ecuador (card tokenization, HMAC-SHA256 signature verification, deferred payments, 3DS).
     - Idempotent state machine (`INITIATED` -> `APPROVED` -> `INVOICED_SRI`) and 02:00 AM daily financial reconciliation cron.
   - Comprehensive roadmap and timeline covering all 11 Functional Modules + 2 Transversal Modules for military clubs in Ecuador (CROE & Círculo Militar).
   - Security, 8-tier military RBAC matrix, TOTP rotating QR cards (refreshed every 45s), AES-256 at rest/transit, and full compliance with Ecuador's LOPDP (Ley Orgánica de Protección de Datos Personales, Registro Oficial Suplemento 459), ARCO-POL procedures, and 72h breach notification.
2. Author `README.md` in the project root with:
   - Overview of the CROE & Círculo Militar del Ecuador interactive web prototype.
   - Clear instructions to install and start the application locally (`npm install`, `npm run dev`).
   - Detailed executive pitch and demo walkthrough guide for Tuesday's meeting with the military directors (how to switch tenants, inspect the 3D carné, run the garita scanner, book lodging/sports courts, simulate Payphone & Kushki payments, and print the SRI digital voucher).
   - Overview of the architectural deliverables and roadmap.


## 2026-11-09T01:54:27Z
You are Worker M5 (Technical Execution Plan & Executive Documentation Worker).
Your working directory is: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m5\
Read the original request at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master project architecture at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\PROJECT.md
Read the business logic and technical architecture survey report at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_2\handoff.md
Read your task dispatch at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m5\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You own exclusively:
`c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\PLAN_EJECUCION_TECNICA.md`
`c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\README.md`

Your Mission:
1. Write the exhaustive, enterprise-grade `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\PLAN_EJECUCION_TECNICA.md` in the project root:
   - Comprehensive Entity-Relationship Data Model: 12 core tables fully specified in PostgreSQL (`tenants`, `military_branches`, `military_ranks`, `members`, `dependents`, `campuses`, `facilities`, `reservations`, `membership_dues`, `payment_transactions`, `electronic_invoices_sri`, `inter_institutional_agreements`) with complete data types, constraints, and relationships tailored for Ecuadorian military clubs.
   - Multi-Tenant & White-Label Architecture: Shared database / shared schema with PostgreSQL Row Level Security (RLS) via `tenant_id`, dynamic CSS variable injection (`#8B1E24` CROE vs `#1B365D` Círculo Militar), domain routing, and cross-club reciprocity.
   - Local Payment Gateways: Complete technical specs for Payphone Ecuador (Button Prepare/Confirm, 15% IVA SRI calculation, mobile push app flow) and Kushki Ecuador (card tokenization, HMAC-SHA256 signature verification, deferred payments, 3DS), idempotent state machines, and 02:00 AM daily financial reconciliation cron.
   - Phased Roadmap: 10-month, 5-phase detailed implementation roadmap covering all 11 Functional Modules + 2 Transversal Modules (M1-M11, T1-T2).
   - Security, RBAC & LOPDP: 8-tier military RBAC matrix, TOTP rotating QR cards (refreshed every 45s), AES-256 at rest/transit, full Ecuadorian LOPDP compliance (ARCO-POL, DPO, 72h breach notification).
2. Write the executive `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\README.md` in the project root:
   - Overview of the CROE & Círculo Militar del Ecuador interactive web prototype.
   - Clear instructions to run the application locally (`npm install`, `npm run dev`).
   - Executive pitch and demonstration script for Tuesday's meeting with the military directors (switching tenants, inspecting the 3D carné, running the garita scanner, booking lodging/sports courts, simulating Payphone & Kushki payments, and printing the SRI digital voucher).
3. Verify file sizes, formatting, and completeness.
4. Write your handoff report at `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m5\handoff.md` and send a message when done.
