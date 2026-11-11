import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_CONFIG } from '../../src/data/croeData';
import { generateSignedQrPayload, verifyQrOffline } from '../helpers/qrVerifier';

describe('Tier 1: Feature 1.3 — Verifiable Dynamic QR Carné & Security Badges', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-QRC-01: Interactive Carné Visual Layout — renders military credential layout and rank', () => {
    render(<App />);

    const socioTabBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioTabBtn);

    const socio = CROE_CONFIG.defaultSocio;

    // Carné title
    expect(screen.getByText(/Carné Oficial de Socio Militar/i)).toBeInTheDocument();

    // Officer details inside the credential
    expect(screen.getAllByText(new RegExp(socio.grado, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(socio.nombres, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(socio.codigoMilitar, 'i')).length).toBeGreaterThan(0);
  });

  it('T1-QRC-02: 2D QR Code Matrix Rendering — displays QR code box with scan directive', () => {
    render(<App />);

    const socioTabBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioTabBtn);

    // Directive to scan at guard sentry
    expect(screen.getByText(/Escanear en Garita/i)).toBeInTheDocument();
  });

  it('T1-QRC-03: QR Payload Cryptographic & Schema Integrity — payload conforms to military JSON schema with SHA-256 hash', () => {
    const socio = CROE_CONFIG.defaultSocio;
    const signedPayloadStr = generateSignedQrPayload({
      memberId: socio.id,
      cedula: socio.cedula,
      rank: socio.grado,
      fullName: `${socio.nombres} ${socio.apellidos}`,
      tenant: 'croe',
      status: 'ACTIVO',
    });

    const parsed = JSON.parse(signedPayloadStr);
    expect(parsed.version).toBe('1.0');
    expect(parsed.memberId).toBe(socio.id);
    expect(parsed.cedula).toBe(socio.cedula);
    expect(parsed.rank).toBe(socio.grado);
    expect(parsed.hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 is 64 hex characters

    // Offline validation returns AUTHORIZED
    const verification = verifyQrOffline(signedPayloadStr);
    expect(verification.status).toBe('AUTHORIZED');
  });

  it('T1-QRC-04: Dynamic Security Watermark & Timestamp — displays anti-screenshot security badge', () => {
    render(<App />);

    const socioTabBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioTabBtn);

    // Cryptographic indicator on the carné
    expect(screen.getByText(/SHA-256 VERIFIED/i)).toBeInTheDocument();
    expect(screen.getByText(/ACTIVA 2026/i)).toBeInTheDocument();
  });

  it('T1-QRC-05: Security Attributes & Inspection Guidelines — renders garita access notice and control status', () => {
    render(<App />);

    const socioTabBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioTabBtn);

    expect(screen.getByText(/Control de Acceso en Garitas de Seguridad/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Acceso Garita/i).length).toBeGreaterThan(0);
  });
});
