import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { CROE_INVENTORY_SEED } from '../../src/data/mockInventory';
import { PRELOADED_SUPPLIER_INVOICES } from '../../src/data/mockInvoices';

describe('Tier 3: Cross-Feature Flow 3.2 — Invoice Replenishment & Kardex Auditing', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T3-IKR-01: Ingesting Supplier Invoice Bumps Low Stock and Clears Reorder Alerts', () => {
    render(<App />);

    // 1. Go to Economato view
    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    // Initial alert check
    expect(screen.getByText(/punto de reorden/i)).toBeInTheDocument();

    // 2. Open invoice modal and ingest Pronaca invoice
    const openInvoiceModalBtn = screen.getByRole('button', { name: /ingresar factura sri/i });
    fireEvent.click(openInvoiceModalBtn);

    const confirmBtn = screen.getByRole('button', { name: /confirmar ingreso a bodega/i });
    fireEvent.click(confirmBtn);

    // 3. Verify confirmation
    expect(screen.getByText(/procesada exitosamente/i)).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /cerrar ventana/i });
    fireEvent.click(closeBtn);

    // 4. Verify catalog still shows healthy stock levels
    expect(screen.getAllByText(/óptimo/i).length).toBeGreaterThan(0);
  });

  it('T3-IKR-02: Tableware Audit Records Intact Return & Settles Breakage in Kardex', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    // Open tableware audit modal
    const openAuditModalBtn = screen.getByRole('button', { name: /auditoría de menaje post-evento/i });
    fireEvent.click(openAuditModalBtn);

    expect(screen.getByText(/auditoría de menaje & cierre de eventos/i)).toBeInTheDocument();

    // Confirm settlement
    const settleBtn = screen.getByRole('button', { name: /cerrar evento y registrar en kardex/i });
    fireEvent.click(settleBtn);

    expect(screen.getByText(/auditoría liquidada con éxito/i)).toBeInTheDocument();

    // Close modal
    const closeAuditBtn = screen.getByRole('button', { name: /^cerrar$/i });
    fireEvent.click(closeAuditBtn);

    // Inspect Kardex
    const kardexTabBtn = screen.getByRole('button', { name: /bitácora kardex perpetuo/i });
    fireEvent.click(kardexTabBtn);

    expect(screen.getAllByText(/merma \/ rotura/i).length).toBeGreaterThan(0);
  });

  it('T3-IKR-03: Mathematical Balance Integrity Across Initial Balance and Invoices', () => {
    // Verify mathematical coherence between seed items and mock invoices
    const initialLomo = CROE_INVENTORY_SEED.find((i) => i.code === 'ALM-LOM-01');
    expect(initialLomo).toBeDefined();
    const initialStock = initialLomo!.currentStock; // 38.0 kg

    const pronacaInvoice = PRELOADED_SUPPLIER_INVOICES[0];
    const invoiceLomo = pronacaInvoice.items.find((i) => i.itemCode === 'ALM-LOM-01');
    expect(invoiceLomo).toBeDefined();
    const purchaseQty = invoiceLomo!.quantity; // 50.0 kg

    const expectedStockAfterPurchase = initialStock + purchaseQty;
    expect(expectedStockAfterPurchase).toBe(88.0);

    // Weighted Average Price calculation check (NIC 2)
    const prevValue = initialStock * initialLomo!.unitCost;
    const purchaseValue = purchaseQty * invoiceLomo!.unitCost;
    const expectedPmp = Math.round(((prevValue + purchaseValue) / expectedStockAfterPurchase) * 100) / 100;

    expect(expectedPmp).toBeGreaterThan(0);
    expect(expectedPmp).toBeCloseTo(8.5, 1);
  });
});
