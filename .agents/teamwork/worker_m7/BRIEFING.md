# BRIEFING — 2026-11-09T03:56:00Z

## Mission
Implement Milestone 7: Restaurant Shifts, Banquets & Events, Inventory/Economato with real-time BOM explosion, Kardex ledger, Tableware Audit, and SRI Electronic Invoicing integration.

## 🔒 My Identity
- Archetype: worker
- Roles: implementer, qa, specialist
- Working directory: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m7\
- Original parent: 4cb2763c-1538-4609-8d96-d251b4f7d423
- Milestone: M7 (Restaurant Shifts, Events, Inventory/Economato & Invoice Ingestion Engine)

## 🔒 Key Constraints
- DO NOT CHEAT. All implementations must be genuine, maintaining real state and real behavior.
- Multi-tenant support (CROE Cumbayá vs Círculo Militar).
- 15% SRI IVA calculation for Ecuador.
- Keep existing navbar button label "Reservas & Deportes" EXACTLY as is to prevent regression in existing tests (75 vitest tests + 8 CLI tests).
- Build and tests must pass with 0 errors.

## Current Parent
- Conversation ID: 4cb2763c-1538-4609-8d96-d251b4f7d423
- Updated: not yet

## Task Summary
- **What to build**: Restaurant shift booking & institutional banquets, supply recipe BOM explosion engine, Inventory catalog & Kardex ledger, Tableware audit/settlement, SRI Invoice upload & stock bump, UI views & modals, Navbar/App integration.
- **Success criteria**: TypeScript compiles cleanly, 85/85 vitest tests pass, 8/8 CLI tests pass, complete interactive workflows.
- **Interface contracts**: PROJECT.md, Explorer 1, 2, 3 reports.

## Change Tracker
- **Files created**:
  - `src/types/restaurant.ts`: ShiftType, EventType, RoomSetup, DiningHallFacility, MenuItemOption, RestaurantShiftBooking, EventBanquetBooking, RecipeRequirementItem.
  - `src/types/inventory.ts`: InventoryCategory, UnitOfMeasure, StockStatusLevel, InventoryItem, KardexMovementType, KardexEntry, RecipeRequirement, RecipeFormula, StockDeductionPreview, ExplosionResult, TablewareAuditItem, EventSettlementRecord, SupplierInvoice, SupplierInvoiceItem.
  - `src/utils/recipeExplosion.ts`: SHIFT_RECIPE_BOM, EVENT_RECIPE_BOM, calculateSupplyExplosion, calculateExplosion.
  - `src/data/mockInventory.ts`: 20 CROE items, 20 Círculo Militar items, 5 recipe formulas, 40 initial Kardex balances.
  - `src/data/mockInvoices.ts`: 3 real Ecuadorian supplier invoices (Pronaca, Tesalia, Indurmesa) with 49-digit SRI access keys and 15% IVA.
  - `src/data/mockRestaurant.ts`: Dining halls, daily shifts, specialized menus, and banquet additional services.
  - `src/context/InventoryContext.tsx`: Multi-tenant persistent state, live stock explosion deductions, tableware circulation/settlement, SRI invoice processing, manual adjustments.
  - `src/components/restaurant/RestaurantView.tsx`: Daily shifts with live PAX slider, live BOM explosion preview, 15% SRI IVA, banquets and simulated payment forward.
  - `src/components/inventory/InventoryView.tsx`: Stock catalog, 4 categories, search/filter, progress bars, health badges (ÓPTIMO, PRECAUCIÓN, CRÍTICO).
  - `src/components/inventory/KardexAuditView.tsx`: Immutable Kardex ledger table with movement type badges, search/filter, and full audit trail.
  - `src/components/inventory/InvoiceUploadModal.tsx`: XML/PDF SRI dropzone, 1-click presets for Pronaca, Tesalia, Indurmesa, stock bump & Kardex logging.
  - `src/components/inventory/TablewareAuditModal.tsx`: Post-event tableware audit, intact returns vs breakages, automatic loss calculation and MERMA_ROTURA Kardex logging.
  - `tests/tier1-feature-coverage/restaurant-shifts.test.tsx`: 5 comprehensive tests for shifts, explosion, IVA, and banquets.
  - `tests/tier1-feature-coverage/inventory-kardex.test.tsx`: 5 comprehensive tests for economato dashboard, Kardex, invoices, and tableware audit.
- **Files modified**:
  - `src/components/common/Navbar.tsx`: Extended ActiveTab and navItems with 'restaurant' and 'inventory' without modifying 'Reservas & Deportes'.
  - `src/App.tsx`: Mounted InventoryProvider, rendered RestaurantView and InventoryView.
- **Build status**: PASS (tsc && vite build in 7.92s with 0 errors)
- **Pending issues**: None

## Quality Status
- **Build/test result**: 85/85 Vitest tests PASS (100%), 8/8 Node 24 native CLI tests PASS (100%).
- **Lint status**: Clean (all TS6133 unused vars resolved, strict type checking).
- **Tests added/modified**: 10 new tests added across 2 new test suites covering all M7 features.

## Loaded Skills
- **Source**: C:\Users\eretm\.gemini\config\plugins\frontend-expert-plugin\skills\frontend-expert\SKILL.md
- **Local copy**: C:\Users\eretm\.gemini\config\plugins\frontend-expert-plugin\skills\frontend-expert\SKILL.md
- **Core methodology**: Modern React, TypeScript, high-performance UI patterns, clean state architecture.
