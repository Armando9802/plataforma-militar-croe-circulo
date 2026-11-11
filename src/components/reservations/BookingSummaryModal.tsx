import React, { useState } from 'react';
import { useTenant } from '../../context/TenantContext';
import { useReservation, DraftBooking } from '../../context/ReservationContext';
import { Reservation } from '../../types/reservation';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  Users,
  CreditCard,
  FileText,
} from 'lucide-react';

interface BookingSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  draft: DraftBooking | null;
  onProceedToPayment?: (reservation: Reservation) => void;
}

export const BookingSummaryModal: React.FC<BookingSummaryModalProps> = ({
  isOpen,
  onClose,
  draft,
  onProceedToPayment,
}) => {
  const { currentTenant } = useTenant();
  const { confirmBooking, openMyBookings } = useReservation();
  const [confirmedReservation, setConfirmedReservation] = useState<Reservation | null>(null);

  if (!isOpen || !draft) return null;

  const isLodging = draft.category === 'lodging';

  const handleConfirm = () => {
    const res = confirmBooking(draft);
    setConfirmedReservation(res);
  };

  const handleCloseAll = () => {
    setConfirmedReservation(null);
    onClose();
  };

  const handleOpenLedger = () => {
    setConfirmedReservation(null);
    onClose();
    openMyBookings();
  };

  const handleGoToPayment = () => {
    if (confirmedReservation && onProceedToPayment) {
      onProceedToPayment(confirmedReservation);
    }
    handleCloseAll();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="summary-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[92vh] overflow-y-auto border border-slate-200">
        {/* Header */}
        <div
          className="relative p-6 text-white rounded-t-3xl overflow-hidden"
          style={{ backgroundColor: currentTenant.theme.primaryColor }}
        >
          <div className="absolute top-0 right-0 p-4">
            <button
              onClick={handleCloseAll}
              className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2 text-amber-300 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Liquidación Oficial de Reserva Militar</span>
          </div>

          <h2 id="summary-modal-title" className="text-2xl font-serif font-bold text-white">
            {confirmedReservation ? '¡Reserva Confirmada con Éxito!' : 'Resumen & Liquidación de Tarifa'}
          </h2>

          <p className="text-xs text-white/80 mt-1">
            {currentTenant.name} · RUC: {currentTenant.ruc}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {confirmedReservation ? (
            /* Confirmation Success State */
            <div className="space-y-6 py-2">
              <div className="flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-serif font-bold text-slate-900">
                  Reserva Registrada en el Sistema
                </h3>
                <p className="text-xs text-slate-600 max-w-md">
                  Su espacio ha sido bloqueado exitosamente en el catálogo oficial de {currentTenant.name}. Se ha emitido el código localizador militar para el control en garita y recepción.
                </p>
              </div>

              {/* Locator Code Box */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border-2 border-amber-300/80 text-center space-y-1 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Código Localizador Oficial:
                </span>
                <div className="font-mono text-2xl font-black text-slate-900 tracking-wider">
                  {confirmedReservation.id}
                </div>
                <span className="inline-block text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  Estado: Confirmada · Pendiente de Pago
                </span>
              </div>

              {/* Reservation Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Instalación:</span>
                  <span className="font-bold text-slate-900">{confirmedReservation.facilityName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Oficial Titular:</span>
                  <span className="font-medium text-slate-800">{confirmedReservation.socioName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-2">
                  <span className="text-slate-500">Fecha / Periodo:</span>
                  <span className="font-mono font-medium text-slate-800">
                    {confirmedReservation.checkIn} al {confirmedReservation.checkOut}
                  </span>
                </div>
                <div className="flex justify-between pt-1 text-sm font-bold text-slate-900">
                  <span>Monto Total a Liquidar:</span>
                  <span className="font-mono text-emerald-600">
                    ${confirmedReservation.total.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                {onProceedToPayment && (
                  <button
                    type="button"
                    onClick={handleGoToPayment}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
                    style={{ backgroundColor: currentTenant.theme.primaryColor }}
                  >
                    <CreditCard className="w-4 h-4 text-amber-300" />
                    <span>Proceder al Pago Seguro (Payphone / Kushki)</span>
                  </button>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleOpenLedger}
                    className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText className="w-4 h-4 text-slate-500" />
                    <span>Ver en Mis Reservas</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCloseAll}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 text-xs font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                  >
                    Finalizar y Cerrar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Pending Summary Breakdown */
            <div className="space-y-5">
              {/* Facility card snippet */}
              <div className="flex gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <img
                  src={draft.facility.imageUrl}
                  alt={draft.facility.name}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="flex flex-col justify-center text-xs">
                  <span className="text-[10px] font-bold uppercase text-amber-600">
                    {draft.facility.subcategory}
                  </span>
                  <h4 className="font-serif font-bold text-slate-900 text-sm">
                    {draft.facility.name}
                  </h4>
                  <span className="text-slate-500 mt-0.5">{draft.facility.location}</span>
                </div>
              </div>

              {/* Itemized Line Items */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  Detalle del Servicio & Estadía:
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-[11px] text-slate-500 mb-1">
                      {isLodging ? 'Periodo de Hospedaje:' : 'Horario Deportivo:'}
                    </span>
                    <span className="font-medium text-slate-800">
                      {isLodging
                        ? `${draft.checkIn} al ${draft.checkOut} (${draft.units} noche${draft.units > 1 ? 's' : ''})`
                        : `${draft.checkIn} · ${draft.timeSlot || `${draft.units} hora(s)`}`}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="block text-[11px] text-slate-500 mb-1">
                      Ocupación Registrada:
                    </span>
                    <span className="font-medium text-slate-800 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{draft.guests} persona{draft.guests > 1 ? 's' : ''}</span>
                    </span>
                  </div>
                </div>

                {/* Beneficiary officer */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="block text-[11px] text-slate-500 mb-0.5">
                    Oficial Militar Beneficiario:
                  </span>
                  <span className="font-bold text-slate-800">
                    {currentTenant.defaultSocio.grado} {currentTenant.defaultSocio.nombres} {currentTenant.defaultSocio.apellidos}
                  </span>
                  <span className="block text-[10px] text-slate-500 mt-0.5">
                    Cédula: {currentTenant.defaultSocio.cedula} · Código: {currentTenant.defaultSocio.codigoMilitar}
                  </span>
                </div>
              </div>

              {/* Financial Calculation Breakdown Table */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <h4 className="font-bold text-slate-800 mb-2">Liquidación Financiera SRI:</h4>

                <div className="flex justify-between text-slate-500">
                  <span>
                    Tarifa regular para invitados ({draft.units} {isLodging ? 'noche(s)' : 'hora(s)'}):
                  </span>
                  <span className="line-through">
                    ${(draft.facility.guestPrice * draft.units).toFixed(2)} USD
                  </span>
                </div>

                {draft.militaryDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Subsidio / Descuento Militar Aplicado:</span>
                    <span>-${draft.militaryDiscount.toFixed(2)} USD</span>
                  </div>
                )}

                <div className="flex justify-between text-slate-700">
                  <span>Subtotal Tarifa Socio Militar:</span>
                  <span className="font-mono font-bold">${draft.subtotal.toFixed(2)} USD</span>
                </div>

                <div className="flex justify-between text-slate-700">
                  <span>Tarifa IVA 15% SRI Ecuador (Ley Orgánica 2024):</span>
                  <span className="font-mono">${draft.vat.toFixed(2)} USD</span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-base font-bold text-slate-900">
                  <span>Total Liquidado a Pagar:</span>
                  <span className="font-mono text-lg text-emerald-600 font-black">
                    ${draft.total.toFixed(2)} USD
                  </span>
                </div>
              </div>

              {/* Legal Note */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Al confirmar, la reserva quedará registrada con código localizador oficial en el libro mayor de {currentTenant.name}. Podrá abonarla de forma inmediata o previa al check-in en garita.
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseAll}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleConfirm}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95"
                  style={{ backgroundColor: currentTenant.theme.primaryColor }}
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Confirmar Reserva</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
