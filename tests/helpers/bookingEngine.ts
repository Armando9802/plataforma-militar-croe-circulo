export interface BookingInterval {
  id?: string;
  facilityId: string;
  checkIn: string; // ISO date 'YYYY-MM-DD'
  checkOut: string; // ISO date 'YYYY-MM-DD'
}

export interface SportsSlotInterval {
  id?: string;
  facilityId: string;
  date: string; // 'YYYY-MM-DD'
  startHour: number; // e.g. 10 (10:00)
  endHour: number; // e.g. 11 (11:00)
}

/**
 * Checks if requested lodging dates conflict with existing active reservations.
 * Standard hotel rule: Check-in on checkout day of another reservation is ALLOWED (turnover at 12:00/14:00).
 */
export function checkLodgingCollision(
  existingBookings: BookingInterval[],
  requested: BookingInterval
): { hasConflict: boolean; conflictingBooking?: BookingInterval; reason?: string } {
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

/**
 * Checks if sports time slot collides with existing booking
 */
export function checkSportsCollision(
  existingSlots: SportsSlotInterval[],
  requested: SportsSlotInterval
): { hasConflict: boolean; reason?: string } {
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

/**
 * Validates guest capacity
 */
export function validateGuestCapacity(guests: number, maxCapacity: number): { valid: boolean; error?: string } {
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

/**
 * Validates if date is not in the past
 */
export function validateNotPastDate(dateStr: string, referenceDate?: string): { valid: boolean; error?: string } {
  const target = new Date(`${dateStr}T00:00:00Z`).getTime();
  const ref = referenceDate
    ? new Date(`${referenceDate}T00:00:00Z`).getTime()
    : new Date().setHours(0, 0, 0, 0);

  if (target < ref) {
    return {
      valid: false,
      error: 'La fecha no puede ser anterior al día de hoy',
    };
  }
  return { valid: true };
}
