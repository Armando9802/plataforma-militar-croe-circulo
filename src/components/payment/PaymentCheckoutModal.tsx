import React from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { usePayment } from '../../context/PaymentContext';
import { PayphoneForm } from './PayphoneForm';
import { KushkiForm } from './KushkiForm';
import { ProcessingSpinner } from './ProcessingSpinner';
import { CroeShieldSvg } from '../badges/CroeShieldSvg';
import { CirculoSealSvg } from '../badges/CirculoSealSvg';

export const PaymentCheckoutModal: React.FC = () => {
  const { currentTenant, isCroe } = useTenant();
  const {
    isCheckoutModalOpen,
    closeCheckoutModal,
    paymentState,
    selectedGateway,
    setSelectedGateway,
    currentInitiation,
    processPayment,
    processingStep,
    calculateBreakdown,
  } = usePayment();

  if (!isCheckoutModalOpen) return null;

  const rawAmount = currentInitiation?.amount ?? currentTenant.defaultSocio.montoCuotaMensual;
  const breakdown = calculateBreakdown(rawAmount);
  const description =
    currentInitiation?.description ||
    `Aportación Mensual Oficial (${currentTenant.name})`;

  const isProcessing = paymentState === 'PROCESSING';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="payment-modal-title"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-6 animate-scaleUp">
        {/* Header Bar */}
        <div
          className="p-5 text-white flex items-center justify-between"
          style={{ backgroundColor: currentTenant.theme.primaryColor }}
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0">
              {isCroe ? <CroeShieldSvg size={42} /> : <CirculoSealSvg size={42} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Pasarela Bancaria Integrada
                </span>
                <span className="text-xs text-white/80 font-mono">
                  RUC: {currentTenant.ruc}
                </span>
              </div>
              <h3 id="payment-modal-title" className="text-lg font-serif font-bold text-white">
                Pasarela de Pagos & Facturación Electrónica SRI
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={closeCheckoutModal}
            disabled={isProcessing}
            className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            aria-label="Cerrar Pasarela"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {isProcessing ? (
          <ProcessingSpinner stepText={processingStep} gateway={selectedGateway} />
        ) : (
          <div className="p-6 space-y-6">
            {/* Gateway Selector Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Tab 1: Payphone Ecuador */}
              <button
                type="button"
                onClick={() => setSelectedGateway('PAYPHONE')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedGateway === 'PAYPHONE'
                    ? 'border-[#F37021] bg-orange-50/60 shadow-md ring-2 ring-[#F37021]/20'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#F37021] text-white flex items-center justify-center font-black text-sm">
                      PP
                    </div>
                    <span className="font-bold text-slate-900 text-sm">
                      Payphone Ecuador
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-200 text-orange-900">
                    App Móvil & Tarjeta
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Cobro inmediato a número de celular ecuatoriano (09X XXX XXXX), código QR o tarjeta directa.
                </p>
              </button>

              {/* Tab 2: Kushki Pagos */}
              <button
                type="button"
                onClick={() => setSelectedGateway('KUSHKI')}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  selectedGateway === 'KUSHKI'
                    ? 'border-[#002B49] bg-slate-900 text-white shadow-md ring-2 ring-[#002B49]/30'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#002B49] text-[#FF2B6D] border border-[#FF2B6D] flex items-center justify-center font-black text-sm">
                      K
                    </div>
                    <span
                      className={`font-bold text-sm ${
                        selectedGateway === 'KUSHKI' ? 'text-white' : 'text-slate-900'
                      }`}
                    >
                      Kushki Pagos
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedGateway === 'KUSHKI'
                        ? 'bg-[#FF2B6D] text-white'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    Tokenización 3DS
                  </span>
                </div>
                <p
                  className={`text-xs ${
                    selectedGateway === 'KUSHKI' ? 'text-slate-300' : 'text-slate-600'
                  }`}
                >
                  Tarjetas de crédito/débito nacionales con diferidos de 3 a 6 meses y verificación 3DS.
                </p>
              </button>
            </div>

            {/* Grid Layout: Left Column (Form) vs Right Column (Order Summary) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Active Gateway Form */}
              <div className="md:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                {selectedGateway === 'PAYPHONE' ? (
                  <PayphoneForm
                    amount={breakdown.total}
                    description={description}
                    onSubmit={(details) => processPayment(details)}
                    isLoading={isProcessing}
                  />
                ) : (
                  <KushkiForm
                    amount={breakdown.total}
                    description={description}
                    onSubmit={(details) => processPayment(details)}
                    isLoading={isProcessing}
                  />
                )}
              </div>

              {/* Right Column: Order Summary & Legal Info */}
              <div className="md:col-span-5 space-y-4">
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-2">
                    Resumen de Consumo / Reserva:
                  </h4>

                  <div className="space-y-1 text-xs">
                    <span className="text-slate-500 block">Servicio o Concepto:</span>
                    <p className="font-semibold text-slate-900 leading-snug">{description}</p>
                    {currentInitiation?.reservationId && (
                      <span className="inline-block font-mono text-[11px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded mt-1">
                        Localizador: {currentInitiation.reservationId}
                      </span>
                    )}
                  </div>

                  {/* Calculations */}
                  <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal 0% (Institucional):</span>
                      <span className="font-mono text-slate-900">$0.00 USD</span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal 15% (Gravado):</span>
                      <span className="font-mono text-slate-900">
                        ${breakdown.subtotal.toFixed(2)} USD
                      </span>
                    </div>

                    <div className="flex justify-between text-slate-600">
                      <span>Tarifa IVA 15% (Ecuador):</span>
                      <span className="font-mono text-slate-900">
                        ${breakdown.vat.toFixed(2)} USD
                      </span>
                    </div>

                    <div className="pt-2 border-t border-slate-300 flex justify-between items-center text-sm font-bold text-slate-900">
                      <span>Total a Pagar:</span>
                      <span className="font-mono text-emerald-600 text-lg font-black">
                        ${breakdown.total.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                </div>

                {/* Institution RUC & SRI Guarantee Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-950">
                    <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>Emisión de Factura Electrónica SRI</span>
                  </div>
                  <p className="text-amber-900/80">
                    La transacción generará automáticamente un comprobante digital con clave de acceso de 49 dígitos bajo el RUC institucional{' '}
                    <strong className="font-mono font-bold text-amber-950">{currentTenant.ruc}</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
