import { describe, it, expect } from 'vitest';
import {
  generateSignedQrPayload,
  verifyQrOffline,
  calculateQrHash,
  QrPayloadSchema,
} from '../helpers/qrVerifier';

describe('Tier 2: Boundary Domain 2.6 — QR Code Payload Validation, Tamper Detection & Malformed Data', () => {

  const validPayloadStr = generateSignedQrPayload({
    memberId: 'SOC-CROE-0094',
    cedula: '1714859621',
    rank: 'CRNL. DE E.M.',
    fullName: 'CARLOS ALBERTO MENDOZA SILVA',
    tenant: 'croe',
    status: 'ACTIVO',
  });

  it('T2-QRP-01: JSON Structural Schema Validation of QR Payload — enforces all required keys', () => {
    const parsed: QrPayloadSchema = JSON.parse(validPayloadStr);
    expect(parsed.version).toBe('1.0');
    expect(parsed.memberId).toBe('SOC-CROE-0094');
    expect(parsed.cedula).toBe('1714859621');
    expect(parsed.rank).toBe('CRNL. DE E.M.');
    expect(parsed.tenant).toBe('croe');
    expect(parsed.status).toBe('ACTIVO');
    expect(parsed.hash).toBeDefined();
    expect(typeof parsed.issueTimestamp).toBe('number');
  });

  it('T2-QRP-02: Cryptographic Checksum / Hash Verification — verifies valid SHA-256 integrity', () => {
    const result = verifyQrOffline(validPayloadStr);
    expect(result.status).toBe('AUTHORIZED');
    if (result.status === 'AUTHORIZED') {
      expect(result.memberRank).toBe('CRNL. DE E.M.');
      expect(result.memberName).toBe('CARLOS ALBERTO MENDOZA SILVA');
    }
  });

  it('T2-QRP-03: Tampered Payload Detection — detects when payload content was modified after signing', () => {
    const parsed: QrPayloadSchema = JSON.parse(validPayloadStr);

    // Attacker modifies status from ACTIVO to EXPULSADO without recalculating hash
    (parsed as any).status = 'EXPULSADO';
    const tamperedPayloadStr = JSON.stringify(parsed);

    const result = verifyQrOffline(tamperedPayloadStr);
    expect(result.status).toBe('INVALID_SIGNATURE');
    if (result.status === 'INVALID_SIGNATURE') {
      expect(result.reason).toMatch(/Firma criptográfica inválida/i);
    }
  });

  it('T2-QRP-04: Expired Timestamp Verification — rejects dynamic QR codes older than 15 minutes', () => {
    const pastTimestamp = Date.now() - 20 * 60 * 1000; // 20 minutes ago
    const expiredPayloadStr = generateSignedQrPayload({
      memberId: 'SOC-CROE-0094',
      cedula: '1714859621',
      rank: 'CRNL. DE E.M.',
      fullName: 'CARLOS ALBERTO MENDOZA SILVA',
      tenant: 'croe',
      status: 'ACTIVO',
      issueTimestamp: pastTimestamp,
    });

    const result = verifyQrOffline(expiredPayloadStr);
    expect(result.status).toBe('EXPIRED_CODE');
    if (result.status === 'EXPIRED_CODE') {
      expect(result.reason).toMatch(/caducado/i);
    }
  });

  it('T2-QRP-05: Non-JSON / Corrupted QR String Handling — returns friendly error on garbage input', () => {
    const garbageInputs = [
      'NOT_A_JSON_STRING',
      '<<<XML_MALFORMED>>>',
      '{"incompleteJson": ',
      '',
    ];

    for (const input of garbageInputs) {
      const result = verifyQrOffline(input);
      expect(result.status).toBe('MALFORMED_FORMAT');
      if (result.status === 'MALFORMED_FORMAT') {
        expect(result.reason).toBeTruthy();
      }
    }
  });
});
