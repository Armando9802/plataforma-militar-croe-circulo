import React, { useState, useEffect, useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { SocioProfile } from '../../types/socio';
import { ShieldCheck, Copy, Check, RefreshCw, Radio } from 'lucide-react';

export interface QrPayloadSchema {
  version: string;
  memberId: string;
  cedula: string;
  rank: string;
  fullName: string;
  tenant: 'croe' | 'circulo-militar';
  status: 'ACTIVO' | 'VITALICIO' | 'HONORARIO' | 'SUSPENDIDO' | 'EXPULSADO';
  issueTimestamp: number;
  hash: string;
  // Spanish aliases for system interoperability
  institution?: string;
  socioCode?: string;
  rango?: string;
  nombres?: string;
  categoria?: string;
  vigencia?: string;
  seguridadHash?: string;
  timestamp?: string;
}

export const QR_SECRET_SALT = 'FFAA_ECUADOR_MILITARY_SECURITY_SALT_2026';

/**
 * Pure TypeScript SHA-256 standard implementation (FIPS 180-4).
 * Runs synchronously in all browser and Node environments with 0 external dependencies.
 */
export function sha256Pure(ascii: string): string {
  function rightRotate(value: number, amount: number): number {
    return (value >>> amount) | (value << (32 - amount));
  }

  const utf8: number[] = [];
  for (let i = 0; i < ascii.length; i++) {
    let charcode = ascii.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      // surrogate pair
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (ascii.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f)
      );
    }
  }

  const asciiBitLength = utf8.length * 8;
  const words: number[] = [];
  for (let i = 0; i < utf8.length; i++) {
    words[i >> 2] |= utf8[i] << ((3 - (i % 4)) * 8);
  }
  words[utf8.length >> 2] |= 0x80 << ((3 - (utf8.length % 4)) * 8);
  words[(((utf8.length + 8) >> 6) << 4) + 15] = asciiBitLength;

  let h0 = 0x6a09e667,
    h1 = 0xbb67ae85,
    h2 = 0x3c6ef372,
    h3 = 0xa54ff53a,
    h4 = 0x510e527f,
    h5 = 0x9b05688c,
    h6 = 0x1f83d9ab,
    h7 = 0x5be0cd19;

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  for (let i = 0; i < words.length; i += 16) {
    const w: number[] = [];
    for (let j = 0; j < 16; j++) w[j] = words[i + j] || 0;
    for (let j = 16; j < 64; j++) {
      const s0 = rightRotate(w[j - 15], 7) ^ rightRotate(w[j - 15], 18) ^ (w[j - 15] >>> 3);
      const s1 = rightRotate(w[j - 2], 17) ^ rightRotate(w[j - 2], 19) ^ (w[j - 2] >>> 10);
      w[j] = (w[j - 16] + s0 + w[j - 7] + s1) | 0;
    }
    let a = h0,
      b = h1,
      c = h2,
      d = h3,
      e = h4,
      f = h5,
      g = h6,
      h = h7;

    for (let j = 0; j < 64; j++) {
      const S1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[j] + w[j]) | 0;
      const S0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;
      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }
    h0 = (h0 + a) | 0;
    h1 = (h1 + b) | 0;
    h2 = (h2 + c) | 0;
    h3 = (h3 + d) | 0;
    h4 = (h4 + e) | 0;
    h5 = (h5 + f) | 0;
    h6 = (h6 + g) | 0;
    h7 = (h7 + h) | 0;
  }

  return [h0, h1, h2, h3, h4, h5, h6, h7]
    .map((x) => (x >>> 0).toString(16).padStart(8, '0'))
    .join('');
}

/**
 * Calculates SHA-256 anti-tamper hash over canonical member data string
 */
export function calculateQrHash(data: Omit<QrPayloadSchema, 'hash' | 'institution' | 'socioCode' | 'rango' | 'nombres' | 'categoria' | 'vigencia' | 'seguridadHash' | 'timestamp'>): string {
  const canonicalString = `${data.version}|${data.memberId}|${data.cedula}|${data.rank}|${data.fullName}|${data.tenant}|${data.status}|${data.issueTimestamp}|${QR_SECRET_SALT}`;
  return sha256Pure(canonicalString);
}

/**
 * Creates a signed cryptographic QR JSON payload string
 */
export function generateSignedQrPayload(
  params: {
    memberId: string;
    cedula: string;
    rank: string;
    fullName: string;
    tenant: 'croe' | 'circulo-militar';
    status: 'ACTIVO' | 'VITALICIO' | 'HONORARIO' | 'SUSPENDIDO' | 'EXPULSADO';
    category?: string;
    issueTimestamp?: number;
    version?: string;
  }
): string {
  const version = params.version || '1.0';
  const issueTimestamp = params.issueTimestamp ?? Date.now();

  const canonical = {
    version,
    memberId: params.memberId,
    cedula: params.cedula,
    rank: params.rank,
    fullName: params.fullName,
    tenant: params.tenant,
    status: params.status,
    issueTimestamp,
  };

  const hash = calculateQrHash(canonical);

  const payload: QrPayloadSchema = {
    ...canonical,
    hash,
    // Spanish aliases for sentry compatibility
    institution: params.tenant === 'croe' ? 'C.R.O.E.' : 'Círculo Militar del Ecuador',
    socioCode: params.memberId,
    rango: params.rank,
    nombres: params.fullName,
    categoria: params.category || 'OFICIAL MILITAR',
    vigencia: '2026-12-31',
    seguridadHash: hash,
    timestamp: new Date(issueTimestamp).toISOString(),
  };

  return JSON.stringify(payload);
}

export type QrVerificationResult =
  | { status: 'AUTHORIZED'; memberRank: string; memberName: string; tenant: string; payload: QrPayloadSchema }
  | { status: 'INVALID_SIGNATURE'; reason: string }
  | { status: 'EXPIRED_CODE'; reason: string }
  | { status: 'UNAUTHORIZED_MEMBER_STATUS'; reason: string }
  | { status: 'MALFORMED_FORMAT'; reason: string };

/**
 * Validates a scanned QR string in the guard sentry terminal
 */
export function verifyQrOffline(
  rawPayload: string,
  options?: { maxAgeMs?: number; currentTimeMs?: number }
): QrVerificationResult {
  const maxAgeMs = options?.maxAgeMs ?? 15 * 60 * 1000; // 15 minutes validity
  const now = options?.currentTimeMs ?? Date.now();

  let parsed: any;
  try {
    parsed = JSON.parse(rawPayload);
  } catch {
    return {
      status: 'MALFORMED_FORMAT',
      reason: 'Formato de código no reconocido. La cadena no es un JSON válido.',
    };
  }

  // Schema validation
  if (
    !parsed ||
    typeof parsed !== 'object' ||
    typeof parsed.memberId !== 'string' ||
    typeof parsed.cedula !== 'string' ||
    typeof parsed.rank !== 'string' ||
    typeof parsed.hash !== 'string' ||
    typeof parsed.issueTimestamp !== 'number'
  ) {
    return {
      status: 'MALFORMED_FORMAT',
      reason: 'Estructura de payload QR inválida: Faltan campos requeridos.',
    };
  }

  // Tamper detection: verify hash
  const expectedHash = calculateQrHash({
    version: parsed.version || '1.0',
    memberId: parsed.memberId,
    cedula: parsed.cedula,
    rank: parsed.rank,
    fullName: parsed.fullName,
    tenant: parsed.tenant,
    status: parsed.status,
    issueTimestamp: parsed.issueTimestamp,
  });

  if (parsed.hash !== expectedHash) {
    return {
      status: 'INVALID_SIGNATURE',
      reason: 'Firma criptográfica inválida. Se detectó manipulación o alteración de datos.',
    };
  }

  // Check expiration
  const age = now - parsed.issueTimestamp;
  if (age > maxAgeMs) {
    return {
      status: 'EXPIRED_CODE',
      reason: 'Código QR caducado. Por favor actualice su carné digital dinámico.',
    };
  }

  // Check military standing status
  if (parsed.status !== 'ACTIVO' && parsed.status !== 'VITALICIO') {
    return {
      status: 'UNAUTHORIZED_MEMBER_STATUS',
      reason: `Socio en estado ${parsed.status}. Acceso no autorizado por Bienestar Militar.`,
    };
  }

  return {
    status: 'AUTHORIZED',
    memberRank: parsed.rank,
    memberName: parsed.fullName,
    tenant: parsed.tenant,
    payload: parsed as QrPayloadSchema,
  };
}

interface VerifiableQRCodeProps {
  socio: SocioProfile;
  tenantId: 'croe' | 'circulo-militar';
  size?: number;
  showDetails?: boolean;
  onScanSimulation?: () => void;
  className?: string;
}

export const VerifiableQRCode: React.FC<VerifiableQRCodeProps> = ({
  socio,
  tenantId,
  size = 180,
  showDetails = true,
  onScanSimulation,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(900); // 15 min countdown
  const [issueTimestamp, setIssueTimestamp] = useState<number>(Date.now());
  const [pulseTick, setPulseTick] = useState(0);

  // Generate cryptographic signed payload
  const qrJsonPayload = useMemo(() => {
    return generateSignedQrPayload({
      memberId: socio.codigoMilitar,
      cedula: socio.cedula,
      rank: socio.grado,
      fullName: `${socio.nombres} ${socio.apellidos}`,
      tenant: tenantId,
      status: socio.estadoSocio,
      category: socio.categoria,
      issueTimestamp,
      version: '1.0',
    });
  }, [socio, tenantId, issueTimestamp]);

  // Parse for preview data
  const parsedData: QrPayloadSchema = useMemo(() => {
    try {
      return JSON.parse(qrJsonPayload);
    } catch {
      return {} as QrPayloadSchema;
    }
  }, [qrJsonPayload]);

  // Live anti-screenshot clock ticking effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseTick((prev) => (prev + 1) % 60);
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          // Auto-renew token every 15 min
          setIssueTimestamp(Date.now());
          return 900;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrJsonPayload).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleRegenerate = () => {
    setIssueTimestamp(Date.now());
    setSecondsRemaining(900);
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={`flex flex-col items-center p-4 bg-white rounded-2xl border border-slate-200/90 shadow-sm ${className}`}
      data-testid="verifiable-qr-container"
    >
      {/* Dynamic Security Pulse Banner */}
      <div className="w-full flex items-center justify-between gap-2 px-3 py-1.5 mb-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="font-semibold text-emerald-900 text-[11px] uppercase tracking-wide">
            Anti-Captura Activo
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-emerald-800 font-mono text-[11px] font-bold">
          <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
          <span>{formatCountdown(secondsRemaining)}</span>
        </div>
      </div>

      {/* High-Contrast SVG QR Display */}
      <div
        className="p-3 bg-white rounded-xl border-2 border-amber-400 shadow-inner flex items-center justify-center relative group"
        data-testid="qr-code-svg-wrapper"
      >
        <QRCodeSVG
          value={qrJsonPayload}
          size={size}
          level="H"
          includeMargin={true}
          className="rounded-lg"
          aria-label="Código QR Dinámico Verificable"
        />

        {/* Dynamic Watermark Indicator */}
        <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm text-[9px] font-mono font-bold text-amber-300 px-1.5 py-0.5 rounded border border-amber-400/50 pointer-events-none">
          SEC-{pulseTick.toString().padStart(2, '0')}
        </div>
      </div>

      {/* Security Hash Footprint */}
      <div className="w-full mt-3 text-center">
        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          Firma Criptográfica SHA-256
        </p>
        <p className="font-mono text-[10px] text-slate-700 truncate max-w-[220px] mx-auto bg-slate-100 px-2 py-0.5 rounded mt-0.5 border border-slate-200">
          {parsedData.hash || 'Calculando firma digital...'}
        </p>
      </div>

      {showDetails && (
        <div className="w-full mt-4 pt-3 border-t border-slate-100 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-600">
            <span>Socio Titular:</span>
            <span className="font-semibold text-slate-800 text-right truncate max-w-[140px]">
              {socio.grado} {socio.apellidos}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Código Militar:</span>
            <span className="font-mono font-bold text-slate-800">{socio.codigoMilitar}</span>
          </div>

          <div className="flex items-center justify-between text-slate-600">
            <span>Estado Militar:</span>
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
              <ShieldCheck className="w-3.5 h-3.5" />
              {socio.estadoSocio}
            </span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
              title="Copiar JSON Criptográfico firmado"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copiado</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-600" />
                  <span>Copiar JSON</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleRegenerate}
              className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-colors border border-slate-300"
              title="Regenerar Token Dinámico"
            >
              <RefreshCw className="w-3.5 h-3.5 text-slate-600" />
              <span>Actualizar</span>
            </button>
          </div>

          {onScanSimulation && (
            <button
              type="button"
              onClick={onScanSimulation}
              className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:shadow"
              data-testid="simulate-scan-btn"
            >
              <ShieldCheck className="w-4 h-4 text-slate-950" />
              <span>Simular Escaneo en Garita</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
