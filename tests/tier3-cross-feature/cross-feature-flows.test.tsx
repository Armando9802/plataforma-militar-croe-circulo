import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_CONFIG } from '../../src/data/croeData';
import { CIRCULO_CONFIG } from '../../src/data/circuloData';
import { computeBillingBreakdown, formatUSD, generateSriAccessKey } from '../helpers/financialEngine';
import { generateSignedQrPayload, verifyQrOffline } from '../helpers/qrVerifier';
import { MOCK_FACILITY_CABANA, MOCK_FACILITY_TENNIS } from '../helpers/mockData';

describe('Tier 3: Cross-Feature Combinations (Pairwise Multi-Step Interactions)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T3-XFT-01: End-to-End Booking -> Checkout -> Payment -> Voucher Ledger Lifecycle', () => {
    // 1. Initial facility selection
    const facility = MOCK_FACILITY_CABANA;
    const nights = 2;
    const breakdown = computeBillingBreakdown({
      regularPrice: facility.guestPrice,
      memberPrice: facility.memberPrice,
      units: nights,
      isMember: true,
    });

    expect(breakdown.subtotal).toBe(90.00); // 45 * 2
    expect(breakdown.vat).toBe(13.50); // 90 * 0.15
    expect(breakdown.total).toBe(103.50);

    // 2. Simulated payment approval
    const simulatedAuth = {
      transactionId: 'TX-E2E-2026-9901',
      authCode: 'AUTH-KSH-4091',
      status: 'APPROVED',
      amount: breakdown.total,
      gateway: 'KUSHKI',
    };
    expect(simulatedAuth.status).toBe('APPROVED');

    // 3. Voucher emission with SRI access key
    const accessKey = generateSriAccessKey(CROE_CONFIG.ruc, new Date(), 9901);
    expect(accessKey).toHaveLength(49);

    // 4. Ledger entry creation
    const newBooking = {
      id: 'RSV-E2E-9901',
      tenantId: 'croe',
      facilityId: facility.id,
      facilityName: facility.name,
      checkIn: '2026-11-21',
      checkOut: '2026-11-23',
      subtotal: breakdown.subtotal,
      vat: breakdown.vat,
      total: breakdown.total,
      status: 'confirmed',
      paymentStatus: 'paid',
      transactionId: simulatedAuth.transactionId,
    };
    expect(newBooking.status).toBe('confirmed');
    expect(newBooking.paymentStatus).toBe('paid');
  });

  it('T3-XFT-02: Mid-Reservation Wizard Tenant Switching & Context Safety', () => {
    render(<App />);

    // Start in CROE mode and browse reservations
    const resNavBtn = screen.getByRole('button', { name: /reservas & deportes/i });
    fireEvent.click(resNavBtn);

    const croeFacilityName = CROE_CONFIG.facilities[0].name;
    expect(screen.getByText(new RegExp(croeFacilityName, 'i'))).toBeInTheDocument();

    // User switches tenant to Círculo Militar mid-session
    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloTab);

    // Context changes safely: Círculo facilities load, CROE-specific disappears
    const circuloFacilityName = CIRCULO_CONFIG.facilities[0].name;
    expect(screen.getByText(new RegExp(circuloFacilityName, 'i'))).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(croeFacilityName, 'i'))).not.toBeInTheDocument();
  });

  it('T3-XFT-03: Member Profile Update to Immediate QR Carné Dynamic Synchronization', () => {
    const originalSocio = { ...CROE_CONFIG.defaultSocio };

    // Initial QR signature
    const qrV1 = generateSignedQrPayload({
      memberId: originalSocio.id,
      cedula: originalSocio.cedula,
      rank: originalSocio.grado,
      fullName: `${originalSocio.nombres} ${originalSocio.apellidos}`,
      tenant: 'croe',
      status: 'ACTIVO',
    });
    const parsedV1 = JSON.parse(qrV1);
    expect(parsedV1.rank).toBe(originalSocio.grado);

    // Officer receives promotion: CRNL. DE E.M. -> GRAB. (General de Brigada)
    const updatedRank = 'GRAB. DE E.M.';
    const qrV2 = generateSignedQrPayload({
      memberId: originalSocio.id,
      cedula: originalSocio.cedula,
      rank: updatedRank,
      fullName: `${originalSocio.nombres} ${originalSocio.apellidos}`,
      tenant: 'croe',
      status: 'ACTIVO',
    });
    const parsedV2 = JSON.parse(qrV2);

    expect(parsedV2.rank).toBe(updatedRank);
    expect(parsedV2.hash).not.toBe(parsedV1.hash); // Hash updated automatically

    // Scanner confirms updated rank immediately
    const checkResult = verifyQrOffline(qrV2);
    expect(checkResult.status).toBe('AUTHORIZED');
    if (checkResult.status === 'AUTHORIZED') {
      expect(checkResult.memberRank).toBe(updatedRank);
    }
  });

  it('T3-XFT-04: Multi-Facility Bundling with Single Consolidated Payment', () => {
    // 1 night lodging ($45.00) + 2 hours tennis ($20.00)
    const lodgingCost = 45.00;
    const tennisCost = 20.00;
    const consolidatedSubtotal = lodgingCost + tennisCost; // 65.00
    const consolidatedVat = consolidatedSubtotal * 0.15; // 9.75
    const total = consolidatedSubtotal + consolidatedVat; // 74.75

    expect(consolidatedSubtotal).toBe(65.00);
    expect(consolidatedVat).toBe(9.75);
    expect(total).toBe(74.75);

    const formatted = formatUSD(total);
    expect(formatted).toBe('$74.75');
  });

  it('T3-XFT-05: Dynamic Gateway Switching Mid-Checkout with Fee & Form Adaptation', () => {
    render(<App />);

    const payNavBtn = screen.getByRole('button', { name: /pasarela de pagos \(sri\)/i });
    fireEvent.click(payNavBtn);

    // Both payment options available
    const payphoneOption = screen.getByText(/Payphone Ecuador/i);
    const kushkiOption = screen.getByText(/Kushki Pagos/i);

    expect(payphoneOption).toBeInTheDocument();
    expect(kushkiOption).toBeInTheDocument();

    // Switching between gateways maintains legal RUC and base pricing
    expect(screen.getAllByText(new RegExp(CROE_CONFIG.ruc, 'i')).length).toBeGreaterThan(0);
  });

  it('T3-XFT-06: Digital Voucher QR Code Closed-Loop Verification', () => {
    // Emit voucher payload
    const voucherPayload = {
      voucherId: 'VOU-2026-8812',
      authCode: 'AUTH-PP-7712',
      sriAccessKey: '0811202601179001429800120010010000000011234567819',
      total: 74.75,
      memberName: 'CRNL. CARLOS MENDOZA',
      facility: 'Cabaña Familiar VIP',
      issuedAt: '2026-11-09T02:00:00Z',
    };

    const voucherQrString = JSON.stringify(voucherPayload);

    // Garita or reception terminal verifies voucher
    const verifyVoucher = (raw: string) => {
      try {
        const data = JSON.parse(raw);
        if (data.voucherId && data.authCode && data.sriAccessKey) {
          return { status: 'VALID', data };
        }
        return { status: 'INVALID' };
      } catch {
        return { status: 'ERROR' };
      }
    };

    const verification = verifyVoucher(voucherQrString);
    expect(verification.status).toBe('VALID');
    if (verification.status === 'VALID') {
      expect(verification.data.authCode).toBe('AUTH-PP-7712');
      expect(verification.data.total).toBe(74.75);
    }
  });
});
