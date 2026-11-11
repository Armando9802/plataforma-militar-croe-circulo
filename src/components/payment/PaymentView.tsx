import React from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  FileText,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';
import { usePayment } from '../../context/PaymentContext';
import { PaymentTransaction } from '../../types/payment';

export const PaymentView: React.FC = () => {
  const { currentTenant } = useTenant();
  const {
    transactions,
    initiatePayment,
    openReceiptModal,
    selectedGateway,
    setSelectedGateway,
  } = usePayment();

  const duesAmount = currentTenant.defaultSocio.montoCuotaMensual;

  // Latest approved transaction or default mock
  const latestTx: PaymentTransaction | undefined = transactions[0];

  const handlePayDues = () => {
    initiatePayment(
      {
        socioId: currentTenant.defaultSocio.cedula,
        socioName: `${currentTenant.defaultSocio.grado} ${currentTenant.defaultSocio.nombres} ${currentTenant.defaultSocio.apellidos}`,
        amount: duesAmount,
        description: `Aportación y Cuota Mensual Oficial (${currentTenant.name})`,
      },
      selectedGateway
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 animate-fadeIn">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 bg-emerald-100 text-emerald-800">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Pasarela Integrada Payphone & Kushki</span>
          </div>
          <h2 className="text-3xl font-serif font-bold text-slate-900">
            Módulo de Cobro y Facturación Electrónica SRI
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Simulación de transacción segura con desglose de 15% IVA y emisión de comprobante tributario para {currentTenant.name}.
          </p>
        </div>

        <div className="text-left md:text-right bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="block text-xs text-slate-500 font-medium">RUC Emisor Oficial:</span>
          <span className="font-mono text-sm font-bold text-slate-800">{currentTenant.ruc}</span>
          <span className="block text-[11px] text-emerald-700 font-medium">SRI Ambiente de Producción</span>
        </div>
      </div>

      {/* Main Interactive Payment Simulation & Preview Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Gateway Selector & Order Summary */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif font-bold text-slate-900 text-lg">
              Selección de Pasarela de Cobro Local
            </h3>
            <span className="text-xs text-slate-500">
              Seleccione para pagar cuotas o reservas
            </span>
          </div>

          {/* Interactive Gateway Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Payphone Option */}
            <div
              onClick={() => setSelectedGateway('PAYPHONE')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                selectedGateway === 'PAYPHONE'
                  ? 'border-[#F37021] bg-orange-50/70 shadow-md ring-2 ring-[#F37021]/20'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#F37021] text-base">Payphone Ecuador</span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-orange-200 text-orange-900">
                  App Móvil & Tarjeta
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Cobro inmediato con número de celular ecuatoriano (09X XXX XXXX) o escaneo QR.
              </p>
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#F37021]">
                <span>Pagar con App Payphone</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Kushki Option */}
            <div
              onClick={() => setSelectedGateway('KUSHKI')}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer space-y-2 ${
                selectedGateway === 'KUSHKI'
                  ? 'border-[#002B49] bg-slate-900 text-white shadow-md ring-2 ring-[#002B49]/30'
                  : 'border-slate-200 bg-slate-50 hover:border-slate-300 text-slate-900'
              }`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`font-bold text-base ${
                    selectedGateway === 'KUSHKI' ? 'text-white' : 'text-slate-900'
                  }`}
                >
                  Kushki Pagos
                </span>
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
                Procesamiento de tarjetas de crédito/débito nacionales con diferidos de 3 a 6 cuotas.
              </p>
              <div
                className={`pt-2 flex items-center gap-1.5 text-[11px] font-semibold ${
                  selectedGateway === 'KUSHKI' ? 'text-[#FF2B6D]' : 'text-slate-700'
                }`}
              >
                <span>Pagar con Kushki 3DS</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Itemized Order Summary Box */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs">
            <h4 className="font-bold text-slate-800 text-sm">Resumen de Consumo / Reserva:</h4>

            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600">Servicio / Reserva:</span>
              <span className="font-semibold text-slate-800">Aportación y Cuota Mensual Oficial</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600">Subtotal 0% (Institucional):</span>
              <span className="font-mono text-slate-800">${duesAmount.toFixed(2)} USD</span>
            </div>

            <div className="flex justify-between py-1.5 border-b border-slate-200">
              <span className="text-slate-600">Tarifa IVA 15% (Ecuador):</span>
              <span className="font-mono text-slate-800">$0.00 USD</span>
            </div>

            <div className="flex justify-between pt-2 text-base font-bold text-slate-900">
              <span>Total a Pagar:</span>
              <span className="text-emerald-600 font-mono text-lg font-black">
                ${duesAmount.toFixed(2)} USD
              </span>
            </div>

            {/* Launch Checkout Button */}
            <div className="pt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handlePayDues}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-98"
                style={{
                  backgroundColor:
                    selectedGateway === 'PAYPHONE' ? '#F37021' : '#002B49',
                }}
              >
                <CreditCard className="w-4 h-4" />
                <span>
                  Iniciar Cobro con {selectedGateway === 'PAYPHONE' ? 'Payphone' : 'Kushki'} (${duesAmount.toFixed(2)} USD)
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Legal SRI Voucher Card & Preview */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
          <div className="flex items-center gap-2 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
            <span className="font-serif font-bold text-sm tracking-wider uppercase">
              Comprobante SRI
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Los comprobantes generados cumplen con las normas técnicas de facturación electrónica del SRI de la República del Ecuador.
          </p>

          <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-2.5 text-[11px] font-mono shadow-inner">
            <div className="space-y-0.5">
              <p className="text-slate-400 font-semibold uppercase text-[10px]">AUTORIZACIÓN:</p>
              <p className="text-amber-300 font-bold break-all">
                {`AUTH-SRI-2026-${(latestTx?.authorizationCode || '9812401824').replace(/^AUTH-(PP|KSH|PAYPHONE|KUSHKI|SRI-2026)-/, '')}`}
              </p>
            </div>

            <div className="space-y-0.5 pt-1.5 border-t border-slate-700/80">
              <p className="text-slate-400 font-semibold uppercase text-[10px]">CLAVE DE ACCESO:</p>
              <p className="text-slate-300 text-xs break-all select-all">
                {latestTx?.accessKeySRI || '0811202601179001429800120010010000000011234567819'}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[10px] text-slate-400">
              <span>Estado Tributario:</span>
              <span className="text-emerald-400 font-bold">AUTORIZADO</span>
            </div>
          </div>

          {latestTx && (
            <button
              type="button"
              onClick={() => openReceiptModal(latestTx)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs shadow-md transition-all"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Documento Electrónico Emitido</span>
            </button>
          )}

          <div className="text-[11px] text-slate-400 text-center">
            RUC Institucional: <span className="font-mono text-slate-200">{currentTenant.ruc}</span>
          </div>
        </div>
      </div>

      {/* Transaction History Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-serif font-bold text-slate-900">
              Historial de Transacciones & Comprobantes Emitidos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro local inmutable de cobros autorizados para {currentTenant.name}.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 self-start sm:self-center">
            {transactions.length} transacción(es) registradas
          </span>
        </div>

        {transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">
            No registra transacciones previas para este club.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nº Transacción</th>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Concepto / Servicio</th>
                  <th className="py-3 px-4">Pasarela</th>
                  <th className="py-3 px-4 text-right">Total USD</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-center">Comprobante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {tx.transactionId}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(tx.timestamp).toLocaleString('es-EC', {
                        dateStyle: 'short',
                        timeStyle: 'short',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {tx.description}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.gateway === 'PAYPHONE'
                            ? 'bg-orange-100 text-orange-800'
                            : 'bg-slate-200 text-slate-900'
                        }`}
                      >
                        {tx.gateway}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                      ${tx.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Aprobado</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => openReceiptModal(tx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 font-semibold transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-600" />
                        <span>Ver SRI</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
