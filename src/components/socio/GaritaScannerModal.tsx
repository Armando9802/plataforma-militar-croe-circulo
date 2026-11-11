import React, { useState, useEffect } from 'react';
import { SocioProfile } from '../../types/socio';
import { TenantId } from '../../types/tenant';
import {
  generateSignedQrPayload,
  verifyQrOffline,
  QrVerificationResult
} from './VerifiableQRCode';
import {
  Car,
  Users,
  CheckCircle2,
  XCircle,
  ScanLine,
  X,
  Radio,
  FileText,
  AlertTriangle,
  History,
  Check
} from 'lucide-react';

export interface AccessLogEntry {
  id: string;
  timestamp: string;
  socioRank: string;
  socioName: string;
  socioCode: string;
  vehiculoPlaca: string;
  accompanyingCount: number;
  accompanyingNames: string[];
  status: 'AUTORIZADO' | 'DENEGADO';
  sentryStation: string;
}

interface GaritaScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  socio: SocioProfile;
  tenantId: TenantId;
}

export const GaritaScannerModal: React.FC<GaritaScannerModalProps> = ({
  isOpen,
  onClose,
  socio,
  tenantId,
}) => {
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verified' | 'rejected'>('idle');
  const [verificationResult, setVerificationResult] = useState<QrVerificationResult | null>(null);
  const [activeSimulationMode, setActiveSimulationMode] = useState<
    'valid' | 'tampered' | 'expired' | 'suspended'
  >('valid');
  const [selectedDependents, setSelectedDependents] = useState<string[]>([]);
  const [entryLogged, setEntryLogged] = useState(false);
  const [accessLogs, setAccessLogs] = useState<AccessLogEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load existing logs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('garita_access_logs');
      if (stored) {
        setAccessLogs(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  // Initialize selected dependents
  useEffect(() => {
    if (socio.dependientes) {
      setSelectedDependents(socio.dependientes.map((d) => d.id));
    }
  }, [socio]);

  // Gentle audio synthesis for scan sound effect
  const playScanSound = (success: boolean) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      if (success) {
        // High dual-tone chime
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // Low error buzz
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio might be muted or not allowed without gesture
    }
  };

  // Execute scan based on selected simulation mode
  const executeScan = (mode: 'valid' | 'tampered' | 'expired' | 'suspended' = activeSimulationMode) => {
    setScanState('scanning');
    setEntryLogged(false);

    setTimeout(() => {
      let rawPayload = '';
      const now = Date.now();

      if (mode === 'valid') {
        rawPayload = generateSignedQrPayload({
          memberId: socio.codigoMilitar,
          cedula: socio.cedula,
          rank: socio.grado,
          fullName: `${socio.nombres} ${socio.apellidos}`,
          tenant: tenantId,
          status: socio.estadoSocio,
          category: socio.categoria,
          issueTimestamp: now - 30000, // 30s ago
        });
      } else if (mode === 'tampered') {
        // Altered payload with wrong hash
        const signed = generateSignedQrPayload({
          memberId: socio.codigoMilitar,
          cedula: socio.cedula,
          rank: socio.grado,
          fullName: `${socio.nombres} ${socio.apellidos}`,
          tenant: tenantId,
          status: socio.estadoSocio,
          category: socio.categoria,
          issueTimestamp: now,
        });
        const obj = JSON.parse(signed);
        obj.rank = 'GENERAL DE EJÉRCITO (FALSO)';
        rawPayload = JSON.stringify(obj);
      } else if (mode === 'expired') {
        // Issue timestamp older than 15 minutes
        rawPayload = generateSignedQrPayload({
          memberId: socio.codigoMilitar,
          cedula: socio.cedula,
          rank: socio.grado,
          fullName: `${socio.nombres} ${socio.apellidos}`,
          tenant: tenantId,
          status: socio.estadoSocio,
          category: socio.categoria,
          issueTimestamp: now - 20 * 60 * 1000, // 20 min ago
        });
      } else if (mode === 'suspended') {
        // Member marked as suspended
        rawPayload = generateSignedQrPayload({
          memberId: socio.codigoMilitar,
          cedula: socio.cedula,
          rank: socio.grado,
          fullName: `${socio.nombres} ${socio.apellidos}`,
          tenant: tenantId,
          status: 'SUSPENDIDO',
          category: socio.categoria,
          issueTimestamp: now,
        });
      }

      const result = verifyQrOffline(rawPayload);
      setVerificationResult(result);

      if (result.status === 'AUTHORIZED') {
        setScanState('verified');
        playScanSound(true);
      } else {
        setScanState('rejected');
        playScanSound(false);
      }
    }, 1100);
  };

  // Auto-scan on modal open
  useEffect(() => {
    if (isOpen) {
      executeScan('valid');
    } else {
      setScanState('idle');
      setVerificationResult(null);
      setEntryLogged(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Adapt military greeting based on rank
  const getMilitaryGreeting = (rank: string) => {
    const upper = rank.toUpperCase();
    if (upper.includes('GRAL') || upper.includes('GENERAL')) return 'BIENVENIDO MI GENERAL';
    if (upper.includes('VALM') || upper.includes('ALMIRANTE')) return 'BIENVENIDO MI ALMIRANTE';
    if (upper.includes('CRNL') || upper.includes('CORONEL')) return 'BIENVENIDO MI CORONEL';
    if (upper.includes('TCRN') || upper.includes('TENIENTE CORONEL')) return 'BIENVENIDO MI TENIENTE CORONEL';
    if (upper.includes('MYR') || upper.includes('MAYOR')) return 'BIENVENIDO MI MAYOR';
    if (upper.includes('CAPT') || upper.includes('CAPITÁN')) return 'BIENVENIDO MI CAPITÁN';
    if (upper.includes('TNTE') || upper.includes('TENIENTE')) return 'BIENVENIDO MI TENIENTE';
    if (upper.includes('SUBT') || upper.includes('SUBTENIENTE')) return 'BIENVENIDO MI SUBTENIENTE';
    return `BIENVENIDO ${rank}`;
  };

  const toggleDependentSelection = (depId: string) => {
    setSelectedDependents((prev) =>
      prev.includes(depId) ? prev.filter((id) => id !== depId) : [...prev, depId]
    );
  };

  const handleLogEntry = () => {
    const accompanyingNames = (socio.dependientes || [])
      .filter((d) => selectedDependents.includes(d.id))
      .map((d) => `${d.nombres} (${d.parentesco})`);

    const newEntry: AccessLogEntry = {
      id: `LOG-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-EC', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      socioRank: socio.grado,
      socioName: `${socio.nombres} ${socio.apellidos}`,
      socioCode: socio.codigoMilitar,
      vehiculoPlaca: socio.vehiculoPlaca || 'S/R',
      accompanyingCount: accompanyingNames.length,
      accompanyingNames,
      status: scanState === 'verified' ? 'AUTORIZADO' : 'DENEGADO',
      sentryStation:
        tenantId === 'croe'
          ? 'Garita Principal Cumbayá (Puesto 1)'
          : 'Garita de Honor Quito - La Carolina',
    };

    const updated = [newEntry, ...accessLogs].slice(0, 30);
    setAccessLogs(updated);
    try {
      localStorage.setItem('garita_access_logs', JSON.stringify(updated));
    } catch {
      // ignore
    }
    setEntryLogged(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
      data-testid="garita-scanner-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="garita-modal-title"
    >
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* ========================================================= */}
        {/* RUGGED MILITARY TERMINAL HEADER */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400">
              <ScanLine className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <h3 id="garita-modal-title" className="font-serif font-black text-sm sm:text-base tracking-wider uppercase text-amber-300">
                  Control de Acceso Perimetral · Garita Militar
                </h3>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Terminal Táctico de Identificación · {tenantId === 'croe' ? 'C.R.O.E. Sede Cumbayá' : 'Círculo Militar del Ecuador'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowHistory((prev) => !prev)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1.5 border border-slate-700 transition-colors"
              title="Ver bitácora de ingresos registrados"
            >
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Bitácora</span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px] font-mono text-amber-300">
                {accessLogs.length}
              </span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Cerrar Simulador de Garita"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SIMULATION TEST CONTROLS FOR MILITARY DIRECTORS */}
        {/* ========================================================= */}
        <div className="bg-slate-950 px-6 py-2.5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400 font-mono text-[11px] uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            Modo de Prueba para Directores:
          </span>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setActiveSimulationMode('valid');
                executeScan('valid');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                activeSimulationMode === 'valid'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              1. Carné Válido (OK)
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSimulationMode('tampered');
                executeScan('tampered');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                activeSimulationMode === 'tampered'
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              2. Falsificación / Hash Alterado
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSimulationMode('expired');
                executeScan('expired');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                activeSimulationMode === 'expired'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              3. Código Expirado
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveSimulationMode('suspended');
                executeScan('suspended');
              }}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                activeSimulationMode === 'suspended'
                  ? 'bg-purple-600 text-white shadow'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              4. Socio Suspendido
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN TERMINAL BODY */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {showHistory ? (
            /* Log Bitácora View */
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="font-serif font-bold text-amber-400 text-sm uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Registro de Entradas en Garita Hoy
                </h4>
                <button
                  type="button"
                  onClick={() => setShowHistory(false)}
                  className="text-xs text-amber-300 hover:underline"
                >
                  Volver al Escáner
                </button>
              </div>

              {accessLogs.length === 0 ? (
                <p className="text-slate-400 text-xs py-8 text-center font-mono">
                  No hay registros de ingreso en la sesión actual.
                </p>
              ) : (
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {accessLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              log.status === 'AUTORIZADO'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {log.status}
                          </span>
                          <span className="font-bold text-white">
                            {log.socioRank} {log.socioName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Hora: {log.timestamp} · Placa: <span className="text-amber-300">{log.vehiculoPlaca}</span> · Acompañantes: {log.accompanyingCount}
                        </p>
                      </div>

                      <span className="text-[10px] text-slate-500 font-mono">
                        {log.sentryStation}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* SCANNING LASER VIEWPORT ANIMATION */}
              {scanState === 'scanning' && (
                <div className="relative h-44 rounded-2xl bg-black border-2 border-amber-500/60 overflow-hidden flex flex-col items-center justify-center shadow-inner">
                  {/* Grid Lines */}
                  <div
                    className="absolute inset-0 opacity-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        'linear-gradient(rgba(212,175,55,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.4) 1px, transparent 1px)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Sweeping Laser Line */}
                  <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laserSweep" />

                  {/* Reticle Target */}
                  <div className="w-28 h-28 border-2 border-dashed border-amber-400/80 rounded-xl flex items-center justify-center relative">
                    <div className="w-3 h-3 border-t-2 border-l-2 border-amber-400 absolute -top-1 -left-1" />
                    <div className="w-3 h-3 border-t-2 border-r-2 border-amber-400 absolute -top-1 -right-1" />
                    <div className="w-3 h-3 border-b-2 border-l-2 border-amber-400 absolute -bottom-1 -left-1" />
                    <div className="w-3 h-3 border-b-2 border-r-2 border-amber-400 absolute -bottom-1 -right-1" />
                    <ScanLine className="w-10 h-10 text-amber-400 animate-pulse" />
                  </div>

                  <p className="mt-3 font-mono text-xs text-amber-300 tracking-widest uppercase animate-pulse">
                    ESCANEANDO Y VERIFICANDO CRIPTOGRÁFICAMENTE...
                  </p>
                </div>
              )}

              {/* VERIFIED FEEDBACK BANNER */}
              {scanState === 'verified' && (
                <div
                  className="rounded-2xl p-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 border-2 border-emerald-500 shadow-xl space-y-4 animate-scaleUp"
                  data-testid="garita-authorized-banner"
                >
                  <div className="flex items-center justify-between border-b border-emerald-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-2xl bg-emerald-500 text-slate-950 font-black shadow-lg">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <div>
                        <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                          CONTROL DE ACCESO AUTORIZADO
                        </span>
                        <h3 className="font-serif font-black text-xl sm:text-2xl text-white tracking-wide">
                          {getMilitaryGreeting(socio.grado)}
                        </h3>
                      </div>
                    </div>

                    <div className="hidden sm:flex flex-col items-end">
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400 font-mono text-xs font-bold">
                        VÁLIDO · CUOTAS AL DÍA
                      </span>
                      <span className="text-[10px] text-emerald-400/80 font-mono mt-1">
                        FIRMA DIGITAL SHA-256 OK
                      </span>
                    </div>
                  </div>

                  {/* Officer Info & Auto-Barrier Vehicle Plate */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Officer Card */}
                    <div className="md:col-span-2 flex items-center gap-4 p-3 rounded-xl bg-black/40 border border-emerald-800/50">
                      <img
                        src={socio.fotoUrl}
                        alt={socio.apellidos}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-400 shadow shrink-0"
                      />
                      <div className="space-y-0.5 text-xs text-slate-300">
                        <p className="font-serif font-bold text-white text-sm">
                          {socio.grado} {socio.nombres} {socio.apellidos}
                        </p>
                        <p className="font-mono text-emerald-300 text-[11px]">
                          Cód. {socio.codigoMilitar} · C.I. {socio.cedula}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          Arma: <span className="text-white">{socio.arma}</span> · Categoría: <span className="text-white">{socio.categoria}</span>
                        </p>
                      </div>
                    </div>

                    {/* Authorized Vehicle License Plate */}
                    <div className="p-3 rounded-xl bg-black/40 border border-emerald-800/50 flex flex-col justify-between">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
                          <Car className="w-4 h-4 text-emerald-400" />
                          Vehículo Oficial:
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400">AUTORIZADO</span>
                      </div>

                      <div className="my-1 text-center py-1 rounded-lg bg-amber-400 text-slate-950 font-mono font-black text-xl tracking-wider border-2 border-amber-600 shadow">
                        {socio.vehiculoPlaca || 'PDF-4921'}
                      </div>

                      <p className="text-[10px] text-emerald-400 font-mono text-center">
                        Talanquera Vehicular: APERTURA AUTOMÁTICA
                      </p>
                    </div>
                  </div>

                  {/* Dependents Accompanying Entry */}
                  {socio.dependientes && socio.dependientes.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-black/30 border border-emerald-800/40 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-emerald-400" />
                          Seleccionar Cargas Familiares que Ingresan con el Oficial:
                        </span>
                        <span className="text-[10px] text-emerald-400 font-mono">
                          {selectedDependents.length} de {socio.dependientes.length} ingresando
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {socio.dependientes.map((dep) => {
                          const isSelected = selectedDependents.includes(dep.id);
                          return (
                            <button
                              key={dep.id}
                              type="button"
                              onClick={() => toggleDependentSelection(dep.id)}
                              className={`p-2 rounded-lg text-left text-xs flex items-center justify-between border transition-all ${
                                isSelected
                                  ? 'bg-emerald-950/80 border-emerald-500 text-white'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-400'
                              }`}
                            >
                              <div>
                                <p className="font-semibold text-xs leading-tight">{dep.nombres}</p>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {dep.parentesco} · C.I. {dep.cedula}
                                </p>
                              </div>

                              <div
                                className={`w-4 h-4 rounded flex items-center justify-center border ${
                                  isSelected
                                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                                    : 'border-slate-700'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Register entry CTA */}
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-[11px] text-slate-400 font-mono">
                      Puesto 1 · Suboficial de Guardia · Sede {tenantId === 'croe' ? 'Cumbayá' : 'Quito'}
                    </p>

                    <button
                      type="button"
                      onClick={handleLogEntry}
                      disabled={entryLogged}
                      className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
                        entryLogged
                          ? 'bg-emerald-800/80 text-emerald-200 cursor-default'
                          : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg hover:shadow'
                      }`}
                      data-testid="log-entry-btn"
                    >
                      {entryLogged ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Ingreso Registrado en Bitácora</span>
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4" />
                          <span>Registrar Novedad / Abrir Garita</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* REJECTED FEEDBACK BANNER */}
              {scanState === 'rejected' && verificationResult && (
                <div
                  className="rounded-2xl p-5 bg-gradient-to-br from-red-950 via-red-900 to-slate-950 border-2 border-red-500 shadow-xl space-y-4 animate-scaleUp"
                  data-testid="garita-rejected-banner"
                >
                  <div className="flex items-center gap-3 border-b border-red-800/80 pb-3">
                    <div className="p-2.5 rounded-2xl bg-red-600 text-white font-black shadow-lg">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-widest text-red-400 font-bold block">
                        ACCESO DENEGADO // ALERTA EN PUESTO DE CONTROL
                      </span>
                      <h3 className="font-serif font-black text-xl text-white tracking-wide">
                        {verificationResult.status === 'INVALID_SIGNATURE'
                          ? 'CÓDIGO ALTERADO / FIRMA INVÁLIDA'
                          : verificationResult.status === 'EXPIRED_CODE'
                          ? 'CÓDIGO QR CADUCADO'
                          : verificationResult.status === 'UNAUTHORIZED_MEMBER_STATUS'
                          ? 'SOCIO NO AUTORIZADO'
                          : 'ERROR DE LECTURA'}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-red-800 text-xs text-red-200 space-y-2">
                    <p className="font-semibold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      {(verificationResult as any).reason || 'Error de validación perimetral'}
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Protocolo de seguridad militar: Notifique al oficial titular que debe ingresar a su portal web institucional y presentar su carné digital dinámico vigente.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => executeScan('valid')}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700"
                    >
                      Reintentar con Carné Válido
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ========================================================= */}
        {/* FOOTER ACTIONS */}
        {/* ========================================================= */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Encriptación SHA-256 Activa · Modo Autónomo Offline</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors"
          >
            Cerrar Terminal
          </button>
        </div>
      </div>
    </div>
  );
};
