import React from 'react';
import {
  ShieldCheck,
  Printer,
  Download,
  X,
  CheckCircle2,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentTransaction } from '../../types/payment';
import { useTenant } from '../../context/TenantContext';
import { CroeShieldSvg } from '../badges/CroeShieldSvg';
import { CirculoSealSvg } from '../badges/CirculoSealSvg';

interface DigitalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: PaymentTransaction | null;
}

export const DigitalReceiptModal: React.FC<DigitalReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
}) => {
  const { currentTenant, isCroe } = useTenant();

  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(transaction, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `comprobante-sri-${transaction.transactionId}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // 49-digit SRI access key
  const accessKey =
    transaction.accessKeySRI ||
    '0811202601179001429800120010010000000011234567819';

  // Authorization code formatted with SRI standard
  const sriAuthCode = transaction.authorizationCode.startsWith('AUTH-SRI-2026-')
    ? transaction.authorizationCode
    : `AUTH-SRI-2026-${transaction.authorizationCode.replace(/^AUTH-(PP|KSH|PAYPHONE|KUSHKI)-/, '')}`;

  const formattedDate = new Date(transaction.timestamp).toLocaleString('es-EC', {
    dateStyle: 'long',
    timeStyle: 'medium',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn print:p-0 print:bg-white">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 animate-scaleUp print:border-none print:shadow-none print:m-0 print:max-w-none">
        {/* Printable Voucher Outer Container */}
        <div className="p-6 sm:p-8 space-y-6 print:p-6" id="digital-voucher-print-area">
          {/* Top Header: Institutional Crest & Legal Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-5 gap-4">
            <div className="flex items-center gap-4">
              <div className="shrink-0">
                {isCroe ? (
                  <CroeShieldSvg size={64} />
                ) : (
                  <CirculoSealSvg size={64} />
                )}
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold tracking-widest uppercase text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full inline-block">
                  Comprobante SRI · Facturación Electrónica
                </span>
                <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-900 leading-tight">
                  {transaction.institutionName || currentTenant.legalEntity}
                </h3>
                <p className="text-xs text-slate-600">
                  RUC: <strong className="font-mono text-slate-900">{transaction.rucInstitucion || currentTenant.ruc}</strong>
                </p>
                <p className="text-[11px] text-slate-500">
                  {currentTenant.contact.address} · {currentTenant.contact.city}, Ecuador
                </p>
              </div>
            </div>

            {/* Non-printing close button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors print:hidden shrink-0"
              aria-label="Cerrar Comprobante"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Legal Compliance Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="font-bold text-slate-900 block">
                Comprobante Digital de Pago y Reserva
              </span>
              <span className="text-[11px] text-slate-600">
                Emitido conforme a las normas técnicas de facturación electrónica del SRI de la República del Ecuador.
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 self-start sm:self-center">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>AUTORIZADO / PAGADO</span>
            </div>
          </div>

          {/* Electronic Document Metadata (Clave de Acceso & Autorización) */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-amber-400 font-bold tracking-wider">
                AUTORIZACIÓN:
              </span>
              <span className="text-amber-300 font-bold break-all">
                {sriAuthCode}
              </span>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 text-[10px] block">
                CLAVE DE ACCESO:
              </span>
              <p className="text-slate-200 text-xs tracking-wider break-all select-all font-semibold">
                {accessKey}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
              <div>
                <span className="text-slate-500 block">Nº Transacción:</span>
                <span className="text-slate-200">{transaction.transactionId}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Fecha y Hora:</span>
                <span className="text-slate-200">{formattedDate}</span>
              </div>
            </div>
          </div>

          {/* Customer / Military Officer Information */}
          <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] border-b border-slate-100 pb-1">
              Datos del Socio / Adquiriente:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
              <div>
                <span className="text-slate-500 block">Nombre / Razón Social:</span>
                <span className="font-bold text-slate-900">{transaction.customerName}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Identificación / Cédula Militar:</span>
                <span className="font-mono font-medium text-slate-900">{transaction.customerId}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Correo Electrónico:</span>
                <span className="font-medium text-slate-800">{transaction.customerEmail}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Pasarela & Medio de Pago:</span>
                <span className="font-medium text-slate-800">
                  {transaction.gateway === 'PAYPHONE' ? 'Payphone Ecuador' : 'Kushki Pagos'} (
                  {transaction.paymentMethod === 'app' ? 'App Móvil' : `Tarjeta ${transaction.cardBrand || ''} *${transaction.cardLast4 || '4500'}`})
                </span>
              </div>
            </div>
          </div>

          {/* Itemized Financial Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Descripción del Servicio / Reserva</th>
                  <th className="py-2.5 px-3 text-right">Monto USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-3 px-3 font-medium text-slate-900">
                    {transaction.description}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-semibold">
                    ${transaction.subtotal.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Financial Summary Calculation Rows */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal / Base Imponible (15%):</span>
                <span className="font-mono text-slate-900">${transaction.subtotal.toFixed(2)} USD</span>
              </div>

              {transaction.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Descuento Militar Institucional:</span>
                  <span className="font-mono">-${transaction.discount.toFixed(2)} USD</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Tarifa IVA 15% SRI Ecuador (Ley Orgánica 2024):</span>
                <span className="font-mono text-slate-900">${transaction.vat.toFixed(2)} USD</span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm sm:text-base font-bold text-slate-900">
                <span>Total Liquidado y Pagado:</span>
                <span className="font-mono text-emerald-600 text-lg font-black">
                  ${transaction.amount.toFixed(2)} USD
                </span>
              </div>
            </div>
          </div>

          {/* Verifiable SRI QR Code Container */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-xs">
            <div className="space-y-1 text-center sm:text-left">
              <span className="font-bold text-amber-900 block flex items-center justify-center sm:justify-start gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                <span>Verificación Electrónica Oficial SRI</span>
              </span>
              <p className="text-[11px] text-amber-800/80 max-w-sm">
                Escanee este código con la cámara de su dispositivo móvil para verificar la validez de la autorización fiscal en el portal web oficial del SRI del Ecuador.
              </p>
            </div>

            <div
              data-testid="voucher-qr-code"
              className="p-2 bg-white rounded-xl border border-amber-200 shadow-xs shrink-0"
            >
              <QRCodeSVG
                value={`https://sri.gob.ec/comprobantes-electronicos?claveAcceso=${accessKey}&auth=${transaction.authorizationCode}&total=${transaction.amount.toFixed(2)}`}
                size={84}
                level="M"
              />
            </div>
          </div>

          {/* Action Buttons (Excluded from print) */}
          <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-slate-200 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Imprimir Comprobante</span>
            </button>

            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Descargar Comprobante</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95"
              style={{ backgroundColor: currentTenant.theme.primaryColor }}
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Finalizar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
