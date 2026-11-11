# Worker M4 Dispatch: Payment Gateway Simulation (Payphone & Kushki) + Digital SRI Receipt Voucher

## Milestone Scope
- **Milestone**: M4 - Payment Gateway Simulation (Payphone & Kushki) & Digital SRI Voucher
- **Assigned Files (Exclusive Ownership)**:
  - `src/context/PaymentContext.tsx`
  - `src/components/payment/PaymentCheckoutModal.tsx`
  - `src/components/payment/PayphoneForm.tsx`
  - `src/components/payment/KushkiForm.tsx`
  - `src/components/payment/ProcessingSpinner.tsx`
  - `src/components/payment/DigitalReceiptModal.tsx`
  - `src/components/payment/PaymentView.tsx`
  - `src/App.tsx` (the payment tab integration)

## Mandatory Requirements
1. Implement `PaymentContext.tsx`:
   - State for pending transactions, active checkout modal, payment status machine (`IDLE` -> `INITIATED` -> `PROCESSING` -> `APPROVED` -> `VOUCHER_ISSUED`).
   - Store transaction history and issued electronic vouchers in `localStorage` (`croe_transactions`, `circulo_transactions`).
   - Implement Ecuadorian financial calculation helpers: Subtotal 0%, Subtotal 15%, 15% IVA SRI (`0.15`), and Total USD.
   - Generate realistic authorization codes (`AUTH-PP-XXXXX` for Payphone, `AUTH-KSH-XXXXX` for Kushki), transaction UUIDs, and 49-digit SRI electronic access keys.
2. Implement `PaymentCheckoutModal.tsx`:
   - Branded gateway selector tabs:
     - **Payphone Ecuador** (`#F37021` orange branding, logo/icon, "App Móvil & Tarjeta").
     - **Kushki Pagos** (`#002B49` navy / `#FF2B6D` magenta branding, "Tokenización Segura & 3DS").
   - Order summary box with itemized description, subtotal, 15% IVA, and total.
3. Implement `PayphoneForm.tsx`:
   - Dual sub-modes: [ Pagar con App Payphone ] vs [ Tarjeta Directa ].
   - Mobile flow: Ecuadorian mobile input (`09X XXX XXXX`), phone validation, "Enviar Solicitud de Cobro", countdown animation simulating mobile push, and interactive "Simular Aprobación en Celular" button.
4. Implement `KushkiForm.tsx`:
   - Credit/debit card form with Luhn validation, brand auto-detect (Visa, Mastercard, Diners Club, Pacificard), expiry date, and CVV.
   - Installments dropdown: 1 cuota corriente, 3 meses sin intereses, 6 meses con intereses.
   - Simulated 3-D Secure OTP verification modal.
5. Implement `ProcessingSpinner.tsx`:
   - High-fidelity military/bank cryptographic loading animation ("Cifrando canal TLS 1.3...", "Consultando pasarela bancaria...", "Autorizando débito...", "Comprobante emitido").
6. Implement `DigitalReceiptModal.tsx`:
   - Printable Ecuadorian electronic voucher compliant with SRI specifications.
   - Header with institutional crest (CROE shield or Círculo Militar seal), legal entity name, institutional RUC, and "Comprobante Digital de Pago y Reserva".
   - Transaction metadata: Nº de Autorización SRI (49 dígitos), Fecha/Hora de emisión, Estado: "AUTORIZADO / PAGADO".
   - Itemized financial breakdown: Base Imponible, Descuento Militar, IVA 15%, Total Pagado en USD.
   - Dedicated QR code (`data-testid="voucher-qr-code"`) encoding voucher authorization and verification link.
   - Action buttons: "Imprimir Comprobante" (`window.print()`), "Descargar Comprobante", and "Finalizar".
7. Implement `PaymentView.tsx` and wire it cleanly into `src/App.tsx` under the "Pagos & Facturación" tab.
8. Ensure `npm run build` succeeds cleanly with 0 errors and `npm test` passes all 75 tests.


## 2026-11-09T02:38:55Z
You are Worker M4 (Payment Gateway Simulation & SRI Digital Voucher Worker).
Your working directory is: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m4\
Read the original request at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master project architecture at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\PROJECT.md
Read the UI/UX frontend survey report at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_1\handoff.md
Read the technical architecture report at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_2\handoff.md
Read your task dispatch at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m4\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You own exclusively:
`src/context/PaymentContext.tsx`, `src/components/payment/PaymentCheckoutModal.tsx`, `src/components/payment/PayphoneForm.tsx`, `src/components/payment/KushkiForm.tsx`, `src/components/payment/ProcessingSpinner.tsx`, `src/components/payment/DigitalReceiptModal.tsx`, `src/components/payment/PaymentView.tsx`, and the payment view in `src/App.tsx`.

Your Mission:
1. Implement `PaymentContext.tsx`:
   - State machine: `IDLE` -> `INITIATED` -> `PROCESSING` -> `APPROVED` -> `VOUCHER_ISSUED`.
   - Store transaction history and issued electronic vouchers in `localStorage` (`croe_transactions`, `circulo_transactions`).
   - Calculate SRI Ecuador 15% IVA tax, Subtotal, and Total in USD with 2 decimal precision.
   - Generate realistic authorization codes (`AUTH-PP-XXXXX` for Payphone, `AUTH-KSH-XXXXX` for Kushki), transaction IDs, and 49-digit SRI access keys (using Modulo 11).
2. Implement `PaymentCheckoutModal.tsx`:
   - Branded gateway selector tabs: Payphone Ecuador (orange `#F37021`) vs Kushki Pagos (navy `#002B49` / magenta `#FF2B6D`).
   - Order summary box with itemized description, subtotal, 15% IVA, and total.
3. Implement `PayphoneForm.tsx`:
   - App push flow: Ecuadorian mobile input (`09X XXX XXXX`), phone validation, simulated push countdown, and interactive "Simular Aprobación en Celular" button.
   - Card direct flow: Tokenized card fields.
4. Implement `KushkiForm.tsx`:
   - Card fields with Luhn validation, brand auto-detect (Visa, Mastercard, Diners Club, Pacificard), expiry date, CVV, and deferred installments (1, 3, 6 cuotas).
   - Simulated 3-D Secure OTP verification modal.
5. Implement `ProcessingSpinner.tsx`:
   - Bank/military cryptographic loading animation ("Cifrando canal TLS 1.3...", "Consultando pasarela bancaria...", "Autorizando...").
6. Implement `DigitalReceiptModal.tsx`:
   - Legal Ecuadorian electronic receipt voucher compliant with SRI specifications.
   - Institutional crest (CROE shield or Círculo Militar seal), legal entity name, RUC, and "Comprobante Digital de Pago y Reserva".
   - 49-digit authorization number, emission timestamp, status "AUTORIZADO / PAGADO".
   - Financial table with Base Imponible, Descuento Militar, IVA 15%, and Total Pagado.
   - Dedicated QR code (`data-testid="voucher-qr-code"`) with verification URL.
   - Actions: "Imprimir Comprobante" (`window.print()`), "Descargar Comprobante", and "Finalizar".
7. Implement `PaymentView.tsx` and wire it into the "Pagos & Facturación" tab in `src/App.tsx`.
8. Run `npm run build` and `npm test` verifying 0 errors and all 75 tests passing.
9. Write your handoff report at `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m4\handoff.md` and send a message when done.
