import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Facility, FacilityCategory, Reservation } from '../types/reservation';
import { useTenant } from './TenantContext';
import { INITIAL_RESERVATIONS } from '../data/mockTransactions';

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

export interface FinancialBreakdown {
  subtotal: number;
  militaryDiscount: number;
  taxableSubtotal: number;
  vat: number;
  total: number;
  isComplimentary: boolean;
}

export interface DraftBooking {
  facility: Facility;
  category: FacilityCategory;
  checkIn: string;
  checkOut: string;
  date?: string;
  timeSlot?: string;
  startHour?: number;
  endHour?: number;
  units: number;
  guests: number;
  isMember: boolean;
  notes?: string;
  subtotal: number;
  militaryDiscount: number;
  taxableSubtotal: number;
  vat: number;
  total: number;
}

export const ECUADOR_IVA_RATE = 0.15;

export function roundCurrency(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

export function calculateVat15(taxableBase: number): number {
  if (taxableBase <= 0) return 0;
  return roundCurrency(taxableBase * ECUADOR_IVA_RATE);
}

export function computeBillingBreakdown(params: {
  regularPrice: number;
  memberPrice: number;
  units: number;
  isMember: boolean;
  isTaxExempt?: boolean;
}): FinancialBreakdown {
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

interface ReservationContextType {
  facilities: Facility[];
  reservations: Reservation[];
  allTenantReservations: Record<string, Reservation[]>;
  selectedFacility: Facility | null;
  draftBooking: DraftBooking | null;
  isAvailabilityModalOpen: boolean;
  isSummaryModalOpen: boolean;
  isMyBookingsOpen: boolean;
  lastConfirmedBooking: Reservation | null;
  openAvailabilityModal: (facility: Facility) => void;
  closeAvailabilityModal: () => void;
  openSummaryModal: (draft: DraftBooking) => void;
  closeSummaryModal: () => void;
  openMyBookings: () => void;
  closeMyBookings: () => void;
  checkLodgingConflict: (checkIn: string, checkOut: string, facilityId: string, excludeId?: string) => { hasConflict: boolean; reason?: string };
  checkSportsConflict: (date: string, startHour: number, endHour: number, facilityId: string, excludeId?: string) => { hasConflict: boolean; reason?: string };
  calculateBreakdown: (facility: Facility, units: number, isMember?: boolean) => FinancialBreakdown;
  confirmBooking: (draft: DraftBooking) => Reservation;
  cancelReservation: (reservationId: string) => void;
  getFacilityById: (facilityId: string) => Facility | undefined;
}

const ReservationContext = createContext<ReservationContextType | undefined>(undefined);

const STORAGE_KEYS = {
  croe: 'croe_reservations',
  'circulo-militar': 'circulo_reservations',
};

export const ReservationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentTenant } = useTenant();

  // Load or seed initial reservations from localStorage per tenant
  const [tenantLedgers, setTenantLedgers] = useState<Record<string, Reservation[]>>(() => {
    const initialLedgers: Record<string, Reservation[]> = {
      croe: [],
      'circulo-militar': [],
    };

    try {
      const croeRaw = localStorage.getItem(STORAGE_KEYS.croe);
      if (croeRaw) {
        initialLedgers.croe = JSON.parse(croeRaw);
      } else {
        const croeSeeds = INITIAL_RESERVATIONS.filter((r) => r.tenantId === 'croe');
        initialLedgers.croe = croeSeeds;
        localStorage.setItem(STORAGE_KEYS.croe, JSON.stringify(croeSeeds));
      }

      const circuloRaw = localStorage.getItem(STORAGE_KEYS['circulo-militar']);
      if (circuloRaw) {
        initialLedgers['circulo-militar'] = JSON.parse(circuloRaw);
      } else {
        const circuloSeeds = INITIAL_RESERVATIONS.filter((r) => r.tenantId === 'circulo-militar');
        initialLedgers['circulo-militar'] = circuloSeeds;
        localStorage.setItem(STORAGE_KEYS['circulo-militar'], JSON.stringify(circuloSeeds));
      }
    } catch (e) {
      console.warn('Error accessing localStorage for reservations, using seeds', e);
      initialLedgers.croe = INITIAL_RESERVATIONS.filter((r) => r.tenantId === 'croe');
      initialLedgers['circulo-militar'] = INITIAL_RESERVATIONS.filter((r) => r.tenantId === 'circulo-militar');
    }

    return initialLedgers;
  });

  // Modal and draft states
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [draftBooking, setDraftBooking] = useState<DraftBooking | null>(null);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [lastConfirmedBooking, setLastConfirmedBooking] = useState<Reservation | null>(null);

  // Active tenant facilities and reservations
  const facilities = currentTenant.facilities;
  const activeTenantKey = currentTenant.id;
  const reservations = tenantLedgers[activeTenantKey] || [];

  const saveTenantReservations = useCallback((tenantId: 'croe' | 'circulo-militar', updated: Reservation[]) => {
    setTenantLedgers((prev) => {
      const next = { ...prev, [tenantId]: updated };
      try {
        localStorage.setItem(STORAGE_KEYS[tenantId], JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save to localStorage:', err);
      }
      return next;
    });
  }, []);

  const openAvailabilityModal = useCallback((facility: Facility) => {
    setSelectedFacility(facility);
    setIsAvailabilityModalOpen(true);
  }, []);

  const closeAvailabilityModal = useCallback(() => {
    setIsAvailabilityModalOpen(false);
  }, []);

  const openSummaryModal = useCallback((draft: DraftBooking) => {
    setDraftBooking(draft);
    setIsAvailabilityModalOpen(false);
    setIsSummaryModalOpen(true);
  }, []);

  const closeSummaryModal = useCallback(() => {
    setIsSummaryModalOpen(false);
  }, []);

  const openMyBookings = useCallback(() => {
    setIsMyBookingsOpen(true);
  }, []);

  const closeMyBookings = useCallback(() => {
    setIsMyBookingsOpen(false);
  }, []);

  const getFacilityById = useCallback((facilityId: string): Facility | undefined => {
    return facilities.find((f) => f.id === facilityId);
  }, [facilities]);

  const checkLodgingConflict = useCallback((
    checkIn: string,
    checkOut: string,
    facilityId: string,
    excludeId?: string
  ) => {
    const existing = reservations
      .filter((r) => r.facilityId === facilityId && r.status !== 'cancelled')
      .map((r) => ({
        id: r.id,
        facilityId: r.facilityId,
        checkIn: r.checkIn,
        checkOut: r.checkOut,
      }));

    return checkLodgingCollision(existing, {
      id: excludeId,
      facilityId,
      checkIn,
      checkOut,
    });
  }, [reservations]);

  const checkSportsConflict = useCallback((
    date: string,
    startHour: number,
    endHour: number,
    facilityId: string,
    excludeId?: string
  ) => {
    const existingSlots: SportsSlotInterval[] = [];

    reservations
      .filter((r) => r.facilityId === facilityId && r.status !== 'cancelled')
      .forEach((r) => {
        // Parse stored slots if present or infer from checkIn / checkOut
        const rDate = r.checkIn.includes('T') ? r.checkIn.split('T')[0] : r.checkIn;
        const bStart = (r as any).startHour;
        const bEnd = (r as any).endHour;

        if (bStart !== undefined && bEnd !== undefined) {
          existingSlots.push({
            id: r.id,
            facilityId: r.facilityId,
            date: rDate,
            startHour: bStart,
            endHour: bEnd,
          });
        }
      });

    return checkSportsCollision(existingSlots, {
      id: excludeId,
      facilityId,
      date,
      startHour,
      endHour,
    });
  }, [reservations]);

  const calculateBreakdown = useCallback((
    facility: Facility,
    units: number,
    isMember = true
  ): FinancialBreakdown => {
    return computeBillingBreakdown({
      regularPrice: facility.guestPrice,
      memberPrice: facility.memberPrice,
      units,
      isMember,
    });
  }, []);

  const confirmBooking = useCallback((draft: DraftBooking): Reservation => {
    const tenantPrefix = currentTenant.id === 'croe' ? 'CROE' : 'CIR';
    const randomHex = Math.floor(1000 + Math.random() * 9000);
    const locatorId = `RSV-${tenantPrefix}-${randomHex}`;

    const newReservation: Reservation = {
      id: locatorId,
      tenantId: currentTenant.id,
      facilityId: draft.facility.id,
      facilityName: draft.facility.name,
      category: draft.category,
      checkIn: draft.checkIn,
      checkOut: draft.checkOut,
      guests: draft.guests,
      socioId: currentTenant.defaultSocio.id,
      socioName: `${currentTenant.defaultSocio.grado} ${currentTenant.defaultSocio.nombres} ${currentTenant.defaultSocio.apellidos}`,
      subtotal: draft.subtotal,
      discount: draft.militaryDiscount,
      vat: draft.vat,
      total: draft.total,
      status: 'confirmed',
      paymentStatus: 'pending',
      createdAt: new Date().toISOString(),
    };

    // Store sports slot metadata if applicable
    if (draft.startHour !== undefined && draft.endHour !== undefined) {
      (newReservation as any).startHour = draft.startHour;
      (newReservation as any).endHour = draft.endHour;
      (newReservation as any).timeSlot = draft.timeSlot;
    }

    const updated = [newReservation, ...reservations];
    saveTenantReservations(currentTenant.id, updated);
    setLastConfirmedBooking(newReservation);

    return newReservation;
  }, [currentTenant, reservations, saveTenantReservations]);

  const cancelReservation = useCallback((reservationId: string) => {
    const updated = reservations.map((r) =>
      r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
    );
    saveTenantReservations(currentTenant.id, updated);
  }, [currentTenant.id, reservations, saveTenantReservations]);

  return (
    <ReservationContext.Provider
      value={{
        facilities,
        reservations,
        allTenantReservations: tenantLedgers,
        selectedFacility,
        draftBooking,
        isAvailabilityModalOpen,
        isSummaryModalOpen,
        isMyBookingsOpen,
        lastConfirmedBooking,
        openAvailabilityModal,
        closeAvailabilityModal,
        openSummaryModal,
        closeSummaryModal,
        openMyBookings,
        closeMyBookings,
        checkLodgingConflict,
        checkSportsConflict,
        calculateBreakdown,
        confirmBooking,
        cancelReservation,
        getFacilityById,
      }}
    >
      {children}
    </ReservationContext.Provider>
  );
};

export const useReservation = (): ReservationContextType => {
  const context = useContext(ReservationContext);
  if (!context) {
    throw new Error('useReservation must be used within a ReservationProvider');
  }
  return context;
};
