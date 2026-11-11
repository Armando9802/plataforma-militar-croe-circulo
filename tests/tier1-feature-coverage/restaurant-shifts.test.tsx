import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { calculateSupplyExplosion } from '../../src/utils/recipeExplosion';

describe('Tier 1: Feature 1.7 — Restaurant Shifts & Institutional Banquets', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-SFT-01: Renders Daily Shift Selector and Navigation', () => {
    render(<App />);

    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    expect(restaurantNavBtn).toBeInTheDocument();
    fireEvent.click(restaurantNavBtn);

    // Turnos Diarios de Comedor tab should be active
    expect(screen.getByText(/desayuno campestre cumbayá/i)).toBeInTheDocument();
    expect(screen.getByText(/almuerzo de guarnición cumbayá/i)).toBeInTheDocument();
    expect(screen.getByText(/cena de confraternidad andina/i)).toBeInTheDocument();
  });

  it('T1-SFT-02: Live Supply Explosion Engine Calculates Quantities for PAX', () => {
    const explosion10 = calculateSupplyExplosion({
      serviceType: 'shift',
      shiftType: 'almuerzo',
      paxCount: 10,
    });

    const lomoItem10 = explosion10.find((i) => i.sku === 'ALM-LOM-01');
    expect(lomoItem10).toBeDefined();
    expect(lomoItem10?.totalQuantity).toBe(1.2); // 0.12 kg * 10

    const explosion50 = calculateSupplyExplosion({
      serviceType: 'shift',
      shiftType: 'almuerzo',
      paxCount: 50,
    });

    const lomoItem50 = explosion50.find((i) => i.sku === 'ALM-LOM-01');
    expect(lomoItem50?.totalQuantity).toBe(6); // 0.12 kg * 50
  });

  it('T1-SFT-03: Renders 15% SRI IVA Calculation on Dining Shifts', () => {
    render(<App />);

    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    // Expect SRI IVA label
    expect(screen.getByText(/iva sri \(15% legal vigente\):/i)).toBeInTheDocument();
    expect(screen.getByText(/liquidación económica del turno \(sri ecuador\)/i)).toBeInTheDocument();
  });

  it('T1-SFT-04: Executes Shift and Records Stock Deduction in Economato', () => {
    render(<App />);

    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    const executeBtn = screen.getByRole('button', { name: /registrar turno y descontar existencias/i });
    expect(executeBtn).toBeInTheDocument();
    fireEvent.click(executeBtn);

    // Expect confirmation message
    expect(screen.getByText(/ejecutado exitosamente/i)).toBeInTheDocument();
    expect(screen.getByText(/se descontaron las existencias/i)).toBeInTheDocument();
  });

  it('T1-SFT-05: Banquets Tab Renders Room Setup and Menu Options', () => {
    render(<App />);

    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    const banquetsTabBtn = screen.getByRole('button', { name: /eventos & banquetes protocolarios/i });
    fireEvent.click(banquetsTabBtn);

    expect(screen.getByText(/distribución y montaje del salón/i)).toBeInTheDocument();
    expect(screen.getByText(/banquete redondo \(8-10u\)/i)).toBeInTheDocument();
    expect(screen.getByText(/menú especial de banquete castrense/i)).toBeInTheDocument();
    expect(screen.getByText(/menú gala de las armas/i)).toBeInTheDocument();
  });
});
