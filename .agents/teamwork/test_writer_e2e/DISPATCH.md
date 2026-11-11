# E2E Test Writer Dispatch: 4-Tier Test Suite & Test Infrastructure

## Milestone Scope
- **Track**: Dual Track - E2E Testing Track
- **Assigned Files (Exclusive Ownership)**:
  - `TEST_INFRA.md`
  - `tests/` (all test files and configs: `setup.ts`, `vitest.config.ts`, helpers, tier1..4 test suites)
  - `scripts/test-prototype.mjs`

## Mandatory Requirements
1. Implement the testing infrastructure specified in Explorer 3's handoff report (`.agents/teamwork/explorer_survey_3/handoff.md`):
   - `TEST_INFRA.md` in project root documenting the testing philosophy, commands (`npm test`, `npm run test:system`), and 4-tier methodology.
   - `vitest.config.ts` and `tests/setup.ts` (with mocks for localStorage, `window.print`, and DOM matchers).
   - `scripts/test-prototype.mjs` using Node 24 native test runner (`node:test`, `node:assert/strict`) verifying file existence, `PLAN_EJECUCION_TECNICA.md` completeness, `README.md`, and package scripts.
2. Implement the comprehensive 75-test 4-Tier test suite:
   - **Tier 1 (35 tests, 7 features x 5)**:
     - Tenant toggle (CROE <-> Círculo Militar)
     - Socio dossier & military profile
     - Dynamic verifiable QR carné & security badges
     - Reservation engine selection & booking calculations
     - Payment simulation (Payphone & Kushki)
     - Digital voucher receipt (SRI format, 15% IVA)
     - Technical doc existence (`PLAN_EJECUCION_TECNICA.md`, `README.md`)
   - **Tier 2 (30 tests, 6 domains x 5)**:
     - Empty states
     - Date collisions & overlaps
     - Zero/negative amounts & cent precision
     - Tenant persistence across navigation and reload
     - Input validation (Ecuadorian mobile, card checksum, XSS escaping)
     - QR tampering, expiration, and malformed payload handling
   - **Tier 3 (6 pairwise tests)**:
     - End-to-end booking -> checkout -> payment -> voucher ledger
     - Mid-wizard tenant switching
     - Profile rank mutation to immediate QR sync
     - Multi-facility booking bundling
     - Dynamic gateway switching
     - Voucher QR closed-loop verification
   - **Tier 4 (4 executive demonstration flows)**:
     - Scenario A: "El Retiro Familiar en CROE" (Coronel Carlos Mendoza)
     - Scenario B: "Torneo Interclub en Círculo Militar" (Mayor Patricia Falconí)
     - Scenario C: "Convenio Recíproco Interinstitucional FF.AA." (General de Brigada)
     - Scenario D: "Control de Acceso en Garita Móvil" (Sargento de Guardia)
3. Ensure all tests run cleanly and fast in headless mode with `node --test scripts/test-prototype.mjs` and `npx vitest run`.
4. Produce handoff report at `.agents/teamwork/test_writer_e2e/handoff.md`.


## 2026-11-09T01:59:55Z
You are Test Writer (E2E Testing Track).
Your working directory is: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\test_writer_e2e\
Read the original request at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master project architecture at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\PROJECT.md
Read the E2E testing architecture survey report at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_3\handoff.md
Read your task dispatch at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\test_writer_e2e\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You own exclusively:
`TEST_INFRA.md`, `tests/` (all files inside tests), and `scripts/test-prototype.mjs`. Do NOT edit source files in `src/`.

Your Mission:
1. Author `TEST_INFRA.md` in the project root documenting test runner commands, pass/fail semantics, and the 4-tier methodology.
2. Author `vitest.config.ts` and `tests/setup.ts` (with mocks for localStorage, `window.print`, and custom matchers).
3. Author `scripts/test-prototype.mjs` using Node 24 native test runner (`node:test`, `node:assert/strict`) verifying file existence, `PLAN_EJECUCION_TECNICA.md` completeness, `README.md`, and package scripts.
4. Implement the 75-test 4-Tier test catalog in `tests/`:
   - Tier 1: Feature Coverage (35 tests, 7 features x 5)
   - Tier 2: Boundary & Corner Cases (30 tests, 6 domains x 5)
   - Tier 3: Cross-Feature Combinations (6 pairwise tests)
   - Tier 4: Real-World Scenarios (4 executive demonstration flows)
5. Verify tests with `run_command` (`node --test scripts/test-prototype.mjs`) and report test outcomes in your handoff report at `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\test_writer_e2e\handoff.md`. Send a message when done.
