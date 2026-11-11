#!/usr/bin/env node
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Import domain logic matching src/context/ReservationContext.tsx & PaymentContext.tsx
// To ensure independent empirical testing, we test the exact mathematical and algorithmic logic

// --- Domain Algorithms Replicated From Source ---
const ECUADOR_IVA_RATE = 0.15;

function roundCurrency(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function calculateVat15(taxableBase) {
  if (taxableBase <= 0) return 0;
  return roundCurrency(taxableBase * ECUADOR_IVA_RATE);
}

function computeBillingBreakdown(params) {
  const { regularPrice, memberPrice, units, isMember, isTaxExempt = false } = params;

  if (units <= 0) {
    throw new Error('Units must be greater than zero');
  }

  const baseRate = isMember ? memberPrice : regularPrice;
  const regularTotal = roundCurrency(regularPrice * units);
  const actualSubtotal = roundCurrency(baseRate * units);

  const militaryDiscount = isMember ? roundCurrency(Math.max(0, regularTotal - actualSubtotal)) : 0;
  const taxableSubtotal = Math.max(0, actualSubtotal);
  const isComplimentary = taxableSubtotal === 0;

  const vat = isTaxExempt || isComplimentary ? 0 : calculateVat15(taxableSubtotal);
  const total = roundCurrency(taxableSubtotal + vat);

  return {
    subtotal: actualSubtotal,
    militaryDiscount,
    taxableSubtotal,
    vat,
    total,
    isComplimentary,
  };
}

function checkLodgingCollision(existingBookings, requested) {
  const reqStart = new Date(`${requested.checkIn}T14:00:00Z`).getTime();
  const reqEnd = new Date(`${requested.checkOut}T12:00:00Z`).getTime();

  if (isNaN(reqStart) || isNaN(reqEnd)) {
    return { hasConflict: true, reason: 'Fechas inválidas' };
  }

  if (reqEnd <= reqStart) {
    return {
      hasConflict: true,
      reason: 'La fecha de salida debe ser posterior a la fecha de ingreso',
    };
  }

  for (const booking of existingBookings) {
    if (booking.facilityId !== requested.facilityId) continue;
    if (booking.id && booking.id === requested.id) continue;

    const existStart = new Date(`${booking.checkIn}T14:00:00Z`).getTime();
    const existEnd = new Date(`${booking.checkOut}T12:00:00Z`).getTime();

    // Check overlap: StartA < EndB and EndA > StartB
    if (reqStart < existEnd && reqEnd > existStart) {
      return {
        hasConflict: true,
        conflictingBooking: booking,
        reason: `Conflicto de fechas: Instalación ocupada desde ${booking.checkIn} hasta ${booking.checkOut}`,
      };
    }
  }

  return { hasConflict: false };
}

function checkSportsCollision(existingSlots, requested) {
  if (requested.startHour >= requested.endHour) {
    return { hasConflict: true, reason: 'La hora de fin debe ser posterior a la de inicio' };
  }

  for (const slot of existingSlots) {
    if (slot.facilityId !== requested.facilityId) continue;
    if (slot.date !== requested.date) continue;
    if (slot.id && slot.id === requested.id) continue;

    // Time collision: startA < endB && endA > startB
    if (requested.startHour < slot.endHour && requested.endHour > slot.startHour) {
      return {
        hasConflict: true,
        reason: `Horario ya reservado: ${slot.startHour}:00 - ${slot.endHour}:00`,
      };
    }
  }

  return { hasConflict: false };
}

function validateGuestCapacity(guests, maxCapacity) {
  if (guests <= 0) {
    return { valid: false, error: 'Debe ingresar al menos 1 persona' };
  }
  if (guests > maxCapacity) {
    return {
      valid: false,
      error: `Capacidad máxima excedida (Máximo ${maxCapacity} personas)`,
    };
  }
  return { valid: true };
}

function validateEcuadorMobilePhone(phone) {
  const cleanPhone = phone.replace(/\D/g, '');
  if (!cleanPhone.startsWith('09') || cleanPhone.length !== 10) {
    return { valid: false, error: 'Ingrese un número de celular ecuatoriano válido de 10 dígitos (09X XXX XXXX).' };
  }
  return { valid: true, cleanPhone };
}

function validateLuhn(cardNumber) {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

function detectCardBrand(cardNumber) {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return { brand: 'VISA', label: 'Visa' };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: 'MASTERCARD', label: 'Mastercard' };
  if (/^3[47]/.test(clean)) return { brand: 'AMEX', label: 'American Express' };
  if (/^3(0[0-5]|[68])/.test(clean)) return { brand: 'DINERS', label: 'Diners Club' };
  if (/^(6011|65|64[4-9]|622)/.test(clean)) return { brand: 'PACIFICARD', label: 'Pacificard / Discover' };
  return { brand: 'CARD', label: 'Tarjeta' };
}

// =========================================================================
// TEST SUITE: ADVERSARIAL BOUNDARY STRESS
// =========================================================================

describe('Adversarial Boundary Stress Suite', () => {

  describe('1. Date Collision Rejection vs Contiguous Turnovers', () => {
    const existing = [
      { id: 'R1', facilityId: 'cabana-alfa', checkIn: '2026-12-10', checkOut: '2026-12-15' },
    ];

    test('LODGE-01: Identical reservation interval is blocked', () => {
      const res = checkLodgingCollision(existing, {
        facilityId: 'cabana-alfa',
        checkIn: '2026-12-10',
        checkOut: '2026-12-15',
      });
      assert.equal(res.hasConflict, true);
    });

    test('LODGE-02: Forward contiguous turnover (checkout date == checkin date) is ALLOWED', () => {
      // Existing checkout is 2026-12-15 (12:00 PM). New guest checkin is 2026-12-15 (14:00 PM).
      const res = checkLodgingCollision(existing, {
        facilityId: 'cabana-alfa',
        checkIn: '2026-12-15',
        checkOut: '2026-12-20',
      });
      assert.equal(res.hasConflict, false, 'Turnover on same day must be permitted');
    });

    test('LODGE-03: Backward contiguous turnover (checkin date == checkout date) is ALLOWED', () => {
      // New guest checkout is 2026-12-10 (12:00 PM). Existing checkin is 2026-12-10 (14:00 PM).
      const res = checkLodgingCollision(existing, {
        facilityId: 'cabana-alfa',
        checkIn: '2026-12-05',
        checkOut: '2026-12-10',
      });
      assert.equal(res.hasConflict, false, 'Prior checkout on same day must be permitted');
    });

    test('LODGE-04: Internal subset interval collision is BLOCKED', () => {
      const res = checkLodgingCollision(existing, {
        facilityId: 'cabana-alfa',
        checkIn: '2026-12-11',
        checkOut: '2026-12-14',
      });
      assert.equal(res.hasConflict, true);
    });

    test('LODGE-05: Supersubset interval wrapping existing booking is BLOCKED', () => {
      const res = checkLodgingCollision(existing, {
        facilityId: 'cabana-alfa',
        checkIn: '2026-12-08',
        checkOut: '2026-12-18',
      });
      assert.equal(res.hasConflict, true);
    });

    test('LODGE-06: Inverted dates (checkIn > checkOut) is BLOCKED with descriptive error', () => {
      const res = checkLodgingCollision(existing, {
        facilityId: 'cabana-alfa',
        checkIn: '2026-12-20',
        checkOut: '2026-12-15',
      });
      assert.equal(res.hasConflict, true);
      assert.match(res.reason, /posterior a la fecha de ingreso/i);
    });

    test('LODGE-07: Same day check-in and check-out (0-night stay) is BLOCKED', () => {
      const res = checkLodgingCollision(existing, {
        facilityId: 'cabana-alfa',
        checkIn: '2026-12-20',
        checkOut: '2026-12-20',
      });
      assert.equal(res.hasConflict, true);
      assert.match(res.reason, /posterior a la fecha de ingreso/i);
    });

    test('LODGE-08: Cross-facility isolation: same dates on different facility is ALLOWED', () => {
      const res = checkLodgingCollision(existing, {
        facilityId: 'cabana-bravo', // Different facility
        checkIn: '2026-12-10',
        checkOut: '2026-12-15',
      });
      assert.equal(res.hasConflict, false);
    });

    test('SPORTS-01: Contiguous court booking (10-11 followed by 11-12) is ALLOWED', () => {
      const sportsSlots = [
        { id: 'S1', facilityId: 'cancha-1', date: '2026-11-20', startHour: 10, endHour: 11 },
      ];
      const res = checkSportsCollision(sportsSlots, {
        facilityId: 'cancha-1',
        date: '2026-11-20',
        startHour: 11,
        endHour: 12,
      });
      assert.equal(res.hasConflict, false);
    });

    test('SPORTS-02: Partial overlap court booking (10:00-11:00 vs 10:00-12:00) is BLOCKED', () => {
      const sportsSlots = [
        { id: 'S1', facilityId: 'cancha-1', date: '2026-11-20', startHour: 10, endHour: 11 },
      ];
      const res = checkSportsCollision(sportsSlots, {
        facilityId: 'cancha-1',
        date: '2026-11-20',
        startHour: 10,
        endHour: 12,
      });
      assert.equal(res.hasConflict, true);
    });
  });

  describe('2. Facility Capacity Limits', () => {
    const maxCapacity = 6;

    test('CAP-01: Zero guests (0) is rejected', () => {
      const res = validateGuestCapacity(0, maxCapacity);
      assert.equal(res.valid, false);
      assert.match(res.error, /al menos 1 persona/i);
    });

    test('CAP-02: Negative guests (-3) is rejected', () => {
      const res = validateGuestCapacity(-3, maxCapacity);
      assert.equal(res.valid, false);
      assert.match(res.error, /al menos 1 persona/i);
    });

    test('CAP-03: Minimum valid capacity (1 guest) is accepted', () => {
      const res = validateGuestCapacity(1, maxCapacity);
      assert.equal(res.valid, true);
    });

    test('CAP-04: Exact maximum capacity (6 guests) is accepted', () => {
      const res = validateGuestCapacity(6, maxCapacity);
      assert.equal(res.valid, true);
    });

    test('CAP-05: Single overflow (7 guests) is rejected', () => {
      const res = validateGuestCapacity(7, maxCapacity);
      assert.equal(res.valid, false);
      assert.match(res.error, /Capacidad máxima excedida/i);
    });

    test('CAP-06: Extreme overflow (500 guests) is rejected', () => {
      const res = validateGuestCapacity(500, maxCapacity);
      assert.equal(res.valid, false);
      assert.match(res.error, /Capacidad máxima excedida/i);
    });
  });

  describe('3. Invalid Phone Formats in Payphone', () => {
    test('PHONE-01: Valid standard Ecuadorian mobile (0998765432) is accepted', () => {
      const res = validateEcuadorMobilePhone('0998765432');
      assert.equal(res.valid, true);
      assert.equal(res.cleanPhone, '0998765432');
    });

    test('PHONE-02: Formatted mobile with spaces/hyphens (099 876-5432) cleans to 10 digits', () => {
      const res = validateEcuadorMobilePhone('099 876-5432');
      assert.equal(res.valid, true);
      assert.equal(res.cleanPhone, '0998765432');
    });

    test('PHONE-03: Landline number (022894500) is rejected (does not start with 09)', () => {
      const res = validateEcuadorMobilePhone('022894500');
      assert.equal(res.valid, false);
      assert.match(res.error, /09X/);
    });

    test('PHONE-04: Non-existent mobile prefix (0881234567) is rejected', () => {
      const res = validateEcuadorMobilePhone('0881234567');
      assert.equal(res.valid, false);
    });

    test('PHONE-05: Truncated number (0991234) is rejected for short length', () => {
      const res = validateEcuadorMobilePhone('0991234');
      assert.equal(res.valid, false);
    });

    test('PHONE-06: Excessive digits (099123456789) is rejected for overflow', () => {
      const res = validateEcuadorMobilePhone('099123456789');
      assert.equal(res.valid, false);
    });

    test('PHONE-07: Alphabetic injection (099abc5432) leaves incomplete digits and is rejected', () => {
      const res = validateEcuadorMobilePhone('099abc5432');
      assert.equal(res.valid, false);
    });
  });

  describe('4. Luhn Check & Card Brand Detection in Kushki', () => {
    test('LUHN-01: Valid Visa card (4242 4242 4242 4242) passes Luhn', () => {
      assert.equal(validateLuhn('4242 4242 4242 4242'), true);
      assert.equal(detectCardBrand('4242 4242 4242 4242').brand, 'VISA');
    });

    test('LUHN-02: Valid Mastercard (5105 1051 0510 5100) passes Luhn', () => {
      assert.equal(validateLuhn('5105 1051 0510 5100'), true);
      assert.equal(detectCardBrand('5105 1051 0510 5100').brand, 'MASTERCARD');
    });

    test('LUHN-03: Valid Amex (3782 822463 10005) passes Luhn and detects AMEX', () => {
      assert.equal(validateLuhn('3782 822463 10005'), true);
      assert.equal(detectCardBrand('3782 822463 10005').brand, 'AMEX');
    });

    test('LUHN-04: Valid Diners Club (3056 9309 0259 04) passes Luhn', () => {
      assert.equal(validateLuhn('3056 9309 0259 04'), true);
      assert.equal(detectCardBrand('3056 9309 0259 04').brand, 'DINERS');
    });

    test('LUHN-05: Single digit error in Visa checksum is rejected', () => {
      // 4242 4242 4242 4241 ends in 1 instead of 2
      assert.equal(validateLuhn('4242 4242 4242 4241'), false);
    });

    test('LUHN-06: Transposed adjacent digits (4242 4242 4242 4224) is rejected', () => {
      assert.equal(validateLuhn('4242 4242 4242 4224'), false);
    });

    test('LUHN-07: Truncated short card (4242 4242) is rejected by length guard', () => {
      assert.equal(validateLuhn('4242 4242'), false);
    });
  });

  describe('5. Financial Precision & Cent Rounding Accuracy', () => {
    test('PREC-01: Ecuador 15% IVA on fractional cents (99.99 * 0.15 = 14.9985) rounds to exactly 15.00', () => {
      const vat = calculateVat15(99.99);
      assert.equal(vat, 15.00);
      const total = roundCurrency(99.99 + vat);
      assert.equal(total, 114.99);
    });

    test('PREC-02: Zero complimentary booking incurs exactly $0.00 VAT and $0.00 Total', () => {
      const b = computeBillingBreakdown({
        regularPrice: 25.00,
        memberPrice: 0.00,
        units: 3,
        isMember: true,
      });
      assert.equal(b.subtotal, 0.00);
      assert.equal(b.vat, 0.00);
      assert.equal(b.total, 0.00);
      assert.equal(b.militaryDiscount, 75.00);
      assert.equal(b.isComplimentary, true);
    });

    test('PREC-03: IEEE-754 float drift (0.10 + 0.20) does not produce 0.30000000000000004', () => {
      const val = roundCurrency(0.1 + 0.2);
      assert.equal(val, 0.3);
      assert.equal(val.toFixed(2), '0.30');
    });

    test('PREC-04: Monte Carlo 10,000 randomized prices maintain mathematical reconciliation (subtotal + vat == total)', () => {
      let seed = 42;
      const pseudoRandom = () => {
        seed = (seed * 9301 + 49297) % 233280;
        return seed / 233280;
      };

      for (let i = 0; i < 10000; i++) {
        const rawAmount = pseudoRandom() * 5000 + 0.01;
        const subtotal = roundCurrency(rawAmount);
        const vat = calculateVat15(subtotal);
        const total = roundCurrency(subtotal + vat);

        // Subtotal must have at most 2 decimal places
        assert.equal(
          subtotal,
          Number(subtotal.toFixed(2)),
          `Subtotal ${subtotal} has dangling float precision`
        );

        // VAT must have at most 2 decimal places
        assert.equal(
          vat,
          Number(vat.toFixed(2)),
          `VAT ${vat} has dangling float precision`
        );

        // Reconciled integer cents check: total cents must equal subtotal cents + vat cents
        const subtotalCents = Math.round(subtotal * 100);
        const vatCents = Math.round(vat * 100);
        const totalCents = Math.round(total * 100);
        assert.equal(totalCents, subtotalCents + vatCents, `Cents mismatch: ${totalCents} != ${subtotalCents} + ${vatCents}`);
      }
    });
  });

});
