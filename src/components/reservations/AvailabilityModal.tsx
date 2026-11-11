import React, { useState, useEffect } from 'react';
import { Facility } from '../../types/reservation';
import { useTenant } from '../../context/TenantContext';
import {
  useReservation,
  DraftBooking,
  validateNotPastDate,
  validateGuestCapacity,
} from '../../context/ReservationContext';
import {
  X,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  MapPin,
  ArrowRight,
} from 'lucide-react';

interface AvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  facility: Facility | null;
}

const DEFAULT_SPORTS_SLOTS = [
  { label: '07:00 - 08:00', startHour: 7, endHour: 8 },
  { label: '08:00 - 09:00', startHour: 8, endHour: 9 },
  { label: '09:00 - 10:00', startHour: 9, endHour: 10 },
  { label: '10:00 - 11:00', startHour: 10, endHour: 11 },
  { label: '11:00 - 12:00', startHour: 11, endHour: 12 },
  { label: '14:00 - 15:00', startHour: 14, endHour: 15 },
  { label: '15:00 - 16:00', startHour: 15, endHour: 16 },
  { label: '16:00 - 17:00', startHour: 16, endHour: 17 },
  { label: '17:00 - 18:00', startHour: 17, endHour: 18 },
  { label: '18:00 - 19:00', startHour: 18, endHour: 19 },
  { label: '19:00 - 20:00', startHour: 19, endHour: 20 },
];

export const AvailabilityModal: React.FC<AvailabilityModalProps> = ({
  isOpen,
  onClose,
  facility,
}) => {
  const { currentTenant } = useTenant();
  const {
    checkLodgingConflict,
    checkSportsConflict,
    calculateBreakdown,
    openSummaryModal,
  } = useReservation();



  // Form states
  const [checkIn, setCheckIn] = useState<string>('2026-11-20');
  const [checkOut, setCheckOut] = useState<string>('2026-11-22');
  const [sportsDate, setSportsDate] = useState<string>('2026-11-20');
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number>(2); // 09:00 - 10:00
  const [guests, setGuests] = useState<number>(2);
  const [notes, setNotes] = useState<string>('');

  // Reset values when facility opens
  useEffect(() => {
    if (facility) {
      setGuests(Math.min(2, facility.capacity));
      // Set sensible forward dates
      setCheckIn('2026-11-20');
      setCheckOut('2026-11-22');
      setSportsDate('2026-11-20');
      setSelectedSlotIndex(2);
    }
  }, [facility]);

  if (!isOpen || !facility) return null;

  const isLodging = facility.category === 'lodging';

  // Validation: Past dates
  const checkInDateValidation = validateNotPastDate(
    isLodging ? checkIn : sportsDate,
    '2026-11-09'
  );

  // Validation: Inverted dates for lodging
  let dateOrderError: string | null = null;
  let nights = 1;
  if (isLodging) {
    const inTime = new Date(`${checkIn}T00:00:00Z`).getTime();
    const outTime = new Date(`${checkOut}T00:00:00Z`).getTime();
    if (outTime <= inTime) {
      dateOrderError = 'La fecha de salida debe ser posterior a la fecha de ingreso';
    } else {
      nights = Math.max(1, Math.round((outTime - inTime) / (1000 * 60 * 60 * 24)));
    }
  }

  // Validation: Capacity limits
  const capacityValidation = validateGuestCapacity(guests, facility.capacity);

  // Validation: Lodging collision
  const lodgingConflict = isLodging && !dateOrderError && checkInDateValidation.valid
    ? checkLodgingConflict(checkIn, checkOut, facility.id)
    : { hasConflict: false };

  // Sports slots availability
  const currentSlot = DEFAULT_SPORTS_SLOTS[selectedSlotIndex] || DEFAULT_SPORTS_SLOTS[0];
  const sportsConflict = !isLodging
    ? checkSportsConflict(sportsDate, currentSlot.startHour, currentSlot.endHour, facility.id)
    : { hasConflict: false };

  // Overall validity
  const isValid =
    checkInDateValidation.valid &&
    !dateOrderError &&
    capacityValidation.valid &&
    (!isLodging ? !sportsConflict.hasConflict : !lodgingConflict.hasConflict);

  // Pricing calculation
  const units = isLodging ? nights : 1;
  const breakdown = calculateBreakdown(facility, units, true);

  const handleProceed = () => {
    if (!isValid) return;

    const draft: DraftBooking = {
      facility,
      category: facility.category,
      checkIn: isLodging ? checkIn : sportsDate,
      checkOut: isLodging ? checkOut : sportsDate,
      date: isLodging ? undefined : sportsDate,
      timeSlot: isLodging ? undefined : currentSlot.label,
      startHour: isLodging ? undefined : currentSlot.startHour,
      endHour: isLodging ? undefined : currentSlot.endHour,
      units,
      guests,
      isMember: true,
      notes,
      subtotal: breakdown.subtotal,
      militaryDiscount: breakdown.militaryDiscount,
      taxableSubtotal: breakdown.taxableSubtotal,
      vat: breakdown.vat,
      total: breakdown.total,
    };

    openSummaryModal(draft);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="availability-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div
          className="relative p-6 text-white rounded-t-3xl overflow-hidden"
          style={{ backgroundColor: currentTenant.theme.primaryColor }}
        >
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Consulta de Disponibilidad & Reserva</span>
          </div>

          <h2 id="availability-modal-title" className="text-2xl font-serif font-bold text-white">
            {facility.name}
          </h2>

          <div className="flex flex-wrap items-center gap-3 text-xs text-white/80 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              {facility.location}
            </span>
            <span>·</span>
            <span>{facility.subcategory}</span>
            <span>·</span>
            <span className="font-bold text-amber-200">
              Tarifa Socio: ${facility.memberPrice} / {facility.unit}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          {/* Mode A: Lodging Date Selection */}
          {isLodging ? (
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-600" />
                <span>Fechas de Hospedaje (Ingreso 14:00 · Salida 12:00)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="checkin-date"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Fecha de Ingreso (Check-In):
                  </label>
                  <input
                    id="checkin-date"
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm font-medium text-slate-800"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-date"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Fecha de Salida (Check-Out):
                  </label>
                  <input
                    id="checkout-date"
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="text-slate-500 self-center text-[11px]">Sugerencias:</span>
                <button
                  type="button"
                  onClick={() => {
                    setCheckIn('2026-11-20');
                    setCheckOut('2026-11-22');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Fin de semana (20 - 22 Nov)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCheckIn('2026-11-27');
                    setCheckOut('2026-11-29');
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Próximo Fin de Semana (27 - 29 Nov)
                </button>
              </div>

              {/* Validation Status Indicator */}
              {dateOrderError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{dateOrderError}</span>
                </div>
              )}

              {!checkInDateValidation.valid && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{checkInDateValidation.error}</span>
                </div>
              )}

              {lodgingConflict.hasConflict && (
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Conflicto de fechas detectado:</p>
                    <p className="text-amber-800 mt-0.5">
                      {lodgingConflict.reason || 'Esta cabaña o habitación ya se encuentra reservada en las fechas seleccionadas.'}
                    </p>
                  </div>
                </div>
              )}

              {!dateOrderError && checkInDateValidation.valid && !lodgingConflict.hasConflict && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">
                      ¡Instalación disponible para las fechas seleccionadas!
                    </span>
                  </div>
                  <span className="font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900 text-[11px]">
                    {nights} noche{nights > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Mode B: Sports Court Date & Time Slots */
            <div className="space-y-4">
              <h3 className="font-serif font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Fecha y Horario de Uso Deportivo</span>
              </h3>

              <div>
                <label
                  htmlFor="sports-date"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Fecha del Turno:
                </label>
                <input
                  id="sports-date"
                  type="date"
                  value={sportsDate}
                  onChange={(e) => setSportsDate(e.target.value)}
                  className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-primary focus:border-primary text-sm font-medium text-slate-800"
                />
              </div>

              {/* Time Slots Grid */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Seleccione Turno Horario:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                  {DEFAULT_SPORTS_SLOTS.map((slot, idx) => {
                    const isBooked = checkSportsConflict(
                      sportsDate,
                      slot.startHour,
                      slot.endHour,
                      facility.id
                    ).hasConflict;
                    const isSelected = selectedSlotIndex === idx && !isBooked;

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={isBooked}
                        onClick={() => setSelectedSlotIndex(idx)}
                        className={`p-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                          isBooked
                            ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed line-through'
                            : isSelected
                            ? 'bg-primary text-white shadow-md ring-2 ring-offset-1 ring-amber-400'
                            : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                        style={
                          isSelected ? { backgroundColor: currentTenant.theme.primaryColor } : {}
                        }
                      >
                        <div className="font-mono text-[11px]">{slot.label}</div>
                        <div className="text-[10px] mt-0.5 opacity-80">
                          {isBooked ? 'Ocupado' : isSelected ? 'Seleccionado' : 'Disponible'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {sportsConflict.hasConflict && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{sportsConflict.reason}</span>
                </div>
              )}
            </div>
          )}

          {/* Guest Count Selector */}
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <label
                  htmlFor="guests-stepper"
                  className="block text-xs font-bold text-slate-800"
                >
                  Número de Personas / Cargas Familiares:
                </label>
                <span className="text-[11px] text-slate-500">
                  Capacidad reglamentaria: hasta {facility.capacity} personas
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-100"
                  aria-label="Disminuir personas"
                >
                  -
                </button>
                <span id="guests-stepper" className="font-mono font-bold text-base text-slate-800 w-6 text-center">
                  {guests}
                </span>
                <button
                  type="button"
                  onClick={() => setGuests((g) => g + 1)}
                  className="w-8 h-8 rounded-lg border border-slate-300 flex items-center justify-center text-slate-600 font-bold hover:bg-slate-100"
                  aria-label="Aumentar personas"
                >
                  +
                </button>
              </div>
            </div>

            {!capacityValidation.valid && (
              <p className="text-xs text-rose-600 font-medium">
                {capacityValidation.error}
              </p>
            )}
          </div>

          {/* Notes and Special Requests Input */}
          <div className="space-y-1.5">
            <label
              htmlFor="booking-notes"
              className="block text-xs font-bold text-slate-700"
            >
              Observaciones o requerimientos especiales (opcional):
            </label>
            <input
              id="booking-notes"
              type="text"
              placeholder="Ej. Cama cuna para infante, raquetas adicionales, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Pricing Estimation Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-500">
              <span>Tarifa regular invitados ({units} {isLodging ? 'noche(s)' : 'hora(s)'}):</span>
              <span className="line-through">${(facility.guestPrice * units).toFixed(2)} USD</span>
            </div>

            {breakdown.militaryDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-700 font-semibold">
                <span>Subsidio / Descuento Militar Institucional:</span>
                <span>-${breakdown.militaryDiscount.toFixed(2)} USD</span>
              </div>
            )}

            <div className="flex items-center justify-between text-slate-700">
              <span>Subtotal tarifa socio militar:</span>
              <span className="font-mono font-bold">${breakdown.subtotal.toFixed(2)} USD</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span>Tarifa IVA 15% SRI Ecuador:</span>
              <span className="font-mono">${breakdown.vat.toFixed(2)} USD</span>
            </div>

            <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-sm font-bold text-slate-900">
              <span>Total Estimado a Pagar:</span>
              <span className="font-mono text-base text-emerald-600 font-extrabold">
                ${breakdown.total.toFixed(2)} USD
              </span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 pt-3 border-t border-slate-100 bg-slate-50/50 rounded-b-3xl flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={!isValid}
            onClick={handleProceed}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
            style={{ backgroundColor: currentTenant.theme.primaryColor }}
          >
            <span>Continuar al Resumen</span>
            <ArrowRight className="w-4 h-4 text-amber-300" />
          </button>
        </div>
      </div>
    </div>
  );
};
