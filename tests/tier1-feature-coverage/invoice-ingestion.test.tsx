import { describe, it, expect, beforeEach } from 'vitest';
import { screen, fireEvent, render } from '@testing-library/react';
import React from 'react';
import App from '../../src/App';
import { PRELOADED_SUPPLIER_INVOICES } from '../../src/data/mockInvoices';

describe('Tier 1: Feature 1.9 — SRI Electronic Supplier Invoice Ingestion', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('T1-ING-01: Renders Invoice Ingestion Dropzone and 3 Supplier Presets', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    const openInvoiceModalBtn = screen.getByRole('button', { name: /ingresar factura sri/i });
    fireEvent.click(openInvoiceModalBtn);

    // Verify modal header
    expect(screen.getByText(/recepción & carga de facturas electrónicas \(sri\)/i)).toBeInTheDocument();

    // Verify all 3 official supplier presets
    expect(screen.getAllByText(/pronaca/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/the/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/indurmesa/i).length).toBeGreaterThan(0);

    // Verify file dropzone
    expect(screen.getByText(/arrastre aquí el archivo/i)).toBeInTheDocument();
  });

  it('T1-ING-02: Displays Supplier Fiscal Metadata (13-digit RUC & 49-digit SRI Key)', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    const openInvoiceModalBtn = screen.getByRole('button', { name: /ingresar factura sri/i });
    fireEvent.click(openInvoiceModalBtn);

    const pronaca = PRELOADED_SUPPLIER_INVOICES[0];
    expect(pronaca.supplierRuc).toHaveLength(13);
    expect(pronaca.accessKey49).toHaveLength(49);

    // Screen displays RUC and Access key
    expect(screen.getAllByText(new RegExp(pronaca.supplierRuc, 'i')).length).toBeGreaterThan(0);
    expect(screen.getByText(new RegExp(pronaca.accessKey49, 'i'))).toBeInTheDocument();
    expect(screen.getAllByText(new RegExp(pronaca.invoiceNumber, 'i')).length).toBeGreaterThan(0);
  });

  it('T1-ING-03: Maps Invoice Line Items to Warehouse Catalog SKUs', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    const openInvoiceModalBtn = screen.getByRole('button', { name: /ingresar factura sri/i });
    fireEvent.click(openInvoiceModalBtn);

    // Select Tesalia Springs preset by invoice number button
    const tesaliaBtn = screen.getByText(/003-010-000128945/i);
    fireEvent.click(tesaliaBtn);

    // Expect beverages items to be displayed in line items table
    expect(screen.getAllByText(/güitig agua mineral con gas 500ml/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/coca-cola \/ gaseosas 350ml/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BEB-GUT-01/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/BEB-COL-02/i).length).toBeGreaterThan(0);
  });

  it('T1-ING-04: Displays Fiscal Breakdown with Subtotal, 15% SRI IVA, and Total', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    const openInvoiceModalBtn = screen.getByRole('button', { name: /ingresar factura sri/i });
    fireEvent.click(openInvoiceModalBtn);

    // Verify tax breakdown labels
    expect(screen.getAllByText(/subtotal/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/iva sri \(15%\):/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/total liquidado:/i).length).toBeGreaterThan(0);

    // Verify calculated figures for default Pronaca invoice ($669 subtotal, $100.35 IVA, $769.35 total)
    expect(screen.getAllByText(/\$669\.00/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$100\.35/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\$769\.35/i).length).toBeGreaterThan(0);
  });

  it('T1-ING-05: Confirming Ingestion Bumps Stock and Registers IN_PURCHASE in Kardex', () => {
    render(<App />);

    const inventoryNavBtn = screen.getByRole('button', { name: /inventario & economato/i });
    fireEvent.click(inventoryNavBtn);

    const openInvoiceModalBtn = screen.getByRole('button', { name: /ingresar factura sri/i });
    fireEvent.click(openInvoiceModalBtn);

    // Confirm Pronaca ingestion
    const confirmBtn = screen.getByRole('button', { name: /confirmar ingreso a bodega/i });
    fireEvent.click(confirmBtn);

    // Close modal
    const closeBtn = screen.getByRole('button', { name: /cerrar ventana/i });
    fireEvent.click(closeBtn);

    // Open Kardex Tab
    const kardexTabBtn = screen.getByRole('button', { name: /bitácora kardex perpetuo/i });
    fireEvent.click(kardexTabBtn);

    // Must have IN_PURCHASE movement for Pronaca reference
    expect(screen.getAllByText(/001-002-000045892/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/entrada compra/i).length).toBeGreaterThan(0);
  });
});
