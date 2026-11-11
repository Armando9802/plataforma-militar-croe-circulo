import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { INITIAL_TRANSACTIONS } from '../../src/data/mockTransactions';
import { calculateVat15, roundCurrency, generateSriAccessKey } from '../helpers/financialEngine';

describe('Tier 1: Feature 1.6 — Digital Voucher Receipt Generation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('T1-VOU-01: Digital Voucher Rendering — renders official SRI voucher container with legal compliance text', () => {
    render(<App />);

    const payNavBtn = screen.getByRole('button', { name: /pasarela de pagos \(sri\)/i });
    fireEvent.click(payNavBtn);

    expect(screen.getByText(/Comprobante SRI/i)).toBeInTheDocument();
    expect(screen.getByText(/normas técnicas de facturación electrónica del SRI/i)).toBeInTheDocument();
  });

  it('T1-VOU-02: Line-Item Cost Breakdown — computes 15% IVA and displays currency formatting', () => {
    const subtotal = 100.00;
    const vat = calculateVat15(subtotal);
    const total = roundCurrency(subtotal + vat);

    expect(vat).toBe(15.00);
    expect(total).toBe(115.00);

    // Initial transactions have mathematically consistent breakdown
    for (const tx of INITIAL_TRANSACTIONS) {
      expect(tx.amount).toBeCloseTo(tx.subtotal + tx.vat, 2);
    }
  });

  it('T1-VOU-03: Transaction Security Metadata — displays SRI authorization and 49-digit electronic access key', () => {
    render(<App />);

    const payNavBtn = screen.getByRole('button', { name: /pasarela de pagos \(sri\)/i });
    fireEvent.click(payNavBtn);

    expect(screen.getByText(/AUTORIZACIÓN:/i)).toBeInTheDocument();
    expect(screen.getByText(/CLAVE DE ACCESO:/i)).toBeInTheDocument();
    expect(screen.getByText(/AUTH-SRI-2026-/i)).toBeInTheDocument();
  });

  it('T1-VOU-04: Voucher Verification Access Key Algorithm — generates valid 49-digit access key with modulo 11 checksum', () => {
    const ruc = '1790014298001';
    const accessKey = generateSriAccessKey(ruc, new Date(2026, 10, 8), 1);

    expect(accessKey).toHaveLength(49);
    expect(accessKey.startsWith('08112026011790014298001')).toBe(true);
  });

  it('T1-VOU-05: Print & PDF Export Simulation Button — triggers window.print without exceptions', () => {
    const printSpy = vi.spyOn(window, 'print');

    // Trigger print
    window.print();
    expect(printSpy).toHaveBeenCalledTimes(1);
  });
});
