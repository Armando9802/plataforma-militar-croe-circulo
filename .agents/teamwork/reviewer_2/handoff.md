# Reviewer 2: Multi-Tenant Architecture, Security, Cryptography & LOPDP Review

**Reviewer Identity:** Reviewer 2 (Multi-Tenant Architecture, Security & LOPDP Reviewer)  
**Roles:** Reviewer & Adversarial Critic  
**Date:** 2026-11-09  
**Verdict:** **APPROVE**  
**Integrity Audit:** **PASSED — ZERO INTEGRITY VIOLATIONS DETECTED**

---

## 1. Executive Review Summary

| Evaluation Area | Status | Key Findings & Evidence |
|:---|:---:|:---|
| **Multi-Tenant Architecture & CSS Theming** | **VERIFIED** | Dynamic `:root` injection of `data-tenant` and 7 CSS tokens (`--color-primary`, `--color-primary-dark`, `--color-primary-light`, `--color-accent`, `--color-accent-light`, `--color-neutral-dark`, `--color-bg-subtle`). Fluid zero-reload switching. |
| **LocalStorage Isolation** | **VERIFIED** | Clean key partition between institutions: `croe_reservations` vs `circulo_reservations`, `croe_transactions` vs `circulo_transactions`. Corrupt JSON handling with safe fallbacks. |
| **Cryptographic QR Signing & Verification** | **VERIFIED** | Genuine FIPS 180-4 standard SHA-256 implementation (`sha256Pure`) matching Node.js OpenSSL bit-for-bit. Tamper detection, 15-minute expiration enforcement, and live anti-screenshot CSS/JS pulse. |
| **SRI Fiscal & 15% IVA Compliance** | **VERIFIED** | Exact 15% IVA rate calculation conforming to Ecuador 2024 tax reforms (`Ley Orgánica de Conflicto Armado`), banker's cent rounding with `Number.EPSILON`, and 49-digit SRI electronic access key using weighted Modulo 11 check digit. |
| **Payment Gateways (Payphone & Kushki)** | **VERIFIED** | Payphone mobile flow with +593 10-digit validation, simulated push notification, and Kushki card flow with Luhn algorithm and 3-D Secure OTP modal simulation. |
| **PLAN_EJECUCION_TECNICA.md** | **VERIFIED** | Comprehensive 986-line architecture blueprint: 12 PostgreSQL DDL tables, RLS isolation policies, 8-tier RBAC matrix, LOPDP compliance (ARCO rights, 72h breach notification, DPO role), and 11+2 module roadmap over 10 months. |
| **Build & Test Automation** | **VERIFIED** | `npm run build` exits 0 (1622 modules transformed). `npm test` runs 15 Vitest suites with 75/75 passing tests. Native Node 24 test runner passes 8/8 architectural checks. |

---

## 2. 5-Component Handoff Report

### 2.1. Observation

1. **Build Command & Output:**
   - Command: `npm run build`
   - Result: Exit code 0, 0 TypeScript errors.
   - Verbatim Output:
     ```
     > plataforma-militar-croe-circulo@1.0.0 build
     > tsc && vite build
     vite v5.4.21 building for production...
     transforming...
     ✓ 1622 modules transformed.
     rendering chunks...
     computing gzip size...
     dist/index.html                   1.05 kB │ gzip:   0.61 kB
     dist/assets/index-V47tySyQ.css   53.55 kB │ gzip:   9.17 kB
     dist/assets/index-CxjRiT8x.js   400.85 kB │ gzip: 107.97 kB
     ✓ built in 33.34s
     ```

2. **Test Command & Output:**
   - Command: `npm test`
   - Result: Exit code 0, 15 test files passed, 75 tests passed, 0 failed.
   - Verbatim Output:
     ```
     Test Files  15 passed (15)
          Tests  75 passed (75)
       Start at  21:58:46
       Duration  23.29s (transform 2.20s, setup 4.42s, collect 52.56s, tests 33.26s, environment 22.61s, prepare 3.69s)
     JSON report written to C:/Users/eretm/OneDrive/Desktop/Projecto Hernan Fonseca/test-results/summary.json
     ```

3. **System & Document Runner Output:**
   - Command: `node --test scripts/test-prototype.mjs`
   - Result: Exit code 0, 8 passed, 0 failed.
   - Verbatim Output:
     ```
     ▶ System, Document & Architecture Verification (Node 24 Native Test Runner)
       ✔ DOC-01: PLAN_EJECUCION_TECNICA.md exists and meets depth requirements (>15KB) (2.4666ms)
       ✔ DOC-02: ER Data Model specifies core military entities with relational structure (0.9227ms)
       ✔ DOC-03: Multi-tenant architecture and Ecuadorian payment gateways are documented (0.6375ms)
       ✔ DOC-04: 11+2 module roadmap and security architecture are specified (0.5491ms)
       ✔ DOC-05: README.md exists and contains executive demo execution instructions (0.4914ms)
       ✔ PKG-01: package.json specifies standard dev, build, and test scripts (1.0645ms)
       ✔ INFRA-01: TEST_INFRA.md documents the 4-tier testing methodology and commands (0.5624ms)
       ✔ ARCH-01: Source code structure conforms to PROJECT.md layout standards (0.5672ms)
     ✔ System, Document & Architecture Verification (Node 24 Native Test Runner) (8.2998ms)
     ```

4. **Multi-Tenant State & Storage Isolation (`src/context/TenantContext.tsx`, `ReservationContext.tsx`, `PaymentContext.tsx`):**
   - In `TenantContext.tsx` lines 49-61:
     ```typescript
     const root = document.documentElement;
     root.setAttribute('data-tenant', currentTenant.id);
     root.style.setProperty('--color-primary', currentTenant.theme.primaryColor);
     root.style.setProperty('--color-primary-dark', currentTenant.theme.primaryDark);
     root.style.setProperty('--color-primary-light', currentTenant.theme.primaryLight);
     root.style.setProperty('--color-accent', currentTenant.theme.accentColor);
     root.style.setProperty('--color-accent-light', currentTenant.theme.accentLight);
     root.style.setProperty('--color-neutral-dark', currentTenant.theme.textColor);
     root.style.setProperty('--color-bg-subtle', currentTenant.theme.bgSubtle);
     document.title = `${currentTenant.shortName} | Plataforma Institucional`;
     ```
   - In `ReservationContext.tsx` lines 212-215:
     ```typescript
     const STORAGE_KEYS = {
       croe: 'croe_reservations',
       'circulo-militar': 'circulo_reservations',
     };
     ```
   - In `PaymentContext.tsx` lines 163-166:
     ```typescript
     const STORAGE_KEYS: Record<TenantId, string> = {
       croe: 'croe_transactions',
       'circulo-militar': 'circulo_transactions',
     };
     ```

5. **Cryptographic SHA-256 Bitwise Parity (`src/components/socio/VerifiableQRCode.tsx`):**
   - In `VerifiableQRCode.tsx` lines 33-133: Full 64-round pure TypeScript implementation of standard FIPS 180-4 SHA-256.
   - Independent cross-check against Node.js `node:crypto.createHash('sha256')`:
     - Test input: `"hello world"` -> `b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9` (Match: true)
     - Test input: `"FFAA_ECUADOR_MILITARY_SECURITY_SALT_2026"` -> `a347d78d99efb983ad24def426721ab74aa7565036a7cac286fc5743c72f6733` (Match: true)
     - Test input: Multi-byte UTF-8 `"áéíóúñÁÉÍÓÚÑ"` -> `464a2fc521d79c14f798328fabc7438fc16aabb662bd88e18dd8d435da4ea855` (Match: true)

6. **SRI 49-Digit Access Key & Modulo 11 Algorithm (`src/context/PaymentContext.tsx` lines 105-131):**
   - Key format: 48 digits partial + 1 check digit = 49 numeric characters.
   - Test execution with RUC `'1790014298001'`, date `08/11/2026`, seq `1234`:
     - Key: `0811202601179001429800110010010000012341234567819` (Length: 49, all numeric).
     - Sum: 552. Residue: 552 % 11 = 2. Check digit: 11 - 2 = 9. Exactly matches.

7. **Technical Plan Specification (`PLAN_EJECUCION_TECNICA.md`):**
   - Total lines: 986 lines (>55 KB).
   - 12 tables in PostgreSQL DDL: `tenants`, `military_branches`, `military_ranks`, `members`, `dependents`, `campuses`, `facilities`, `reservations`, `membership_dues`, `payment_transactions`, `electronic_invoices_sri`, `inter_institutional_agreements`.
   - PostgreSQL RLS enabled with `current_tenant_id()` session resolver and restrictive policies.
   - 8-tier RBAC matrix covering all castrense and operational roles.
   - LOPDP compliance provisions: AES-256 encryption for military personnel data, 15-day ARCO turnaround, 72-hour breach notification, DPO designated officer.

---

### 2.2. Logic Chain

1. **Integrity Verification:**
   - Examined `VerifiableQRCode.tsx`, `PaymentContext.tsx`, `ReservationContext.tsx`, and `KushkiForm.tsx`.
   - Found that algorithms (SHA-256, Modulo 11, collision detection, Luhn) execute substantive mathematical logic rather than returning static mocks.
   - Cross-checked `sha256Pure` against native OpenSSL crypto; verified identical hex digests across ASCII and UTF-8 strings.
   - Checked tests: 75 Vitest tests run against the real DOM (`@testing-library/react`), firing real click events and evaluating dynamic states.
   - **Deduction:** No integrity violations, hardcoded test results, or facade bypasses exist.

2. **Multi-Tenant Isolation Verification:**
   - Traced `TenantContext.tsx` state updates to DOM: setting `data-tenant="croe"` vs `data-tenant="circulo-militar"` and updating the 7 CSS custom properties.
   - Inspected `ReservationContext.tsx`: `tenantLedgers` state maintains separate keys `croe` and `circulo-militar`, reading and writing strictly to `croe_reservations` and `circulo_reservations`.
   - Inspected `PaymentContext.tsx`: `tenantTransactions` state reads and writes strictly to `croe_transactions` and `circulo_transactions`.
   - Verified that corrupt values in localStorage do not throw uncaught exceptions; both contexts safely fall back to default seeds.
   - **Deduction:** Multi-tenant isolation is robust and zero-reload tenant switching operates cleanly.

3. **Cryptographic & Anti-Screenshot Verification:**
   - Traced `generateSignedQrPayload`: takes canonical string with pipe delimiter, appends `QR_SECRET_SALT`, hashes using SHA-256, and outputs structured JSON.
   - In `verifyQrOffline`: parses JSON, extracts metadata, recalculates expected hash, and checks issue timestamp against a 15-minute sliding window. If hash is altered, returns `INVALID_SIGNATURE`; if timestamp > 15m, returns `EXPIRED_CODE`.
   - In `VerifiableQRCode.tsx`: `pulseTick` state increments every 1000ms with a CSS ping animation and 15-minute countdown clock, providing an anti-screenshot live indicator.
   - **Deduction:** QR security meets the specified military credential verification requirements.

4. **SRI & Fiscal Simulation Verification:**
   - Tested `calculateVat15`: applies `0.15` multiplier with `(amount + Number.EPSILON) * 100 / 100` rounding, preventing JavaScript floating point off-by-one errors (e.g., $10.05 -> $1.51 VAT, total $11.56).
   - Tested `generateSriAccessKey`: generates exact 49-digit electronic access key with standard SRI composition and Modulo 11 check digit.
   - **Deduction:** Fiscal calculations conform accurately to Ecuadorian SRI regulations.

5. **Technical Plan Review (`PLAN_EJECUCION_TECNICA.md`):**
   - Confirmed the 12-table relational model covers the full operational domain (members, dependents, dues, reservations, transactions, SRI invoices, inter-club agreements).
   - Confirmed RLS policy definitions enforce database-level isolation.
   - Confirmed 8-tier RBAC and LOPDP compliance requirements are clearly documented for the Tuesday executive meeting.
   - **Deduction:** The technical plan is comprehensive, professional, and directly actionable.

---

### 2.3. Caveats

1. **Client-Side Prototype Salt Exposure:**
   In this autonomous client-side prototype, `QR_SECRET_SALT` is bundled in JavaScript (`dist/assets/index-CxjRiT8x.js`). While necessary for a standalone zero-backend demonstration, production deployment must transition to asymmetric digital signatures (e.g. Ed25519/ECDSA with private keys on an HSM/KMS and public keys distributed to garita terminals) or server-side TOTP as specified in Section 6.2 of `PLAN_EJECUCION_TECNICA.md`.
2. **Unsanitized RUC Input Edge Case:**
   `generateSriAccessKey` assumes `ruc` contains only numeric characters. If a future caller passes an unformatted RUC with hyphens (e.g. `'1790014298-001'`), `paddedRuc` will slice the hyphen, resulting in `NaN` check digits. Recommended defense: sanitize with `.replace(/\D/g, '')` before padding.
3. **Hardware Integration:**
   Garita scanning is simulated via camera reticle and interactive test scenario buttons. Physical barcode reader hardware and NFC readers are architecturally planned for Phase 1 in `PLAN_EJECUCION_TECNICA.md`.

---

### 2.4. Conclusion

The multi-tenant architecture, CSS custom property theming, localStorage data partitioning, SHA-256 QR cryptographic signing, 15% IVA SRI calculation, and `PLAN_EJECUCION_TECNICA.md` document meet and exceed all technical requirements. The code exhibits high modularity, comprehensive test coverage (75 Vitest tests + 8 Node tests), and clean separation of concerns.

**Final Verdict:** **APPROVE**

---

### 2.5. Verification Method

To independently verify this evaluation, execute the following commands in the project directory:

```bash
# 1. Verify build compiles cleanly with zero TypeScript errors
npm run build

# 2. Execute full 15-suite automated test harness
npm test

# 3. Run Node 24 native system and document verification
node --test scripts/test-prototype.mjs

# 4. Cross-check SHA-256 against OpenSSL
node --input-type=module -e "
import crypto from 'node:crypto';
console.log('OpenSSL SHA256:', crypto.createHash('sha256').update('FFAA_ECUADOR_MILITARY_SECURITY_SALT_2026').digest('hex'));
"

# 5. Inspect PLAN_EJECUCION_TECNICA.md table count and RLS policies
grep -n "CREATE TABLE" PLAN_EJECUCION_TECNICA.md
grep -n "CREATE POLICY" PLAN_EJECUCION_TECNICA.md
```

**Invalidation Conditions:**
- Any build failure during `npm run build`.
- Any test failure in `npm test` (<75 passing).
- Modification of `sha256Pure` resulting in non-standard hash outputs.
- Key collision between `croe_reservations` and `circulo_reservations` in `localStorage`.

---

## 3. Findings & Recommendations

### [Minor] Finding 1: RUC Input Sanitization in SRI Access Key Generator
- **Location:** `src/context/PaymentContext.tsx`, Line 111 (`paddedRuc = ruc.padEnd(13, '0').slice(0, 13)`)
- **Impact:** If an unformatted RUC containing dashes (e.g., `'1790014298-001'`) is passed, `parseInt` encounters `-` and yields `NaN`.
- **Suggestion:** Add `.replace(/\D/g, '')` before padding:
  ```typescript
  const cleanRuc = ruc.replace(/\D/g, '').padEnd(13, '0').slice(0, 13);
  ```

### [Minor] Finding 2: Modal Label vs QR URL Parameter Consistency
- **Location:** `src/components/payment/DigitalReceiptModal.tsx`, Line 55 vs Line 248
- **Impact:** The on-screen text renders `sriAuthCode` as `AUTH-SRI-2026-XXXXX` while the QR verification URL passes `auth=${transaction.authorizationCode}` (`AUTH-PP-XXXXX`).
- **Suggestion:** Pass `sriAuthCode` in both the display header and the QR code link for uniform presentation.

---

## 4. Adversarial Challenge Report

### Challenge Summary
- **Overall Risk Assessment:** **LOW**
- **Robustness Rating:** **HIGH** (Production-ready prototype with solid theoretical foundations in `PLAN_EJECUCION_TECNICA.md`).

### Challenge 1: Key Extraction in Client-Side Cryptography
- **Assumption Challenged:** Client can perform offline signing securely using `QR_SECRET_SALT`.
- **Attack Scenario:** A curious officer inspects the browser source code, extracts `QR_SECRET_SALT = 'FFAA_ECUADOR_MILITARY_SECURITY_SALT_2026'`, and writes a script to forge QR codes with status `ACTIVO`.
- **Blast Radius:** In a production environment without backend check, forged access at garita.
- **Mitigation:** As already documented in Section 6.2 of `PLAN_EJECUCION_TECNICA.md`, production must use asymmetric cryptography (private key on server, public key on garita terminal) or dynamic TOTP seeds synced via secure enclave.

### Challenge 2: Modulo 11 Corner Cases (Residue 0 and 1)
- **Assumption Challenged:** SRI Modulo 11 formula handles residue 0 and 1 according to SRI specifications.
- **Stress Test:**
  - Residue 0 -> `11 - 0 = 11` -> check digit MUST be `0`.
  - Residue 1 -> `11 - 1 = 10` -> check digit MUST be `1`.
- **Test Result:** Line 128 of `PaymentContext.tsx`:
  `const checkDigit = mod11 === 11 ? 0 : mod11 === 10 ? 1 : mod11;`
  **PASS.** Exactly handles both corner cases.

### Challenge 3: Float Precision Under High-Volume Rounding
- **Assumption Challenged:** 15% IVA computation does not suffer from JavaScript floating point imprecision.
- **Stress Test:** Evaluated amounts with fractional cent bases ($15.55, $10.05, $99.99).
- **Test Result:** `Math.round((amount + Number.EPSILON) * 100) / 100` correctly rounds without drift.
  **PASS.**
