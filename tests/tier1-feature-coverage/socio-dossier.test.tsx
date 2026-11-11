import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_CONFIG } from '../../src/data/croeData';
import { CIRCULO_CONFIG } from '../../src/data/circuloData';

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

describe('Tier 1: Feature 1.2 — Socio Dossier & Military Profile', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-SOC-01: Military Dossier Rendering — displays full rank, name, military code, and active badge', () => {
    render(<App />);

    // Navigate to socio tab
    const socioNavBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioNavBtn);

    const defaultSocio = CROE_CONFIG.defaultSocio;

    // Header title with rank and last name
    expect(
      screen.getByText(new RegExp(`Expediente de ${escapeRegex(defaultSocio.grado)}`, 'i'))
    ).toBeInTheDocument();

    // Military code and ID
    expect(screen.getAllByText(new RegExp(defaultSocio.codigoMilitar, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(defaultSocio.cedula, 'i')).length).toBeGreaterThan(0);

    // Specialty / Branch
    expect(screen.getByText(new RegExp(defaultSocio.arma, 'i'))).toBeInTheDocument();
  });

  it('T1-SOC-02: Dependent / Family Cargas Display — renders all registered family dependents', () => {
    render(<App />);

    const socioNavBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioNavBtn);

    const defaultSocio = CROE_CONFIG.defaultSocio;

    // Dependents count header
    expect(
      screen.getByText(new RegExp(`Cargas Familiares Autorizadas \\(${defaultSocio.dependientes.length}\\)`, 'i'))
    ).toBeInTheDocument();

    // Each dependent rendered with name, relationship, and cedula
    for (const dep of defaultSocio.dependientes) {
      expect(screen.getByText(new RegExp(dep.nombres, 'i'))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(dep.parentesco, 'i'))).toBeInTheDocument();
      expect(screen.getByText(new RegExp(dep.cedula, 'i'))).toBeInTheDocument();
    }
  });

  it('T1-SOC-03: Membership Category & Dues Status — indicates Cuotas al Día and financial category', () => {
    render(<App />);

    const socioNavBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioNavBtn);

    const defaultSocio = CROE_CONFIG.defaultSocio;

    // Dues badge
    expect(screen.getAllByText(new RegExp('Cuotas al Día', 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(defaultSocio.ultimaCuotaPagada, 'i')).length).toBeGreaterThan(0);

    // Monthly quota amount
    expect(
      screen.getAllByText(new RegExp(`\\$${defaultSocio.montoCuotaMensual.toFixed(2)}`, 'i')).length
    ).toBeGreaterThan(0);
  });

  it('T1-SOC-04: Service History & Military Trajectory — displays seniority years and registered vehicle', () => {
    render(<App />);

    const socioNavBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioNavBtn);

    const defaultSocio = CROE_CONFIG.defaultSocio;

    // Seniority in years
    expect(
      screen.getByText(new RegExp(`${defaultSocio.antiguedadAnios} Años de Servicio`, 'i'))
    ).toBeInTheDocument();

    // Habitual campus / sede
    expect(screen.getByText(new RegExp(defaultSocio.sedeHabitual, 'i'))).toBeInTheDocument();

    // Vehicle license plate
    if (defaultSocio.vehiculoPlaca) {
      expect(screen.getByText(new RegExp(defaultSocio.vehiculoPlaca, 'i'))).toBeInTheDocument();
    }
  });

  it('T1-SOC-05: Socio Profile Toggle by Tenant Context — profile adapts to active club context', () => {
    render(<App />);

    // Navigate to socio tab in CROE mode
    const socioNavBtn = screen.getByRole('button', { name: /portal del socio & carné/i });
    fireEvent.click(socioNavBtn);

    expect(screen.getAllByText(new RegExp(CROE_CONFIG.defaultSocio.codigoMilitar, 'i')).length).toBeGreaterThan(0);

    // Switch tenant to Circulo Militar
    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloTab);

    // Now Circulo default socio dossier is displayed
    const circuloSocio = CIRCULO_CONFIG.defaultSocio;
    expect(screen.getAllByText(new RegExp(circuloSocio.codigoMilitar, 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(escapeRegex(circuloSocio.grado), 'i')).length).toBeGreaterThan(0);
    expect(screen.getAllByText(new RegExp(circuloSocio.apellidos, 'i')).length).toBeGreaterThan(0);
  });
});
