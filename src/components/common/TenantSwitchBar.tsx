import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { CroeShieldSvg } from '../badges/CroeShieldSvg';
import { CirculoSealSvg } from '../badges/CirculoSealSvg';
import { RefreshCw, Sparkles, Building2 } from 'lucide-react';

export const TenantSwitchBar: React.FC = () => {
  const { currentTenant, setTenant, switchTenant, isCroe } = useTenant();

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2 sm:px-6 shadow-inner select-none transition-colors duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Presentation Context Badge */}
        <div className="flex items-center gap-2.5 text-xs text-slate-300">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-medium text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Tenant Demo</span>
          </span>
          <span className="hidden sm:inline text-slate-400">
            Plataforma Institucional Militar Unificada
          </span>
          <span className="text-slate-500 hidden lg:inline">|</span>
          <span className="hidden lg:inline text-slate-400 text-[11px]">
            Atajo rápido: <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 border border-slate-700 rounded text-slate-200">Alt + T</kbd>
          </span>
        </div>

        {/* Center / Right: Institutional Dual Switcher */}
        <div className="flex items-center gap-2">
          <div
            role="tablist"
            aria-label="Selector de Institución Militar"
            className="inline-flex p-1 rounded-xl bg-slate-950/80 border border-slate-700/80 shadow-md backdrop-blur-sm"
          >
            {/* Button CROE */}
            <button
              role="tab"
              aria-selected={isCroe}
              aria-label="Seleccionar portal CROE"
              onClick={() => setTenant('croe')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                isCroe
                  ? 'bg-gradient-to-r from-[#8B1E24] to-[#6A1318] text-white shadow-lg shadow-red-950/50 border border-amber-400/40 ring-1 ring-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CroeShieldSvg size={20} className={isCroe ? 'scale-110' : 'opacity-70'} />
              <div className="text-left">
                <span className="block leading-tight font-serif">C.R.O.E.</span>
                <span className="block text-[9px] font-sans font-normal opacity-75">
                  Ejército
                </span>
              </div>
              {isCroe && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>

            {/* Button Círculo Militar */}
            <button
              role="tab"
              aria-selected={!isCroe}
              aria-label="Seleccionar portal Círculo Militar"
              onClick={() => setTenant('circulo-militar')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${
                !isCroe
                  ? 'bg-gradient-to-r from-[#1B365D] to-[#11233D] text-white shadow-lg shadow-blue-950/50 border border-amber-400/40 ring-1 ring-amber-400/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <CirculoSealSvg size={20} className={!isCroe ? 'scale-110' : 'opacity-70'} />
              <div className="text-left">
                <span className="block leading-tight font-serif">Círculo Militar</span>
                <span className="block text-[9px] font-sans font-normal opacity-75">
                  FFAA (1918)
                </span>
              </div>
              {!isCroe && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse ml-0.5" />
              )}
            </button>
          </div>

          {/* Quick toggle circular button */}
          <button
            onClick={switchTenant}
            title="Alternar institución (Alt + T)"
            aria-label="Alternar entre CROE y Círculo Militar"
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 border border-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4 transition-transform active:rotate-180" />
          </button>
        </div>

        {/* Right status indicator */}
        <div className="hidden md:flex items-center gap-2 text-xs">
          <span className="text-slate-400">Entidad activa:</span>
          <span
            className={`font-semibold inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] ${
              isCroe
                ? 'bg-red-950/80 text-amber-300 border border-red-800/50'
                : 'bg-blue-950/80 text-amber-300 border border-blue-800/50'
            }`}
          >
            <Building2 className="w-3 h-3" />
            {currentTenant.name}
          </span>
        </div>
      </div>
    </div>
  );
};
