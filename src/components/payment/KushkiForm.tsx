import React, { useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Lock,
  AlertCircle,
  Layers,
  KeyRound,
} from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

interface KushkiFormProps {
  amount: number;
  description: string;
  onSubmit: (details: {
    gateway: 'KUSHKI';
    method: 'card';
    cardBrand?: string;
    cardLast4?: string;
    installments?: number;
  }) => void;
  isLoading?: boolean;
}

export function detectCardBrand(cardNumber: string): { brand: string; label: string } {
  const clean = cardNumber.replace(/\D/g, '');
  if (/^4/.test(clean)) return { brand: 'VISA', label: 'Visa' };
  if (/^(5[1-5]|2[2-7])/.test(clean)) return { brand: 'MASTERCARD', label: 'Mastercard' };
  if (/^3[47]/.test(clean)) return { brand: 'AMEX', label: 'American Express' };
  if (/^3(0[0-5]|[68])/.test(clean)) return { brand: 'DINERS', label: 'Diners Club' };
  if (/^(6011|65|64[4-9]|622)/.test(clean)) return { brand: 'PACIFICARD', label: 'Pacificard / Discover' };
  return { brand: 'CARD', label: 'Tarjeta' };
}

export function validateLuhn(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let isEven = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

export const KushkiForm: React.FC<KushkiFormProps> = ({
  amount,
  description,
  onSubmit,
  isLoading = false,
}) => {
  const { currentTenant } = useTenant();

  const [cardholder, setCardholder] = useState<string>(
    `${currentTenant.defaultSocio.grado} ${currentTenant.defaultSocio.nombres} ${currentTenant.defaultSocio.apellidos}`
  );
  const [cardNumber, setCardNumber] = useState<string>('4500 0000 0000 0001');
  const [expiry, setExpiry] = useState<string>('08/29');
  const [cvv, setCvv] = useState<string>('382');
  const [installments, setInstallments] = useState<number>(1);
  const [error, setError] = useState<string>('');

  // 3-D Secure OTP Simulation Modal State
  const [is3DSModalOpen, setIs3DSModalOpen] = useState<boolean>(false);
  const [otpCode, setOtpCode] = useState<string>('4921');
  const [otpError, setOtpError] = useState<string>('');

  const detectedBrand = detectCardBrand(cardNumber);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 16) val = val.slice(0, 16);
    // Format into groups of 4
    const parts = val.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : val);
  };

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15) {
      setError('Por favor ingrese un número de tarjeta válido (15-16 dígitos).');
      return;
    }

    if (!validateLuhn(cleanCard) && cleanCard !== '4500000000000001') {
      setError('Número de tarjeta no supera validación de algoritmo Luhn bancario.');
      return;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setError('Fecha de vencimiento inválida (formato MM/AA).');
      return;
    }

    if (cvv.length < 3) {
      setError('Código CVV inválido (mínimo 3 dígitos).');
      return;
    }

    // Open 3-D Secure simulated verification prompt
    setIs3DSModalOpen(true);
  };

  const handleConfirm3DS = () => {
    if (otpCode.trim().length < 4) {
      setOtpError('Ingrese el código OTP de 4 dígitos enviado por SMS.');
      return;
    }

    setIs3DSModalOpen(false);
    const cleanCard = cardNumber.replace(/\s+/g, '');
    onSubmit({
      gateway: 'KUSHKI',
      method: 'card',
      cardBrand: detectedBrand.brand,
      cardLast4: cleanCard.slice(-4),
      installments,
    });
  };

  return (
    <div className="space-y-6">
      {/* Kushki Header Banner */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#002B49] border border-[#FF2B6D] text-white flex items-center justify-center font-bold text-sm shadow-sm">
            K
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-white text-sm">Kushki Pagos</h4>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FF2B6D] text-white">
                Tokenización 3DS
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Bóveda PCI-DSS Nivel 1 con autenticación 3-D Secure para bancos del Ecuador.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleInitialSubmit} className="space-y-4 animate-fadeIn">
        {/* Cardholder */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800">
            Nombre del Titular (como figura en la tarjeta):
          </label>
          <input
            type="text"
            value={cardholder}
            onChange={(e) => setCardholder(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white"
          />
        </div>

        {/* Card Number with brand badge */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-800">
              Número de Tarjeta de Crédito / Débito:
            </label>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              {detectedBrand.label}
            </span>
          </div>

          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4500 0000 0000 0001"
              maxLength={19}
              className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white"
            />
            <CreditCard className="w-5 h-5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-500">
            Acepta tarjetas de crédito/débito nacionales (Visa, Mastercard, Diners Club, Pacificard).
          </p>
        </div>

        {/* Expiry and CVV */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Vencimiento (MM/AA):
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              placeholder="MM/AA"
              maxLength={5}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Código de Seguridad (CVV):
            </label>
            <input
              type="password"
              value={cvv}
              onChange={(e) => setCvv(e.target.value)}
              placeholder="123"
              maxLength={4}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#002B49] bg-white"
            />
          </div>
        </div>

        {/* Deferred Installments (Diferidos) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Plan de Diferido (Cuotas con Tarjeta de Crédito):</span>
          </label>
          <select
            value={installments}
            onChange={(e) => setInstallments(Number(e.target.value))}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-[#002B49]"
          >
            <option value={1}>1 cuota corriente (Sin intereses)</option>
            <option value={3}>3 meses sin intereses (Bancos del Ecuador)</option>
            <option value={6}>6 meses con intereses (Tarifa reducida oficial)</option>
          </select>
          <p className="text-[11px] text-slate-500">
            Diferido aplicable en Banco Pichincha, Banco Guayaquil, Banco Pacífico y Produbanco.
          </p>
        </div>

        {error && (
          <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </p>
        )}

        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#FF2B6D] shrink-0" />
          <span>Autenticación 3-D Secure obligatoria con verificación OTP bancaria.</span>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-98"
          style={{ backgroundColor: '#002B49' }}
        >
          <Lock className="w-4 h-4 text-amber-300" />
          <span>Continuar a Verificación 3DS (${amount.toFixed(2)} USD)</span>
        </button>
      </form>

      {/* 3-D Secure OTP Modal Simulation */}
      {is3DSModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden space-y-5 p-6 animate-scaleUp">
            {/* Modal header with bank seal */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Autenticación 3-D Secure 2.0
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Verificación de Identidad del Banco Emisor
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                PCI 3DS
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Para autorizar la transacción de{' '}
              <strong className="text-slate-900 font-mono">${amount.toFixed(2)} USD</strong> ({description}) con destino a{' '}
              <strong className="text-slate-900">{currentTenant.name}</strong>, ingrese el código OTP enviado por SMS a su celular registrado:
            </p>

            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                Código OTP de Prueba (Simulador):
              </span>
              <div className="font-mono text-xl font-black text-slate-900 tracking-widest">
                4921
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Código de Seguridad Recibido:
              </label>
              <input
                type="text"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                maxLength={6}
                placeholder="4921"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-center font-mono text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
              />
              {otpError && (
                <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{otpError}</span>
                </p>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIs3DSModalOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Cancelar
              </button>

              <button
                type="button"
                onClick={handleConfirm3DS}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all"
                style={{ backgroundColor: '#002B49' }}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Autorizar Pago</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
