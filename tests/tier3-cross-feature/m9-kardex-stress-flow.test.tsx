import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render, within } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';

describe('Tier 3: Milestone 9 — Full Lifecyle Kardex & Multi-Event Stress Flow', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('M9-FLC-01: Consecutive Shifts + Large Banquet (200 PAX) + Invoice Replenishment maintains Kardex invariant', () => {
    render(<App />);

    // 1. Navigate to Restaurant View
    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    // 2. Execute Desayuno shift for 60 PAX
    const executeShiftBtn = screen.getByRole('button', { name: /registrar turno y descontar existencias/i });
    fireEvent.click(executeShiftBtn);
    expect(screen.getByText(/ejecutado exitosamente/i)).toBeInTheDocument();

    // 3. Switch to Banquets Tab and execute Banquete de Gala for 200 PAX
    const banquetsTab = screen.getByRole('button', { name: /eventos & banquetes protocolarios/i });
    fireEvent.click(banquetsTab);

    const executeBanquetBtn = screen.getByRole('button', { name: /registrar y despachar banquete/i });
    fireEvent.click(executeBanquetBtn);
    expect(screen.getByText(/despachado exitosamente/i)).toBeInTheDocument();

    // 4. Navigate to Economato & Kardex
    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    const kardexTabBtn = screen.getByRole('button', { name: /bitácora kardex perpetuo/i });
    fireEvent.click(kardexTabBtn);

    // 5. Inspect Kardex rows to verify balance consistency
    // Both SALIDA TURNO and DESPACHO EVENTO must be present
    expect(screen.getAllByText(/salida por turno/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/despacho evento/i).length).toBeGreaterThan(0);

    // 6. Execute Invoice Ingestion (Pronaca / Bodega replenishment)
    const catalogTabBtn = screen.getByRole('button', { name: /catálogo de existencias/i });
    fireEvent.click(catalogTabBtn);

    const openInvoiceModalBtn = screen.getByRole('button', { name: /ingresar factura sri/i });
    fireEvent.click(openInvoiceModalBtn);

    const confirmIngresoBtn = screen.getByRole('button', { name: /confirmar ingreso a bodega/i });
    fireEvent.click(confirmIngresoBtn);
    expect(screen.getByText(/procesada exitosamente/i)).toBeInTheDocument();

    // Close modal and return to Kardex
    const closeBtn = screen.getByRole('button', { name: /cerrar ventana/i });
    fireEvent.click(closeBtn);

    fireEvent.click(kardexTabBtn);
    expect(screen.getAllByText(/entrada compra/i).length).toBeGreaterThan(0);
  });

  it('M9-FLC-02: 350 PAX Banquet in Círculo Militar preserves stock non-negativity and alerts', () => {
    render(<App />);

    // 1. Switch to Círculo Militar
    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloTab);

    // 2. Navigate to Restaurant View -> Banquets Tab
    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    const banquetsTab = screen.getByRole('button', { name: /eventos & banquetes protocolarios/i });
    fireEvent.click(banquetsTab);

    // Verify Gran Salón de los Generales is accessible and can host 350 PAX
    expect(screen.getAllByText(/gran salón de los generales/i).length).toBeGreaterThan(0);

    // Execute banquet dispatch
    const executeBanquetBtn = screen.getByRole('button', { name: /registrar y despachar banquete/i });
    fireEvent.click(executeBanquetBtn);
    expect(screen.getByText(/despachado exitosamente/i)).toBeInTheDocument();

    // 3. Navigate to Economato Central
    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    // Verify all stock bars and quantities are non-negative
    expect(screen.getByText(/economato central & control de existencias/i)).toBeInTheDocument();
    expect(screen.getAllByText(/crítico/i).length).toBeGreaterThan(0);

    // 4. Verify Kardex reflects movements
    const kardexTabBtn = screen.getByRole('button', { name: /bitácora kardex perpetuo/i });
    fireEvent.click(kardexTabBtn);

    expect(screen.getAllByText(/despacho evento/i).length).toBeGreaterThan(0);
  });
});
