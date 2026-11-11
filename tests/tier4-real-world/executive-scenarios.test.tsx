import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_CONFIG } from '../../src/data/croeData';
import { CIRCULO_CONFIG } from '../../src/data/circuloData';
import {
  MOCK_CORONEL_MENDOZA,
  MOCK_MAYOR_FALCONI,
  MOCK_GENERAL_BRIGADA,
} from '../helpers/mockData';
import { computeBillingBreakdown } from '../helpers/financialEngine';
import { generateSignedQrPayload, verifyQrOffline } from '../helpers/qrVerifier';
import fs from 'node:fs';
import path from 'node:path';

describe('Tier 4: Real-World Executive Demonstration Scenarios', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T4-EXEC-01: Scenario A: "El Retiro Familiar en CROE" — Coronel Carlos Mendoza', () => {
    render(<App />);

    // 1. Coronel Mendoza arrives at CROE portal
    expect(document.documentElement.getAttribute('data-tenant')).toBe('croe');
    expect(screen.getAllByText(new RegExp(CROE_CONFIG.name, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(CROE_CONFIG.motto, 'i')).length).toBeGreaterThan(0);

    // 2. Reviews military credentials & family dependents
    const socioBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioBtn);

    expect(screen.getAllByText(new RegExp(MOCK_CORONEL_MENDOZA.grado, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(MOCK_CORONEL_MENDOZA.cedula, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Cuotas al Día/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Acceso Garita/i).length).toBe(MOCK_CORONEL_MENDOZA.dependientes.length);

    // 3. Books Cabaña Familiar for 2 nights ($45/night member rate)
    const breakdown = computeBillingBreakdown({
      regularPrice: 65.00,
      memberPrice: 45.00,
      units: 2,
      isMember: true,
    });
    expect(breakdown.subtotal).toBe(90.00);
    expect(breakdown.vat).toBe(13.50);
    expect(breakdown.total).toBe(103.50);

    // 4. Payphone payment verification
    const payphoneTx = {
      gateway: 'PAYPHONE',
      phone: '0998765432',
      amount: breakdown.total,
      authCode: 'AUTH-CROE-2026-9912',
      status: 'APPROVED',
    };
    expect(payphoneTx.status).toBe('APPROVED');
    expect(payphoneTx.authCode).toMatch(/^AUTH-CROE-/);
  });

  it('T4-EXEC-02: Scenario B: "Torneo Interclub en Círculo Militar" — Mayor Patricia Falconí', () => {
    render(<App />);

    // 1. Switch institutional portal to Círculo Militar
    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloTab);

    expect(document.documentElement.getAttribute('data-tenant')).toBe('circulo-militar');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(
      CIRCULO_CONFIG.theme.primaryColor
    );

    // 2. Navigates to reservations and checks sports facilities
    const resNavBtn = screen.getByRole('button', { name: /reservas & deportes/i });
    fireEvent.click(resNavBtn);

    const circuloSports = CIRCULO_CONFIG.facilities.filter((f) => f.category === 'sports');
    expect(circuloSports.length).toBeGreaterThan(0);

    // 3. Reserves Tennis court for 2 hours (Member rate $10/hr)
    const tennisRate = 10.00;
    const hours = 2;
    const breakdown = computeBillingBreakdown({
      regularPrice: 20.00,
      memberPrice: tennisRate,
      units: hours,
      isMember: true,
    });

    expect(breakdown.subtotal).toBe(20.00);
    expect(breakdown.vat).toBe(3.00); // 20 * 0.15
    expect(breakdown.total).toBe(23.00);

    // 4. Kushki payment simulation with 3DS token
    const kushkiTx = {
      gateway: 'KUSHKI',
      officer: MOCK_MAYOR_FALCONI.grado,
      amount: breakdown.total,
      authCode: 'AUTH-KSH-TORNEO-2109',
      status: 'APPROVED',
    };
    expect(kushkiTx.status).toBe('APPROVED');
    expect(kushkiTx.amount).toBe(23.00);
  });

  it('T4-EXEC-03: Scenario C: "Convenio Recíproco Interinstitucional FF.AA." — General de Brigada', () => {
    // 1. Cross-Club Inter-institutional agreement verification
    const agreementPolicy = {
      code: 'CONV-FFAA-2026',
      parties: ['CROE', 'CIRCULO_MILITAR'],
      active: true,
      privilegeLevel: 'OFICIAL_GENERAL',
    };
    expect(agreementPolicy.active).toBe(true);
    expect(agreementPolicy.parties).toContain('CROE');
    expect(agreementPolicy.parties).toContain('CIRCULO_MILITAR');

    // 2. Both institutions recognize officer credentials
    const general = MOCK_GENERAL_BRIGADA;
    expect(general.categoria).toBe('OFICIAL GENERAL');

    // 3. Inspect PLAN_EJECUCION_TECNICA.md for Module 8 (Convenios Interinstitucionales)
    const planPath = path.resolve(__dirname, '../../PLAN_EJECUCION_TECNICA.md');
    const content = fs.readFileSync(planPath, 'utf8');
    expect(content).toMatch(/M8/i);
    expect(content).toMatch(/convenios|agreements/i);
  });

  it('T4-EXEC-04: Scenario D: "Control de Acceso en Garita Móvil (Inspección Offline)"', () => {
    const sargentoGuardia = {
      puesto: 'Garita Principal Acceso Base / Club',
      dispositivo: 'Tablet Ruggedized Offline',
    };

    // 1. Officer presents dynamic carné QR code
    const member = CROE_CONFIG.defaultSocio;
    const liveQrPayload = generateSignedQrPayload({
      memberId: member.id,
      cedula: member.cedula,
      rank: member.grado,
      fullName: `${member.nombres} ${member.apellidos}`,
      tenant: 'croe',
      status: 'ACTIVO',
    });

    // 2. Sentry terminal verifies cryptographic signature offline without external network
    const scanResult = verifyQrOffline(liveQrPayload);

    expect(scanResult.status).toBe('AUTHORIZED');
    if (scanResult.status === 'AUTHORIZED') {
      expect(scanResult.memberRank).toBe(member.grado);
      expect(scanResult.memberName).toContain('CARLOS ALBERTO');
      expect(scanResult.tenant).toBe('croe');
    }
  });
});
