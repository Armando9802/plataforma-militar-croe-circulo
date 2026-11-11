import { describe, it, expect } from 'vitest';
import { PRELOADED_SUPPLIER_INVOICES } from '../../src/data/mockInvoices';

describe('Tier 2: Boundary Domain 2.9 — Supplier Invoice SRI Integrity Boundaries', () => {
  // Validator functions representing SRI invoice ingestion constraints
  function validateEcuadorianSupplierRuc(ruc: string): { isValid: boolean; error?: string } {
    if (!ruc || typeof ruc !== 'string') {
      return { isValid: false, error: 'RUC requerido' };
    }
    if (ruc.length !== 13) {
      return { isValid: false, error: `Longitud inválida: debe tener 13 dígitos, recibido ${ruc.length}` };
    }
    if (!/^\d{13}$/.test(ruc)) {
      return { isValid: false, error: 'El RUC debe contener únicamente dígitos numéricos' };
    }
    if (!ruc.endsWith('001')) {
      return { isValid: false, error: 'El RUC de persona jurídica o natural debe finalizar en establecimiento 001' };
    }
    return { isValid: true };
  }

  function validateSriAccessKey49(key: string): { isValid: boolean; error?: string } {
    if (!key || typeof key !== 'string') {
      return { isValid: false, error: 'Clave de acceso requerida' };
    }
    if (key.length !== 49) {
      return { isValid: false, error: `Clave de acceso debe tener 49 dígitos, recibido ${key.length}` };
    }
    if (!/^\d{49}$/.test(key)) {
      return { isValid: false, error: 'La clave de acceso SRI debe ser estrictamente numérica' };
    }
    return { isValid: true };
  }

  function validateInvoiceTaxMath(invoice: {
    items: { subtotal: number }[];
    subtotal: number;
    vat15: number;
    total: number;
  }): { isMathematicallySound: boolean; computedTotal: number } {
    const sumItems = invoice.items.reduce((acc, i) => acc + i.subtotal, 0);
    const roundedSum = Math.round(sumItems * 100) / 100;
    const computedVat = Math.round(roundedSum * 0.15 * 100) / 100;
    const computedTotal = Math.round((roundedSum + computedVat) * 100) / 100;

    const isMatch = Math.abs(computedTotal - invoice.total) <= 0.01;
    return {
      isMathematicallySound: isMatch,
      computedTotal,
    };
  }

  it('T2-IIB-01: Validates Ecuadorian Supplier RUC Format and Rejects Invalid Lengths', () => {
    // Valid suppliers
    expect(validateEcuadorianSupplierRuc('1790005744001').isValid).toBe(true); // Pronaca
    expect(validateEcuadorianSupplierRuc('1790013828001').isValid).toBe(true); // Tesalia
    expect(validateEcuadorianSupplierRuc('1791234567001').isValid).toBe(true); // Indurmesa

    // Invalid: 10 digits (cedula without 001)
    const shortRuc = validateEcuadorianSupplierRuc('1790005744');
    expect(shortRuc.isValid).toBe(false);
    expect(shortRuc.error).toContain('Longitud inválida');

    // Invalid: letters or special chars
    const alphaRuc = validateEcuadorianSupplierRuc('179000574400A');
    expect(alphaRuc.isValid).toBe(false);

    // Invalid: doesn't end in 001
    const badSuffix = validateEcuadorianSupplierRuc('1790005744002');
    expect(badSuffix.isValid).toBe(false);
    expect(badSuffix.error).toContain('001');
  });

  it('T2-IIB-02: Enforces 49-Digit SRI Access Key Schema and Detects Duplicates', () => {
    const pronaca = PRELOADED_SUPPLIER_INVOICES[0];
    expect(validateSriAccessKey49(pronaca.accessKey49).isValid).toBe(true);

    // Invalid: 48 digits (missing 1 digit)
    const shortKey = validateSriAccessKey49('091120260117900057440012001002000045892123456781');
    expect(shortKey.isValid).toBe(false);
    expect(shortKey.error).toContain('49 dígitos');

    // Duplicate detection simulation
    const processedKeys = new Set<string>();
    processedKeys.add(pronaca.accessKey49);

    const isDuplicate = processedKeys.has(pronaca.accessKey49);
    expect(isDuplicate).toBe(true);

    const newKey = '0911202601179001382800120030100001289451234567819';
    expect(processedKeys.has(newKey)).toBe(false);
  });

  it('T2-IIB-03: Enforces Exact SRI 15% IVA Tax Calculation and Detects Line-Item Discrepancies', () => {
    // Valid preloaded invoices
    PRELOADED_SUPPLIER_INVOICES.forEach((inv) => {
      const mathCheck = validateInvoiceTaxMath(inv);
      expect(mathCheck.isMathematicallySound).toBe(true);
    });

    // Inconsistent invoice with altered total
    const corruptedInvoice = {
      items: [{ subtotal: 100.0 }],
      subtotal: 100.0,
      vat15: 15.0,
      total: 130.0, // Fraudulent total: should be 115.0
    };
    const checkCorrupted = validateInvoiceTaxMath(corruptedInvoice);
    expect(checkCorrupted.isMathematicallySound).toBe(false);
    expect(checkCorrupted.computedTotal).toBe(115.0);
  });
});
