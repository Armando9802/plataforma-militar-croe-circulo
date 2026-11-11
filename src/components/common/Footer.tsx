import React from 'react';
import { useTenant } from '../../context/TenantContext';
import { CroeShieldSvg } from '../badges/CroeShieldSvg';
import { CirculoSealSvg } from '../badges/CirculoSealSvg';
import { MapPin, Phone, Mail, Clock, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  const { currentTenant, isCroe } = useTenant();

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-300 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Identity & Motto */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {isCroe ? (
                <CroeShieldSvg size={48} glow />
              ) : (
                <CirculoSealSvg size={48} glow />
              )}
              <div>
                <h4 className="font-serif font-bold text-white text-base leading-tight">
                  {currentTenant.name}
                </h4>
                <p className="text-xs text-amber-400 font-semibold mt-0.5">
                  "{currentTenant.motto}"
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Plataforma digital integrada multi-tenant para la gestión de socios militares,
              reservas de infraestructura recreativa y procesamiento seguro de aportaciones institucionales.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cumplimiento LOPDP Ecuador</span>
            </div>
          </div>

          {/* Col 2: Institutional Contact */}
          <div className="space-y-3">
            <h5 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-slate-800 pb-2">
              Sede Institucional
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>{currentTenant.contact.address}, {currentTenant.contact.city}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{currentTenant.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{currentTenant.contact.email}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{currentTenant.contact.hours}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal & Regulatory */}
          <div className="space-y-3">
            <h5 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-slate-800 pb-2">
              Datos Fiscales SRI
            </h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <span className="block text-slate-500 font-medium">Razón Social:</span>
                <span className="text-white font-medium">{currentTenant.legalEntity}</span>
              </li>
              <li>
                <span className="block text-slate-500 font-medium">RUC Institucional:</span>
                <span className="font-mono text-amber-400 font-semibold">{currentTenant.ruc}</span>
              </li>
              <li>
                <span className="block text-slate-500 font-medium">Régimen Tributario:</span>
                <span>Sociedades Sin Fines de Lucro / IVA 15%</span>
              </li>
              <li>
                <span className="block text-slate-500 font-medium">Portal Web Oficial:</span>
                <span className="text-slate-300 font-mono">https://www.{currentTenant.domain}</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Executive Demo Roadmap & Fast Switch */}
          <div className="space-y-3">
            <h5 className="font-serif font-bold text-white text-sm tracking-wider uppercase border-b border-slate-800 pb-2">
              Presentación Ejecutiva
            </h5>
            <p className="text-xs text-slate-400">
              Prototipo de alta fidelidad diseñado para la sesión del Consejo Directivo.
            </p>
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Sesión Directiva:</span>
                <span className="font-semibold text-amber-400">Martes 10 Nov</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Pasarelas:</span>
                <span className="text-slate-200">Payphone & Kushki</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span className="font-medium">Carné Militar:</span>
                <span className="text-slate-200">QR Dinámico 3D</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright & attribution */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {currentTenant.name}. Todos los derechos reservados.</p>
          <p className="text-center sm:text-right text-slate-400">
            Arquitectura Multi-Tenant Marca Blanca para Clubes Militares del Ecuador
          </p>
        </div>
      </div>
    </footer>
  );
};
