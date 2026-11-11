import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_CONFIG } from '../../src/data/croeData';
import { INITIAL_RESERVATIONS } from '../../src/data/mockTransactions';
import { computeBillingBreakdown } from '../helpers/financialEngine';

describe('Tier 1: Feature 1.4 — Reservation Engine Selection & Booking', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-RES-01: Dual Category Inventory Display — displays facilities covering lodging and sports categories', () => {
    render(<App />);

    const resNavBtn = screen.getByRole('button', { name: /reservas & deportes/i });
    fireEvent.click(resNavBtn);

    const facilities = CROE_CONFIG.facilities;
    const lodging = facilities.filter((f) => f.category === 'lodging');
    const sports = facilities.filter((f) => f.category === 'sports');

    expect(lodging.length).toBeGreaterThan(0);
    expect(sports.length).toBeGreaterThan(0);

    // Facilities names rendered in DOM
    expect(screen.getByText(new RegExp(lodging[0].name, 'i'))).toBeInTheDocument();
    expect(screen.getByText(new RegExp(sports[0].name, 'i'))).toBeInTheDocument();
  });

  it('T1-RES-02: Facility Item Card Information Completeness — displays descriptions, amenities, and military rates', () => {
    render(<App />);

    const resNavBtn = screen.getByRole('button', { name: /reservas & deportes/i });
    fireEvent.click(resNavBtn);

    const firstFac = CROE_CONFIG.facilities[0];

    // Name and subcategory
    expect(screen.getByText(new RegExp(firstFac.name, 'i'))).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(firstFac.subcategory, 'i')).length).toBeGreaterThan(0);

    // Military member price and guest price
    expect(screen.getAllByText(new RegExp(`\\$${firstFac.memberPrice}`, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(`Invitados: \\$${firstFac.guestPrice}`, 'i')).length).toBeGreaterThan(0);

    // Reserve CTA button
    expect(screen.getAllByRole('button', { name: /reservar ahora/i }).length).toBeGreaterThan(0);
  });

  it('T1-RES-03: Date & Duration Calculation — accurately calculates stay duration and base subtotal', () => {
    const facility = CROE_CONFIG.facilities[0]; // Cabaña Familiar Andina, $65/night
    const nights = 3;
    const breakdown = computeBillingBreakdown({
      regularPrice: facility.guestPrice,
      memberPrice: facility.memberPrice,
      units: nights,
      isMember: true,
    });

    expect(breakdown.subtotal).toBe(facility.memberPrice * nights);
    expect(breakdown.vat).toBeCloseTo(facility.memberPrice * nights * 0.15, 2);
    expect(breakdown.total).toBeCloseTo(breakdown.subtotal + breakdown.vat, 2);
  });

  it('T1-RES-04: Dynamic Pricing Calculation with Member Discount — applies military institutional discount', () => {
    const facility = CROE_CONFIG.facilities[0]; // guestPrice: 110, memberPrice: 65
    const nights = 2;

    const breakdownMember = computeBillingBreakdown({
      regularPrice: facility.guestPrice,
      memberPrice: facility.memberPrice,
      units: nights,
      isMember: true,
    });

    const breakdownGuest = computeBillingBreakdown({
      regularPrice: facility.guestPrice,
      memberPrice: facility.memberPrice,
      units: nights,
      isMember: false,
    });

    // Subtotal for military member is lower than guest
    expect(breakdownMember.subtotal).toBeLessThan(breakdownGuest.subtotal);
    expect(breakdownMember.militaryDiscount).toBe((facility.guestPrice - facility.memberPrice) * nights);
  });

  it('T1-RES-05: Booking Confirmation & Local Reservation Ledger — validates persistence structure and status', () => {
    expect(INITIAL_RESERVATIONS.length).toBeGreaterThanOrEqual(2);

    const firstBooking = INITIAL_RESERVATIONS[0];
    expect(firstBooking.id).toMatch(/^RSV-/);
    expect(firstBooking.status).toBe('confirmed');
    expect(firstBooking.paymentStatus).toBe('paid');
    expect(firstBooking.transactionId).toBeTruthy();
    expect(firstBooking.total).toBeCloseTo(firstBooking.subtotal + firstBooking.vat, 2);
  });
});
