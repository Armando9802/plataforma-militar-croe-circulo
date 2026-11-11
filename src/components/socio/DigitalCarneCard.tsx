import React, { useState } from 'react';
import { SocioProfile } from '../../types/socio';
import { TenantConfig } from '../../types/tenant';
import { CroeShieldSvg } from '../badges/CroeShieldSvg';
import { CirculoSealSvg } from '../badges/CirculoSealSvg';
import { VerifiableQRCode } from './VerifiableQRCode';
import {
  RotateCcw,
  ShieldCheck,
  User,
  Sparkles,
  ScanLine
} from 'lucide-react';

interface DigitalCarneCardProps {
  socio: SocioProfile;
  tenantConfig: TenantConfig;
  onOpenGarita?: () => void;
  className?: string;
}

export const DigitalCarneCard: React.FC<DigitalCarneCardProps> = ({
  socio,
  tenantConfig,
  onOpenGarita,
  className = '',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isCroe = tenantConfig.id === 'croe';

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`} data-testid="digital-carne-card">
      {/* 3D Perspective Container */}
      <div
        className="w-full max-w-[440px] h-[270px] perspective-1000 cursor-pointer select-none group"
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={isFlipped ? 'Carné Digital - Reverso. Clic para girar al anverso' : 'Carné Digital - Anverso. Clic para girar al reverso'}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        {/* Flippable Card Inner */}
        <div
          className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          data-testid="carne-flip-wrapper"
        >
          {/* ========================================================= */}
          {/* FRONT FACE (ANVERSO) */}
          {/* ========================================================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-4 sm:p-5 text-white shadow-2xl backface-hidden overflow-hidden flex flex-col justify-between"
            style={{
              background: isCroe
                ? 'linear-gradient(135deg, #8B1E24 0%, #6A1318 45%, #38080B 100%)'
                : 'linear-gradient(135deg, #1B365D 0%, #11233D 45%, #08111D 100%)',
              border: isCroe ? '2px solid rgba(212, 175, 55, 0.75)' : '2px solid rgba(200, 160, 81, 0.75)',
              boxShadow: isCroe
                ? '0 16px 36px -10px rgba(139, 30, 36, 0.5), inset 0 0 20px rgba(212, 175, 55, 0.15)'
                : '0 16px 36px -10px rgba(27, 54, 93, 0.5), inset 0 0 20px rgba(200, 160, 81, 0.15)',
            }}
            data-testid="carne-front-face"
          >
            {/* Holographic foil simulation overlay */}
            <div
              className="absolute inset-0 pointer-events-none opacity-20 group-hover:opacity-35 transition-opacity duration-500"
              style={{
                background:
                  'linear-gradient(115deg, transparent 20%, rgba(255,255,255,0.4) 30%, rgba(212,175,55,0.6) 45%, rgba(138,43,226,0.3) 55%, transparent 70%)',
              }}
            />

            {/* Subtle Guilloché / Security Grid Background pattern */}
            <div
              className="absolute inset-0 pointer-events-none opacity-10"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 1px, transparent 1px)',
                backgroundSize: '16px 16px',
              }}
            />

            {/* Header: Crest + Institution Name + Category Badge */}
            <div className="relative z-10 flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0 p-0.5 bg-black/20 rounded-xl border border-amber-400/40 backdrop-blur-sm">
                  {isCroe ? (
                    <CroeShieldSvg size={40} glow />
                  ) : (
                    <CirculoSealSvg size={40} glow />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-black text-xs sm:text-sm tracking-wide uppercase leading-tight text-white drop-shadow-sm truncate">
                    {tenantConfig.shortName || tenantConfig.name}
                  </h3>
                  <p className="text-[9px] sm:text-[10px] text-amber-300 font-semibold tracking-wider uppercase mt-0.5 truncate">
                    Carné Oficial de Socio Militar
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-slate-300 font-mono tracking-wider truncate">
                    REPUBLICA DEL ECUADOR · FF.AA.
                  </p>
                </div>
              </div>

              {/* EMV Smart Card Gold Chip Simulation */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <div
                  className="w-9 h-6.5 rounded bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-500 border border-amber-600 shadow-inner flex flex-col justify-around p-0.5 relative overflow-hidden"
                  title="Chip Criptográfico Militar"
                >
                  <div className="w-full h-px bg-amber-800/40" />
                  <div className="w-full h-px bg-amber-800/40" />
                  <div className="w-full h-px bg-amber-800/40" />
                  <div className="absolute inset-y-0 left-1/3 w-px bg-amber-800/40" />
                  <div className="absolute inset-y-0 right-1/3 w-px bg-amber-800/40" />
                </div>
                <span className="text-[8px] font-mono font-bold text-amber-300">
                  ACTIVA 2026
                </span>
              </div>
            </div>

            {/* Officer Details & Photo */}
            <div className="relative z-10 flex items-center gap-3.5 my-auto">
              {/* Photo with golden frame */}
              <div className="relative shrink-0">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md bg-slate-800 flex items-center justify-center">
                  {!imageError && socio.fotoUrl ? (
                    <img
                      src={socio.fotoUrl}
                      alt={`${socio.grado} ${socio.apellidos}`}
                      className="w-full h-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <User className="w-9 h-9 text-amber-300" />
                  )}
                </div>

                {/* Holographic Security Stamp */}
                <div className="absolute -bottom-1 -right-1 p-0.5 sm:p-1 bg-amber-500 rounded-full border border-white text-slate-950 shadow">
                  <ShieldCheck className="w-3 h-3 text-slate-950" />
                </div>
              </div>

              {/* Credentials text */}
              <div className="flex-1 min-w-0 space-y-0.5 sm:space-y-1">
                <div className="inline-block px-2 py-0.5 rounded bg-black/40 border border-amber-400/40 text-[8px] sm:text-[9px] font-bold text-amber-300 tracking-wider uppercase">
                  {socio.categoria}
                </div>

                <p className="font-serif font-black text-xs sm:text-sm text-white tracking-wide truncate drop-shadow-sm">
                  {socio.grado}
                </p>

                <p className="font-bold text-[11px] sm:text-xs text-amber-200 tracking-wide truncate uppercase">
                  {socio.apellidos} {socio.nombres}
                </p>

                <p className="text-[9px] sm:text-[10px] text-slate-300 truncate">
                  Calificación Militar:{' '}
                  <span className="text-white font-semibold">Oficial de Carrera</span>
                </p>
              </div>
            </div>

            {/* Footer Row: Military ID, National ID, and Hologram Badge */}
            <div className="relative z-10 pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-300 block">
                  Cód. Militar
                </span>
                <span className="font-mono font-bold text-white tracking-wider">
                  {socio.codigoMilitar}
                </span>
              </div>

              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-300 block">
                  Cédula
                </span>
                <span className="font-mono font-semibold text-slate-200">
                  {socio.cedula}
                </span>
              </div>

              <div>
                <span className="text-[8px] uppercase tracking-wider text-slate-300 block">
                  Seguridad
                </span>
                <span className="font-mono text-[9px] text-amber-300 font-bold">
                  SHA-256 VERIFIED
                </span>
              </div>

              {/* Interactive Click to Flip Hint */}
              <div className="flex items-center gap-1 text-[9px] font-semibold text-amber-300/90 bg-black/30 px-2 py-0.5 rounded-full border border-amber-400/30">
                <RotateCcw className="w-2.5 h-2.5 animate-spin-slow" />
                <span>Girar 3D</span>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* BACK FACE (REVERSO) */}
          {/* ========================================================= */}
          <div
            className="absolute inset-0 w-full h-full rounded-2xl p-4 text-white shadow-2xl backface-hidden rotate-y-180 overflow-hidden flex flex-col justify-between"
            style={{
              background: isCroe
                ? 'linear-gradient(135deg, #2b0608 0%, #4a0c0f 50%, #1a0304 100%)'
                : 'linear-gradient(135deg, #0a1320 0%, #13243c 50%, #060b13 100%)',
              border: isCroe ? '2px solid rgba(212, 175, 55, 0.75)' : '2px solid rgba(200, 160, 81, 0.75)',
              boxShadow: isCroe
                ? '0 16px 36px -10px rgba(139, 30, 36, 0.5)'
                : '0 16px 36px -10px rgba(27, 54, 93, 0.5)',
            }}
            data-testid="carne-back-face"
          >
            {/* Magnetic Stripe Simulation */}
            <div className="-mx-4 -mt-4 h-9 bg-slate-950 border-b border-slate-800 flex items-center justify-between px-4">
              <span className="font-mono text-[8px] text-slate-600 tracking-widest">
                TRACK-1 // MDN-EC-SEC-VAL-2026 //
              </span>
              <span className="font-mono text-[8px] text-amber-500/80 font-bold">
                ENCRYPTED-NFC
              </span>
            </div>

            {/* Back Content Area: Regulations + Compact Dynamic QR Code */}
            <div className="grid grid-cols-5 gap-3 items-center my-auto pt-1">
              {/* Left Column: Official Directives & Signatures */}
              <div className="col-span-3 space-y-1.5 text-[9px] text-slate-300 leading-tight">
                <p className="font-semibold text-amber-300 uppercase tracking-wider text-[9px]">
                  Normativa de Uso Oficial
                </p>
                <p className="text-[8.5px] text-slate-300">
                  Este carné es personal e intransferible. Acredita la condición de socio militar activo conforme al estatuto orgánico.
                </p>
                <p className="text-[8px] text-slate-400">
                  En caso de pérdida o sustracción, notificar inmediatamente a la Dirección de Bienestar de las FF.AA.
                </p>

                <div className="pt-1.5 border-t border-white/10 flex items-center justify-between text-[8px]">
                  <div>
                    <span className="text-slate-400 block">Sede Registrada:</span>
                    <span className="font-semibold text-white truncate block max-w-[140px]">
                      Campus Oficial FFAA
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Vehículo:</span>
                    <span className="font-mono font-bold text-amber-300">
                      Placa Autorizada
                    </span>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="font-mono text-[8px] text-slate-400 tracking-wider block">
                    FIRMA AUTORIZADA // BIENESTAR FF.AA.
                  </span>
                  <div className="h-4 border-b border-dashed border-amber-400/50 w-36" />
                </div>
              </div>

              {/* Right Column: Mini Verifiable Dynamic QR Preview */}
              <div className="col-span-2 flex flex-col items-center justify-center p-2 rounded-xl bg-white text-slate-950 border border-amber-400 shadow">
                <VerifiableQRCode
                  socio={socio}
                  tenantId={tenantConfig.id}
                  size={84}
                  showDetails={false}
                  className="!p-0 !border-0 !shadow-none !bg-transparent"
                />
                <span className="font-mono text-[8px] font-bold text-slate-700 mt-1 uppercase tracking-wider">
                  Escanear en Garita
                </span>
              </div>
            </div>

            {/* Footer barcode/serial line */}
            <div className="pt-1 border-t border-white/10 flex items-center justify-between text-[8px] text-slate-400 font-mono">
              <span>SERIE: {socio.id}-2026</span>
              <span className="text-amber-300 font-bold">CONTROL PERIMETRAL MILITAR</span>
              <span>CLIC PARA VOLVER</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Controls below card */}
      <div className="flex flex-wrap items-center justify-center gap-3 w-full max-w-[440px]">
        <button
          type="button"
          onClick={handleFlip}
          className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-400 border border-amber-400/40 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:border-amber-400"
          data-testid="flip-card-btn"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{isFlipped ? 'Ver Anverso del Carné' : 'Girar Carné 3D (Ver QR)'}</span>
        </button>

        {onOpenGarita && (
          <button
            type="button"
            onClick={onOpenGarita}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow"
            data-testid="open-garita-btn"
          >
            <ScanLine className="w-3.5 h-3.5 text-slate-950" />
            <span>Simular Garita</span>
          </button>
        )}
      </div>

      <p className="text-[11px] text-slate-500 text-center flex items-center gap-1.5">
        <Sparkles className="w-3 h-3 text-amber-500" />
        <span>Gire el carné para visualizar el código QR criptográfico dinámico de acceso</span>
      </p>
    </div>
  );
};
