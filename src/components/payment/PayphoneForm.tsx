import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  CreditCard,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { PaymentMethod } from '../../types/payment';
import { useTenant } from '../../context/TenantContext';

interface PayphoneFormProps {
  amount: number;
  description: string;
  onSubmit: (details: {
    gateway: 'PAYPHONE';
    method: PaymentMethod;
    phone?: string;
    cardBrand?: string;
    cardLast4?: string;
  }) => void;
  isLoading?: boolean;
}

export const PayphoneForm: React.FC<PayphoneFormProps> = ({
  amount,
  description,
  onSubmit,
  isLoading = false,
}) => {
  const { currentTenant } = useTenant();
  const [subMode, setSubMode] = useState<'app' | 'card'>('app');

  // Mobile App Push States
  const [phone, setPhone] = useState<string>(currentTenant.defaultSocio.telefono || '0998765432');
  const [phoneError, setPhoneError] = useState<string>('');
  const [isPushSent, setIsPushSent] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(120);

  // Card Direct States
  const [cardholder, setCardholder] = useState<string>(
    `${currentTenant.defaultSocio.grado} ${currentTenant.defaultSocio.nombres} ${currentTenant.defaultSocio.apellidos}`
  );
  const [cardNumber, setCardNumber] = useState<string>('4500 0000 0000 0001');
  const [expiry, setExpiry] = useState<string>('12/28');
  const [cvv, setCvv] = useState<string>('824');
  const [cardError, setCardError] = useState<string>('');

  // Countdown timer when push is sent
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isPushSent && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPushSent, countdown]);

  const handleSendPush = (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone.startsWith('09') || cleanPhone.length !== 10) {
      setPhoneError('Ingrese un número de celular ecuatoriano válido de 10 dígitos (09X XXX XXXX).');
      return;
    }

    setIsPushSent(true);
    setCountdown(120);
  };

  const handleSimulateApproval = () => {
    onSubmit({
      gateway: 'PAYPHONE',
      method: 'app',
      phone,
    });
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCardError('');

    const cleanCard = cardNumber.replace(/\s+/g, '');
    if (cleanCard.length < 15 || cleanCard.length > 19) {
      setCardError('Ingrese un número de tarjeta válido (15-16 dígitos).');
      return;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      setCardError('Formato de expiración inválido (MM/AA).');
      return;
    }
    if (cvv.length < 3) {
      setCardError('CVV inválido (mínimo 3 dígitos).');
      return;
    }

    onSubmit({
      gateway: 'PAYPHONE',
      method: 'card',
      cardBrand: 'VISA',
      cardLast4: cleanCard.slice(-4),
    });
  };

  return (
    <div className="space-y-6">
      {/* Payphone Header Banner */}
      <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F37021] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            PP
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Payphone Ecuador</h4>
            <p className="text-xs text-orange-800">
              Pasarela de pago móvil autorizada y certificada en la República del Ecuador.
            </p>
          </div>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-bold bg-orange-200 text-orange-900">
          App Móvil & Tarjeta
        </span>
      </div>

      {/* Sub-mode selector tabs */}
      <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
        <button
          type="button"
          onClick={() => {
            setSubMode('app');
            setIsPushSent(false);
          }}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
            subMode === 'app'
              ? 'bg-white text-orange-600 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Pagar con App Payphone</span>
        </button>

        <button
          type="button"
          onClick={() => setSubMode('card')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all ${
            subMode === 'card'
              ? 'bg-white text-orange-600 shadow-sm font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Tarjeta Directa</span>
        </button>
      </div>

      {/* Mode A: App Payphone Push Flow */}
      {subMode === 'app' && (
        <div className="space-y-5 animate-fadeIn">
          {!isPushSent ? (
            <form onSubmit={handleSendPush} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-800">
                  Número de Celular Ecuatoriano (App Payphone):
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-sm font-semibold">
                    +593
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="09X XXX XXXX"
                    className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Ingrese su número celular registrado en la App Payphone (formato: 09X XXX XXXX).
                </p>
                {phoneError && (
                  <p className="text-xs text-rose-600 flex items-center gap-1 mt-1 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{phoneError}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-98"
                style={{ backgroundColor: '#F37021' }}
              >
                <Smartphone className="w-4 h-4" />
                <span>Enviar Solicitud de Cobro a Celular</span>
              </button>
            </form>
          ) : (
            /* Push Notification & Live Phone Simulator State */
            <div className="p-5 rounded-2xl bg-amber-50/80 border-2 border-orange-300 space-y-5 animate-fadeIn">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <Smartphone className="w-5 h-5 animate-pulse" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-sm text-slate-900">
                    Solicitud de Cobro Enviada al Smartphone
                  </h4>
                  <p className="text-xs text-slate-600">
                    Se ha enviado una notificación push al celular{' '}
                    <strong className="text-slate-800 font-mono">+593 {phone}</strong> por el valor de{' '}
                    <strong className="text-emerald-700 font-mono">${amount.toFixed(2)} USD</strong>.
                  </p>
                </div>
              </div>

              {/* Push Simulation Card */}
              <div className="p-3.5 rounded-xl bg-white border border-orange-200 shadow-sm space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 pb-2">
                  <span className="font-semibold text-orange-600">Notificación Push Payphone</span>
                  <span className="flex items-center gap-1 font-mono text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>{Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                  </span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-bold text-slate-800">{currentTenant.name}</p>
                  <p className="text-slate-600">{description}</p>
                  <p className="font-mono font-black text-sm text-slate-900">
                    Total: ${amount.toFixed(2)} USD
                  </p>
                </div>
              </div>

              {/* Interactive Approval Simulator Button */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSimulateApproval}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-95 bg-emerald-600 hover:bg-emerald-700"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>Simular Aprobación en Celular</span>
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  Haga clic en el botón superior para simular la confirmación biométrica en el celular del socio.
                </p>
              </div>

              {/* QR Code Alternative for Mobile Scan */}
              <div className="pt-2 border-t border-orange-200/60 flex items-center justify-between gap-4">
                <div className="text-xs text-slate-600 space-y-0.5">
                  <span className="font-bold text-slate-800 block">¿Prefiere escanear con la cámara?</span>
                  <span className="text-[11px] text-slate-500 block">
                    Abra Payphone y apunte a este código QR.
                  </span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-xs shrink-0">
                  <QRCodeSVG
                    value={`payphone://checkout?ruc=${currentTenant.ruc}&amount=${amount.toFixed(2)}`}
                    size={64}
                    level="M"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Mode B: Tokenized Card Direct Flow */}
      {subMode === 'card' && (
        <form onSubmit={handleCardSubmit} className="space-y-4 animate-fadeIn">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Nombre y Rango del Titular:
            </label>
            <input
              type="text"
              value={cardholder}
              onChange={(e) => setCardholder(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-800">
              Número de Tarjeta (Tokenizada Payphone):
            </label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                maxLength={19}
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
              <CreditCard className="w-5 h-5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Expiración (MM/AA):
              </label>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                maxLength={5}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Código CVV:
              </label>
              <input
                type="password"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                maxLength={4}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-center text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
            </div>
          </div>

          {cardError && (
            <p className="text-xs text-rose-600 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{cardError}</span>
            </p>
          )}

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Datos procesados con bóveda de tokenización segura Payphone PCI-DSS.</span>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold text-white shadow-md hover:shadow-lg transition-all active:scale-98"
            style={{ backgroundColor: '#F37021' }}
          >
            <CreditCard className="w-4 h-4" />
            <span>Pagar con Tarjeta Segura (${amount.toFixed(2)} USD)</span>
          </button>
        </form>
      )}
    </div>
  );
};
