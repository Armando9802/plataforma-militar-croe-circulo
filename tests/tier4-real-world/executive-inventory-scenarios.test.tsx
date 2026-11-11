import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { calculateSupplyExplosion } from '../../src/utils/recipeExplosion';
import { PRELOADED_SUPPLIER_INVOICES } from '../../src/data/mockInvoices';

describe('Tier 4: Real-World Scenarios — Executive Inventory & Banquet Demonstrations', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T4-EIS-01: Scenario E — Banquete de Ascenso Militar en CROE (150 PAX)', () => {
    // 1. Calculate BoM supply explosion for 150 PAX military banquet
    const banquetExplosion = calculateSupplyExplosion({
      serviceType: 'event',
      eventType: 'banquete_gala',
      paxCount: 150,
    });

    // 150 PAX * 0.28 kg = 42.0 kg of premium tenderloin
    const lomo = banquetExplosion.find((i) => i.sku === 'ALM-LOM-01');
    expect(lomo?.totalQuantity).toBe(42.0);

    // 150 PAX * 2 = 300 gala glasses
    const copas = banquetExplosion.find((i) => i.sku === 'MEN-COP-03');
    expect(copas?.totalQuantity).toBe(300);

    // 150 PAX * 4 = 600 napkins
    const servilletas = banquetExplosion.find((i) => i.sku === 'INS-SRV-01');
    expect(servilletas?.totalQuantity).toBe(600);

    // 2. Render App and verify Banquet setup interface
    render(<App />);

    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    const banquetsTabBtn = screen.getByRole('button', { name: /eventos & banquetes protocolarios/i });
    fireEvent.click(banquetsTabBtn);

    expect(screen.getByText(/banquete redondo \(8-10u\)/i)).toBeInTheDocument();
    expect(screen.getByText(/menú gala de las armas/i)).toBeInTheDocument();
  });

  it('T4-EIS-02: Scenario F — Reabastecimiento de Alimentos Pronaca en Círculo Militar', () => {
    render(<App />);

    // 1. Toggle to Círculo Militar via accessible tab
    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloTab);

    // 2. Go to Economato
    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    // 3. Open and ingest Pronaca invoice
    const openInvoiceModalBtn = screen.getByRole('button', { name: /ingresar factura sri/i });
    fireEvent.click(openInvoiceModalBtn);

    // Verify Pronaca invoice data
    const pronacaInvoice = PRELOADED_SUPPLIER_INVOICES[0];
    expect(screen.getAllByText(new RegExp(pronacaInvoice.supplierRuc, 'i')).length).toBeGreaterThan(0);

    const confirmBtn = screen.getByRole('button', { name: /confirmar ingreso a bodega/i });
    fireEvent.click(confirmBtn);

    expect(screen.getByText(/procesada exitosamente/i)).toBeInTheDocument();
  });

  it('T4-EIS-03: Scenario G — Operación de Fin de Semana en Comedor Los Chillos (Desayuno 40 PAX + Almuerzo 95 PAX)', () => {
    // 1. Calculate chain consumption: Breakfast 40 PAX
    const breakfastExplosion = calculateSupplyExplosion({
      serviceType: 'shift',
      shiftType: 'desayuno',
      paxCount: 40,
    });
    const eggsBreakfast = breakfastExplosion.find((i) => i.sku === 'ALM-HUE-05');
    expect(eggsBreakfast?.totalQuantity).toBe(80); // 40 * 2 eggs

    // 2. Calculate chain consumption: Lunch 95 PAX
    const lunchExplosion = calculateSupplyExplosion({
      serviceType: 'shift',
      shiftType: 'almuerzo',
      paxCount: 95,
    });
    const lomoLunch = lunchExplosion.find((i) => i.sku === 'ALM-LOM-01');
    expect(lomoLunch?.totalQuantity).toBe(11.4); // 95 * 0.12 kg

    // 3. Render App and execute breakfast shift
    render(<App />);

    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    // Execute first shift
    const executeBtn = screen.getByRole('button', { name: /registrar turno y descontar existencias/i });
    fireEvent.click(executeBtn);

    expect(screen.getByText(/ejecutado exitosamente/i)).toBeInTheDocument();
  });
});
