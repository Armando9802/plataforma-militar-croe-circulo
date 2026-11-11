import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_CONFIG } from '../../src/data/croeData';
import { CIRCULO_CONFIG } from '../../src/data/circuloData';
import { TenantSwitchBar } from '../../src/components/common/TenantSwitchBar';
import { renderWithTenant } from '../helpers/renderWithTenant';

describe('Tier 1: Feature 1.1 — Institutional Tenant Toggle (CROE <-> Círculo Militar)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-TEN-01: Default Tenant Initialization — initializes with CROE institutional branding', () => {
    render(<App />);

    // CROE heraldry and titles
    const headings = screen.getAllByText(new RegExp(CROE_CONFIG.name, 'i'));
    expect(headings.length).toBeGreaterThan(0);

    // CROE motto
    expect(screen.getAllByText(new RegExp(CROE_CONFIG.motto, 'i')).length).toBeGreaterThan(0);

    // Root data attribute and CSS variables
    expect(document.documentElement.getAttribute('data-tenant')).toBe('croe');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(CROE_CONFIG.theme.primaryColor);
  });

  it('T1-TEN-02: Tenant Switch to Círculo Militar — shifts branding and palette to Navy Blue', () => {
    render(<App />);

    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloTab);

    // Root data attribute shifted to circulo-militar
    expect(document.documentElement.getAttribute('data-tenant')).toBe('circulo-militar');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe(CIRCULO_CONFIG.theme.primaryColor);

    // Círculo Militar titles visible
    expect(screen.getAllByText(new RegExp(CIRCULO_CONFIG.name, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(CIRCULO_CONFIG.motto, 'i')).length).toBeGreaterThan(0);
  });

  it('T1-TEN-03: Bidirectional Toggle Fluidity — updates synchronously without page reload', () => {
    render(<App />);

    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    const croeTab = screen.getByRole('tab', { name: /seleccionar portal croe/i });

    // Switch to Circulo
    fireEvent.click(circuloTab);
    expect(document.documentElement.getAttribute('data-tenant')).toBe('circulo-militar');
    expect(circuloTab).toHaveAttribute('aria-selected', 'true');
    expect(croeTab).toHaveAttribute('aria-selected', 'false');

    // Switch back to CROE
    fireEvent.click(croeTab);
    expect(document.documentElement.getAttribute('data-tenant')).toBe('croe');
    expect(croeTab).toHaveAttribute('aria-selected', 'true');
    expect(circuloTab).toHaveAttribute('aria-selected', 'false');
  });

  it('T1-TEN-04: Tenant Persistent Cache in LocalStorage — saves tenant id to localStorage', () => {
    render(<App />);

    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloTab);

    expect(localStorage.getItem('plataforma_militar_tenant_id')).toBe('circulo-militar');
  });

  it('T1-TEN-05: Institutional Header Branding & Crest Assets — renders proper military heraldry SVGs', () => {
    const { container } = renderWithTenant(<TenantSwitchBar />, { initialTenant: 'croe' });

    // Verify SVG elements exist inside the toggle bar
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);

    // Switch to circulo and check active status
    const circuloBtn = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloBtn);
    expect(circuloBtn).toHaveAttribute('aria-selected', 'true');
  });
});
