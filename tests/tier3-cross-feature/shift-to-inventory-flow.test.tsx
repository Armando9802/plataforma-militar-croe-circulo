import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';

describe('Tier 3: Cross-Feature Flow 3.1 — Restaurant Shifts to Economato & Kardex Deduction', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T3-SIF-01: Full Lifecycle: Shift Execution -> Real-time Deduction -> Kardex Entry in Economato', () => {
    render(<App />);

    // 1. Navigate to Restaurant View
    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    // 2. Select Almuerzo and execute deduction
    const executeBtn = screen.getByRole('button', { name: /registrar turno y descontar existencias/i });
    expect(executeBtn).toBeInTheDocument();
    fireEvent.click(executeBtn);

    // Verify success banner appears
    expect(screen.getByText(/ejecutado exitosamente/i)).toBeInTheDocument();

    // 3. Navigate to Economato Tab
    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    // Verify dashboard rendered
    expect(screen.getByText(/economato central & control de existencias/i)).toBeInTheDocument();

    // 4. Inspect Kardex tab for the generated entry
    const kardexTabBtn = screen.getByRole('button', { name: /bitácora kardex perpetuo/i });
    fireEvent.click(kardexTabBtn);

    // Must find SALIDA_TURNO entry in Kardex table
    expect(screen.getAllByText(/salida por turno/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/TURNO-ALMUERZO/i).length).toBeGreaterThan(0);
  });

  it('T3-SIF-02: Dining Shift Consumption Drives Stock Below Reorder Point into Alert Status', () => {
    render(<App />);

    // Execute Almuerzo in Restaurant
    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    const executeBtn = screen.getByRole('button', { name: /registrar turno y descontar existencias/i });
    fireEvent.click(executeBtn);

    // Move to Economato
    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    // Verify presence of alert badges (precaución / crítico)
    const warningBadges = screen.getAllByText(/precaución/i);
    expect(warningBadges.length).toBeGreaterThan(0);

    const criticalBadges = screen.getAllByText(/crítico/i);
    expect(criticalBadges.length).toBeGreaterThan(0);
  });

  it('T3-SIF-03: Multi-Tenant Isolation Preserves Warehouse State During Institutional Switch', () => {
    render(<App />);

    // 1. Execute shift in CROE
    const restaurantNavBtn = screen.getByRole('button', { name: /restaurante & eventos/i });
    fireEvent.click(restaurantNavBtn);

    const executeBtn = screen.getByRole('button', { name: /registrar turno y descontar existencias/i });
    fireEvent.click(executeBtn);

    // 2. Switch tenant to Círculo Militar
    const circuloTab = screen.getByRole('tab', { name: /seleccionar portal círculo militar/i });
    fireEvent.click(circuloTab);

    // 3. Navigate to Economato in Círculo Militar
    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    expect(screen.getByText(/economato central & control de existencias/i)).toBeInTheDocument();

    // 4. Switch back to CROE
    const croeTab = screen.getByRole('tab', { name: /seleccionar portal croe/i });
    fireEvent.click(croeTab);

    // Kardex should retain CROE's previous movements
    const kardexTabBtn = screen.getByRole('button', { name: /bitácora kardex perpetuo/i });
    fireEvent.click(kardexTabBtn);

    expect(screen.getAllByText(/TURNO-ALMUERZO/i).length).toBeGreaterThan(0);
  });
});
