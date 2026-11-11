import React, { useState } from 'react';
import { SocioProfile } from '../../types/socio';
import { useTenant } from '../../context/TenantContext';
import { DigitalCarneCard } from './DigitalCarneCard';
import { DependentsList } from './DependentsList';
import { CroeShieldSvg } from '../badges/CroeShieldSvg';
import { CirculoSealSvg } from '../badges/CirculoSealSvg';
import {
  IdCard,
  CheckCircle,
  Award,
  MapPin,
  Car,
  CreditCard,
  Phone,
  Mail,
  FileCheck,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Download
} from 'lucide-react';

interface SocioProfileViewProps {
  socio?: SocioProfile;
  onOpenGarita?: () => void;
  className?: string;
}

export const SocioProfileView: React.FC<SocioProfileViewProps> = ({
  socio: propSocio,
  onOpenGarita,
  className = '',
}) => {
  const { currentTenant, isCroe } = useTenant();
  const socio = propSocio || currentTenant.defaultSocio;

  const [downloadNotice, setDownloadNotice] = useState<string | null>(null);

  const handleDownloadCertificate = () => {
    setDownloadNotice('Certificado de Afiliación Militar emitido con firma digital (PDF).');
    setTimeout(() => setDownloadNotice(null), 3500);
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn ${className}`}
      data-testid="socio-profile-view"
    >
      {/* ========================================================= */}
      {/* 1. TOP HEADER & MILITARY IDENTITY BANNER */}
      {/* ========================================================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Identity Title */}
          <div className="flex items-start gap-4">
            <div className="shrink-0 p-2 rounded-2xl bg-slate-50 border border-slate-200 shadow-sm hidden sm:block">
              {isCroe ? <CroeShieldSvg size={58} /> : <CirculoSealSvg size={58} />}
            </div>

            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                <IdCard className="w-3.5 h-3.5 text-amber-700" />
                <span>Expediente Militar & Carné Digital</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 leading-tight">
                Expediente de {socio.grado} {socio.apellidos}
              </h2>
              <p className="text-sm font-semibold text-slate-700">{socio.nombres}</p>

              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600">
                <span>
                  Calificación Militar:{' '}
                  <strong className="text-slate-900">Oficial de Carrera</strong>
                </span>
                <span>•</span>
                <span>
                  Código Militar:{' '}
                  <strong className="font-mono text-slate-900">{socio.codigoMilitar}</strong>
                </span>
                <span>•</span>
                <span>
                  C.I.: <strong className="font-mono text-slate-900">{socio.cedula}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Status Badges & Quick Action */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 shadow-sm">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>Cuotas al Día ({socio.ultimaCuotaPagada})</span>
            </span>

            <button
              type="button"
              onClick={handleDownloadCertificate}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Descargar Certificado PDF</span>
            </button>
          </div>
        </div>

        {downloadNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{downloadNotice}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-700">SRI / FF.AA. VALIDATED</span>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. STATS RIBBON / SENIORITY & STATUS BAR */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700 shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Antigüedad
            </p>
            <p className="font-bold text-slate-900 text-sm sm:text-base">
              {socio.antiguedadAnios} Años
            </p>
            <p className="text-[10px] text-slate-500">Desde {socio.fechaIngreso.slice(0, 4)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Aportación
            </p>
            <p className="font-bold text-slate-900 text-sm sm:text-base">
              ${socio.montoCuotaMensual.toFixed(2)} USD
            </p>
            <p className="text-[10px] text-emerald-600 font-semibold">Al día (Nov 2026)</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700 shrink-0">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Vehículo
            </p>
            <p className="font-mono font-bold text-slate-900 text-sm sm:text-base">
              Acreditado
            </p>
            <p className="text-[10px] text-blue-600 font-semibold">Talanquera activa</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              Instalaciones
            </p>
            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
              {currentTenant.shortName} Sede Principal
            </p>
            <p className="text-[10px] text-purple-600 font-semibold">Acceso total</p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. MAIN TWO-COLUMN CONTENT AREA */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ======================================================= */}
        {/* LEFT COLUMN: 3D DIGITAL CARNÉ */}
        {/* ======================================================= */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <IdCard className="w-4 h-4 text-slate-700" />
                <h3 className="font-serif font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Carné Digital Oficial (3D)
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                Giro Interactivo
              </span>
            </div>

            {/* 3D Flippable Card Component */}
            <DigitalCarneCard
              socio={socio}
              tenantConfig={currentTenant}
              onOpenGarita={onOpenGarita}
            />

            {/* Garita Security Notice Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-1.5 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Control de Acceso en Garitas de Seguridad</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Presente este carné en garitas perimetrales. El código QR criptográfico HMAC-SHA256 permite la validación instantánea y autorización de talanquera vehicular.
              </p>
            </div>
          </div>

          {/* Officer Benefits Card */}
          <div className="bg-gradient-to-br from-amber-50 via-white to-amber-50/40 rounded-3xl p-6 border border-amber-200/80 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Beneficios Activos de la Membresía</span>
            </div>
            <ul className="text-xs text-slate-600 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Acceso ilimitado a áreas húmedas, canchas y piscina</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Tarifa preferencial castrense en hospedaje y restaurante</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span>Ingreso vehicular automatizado por tag RFID en garita militar</span>
              </li>
            </ul>
          </div>
        </div>

        {/* ======================================================= */}
        {/* RIGHT COLUMN: MILITARY DOSSIER & DEPENDENTS */}
        {/* ======================================================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Hoja de Vida Militar (Military Record Details) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-700" />
                <h3 className="font-serif font-bold text-slate-900 text-sm uppercase tracking-wider">
                  Expediente Militar & Datos de Afiliación
                </h3>
              </div>
              <button
                type="button"
                onClick={handleDownloadCertificate}
                className="text-xs text-slate-600 hover:text-amber-700 font-semibold flex items-center gap-1.5 transition-colors"
                title="Descargar Certificado de Socio"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Certificado PDF</span>
              </button>
            </div>

            {/* Structured Military Dossier Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-500 block">Grado & Escalafón:</span>
                <p className="font-serif font-bold text-slate-900 text-sm">{socio.grado}</p>
                <p className="text-[11px] text-amber-700 font-semibold">{socio.categoria}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-500 block">Arma o Servicio:</span>
                <p className="font-bold text-slate-900 text-sm">{socio.arma}</p>
                <p className="text-[11px] text-slate-500">Ejército del Ecuador</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-500 block">Identificación Oficial:</span>
                <p className="font-mono font-bold text-slate-900 text-sm">{socio.codigoMilitar}</p>
                <p className="text-[11px] text-slate-600 font-mono">C.I. {socio.cedula}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-500 block">Fecha de Afiliación / Antigüedad:</span>
                <p className="font-bold text-slate-900 text-sm">{socio.fechaIngreso}</p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  {socio.antiguedadAnios} Años de Servicio
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-500 block">Sede Habitual:</span>
                <p className="font-bold text-slate-900 text-sm">{socio.sedeHabitual}</p>
                <p className="text-[11px] text-purple-700 font-semibold">Instalaciones autorizadas</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-500 block">Contacto Oficial:</span>
                <p className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-500" />
                  {socio.telefono}
                </p>
                <p className="text-slate-600 truncate flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  {socio.email}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <span className="text-[11px] text-slate-500 block">Vehículo Oficial en Garita:</span>
                <p className="font-mono font-bold text-slate-900 text-sm">
                  {socio.vehiculoPlaca || 'Sin registrar'}
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold">
                  Acreditación de paso libre
                </p>
              </div>
            </div>

            {/* Financial Status Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-serif font-bold text-emerald-950 text-sm">
                    Membresía Activa y Solventada
                  </p>
                  <p className="text-emerald-800 text-[11px]">
                    Última aportación mensual registrada: {socio.ultimaCuotaPagada} ($
                    {socio.montoCuotaMensual.toFixed(2)} USD).
                  </p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-[11px] text-center self-start sm:self-center">
                Solvente
              </span>
            </div>
          </div>

          {/* Dependents Section */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-7 shadow-sm">
            <DependentsList dependents={socio.dependientes || []} />
          </div>
        </div>
      </div>
    </div>
  );
};
