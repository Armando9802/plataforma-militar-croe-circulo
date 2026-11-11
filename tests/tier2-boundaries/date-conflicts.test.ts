import { describe, it, expect } from 'vitest';
import {
  checkLodgingCollision,
  checkSportsCollision,
  validateNotPastDate,
  BookingInterval,
  SportsSlotInterval,
} from '../helpers/bookingEngine';

describe('Tier 2: Boundary Domain 2.2 — Conflicting Dates & Overlapping Reservations', () => {

  const existingBookings: BookingInterval[] = [
    {
      id: 'RSV-001',
      facilityId: 'cabana-san-jorge',
      checkIn: '2026-11-20',
      checkOut: '2026-11-22',
    },
  ];

  it('T2-OVR-01: Exact Same Date Conflict Prevention — detects identical date booking request', () => {
    const attempt: BookingInterval = {
      facilityId: 'cabana-san-jorge',
      checkIn: '2026-11-20',
      checkOut: '2026-11-22',
    };

    const result = checkLodgingCollision(existingBookings, attempt);
    expect(result.hasConflict).toBe(true);
    expect(result.reason).toMatch(/Conflicto de fechas/i);
  });

  it('T2-OVR-02: Partial Overlap Detection — detects check-in overlapping active reservation stay', () => {
    const attempt: BookingInterval = {
      facilityId: 'cabana-san-jorge',
      checkIn: '2026-11-21',
      checkOut: '2026-11-24',
    };

    const result = checkLodgingCollision(existingBookings, attempt);
    expect(result.hasConflict).toBe(true);
    expect(result.conflictingBooking?.id).toBe('RSV-001');
  });

  it('T2-OVR-03: Sports Court Time-Slot Collision — prevents double booking for the same hour', () => {
    const existingSlots: SportsSlotInterval[] = [
      {
        id: 'SLOT-001',
        facilityId: 'cancha-tenis-1',
        date: '2026-11-21',
        startHour: 10,
        endHour: 11,
      },
    ];

    const duplicateSlot: SportsSlotInterval = {
      facilityId: 'cancha-tenis-1',
      date: '2026-11-21',
      startHour: 10,
      endHour: 11,
    };

    const result = checkSportsCollision(existingSlots, duplicateSlot);
    expect(result.hasConflict).toBe(true);
    expect(result.reason).toMatch(/Horario ya reservado/i);
  });

  it('T2-OVR-04: Contiguous Check-in / Check-out Permitted — allows checkout day to be new checkin day', () => {
    // Existing: Nov 20 - Nov 22 (checkout at 12:00)
    // New: Nov 22 - Nov 24 (checkin at 14:00)
    const contiguousAttempt: BookingInterval = {
      facilityId: 'cabana-san-jorge',
      checkIn: '2026-11-22',
      checkOut: '2026-11-24',
    };

    const result = checkLodgingCollision(existingBookings, contiguousAttempt);
    expect(result.hasConflict).toBe(false);
  });

  it('T2-OVR-05: Past Date Selection Rejection — rejects bookings with dates in the past', () => {
    const today = '2026-11-09';
    const yesterday = '2026-11-08';

    const result = validateNotPastDate(yesterday, today);
    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/La fecha no puede ser anterior al día de hoy/i);

    const futureResult = validateNotPastDate('2026-11-15', today);
    expect(futureResult.valid).toBe(true);
  });
});
