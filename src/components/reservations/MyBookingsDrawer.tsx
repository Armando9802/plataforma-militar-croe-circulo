import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { useReservation } from '../../context/ReservationContext';
import { Reservation } from '../../types/reservation';
import {
  X,
  CalendarCheck,
  CreditCard,
  Ban,
  Clock,
  Users,
  Home,
  Trophy,
} from 'lucide-react';

interface MyBookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToPayment?: (reservation: Reservation) => void;
}

export const MyBookingsDrawer: React.FC<MyBookingsDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToPayment,
}) => {
  const { currentTenant } = useTenant();
  const { reservations, cancelReservation } = useReservation();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="my-bookings-drawer-title"
    >
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          {/* Header */}
          <div
            className="p-6 text-white border-b border-white/10"
            style={{ backgroundColor: currentTenant.theme.primaryColor }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-amber-300" />
                <h2 id="my-bookings-drawer-title" className="font-serif font-bold text-xl text-white">
                  Mis Reservas Activas
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
                aria-label="Cerrar panel de reservas"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-white/80 mt-2">
              <span className="font-medium">{currentTenant.name}</span>
              <span>·</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-full text-[11px] font-bold">
                {reservations.length} registro{reservations.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Body: Ledger List or Empty State */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {reservations.length === 0 ? (
              /* Empty state matching T2-EMP-01 expectations */
              <div className="flex flex-col items-center justify-center h-full text-center py-12 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <CalendarCheck className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-serif font-bold text-slate-800 text-lg">
                    No registra reservas activas
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Actualmente no dispone de cabañas, suites ni canchas deportivas reservadas en {currentTenant.name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
                  style={{ backgroundColor: currentTenant.theme.primaryColor }}
                >
                  Explorar Instalaciones
                </button>
              </div>
            ) : (
              /* List of active reservations */
              <div className="space-y-4">
                {reservations.map((reservation) => {
                  const isCancelled = reservation.status === 'cancelled';
                  const isPaid = reservation.paymentStatus === 'paid';
                  const isLodging = reservation.category === 'lodging';

                  return (
                    <div
                      key={reservation.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCancelled
                          ? 'bg-slate-50 border-slate-200 opacity-60'
                          : 'bg-white border-slate-200 shadow-sm hover:border-slate-300'
                      }`}
                    >
                      {/* Top row: Locator & Status */}
                      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 mb-2.5">
                        <div className="flex items-center gap-1.5">
                          {isLodging ? (
                            <Home className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Trophy className="w-4 h-4 text-emerald-500" />
                          )}
                          <span className="font-mono text-xs font-black text-slate-900">
                            {reservation.id}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isCancelled ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Cancelada
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Confirmada
                            </span>
                          )}

                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isPaid
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {isPaid ? 'Pagada' : 'Pendiente'}
                          </span>
                        </div>
                      </div>

                      {/* Facility details */}
                      <div className="space-y-2 text-xs">
                        <h4 className="font-serif font-bold text-slate-900 text-sm">
                          {reservation.facilityName}
                        </h4>

                        <div className="flex items-center gap-2 text-slate-600">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>
                            {reservation.checkIn} al {reservation.checkOut}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                            <Users className="w-3.5 h-3.5" />
                            <span>{reservation.guests} personas</span>
                          </span>

                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block">Total Liquidado</span>
                            <span className="font-mono text-sm font-bold text-slate-900">
                              ${reservation.total.toFixed(2)} USD
                            </span>
                          </div>
                        </div>

                        {reservation.transactionId && (
                          <div className="text-[10px] text-slate-500 font-mono bg-slate-50 p-1.5 rounded">
                            Tx SRI: {reservation.transactionId}
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      {!isCancelled && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => cancelReservation(reservation.id)}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancelar Reserva</span>
                          </button>

                          {!isPaid && onProceedToPayment && (
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onProceedToPayment(reservation);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-sm"
                              style={{ backgroundColor: currentTenant.theme.primaryColor }}
                            >
                              <CreditCard className="w-3.5 h-3.5 text-amber-300" />
                              <span>Pagar Ahora</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 text-center">
            <p className="text-[11px] text-slate-500">
              Control de acceso vinculado a garita militar mediante código QR o número localizador.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
