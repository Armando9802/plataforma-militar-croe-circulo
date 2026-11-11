import React from 'react';
import { ShieldCheck, Lock, Cpu } from 'lucide-react';
import { useTenant } from '../../context/TenantContext';

interface ProcessingSpinnerProps {
  stepText?: string;
  gateway?: 'PAYPHONE' | 'KUSHKI';
}

export const ProcessingSpinner: React.FC<ProcessingSpinnerProps> = ({
  stepText = 'Cifrando canal TLS 1.3 con clave bancaria militar...',
  gateway = 'PAYPHONE',
}) => {
  const { currentTenant } = useTenant();

  const isPayphone = gateway === 'PAYPHONE';

  return (
    <div className="py-10 px-6 flex flex-col items-center justify-center text-center space-y-6 animate-fadeIn">
      {/* Animated Gateway & Security Badge */}
      <div className="relative">
        {/* Pulsing Outer Rings */}
        <div
          className="absolute -inset-4 rounded-full opacity-30 animate-ping"
          style={{
            backgroundColor: isPayphone ? '#F37021' : '#002B49',
          }}
        />
        <div
          className="absolute -inset-2 rounded-full opacity-40 animate-pulse"
          style={{
            backgroundColor: isPayphone ? '#F37021' : '#FF2B6D',
          }}
        />

        {/* Central Core */}
        <div
          className="relative w-24 h-24 rounded-full flex items-center justify-center shadow-xl border-4 border-white"
          style={{
            backgroundColor: isPayphone ? '#F37021' : '#002B49',
          }}
        >
          <Lock className="w-10 h-10 text-white animate-bounce" />
        </div>
      </div>

      {/* Main Status Text */}
      <div className="space-y-2 max-w-md">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Canal Cifrado Bancario Activo</span>
        </div>

        <h3 className="text-xl font-serif font-bold text-slate-900">
          Procesando Transacción Segura
        </h3>

        {/* Dynamic step notification */}
        <p className="text-sm font-medium text-slate-700 min-h-[40px] flex items-center justify-center gap-2">
          <Cpu className="w-4 h-4 text-amber-500 animate-spin" />
          <span>{stepText}</span>
        </p>
      </div>

      {/* Security Specs Matrix */}
      <div className="w-full max-w-sm grid grid-cols-3 gap-2 text-[10px] font-mono text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
        <div className="text-center p-1 border-r border-slate-200">
          <span className="block font-bold text-slate-800">TLS 1.3</span>
          <span>SHA-256</span>
        </div>
        <div className="text-center p-1 border-r border-slate-200">
          <span className="block font-bold text-slate-800">PCI-DSS</span>
          <span>Nivel 1</span>
        </div>
        <div className="text-center p-1">
          <span className="block font-bold text-slate-800">SRI Ecuador</span>
          <span>Mod 11</span>
        </div>
      </div>

      {/* Institutional Guarantee Footer */}
      <p className="text-xs text-slate-400">
        Entidad Emisora: {currentTenant.legalEntity} · RUC: {currentTenant.ruc}
      </p>
    </div>
  );
};
