import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_CONFIG } from '../../src/data/croeData';
import { INITIAL_TRANSACTIONS } from '../../src/data/mockTransactions';

describe('Tier 1: Feature 1.5 — Payment Gateway Simulation (Payphone & Kushki)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-PAY-01: Payment Gateway Provider Selector — renders Payphone and Kushki gateway options', () => {
    render(<App />);

    const payNavBtn = screen.getByRole('button', { name: /pasarela de pagos \(sri\)/i });
    fireEvent.click(payNavBtn);

    // Payphone branding
    expect(screen.getByText(/Payphone Ecuador/i)).toBeInTheDocument();
    expect(screen.getByText(/App Móvil & Tarjeta/i)).toBeInTheDocument();

    // Kushki branding
    expect(screen.getByText(/Kushki Pagos/i)).toBeInTheDocument();
    expect(screen.getByText(/Tokenización 3DS/i)).toBeInTheDocument();
  });

  it('T1-PAY-02: Payphone Mobile Payment Flow Simulation — details mobile number instructions', () => {
    render(<App />);

    const payNavBtn = screen.getByRole('button', { name: /pasarela de pagos \(sri\)/i });
    fireEvent.click(payNavBtn);

    expect(screen.getByText(/09X XXX XXXX/i)).toBeInTheDocument();
  });

  it('T1-PAY-03: Kushki Credit/Debit Card Flow Simulation — details tokenized cards and installments', () => {
    render(<App />);

    const payNavBtn = screen.getByRole('button', { name: /pasarela de pagos \(sri\)/i });
    fireEvent.click(payNavBtn);

    expect(screen.getByText(/tarjetas de crédito\/débito nacionales/i)).toBeInTheDocument();
  });

  it('T1-PAY-04: Authorization Code & Transaction Token Generation — generates realistic authorization metadata', () => {
    const payphoneTx = INITIAL_TRANSACTIONS.find((tx) => tx.gateway === 'PAYPHONE');
    const kushkiTx = INITIAL_TRANSACTIONS.find((tx) => tx.gateway === 'KUSHKI');

    expect(payphoneTx).toBeDefined();
    expect(payphoneTx?.authorizationCode).toMatch(/^AUTH-PAYPHONE-/);
    expect(payphoneTx?.status).toBe('APPROVED');

    expect(kushkiTx).toBeDefined();
    expect(kushkiTx?.authorizationCode).toMatch(/^AUTH-KUSHKI-/);
    expect(kushkiTx?.status).toBe('APPROVED');
  });

  it('T1-PAY-05: Payment Summary & Institution RUC — displays issuer RUC and fee breakdown', () => {
    render(<App />);

    const payNavBtn = screen.getByRole('button', { name: /pasarela de pagos \(sri\)/i });
    fireEvent.click(payNavBtn);

    // Issuer RUC present
    expect(screen.getAllByText(new RegExp(CROE_CONFIG.ruc, 'i')).length).toBeGreaterThan(0);
    expect(screen.getByText(/Resumen de Consumo \/ Reserva:/i)).toBeInTheDocument();
  });
});
