## 2026-11-09T03:57:40Z
You are Worker M8 (Technical Documentation Updates, README Demo Script & Test Suite Expansion).
Your working directory is: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m8\
Original Request path: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\PROJECT.md

Read the Explorer 3 blueprint and Worker M7 handoff before modifying files:
- Explorer 3 handoff: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_test_3\handoff.md
- Worker M7 handoff: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m7\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Implementation Tasks:
1. `PLAN_EJECUCION_TECNICA.md`:
   - Incorporate the complete DDL for the 9 inventory/economato tables (`inv_categorias`, `inv_bodegas`, `inv_articulos`, `inv_recetas_fichas_tecnicas`, `inv_receta_detalles`, `inv_kardex_movimientos`, `inv_eventos_consumo_menaje`, `inv_facturas_adquisicion`, `inv_factura_detalles`).
   - Add the extended ASCII ERD diagram connecting tenants, campuses, bodegas, articulos, recetas, kardex, eventos menaje, and facturas.
   - Add RLS policies for each table using `tenant_id = current_tenant_id()`.
   - Add the mathematical formulas for PMP (Weighted Average Price), FIFO lot management, Safety Stock, and Reorder Point (ROP).
   - Add multi-tenant warehouse locations for CROE (Cumbayá, Sangolquí, Salinas) and Círculo Militar (Orellana Quito, La Armenia).
   - Document the SRI electronic invoice XML ingestion pipeline and POS/Banquet integration architecture.
2. `README.md`:
   - Document the new Restaurant Shifts, Economato/Inventory and SRI Invoice Ingestion modules.
   - Add the executive demo guide for the Tuesday Board meeting with Acts 7, 8, 9 (Turnos de Restaurante y Explosión Instantánea, Control de Existencias y Menaje Post-Evento, Abastecimiento y Carga de Facturas SRI).
3. Test Suite Expansion & Scripts:
   - Expand `tests/` across Tiers 1-4 with comprehensive tests verifying the new restaurant shift bookings, event bookings with PAX, BOM explosion calculations, tableware damage tracking, SRI invoice ingestion, and Kardex movements.
   - Update `scripts/test-prototype.mjs` to validate that the new inventory tables exist in `PLAN_EJECUCION_TECNICA.md`.
   - Update `TEST_INFRA.md` and `TEST_READY.md` reflecting the expanded test counts.
4. Verification:
   - Run `npm run build` (must pass with 0 errors).
   - Run `npm test` (all tests must pass 100%).
   - Run `node scripts/test-prototype.mjs` (must pass 100%).
   - Document all file modifications, test commands, and exact outputs in `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m8\handoff.md`.
   - Send completion message to orchestrator via send_message.
