import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { TenantProvider, useTenant } from '../context/TenantContext';
import { CroeShieldSvg } from '../components/badges/CroeShieldSvg';
import { CirculoSealSvg } from '../components/badges/CirculoSealSvg';
import { TenantSwitchBar } from '../components/common/TenantSwitchBar';

const TestConsumer: React.FC = () => {
  const { currentTenant, isCroe, isCirculo, switchTenant } = useTenant();
  return (
    <div>
      <span data-testid="tenant-name">{currentTenant.name}</span>
      <span data-testid="is-croe">{isCroe ? 'true' : 'false'}</span>
      <span data-testid="is-circulo">{isCirculo ? 'true' : 'false'}</span>
      <button data-testid="switch-btn" onClick={switchTenant}>
        Switch
      </button>
    </div>
  );
};

describe('Institutional Heraldry & Tenant Architecture', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-tenant');
  });

  it('renders CroeShieldSvg with proper accessibility label', () => {
    render(<CroeShieldSvg size={64} />);
    const svg = screen.getByLabelText('Escudo Oficial CROE');
    expect(svg).toBeInTheDocument();
  });

  it('renders CirculoSealSvg with proper accessibility label', () => {
    render(<CirculoSealSvg size={64} />);
    const svg = screen.getByLabelText('Sello Institucional Círculo Militar del Ecuador');
    expect(svg).toBeInTheDocument();
  });

  it('initializes TenantProvider with CROE by default and injects CSS properties', () => {
    render(
      <TenantProvider>
        <TestConsumer />
      </TenantProvider>
    );

    expect(screen.getByTestId('tenant-name').textContent).toContain('Club de Recreación de Oficiales del Ejército');
    expect(screen.getByTestId('is-croe').textContent).toBe('true');
    expect(screen.getByTestId('is-circulo').textContent).toBe('false');

    expect(document.documentElement.getAttribute('data-tenant')).toBe('croe');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#8B1E24');
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#D4AF37');
  });

  it('toggles tenant smoothly to Círculo Militar and updates DOM attributes', () => {
    render(
      <TenantProvider>
        <TestConsumer />
      </TenantProvider>
    );

    const switchBtn = screen.getByTestId('switch-btn');
    fireEvent.click(switchBtn);

    expect(screen.getByTestId('tenant-name').textContent).toContain('Círculo Militar del Ecuador');
    expect(screen.getByTestId('is-croe').textContent).toBe('false');
    expect(screen.getByTestId('is-circulo').textContent).toBe('true');

    expect(document.documentElement.getAttribute('data-tenant')).toBe('circulo-militar');
    expect(document.documentElement.style.getPropertyValue('--color-primary')).toBe('#1B365D');
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#C8A051');
  });

  it('renders TenantSwitchBar with both institutional options and supports switching', () => {
    render(
      <TenantProvider>
        <TenantSwitchBar />
        <TestConsumer />
      </TenantProvider>
    );

    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloTab);

    expect(screen.getByTestId('is-circulo').textContent).toBe('true');
    expect(document.documentElement.getAttribute('data-tenant')).toBe('circulo-militar');

    const croeTab = screen.getByRole('tab', { name: /seleccionar portal croe/i });
    fireEvent.click(croeTab);

    expect(screen.getByTestId('is-croe').textContent).toBe('true');
    expect(document.documentElement.getAttribute('data-tenant')).toBe('croe');
  });
});
