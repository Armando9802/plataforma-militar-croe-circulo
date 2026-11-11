import crypto from 'node:crypto';

export interface QrPayloadSchema {
  version: string;
  memberId: string;
  cedula: string;
  rank: string;
  fullName: string;
  tenant: 'croe' | 'circulo-militar';
  status: 'ACTIVO' | 'VITALICIO' | 'SUSPENDIDO' | 'EXPULSADO';
  issueTimestamp: number;
  hash: string;
}

const QR_SECRET_SALT = 'FFAA_ECUADOR_MILITARY_SECURITY_SALT_2026';

/**
 * Calculates SHA-256 anti-tamper hash over canonical member data string
 */
export function calculateQrHash(data: Omit<QrPayloadSchema, 'hash'>): string {
  const canonicalString = `${data.version}|${data.memberId}|${data.cedula}|${data.rank}|${data.fullName}|${data.tenant}|${data.status}|${data.issueTimestamp}|${QR_SECRET_SALT}`;
  return crypto.createHash('sha256').update(canonicalString).digest('hex');
}

/**
 * Creates a signed cryptographic QR JSON payload string
 */
export function generateSignedQrPayload(
  params: Omit<QrPayloadSchema, 'hash' | 'version' | 'issueTimestamp'> & {
    issueTimestamp?: number;
    version?: string;
  }
): string {
  const version = params.version || '1.0';
  const issueTimestamp = params.issueTimestamp ?? Date.now();

  const unsignedData: Omit<QrPayloadSchema, 'hash'> = {
    version,
    memberId: params.memberId,
    cedula: params.cedula,
    rank: params.rank,
    fullName: params.fullName,
    tenant: params.tenant,
    status: params.status,
    issueTimestamp,
  };

  const hash = calculateQrHash(unsignedData);

  const signedPayload: QrPayloadSchema = {
    ...unsignedData,
    hash,
  };

  return JSON.stringify(signedPayload);
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
