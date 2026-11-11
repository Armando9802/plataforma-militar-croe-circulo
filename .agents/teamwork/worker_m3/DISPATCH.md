# Worker M3 Dispatch: Interactive Reservation Engine (Lodging vs Sports Facilities)

## Milestone Scope
- **Milestone**: M3 - Interactive Reservation Engine (Lodging & Sports Facilities)
- **Assigned Files (Exclusive Ownership)**:
  - `src/context/ReservationContext.tsx`
  - `src/components/reservations/ReservationView.tsx`
  - `src/components/reservations/FacilityCard.tsx`
  - `src/components/reservations/AvailabilityModal.tsx`
  - `src/components/reservations/BookingSummaryModal.tsx`
  - `src/components/reservations/MyBookingsDrawer.tsx`
  - `src/App.tsx` (the reservations tab view)

## Mandatory Requirements
1. Implement `ReservationContext.tsx`:
   - Manage facility inventory by active tenant (`CROE_CONFIG.facilities` vs `CIRCULO_CONFIG.facilities`).
   - Store and retrieve active reservations from `localStorage` (`croe_reservations` and `circulo_reservations`).
   - Enforce date conflict prevention and overlap checks (per `tests/helpers/bookingEngine.ts`). Contiguous turnover (checkout 12:00, check-in 14:00) is permitted; internal overlaps are rejected.
   - Enforce guest capacity limits per facility.
   - Calculate financial totals applying member discounts: Subtotal, Military Discount, 15% IVA SRI Ecuador, and Grand Total.
2. Implement `ReservationView.tsx`:
   - Dual-mode tab toggle: [ 🏨 Hospedaje y Cabañas ] vs [ 🎾 Deportes y Recreación ].
   - Filter bar: Capacity (1-8 pax), Facility category, Search input by facility name.
   - Grid of `FacilityCard.tsx` showcasing capacity badge, price per night/hour, member discount tag, amenities list, and "Reservar Ahora" CTA.
   - "Mis Reservas Activas" ledger button opening `MyBookingsDrawer.tsx` displaying all booked items, locator codes (`RSV-CROE-XXXX`), status, and cancellation options.
3. Implement `AvailabilityModal.tsx`:
   - Interactive date range picker for lodging and time slot grid for sports courts (e.g. 08:00 - 10:00, 10:00 - 12:00).
   - Real-time slot availability indicator (Available in green vs "Reservado / No disponible" in gray).
   - Guest count selector with capacity limit validation.
4. Implement `BookingSummaryModal.tsx`:
   - Line-item breakdown of selected facility, dates/slots, nights/hours, base rate, military discount subsidy, 15% IVA, and total.
   - "Confirmar Reserva" action that saves the booking to local ledger.
   - Optional hook/CTA to proceed immediately to Payment Checkout (linking to M4).
5. Ensure `npm run build` succeeds cleanly with 0 errors and `npm test` passes all tests.


## 2026-11-09T02:26:12Z
You are Worker M3 (Interactive Reservation Engine Worker).
Your working directory is: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m3\
Read the original request at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md
Read the master project architecture at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\PROJECT.md
Read the UI/UX frontend survey report at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_1\handoff.md
Read your task dispatch at: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m3\DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

File Ownership:
You own exclusively:
`src/context/ReservationContext.tsx`, `src/components/reservations/ReservationView.tsx`, `src/components/reservations/FacilityCard.tsx`, `src/components/reservations/AvailabilityModal.tsx`, `src/components/reservations/BookingSummaryModal.tsx`, `src/components/reservations/MyBookingsDrawer.tsx`, and the reservations tab integration in `src/App.tsx`.

Your Mission:
1. Implement `ReservationContext.tsx`:
   - Expose facility catalog for active tenant (`CROE_CONFIG.facilities` vs `CIRCULO_CONFIG.facilities`).
   - Manage booking cart, active reservations, and persistence in `localStorage` (`croe_reservations` and `circulo_reservations`).
   - Implement date collision prevention (reject overlapping bookings for the same facility, allow contiguous turnovers).
   - Enforce facility guest capacity limits.
   - Calculate financial breakdown: base rate, member discount (subsidy), 15% IVA SRI Ecuador, and total USD.
2. Implement `ReservationView.tsx`:
   - Dual category tabs: [ 🏨 Hospedaje y Cabañas ] vs [ 🎾 Deportes y Recreación ].
   - Capacity and category filters, search bar, and facility cards grid.
   - "Mis Reservas Activas" ledger button opening `MyBookingsDrawer.tsx` displaying booked locator codes (e.g. `RSV-CROE-XXXX`), dates, and status.
3. Implement `AvailabilityModal.tsx`:
   - Calendar date picker for lodging and time slots for sports courts.
   - Real-time slot availability indicators.
   - Guest selector with capacity limit validation.
4. Implement `BookingSummaryModal.tsx`:
   - Line-item breakdown of cost with member discount and 15% IVA.
   - "Confirmar Reserva" saving to local ledger and preparing for payment.
5. Wire everything cleanly into the "Reservas & Hospedaje" tab in `src/App.tsx`.
6. Run `npm run build` and `npm test` verifying 0 errors.
7. Write your handoff report at `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\worker_m3\handoff.md` and send a message when done.


## 2026-11-09T02:35:50Z
**Context**: Milestone M3 Completion Check
**Content**: All reservation components (ReservationView, FacilityCard, AvailabilityModal, BookingSummaryModal, MyBookingsDrawer, ReservationContext) and App.tsx integration are observed. Checking if your test/build verification and handoff report are ready.
**Action**: Please complete your handoff report in .agents/teamwork/worker_m3/handoff.md and report back your results.
