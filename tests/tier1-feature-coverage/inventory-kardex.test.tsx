import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_INVENTORY_SEED } from '../../src/data/mockInventory';

describe('Tier 1: Feature 1.8 — Economato, Kardex & Invoice Ingestion', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-INV-01: Renders Economato Dashboard with 4 Inventory Categories', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    expect(inventoryNavBtn).toBeInTheDocument();
    fireEvent.click(inventoryNavBtn);

    // Verify header and valuation
    expect(screen.getByText(/economato central & control de existencias/i)).toBeInTheDocument();
    expect(screen.getByText(/valorización en bodega/i)).toBeInTheDocument();

    // Verify category filters
    expect(screen.getByRole('button', { name: /insumos \/ descartables/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /menaje \/ cubiertos/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^bebidas$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /alimentos cocina/i })).toBeInTheDocument();
  });

  it('T1-INV-02: Displays Health Status Badges and Stock Progress Indicators', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    // Status badges in catalog
    expect(screen.getAllByText(/óptimo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/precaución/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/crítico/i).length).toBeGreaterThan(0);
  });

  it('T1-INV-03: Renders Immutable Kardex Ledger Tab with Transaction Details', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    const kardexTabBtn = screen.getByRole('button', { name: /bitácora kardex perpetuo/i });
    fireEvent.click(kardexTabBtn);

    // Verify Kardex table headers
    expect(screen.getByText(/libro mayor kardex perpetuo/i)).toBeInTheDocument();
    expect(screen.getByText(/tipo movimiento/i)).toBeInTheDocument();
    expect(screen.getByText(/sku \/ artículo/i)).toBeInTheDocument();
    expect(screen.getByText(/documento ref\./i)).toBeInTheDocument();
    expect(screen.getByText(/responsable militar/i)).toBeInTheDocument();

    // Verify initial balance entries
    expect(screen.getAllByText(/saldo inicial/i).length).toBeGreaterThan(0);
  });

  it('T1-INV-04: Ingests SRI Supplier Invoice and Bumps Warehouse Stock', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    const openInvoiceModalBtn = screen.getByRole('button', { name: /ingresar factura sri/i });
    fireEvent.click(openInvoiceModalBtn);

    // Verify modal is open
    expect(screen.getByText(/recepción & carga de facturas electrónicas \(sri\)/i)).toBeInTheDocument();
    expect(screen.getAllByText(/pronaca/i).length).toBeGreaterThan(0);

    // Confirm ingreso
    const confirmBtn = screen.getByRole('button', { name: /confirmar ingreso a bodega/i });
    fireEvent.click(confirmBtn);

    expect(screen.getByText(/procesada exitosamente/i)).toBeInTheDocument();
    expect(screen.getByText(/se actualizaron/i)).toBeInTheDocument();
  });

  it('T1-INV-05: Performs Tableware Settlement Audit and Records Breakages', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    const openAuditModalBtn = screen.getByRole('button', { name: /auditoría de menaje post-evento/i });
    fireEvent.click(openAuditModalBtn);

    // Verify audit modal opened
    expect(screen.getByText(/auditoría de menaje & cierre de eventos/i)).toBeInTheDocument();
    expect(screen.getAllByText(/platos llanos porcelana escudo dorado/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/cargo total por reposición de vajilla rota:/i)).toBeInTheDocument();

    const settleBtn = screen.getByRole('button', { name: /cerrar evento y registrar en kardex/i });
    fireEvent.click(settleBtn);

    expect(screen.getByText(/auditoría liquidada con éxito/i)).toBeInTheDocument();
    expect(screen.getAllByText(/merma_rotura/i).length).toBeGreaterThan(0);
  });
});
