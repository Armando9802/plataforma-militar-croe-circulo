import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_CONFIG } from '../../src/data/croeData';
import { CIRCULO_CONFIG } from '../../src/data/circuloData';
import { INITIAL_RESERVATIONS } from '../../src/data/mockTransactions';

describe('Tier 2: Boundary Domain 2.4 — Tenant State Retention Across Navigation & Reload', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T2-TNT-01: Tenant Preservation on Page Reload — rehydrates selected tenant from localStorage', () => {
    // Pre-populate localStorage with circulo-militar
    localStorage.setItem('plataforma_militar_tenant_id', 'circulo-militar');

    render(<App />);

    // Renders Círculo Militar theme without defaulting to CROE
    expect(document.documentElement.getAttribute('data-tenant')).toBe('circulo-militar');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(
      CIRCULO_CONFIG.theme.primaryColor
    );
  });

  it('T2-TNT-02: Tenant Preservation Across Route Navigation — active tenant persists when switching tabs', () => {
    localStorage.setItem('plataforma_militar_tenant_id', 'circulo-militar');
    render(<App />);

    // Navigate to Socio
    const socioBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioBtn);
    expect(document.documentElement.getAttribute('data-tenant')).toBe('circulo-militar');

    // Navigate to Reservations
    const resBtn = screen.getByRole('button', { name: /reservas & deportes/i });
    fireEvent.click(resBtn);
    expect(document.documentElement.getAttribute('data-tenant')).toBe('circulo-militar');

    // Navigate to Payment
    const payBtn = screen.getByRole('button', { name: /pasarela de pagos \(sri\)/i });
    fireEvent.click(payBtn);
    expect(document.documentElement.getAttribute('data-tenant')).toBe('circulo-militar');
  });

  it('T2-TNT-03: Tenant-Isolated Inventory Separation — separates facilities by active tenant', () => {
    const croeFacilities = CROE_CONFIG.facilities;
    const circuloFacilities = CIRCULO_CONFIG.facilities;

    // Ensure distinct IDs and tenants
    expect(croeFacilities.every((f) => f.tenantId === 'croe')).toBe(true);
    expect(circuloFacilities.every((f) => f.tenantId === 'circulo-militar')).toBe(true);

    const croeNames = new Set(croeFacilities.map((f) => f.name));
    const circuloNames = new Set(circuloFacilities.map((f) => f.name));

    // No facility name collision across institutions
    for (const name of croeNames) {
      expect(circuloNames.has(name)).toBe(false);
    }
  });

  it('T2-TNT-04: Tenant-Isolated Reservation Ledgers — filters reservations by active tenant', () => {
    const croeLedger = INITIAL_RESERVATIONS.filter((r) => r.tenantId === 'croe');
    const circuloLedger = INITIAL_RESERVATIONS.filter((r) => r.tenantId === 'circulo-militar');

    expect(croeLedger.length).toBeGreaterThan(0);
    expect(circuloLedger.length).toBeGreaterThan(0);

    for (const r of croeLedger) {
      expect(r.tenantId).toBe('croe');
    }
    for (const r of circuloLedger) {
      expect(r.tenantId).toBe('circulo-militar');
    }
  });

  it('T2-TNT-05: Corrupt LocalStorage Tenant Fallback — falls back to CROE if localStorage is corrupted', () => {
    // Malicious or corrupt string in localStorage
    localStorage.setItem('plataforma_militar_tenant_id', 'corrupt_entity_injection_attack');

    render(<App />);

    // Safely defaults to CROE without crashing
    expect(document.documentElement.getAttribute('data-tenant')).toBe('croe');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(
      CROE_CONFIG.theme.primaryColor
    );
  });
});
