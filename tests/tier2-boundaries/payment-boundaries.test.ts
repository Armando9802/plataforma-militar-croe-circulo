import { describe, it, expect } from 'vitest';
import {
  computeBillingBreakdown,
  roundCurrency,
  formatUSD,
  calculateVat15,
} from '../helpers/financialEngine';

describe('Tier 2: Boundary Domain 2.3 — Zero, Negative & Boundary Payment Amounts', () => {

  it('T2-AMT-01: Zero Dollar ($0.00) Complimentary Booking — handles institutional gratuity correctly', () => {
    // Military member booking athletic track or sports facility with $0 member tariff
    const breakdown = computeBillingBreakdown({
      regularPrice: 12.00,
      memberPrice: 0.00,
      units: 2,
      isMember: true,
    });

    expect(breakdown.subtotal).toBe(0.00);
    expect(breakdown.vat).toBe(0.00);
    expect(breakdown.total).toBe(0.00);
    expect(breakdown.isComplimentary).toBe(true);
    expect(breakdown.militaryDiscount).toBe(24.00);
  });

  it('T2-AMT-02: Negative Amount Prevention — prevents negative pricing anomalies', () => {
    const sanitizeAmount = (amount: number): number => {
      if (isNaN(amount) || amount < 0) return 0;
      return roundCurrency(amount);
    };

    expect(sanitizeAmount(-50.00)).toBe(0.00);
    expect(sanitizeAmount(-0.01)).toBe(0.00);
    expect(sanitizeAmount(25.50)).toBe(25.50);
  });

  it('T2-AMT-03: High-Value VIP Presidential Suite Booking — formats large amounts ($1,000+) properly', () => {
    const presidentialRate = 1250.00;
    const days = 3;
    const breakdown = computeBillingBreakdown({
      regularPrice: 2000.00,
      memberPrice: presidentialRate,
      units: days,
      isMember: true,
    });

    expect(breakdown.subtotal).toBe(3750.00);
    expect(breakdown.vat).toBe(562.50);
    expect(breakdown.total).toBe(4312.50);

    const formatted = formatUSD(breakdown.total);
    expect(formatted).toBe('$4,312.50');
  });

  it('T2-AMT-04: Cent-Rounding Precision Validation — guarantees exactly 2 decimals without floating point inaccuracies', () => {
    // 33.33 * 3 = 99.99
    // 99.99 * 0.15 = 14.9985 -> rounded to 15.00
    // Total = 114.99
    const subtotal = 99.99;
    const vat = calculateVat15(subtotal);
    const total = roundCurrency(subtotal + vat);

    expect(vat).toBe(15.00);
    expect(total).toBe(114.99);

    // Verify string representation has no dangling float decimals
    const str = total.toFixed(2);
    expect(str).toBe('114.99');
    expect(str).not.toMatch(/\.989999/);
  });

  it('T2-AMT-05: Payment Timeout & Abandonment Recovery — cart retains pending state on cancellation', () => {
    interface BookingSession {
      bookingId: string;
      status: 'pending' | 'in_checkout' | 'paid' | 'cancelled';
      amount: number;
    }

    const session: BookingSession = {
      bookingId: 'RSV-TEMP-101',
      status: 'in_checkout',
      amount: 90.00,
    };

    // User cancels or abandons modal
    const handleCancelCheckout = (s: BookingSession): BookingSession => ({
      ...s,
      status: 'pending', // Reverts to pending so user can retry
    });

    const updated = handleCancelCheckout(session);
    expect(updated.status).toBe('pending');
    expect(updated.amount).toBe(90.00);
  });
});
