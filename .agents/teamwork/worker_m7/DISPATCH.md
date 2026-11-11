## 2026-11-09T03:38:38Z
You are Worker M7 (Restaurant Shifts, Events, Inventory/Economato & Invoice Ingestion Engine).
Your working directory is: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m7\
Original Request path: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md
Project specification path: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\PROJECT.md

Read the three Explorer handoff reports before writing code:
1. Shift & Event architecture: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_shift_1\handoff.md
2. Inventory, Kardex & Invoices architecture: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_inv_2\handoff.md
3. Documentation & test architecture: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_test_3\handoff.md

Domain skill: C:\Users\eretm\.gemini\config\plugins\frontend-expert-plugin\skills\frontend-expert\SKILL.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Scope & Implementation Tasks:
1. Types:
   - Create `src/types/restaurant.ts` with all types specified in Explorer 1's report (ShiftType, EventType, RoomSetup, DiningHallFacility, MenuItemOption, RestaurantShiftBooking, EventBanquetBooking, RecipeRequirementItem).
   - Create `src/types/inventory.ts` with all types specified in Explorer 2's report (InventoryCategory, UnitOfMeasure, StockStatusLevel, InventoryItem, KardexMovementType, KardexEntry, RecipeRequirement, RecipeFormula, StockDeductionPreview, ExplosionResult, TablewareAuditItem, EventSettlementRecord, SupplierInvoice, SupplierInvoiceItem).
2. Calculation & Explosion Engine:
   - Create `src/utils/recipeExplosion.ts` with SHIFT_RECIPE_BOM, EVENT_RECIPE_BOM, and `calculateSupplyExplosion`.
3. Datasets:
   - Create `src/data/mockInventory.ts` with the 20 realistic seed items for CROE (Cumbayá) and 20 seed items for Círculo Militar (Quito/La Armenia), recipe formulas, and initial Kardex balances.
   - Create `src/data/mockInvoices.ts` with 3 preloaded real Ecuadorian supplier invoices (Pronaca S.A., The Tesalia Springs Co., Indurmesa) with authentic RUCs, 49-digit SRI access keys, 15% IVA calculations, and line item breakdowns.
   - Create `src/data/mockRestaurant.ts` with dining halls and shift/banquet menus per club.
4. State & Context:
   - Create `src/context/InventoryContext.tsx` with multi-tenant localStorage persistence, stock tracking, automatic BOM explosion deductions, tableware deployment & return settlement (sound return vs breakage), supplier invoice processing (increasing stock, logging Kardex ENTRADA, and clearing reorder alerts), and custom movement adjustments.
5. Interactive UI Components:
   - Create `src/components/restaurant/RestaurantView.tsx`:
     - Sub-tab 1: Turnos Diarios de Comedor (Desayuno, Almuerzo, Cena) with live PAX selector, military member vs guest pricing, 15% SRI IVA, interactive live "Explosión de Insumos" preview showing kg/units of food, beverages, disposables, and tableware, and a button "Registrar Turno y Descontar Existencias" that updates stock and logs to Kardex.
     - Sub-tab 2: Eventos & Banquetes Institucionales with PAX slider (10 to 350 comensales), Room Setup selector (Banquete mesas redondas, Imperial en U, Auditorio, Cóctel Lounge), specialized menus (Gala de las Armas, Parrillada campestre, etc.), additional services, tableware assignment, and direct integration to simulated Payphone/Kushki checkout.
   - Create `src/components/inventory/InventoryView.tsx`:
     - Sub-tab 1: Catálogo de Existencias (filtrable por 4 categorías: Insumos/Descartables, Menaje/Cubiertos, Bebidas, Alimentos de Cocina), search bar, stock level progress bars, status badges (ÓPTIMO, PRECAUCIÓN, CRÍTICO), valor total en bodega.
     - Sub-tab 2: Bitácora Kardex (`KardexAuditView.tsx`) displaying all entries with timestamp, movement type badge, SKU, item name, quantity in/out, previous/new stock balance, unit cost, reference document, and responsible military personnel.
     - Sub-tab 3: Carga de Facturas SRI (`InvoiceUploadModal.tsx` or inline tab): upload area for PDF/XML, and 3 one-click preset buttons for Pronaca, Tesalia, and Indurmesa. Shows extracted supplier RUC, SRI invoice number, item table with 15% IVA, and "Confirmar Ingreso a Bodega" button that bumps inventory and records Kardex ENTRADA.
     - Tableware Audit Modal (`TablewareAuditModal.tsx`): audit returned tableware vs broken/lost items post-event with automatic loss cost calculation and Kardex MERMA_ROTURA logging.
6. Navigation Integration:
   - Update `src/components/common/Navbar.tsx` and `src/App.tsx` to include `'restaurant'` ("Restaurante & Eventos") and `'inventory'` ("Inventario & Economato") in `ActiveTab`.
   - STRICT REQUIREMENT: Keep the existing button label "Reservas & Deportes" EXACTLY as is so existing tests in `tests/tier1-feature-coverage/reservation-engine.test.tsx` and all 75 Vitest tests pass without regressions!
   - Mount `<InventoryProvider>` in `App.tsx`.

File Boundaries / Exclusive Ownership:
You own:
- `src/types/restaurant.ts`
- `src/types/inventory.ts`
- `src/utils/recipeExplosion.ts`
- `src/data/mockInventory.ts`
- `src/data/mockInvoices.ts`
- `src/data/mockRestaurant.ts`
- `src/context/InventoryContext.tsx`
- `src/components/restaurant/*`
- `src/components/inventory/*`
- `src/components/common/Navbar.tsx`
- `src/App.tsx`

Verification Requirements:
- Execute `npm run build` and ensure TypeScript compiles with 0 errors.
- Execute `npx vitest run` and ensure all 75 existing tests continue to pass 100%.
- Execute `node scripts/test-prototype.mjs` and ensure all 8 existing CLI tests pass 100%.
- Document all modified and created files, build/test commands, and outcomes in `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m7\handoff.md`.
- Send completion message to orchestrator via send_message.
