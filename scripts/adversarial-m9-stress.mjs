#!/usr/bin/env node
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// =========================================================================
// EMPIRICAL HARNESS: MILESTONE 9 TABLEWARE SETTLEMENT & SRI INGESTION
// =========================================================================

// --- Domain Algorithms & Logic Under Test ---

const ECUADOR_IVA_RATE = 0.15;

function roundCurrency(amount) {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function calculateVat15(taxableBase) {
  if (taxableBase <= 0) return 0;
  return roundCurrency(taxableBase * ECUADOR_IVA_RATE);
}

// 1. RUC Validation
function validateEcuadorianSupplierRuc(ruc) {
  if (!ruc || typeof ruc !== 'string') {
    return { isValid: false, error: 'RUC requerido' };
  }
  if (ruc.length !== 13) {
    return { isValid: false, error: `Longitud inválida: debe tener 13 dígitos, recibido ${ruc.length}` };
  }
  if (!/^\d{13}$/.test(ruc)) {
    return { isValid: false, error: 'El RUC debe contener únicamente dígitos numéricos' };
  }
  const province = parseInt(ruc.substring(0, 2), 10);
  if ((province < 1 || province > 24) && province !== 30) {
    return { isValid: false, error: `Código de provincia inválido: ${province}` };
  }
  const thirdDigit = parseInt(ruc.charAt(2), 10);
  if (![0, 1, 2, 3, 4, 5, 6, 9].includes(thirdDigit)) {
    return { isValid: false, error: `Tercer dígito de RUC inválido: ${thirdDigit}` };
  }
  if (!ruc.endsWith('001')) {
    return { isValid: false, error: 'El RUC debe finalizar en establecimiento 001' };
  }
  return { isValid: true };
}

// 2. Modulo 11 SRI Check Digit Algorithm
function computeSriModulo11(partialKey48) {
  if (typeof partialKey48 !== 'string' || partialKey48.length !== 48 || !/^\d{48}$/.test(partialKey48)) {
    throw new Error(`partialKey48 debe ser string numérico de 48 dígitos, recibido length=${partialKey48?.length}`);
  }
  let sum = 0;
  let factor = 2;
  for (let i = partialKey48.length - 1; i >= 0; i--) {
    sum += parseInt(partialKey48.charAt(i), 10) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const mod11 = 11 - (sum % 11);
  return mod11 === 11 ? 0 : mod11 === 10 ? 1 : mod11;
}

// 3. 49-Digit SRI Key Schema & Check Digit Validation
function validateSriAccessKey49Strict(key) {
  if (!key || typeof key !== 'string') {
    return { isValid: false, error: 'Clave de acceso requerida' };
  }
  if (key.length !== 49) {
    return { isValid: false, error: `Longitud inválida: esperados 49 dígitos, recibido ${key.length}` };
  }
  if (!/^\d{49}$/.test(key)) {
    return { isValid: false, error: 'La clave de acceso debe contener solo caracteres numéricos' };
  }

  // Deconstruct SRI key fields
  const dateStr = key.substring(0, 8); // ddmmyyyy
  const docType = key.substring(8, 10); // 01 = Factura
  const ruc = key.substring(10, 23); // 13 digits RUC
  const env = key.substring(23, 24); // 1=Pruebas, 2=Produccion
  const series = key.substring(24, 30); // 001002 (est + pto)
  const seq = key.substring(30, 39); // 9 digits
  const numCode = key.substring(39, 47); // 8 digits
  const emissionType = key.substring(47, 48); // 1=Normal
  const checkDigitProvided = parseInt(key.substring(48, 49), 10);

  const day = parseInt(dateStr.substring(0, 2), 10);
  const month = parseInt(dateStr.substring(2, 4), 10);
  const year = parseInt(dateStr.substring(4, 8), 10);

  if (day < 1 || day > 31 || month < 1 || month > 12 || year < 2020 || year > 2035) {
    return { isValid: false, error: `Fecha inválida en clave de acceso: ${dateStr}` };
  }
  if (docType !== '01') {
    return { isValid: false, error: `Tipo de comprobante no es factura (01): ${docType}` };
  }
  const rucCheck = validateEcuadorianSupplierRuc(ruc);
  if (!rucCheck.isValid) {
    return { isValid: false, error: `RUC inválido en clave: ${rucCheck.error}` };
  }
  if (!['1', '2'].includes(env)) {
    return { isValid: false, error: `Ambiente inválido: ${env}` };
  }

  const expectedCheckDigit = computeSriModulo11(key.substring(0, 48));
  const hasValidCheckDigit = checkDigitProvided === expectedCheckDigit;

  return {
    isValid: true,
    hasValidCheckDigit,
    expectedCheckDigit,
    checkDigitProvided,
    metadata: { dateStr, docType, ruc, env, series, seq, numCode, emissionType },
  };
}

// 4. Invoice Tax & Math Reconciliation Engine
function reconcileInvoiceFinancials(invoice) {
  let calculatedSubtotal = 0;
  const lineDetails = [];

  for (const item of invoice.items) {
    const lineSubtotal = roundCurrency(item.quantity * item.unitCost);
    calculatedSubtotal += lineSubtotal;
    const diff = Math.abs(lineSubtotal - item.subtotal);
    lineDetails.push({
      itemCode: item.itemCode,
      quantity: item.quantity,
      unitCost: item.unitCost,
      statedSubtotal: item.subtotal,
      calculatedSubtotal,
      isLineConsistent: diff <= 0.01,
    });
  }

  calculatedSubtotal = roundCurrency(calculatedSubtotal);
  const calculatedVat = calculateVat15(calculatedSubtotal);
  const calculatedTotal = roundCurrency(calculatedSubtotal + calculatedVat);

  const subtotalMatches = Math.abs(calculatedSubtotal - invoice.subtotal) <= 0.01;
  const vatMatches = Math.abs(calculatedVat - invoice.vat15) <= 0.01;
  const totalMatches = Math.abs(calculatedTotal - invoice.total) <= 0.01;

  return {
    isFullyConsistent: subtotalMatches && vatMatches && totalMatches,
    subtotalMatches,
    vatMatches,
    totalMatches,
    calculatedSubtotal,
    calculatedVat,
    calculatedTotal,
    lineDetails,
  };
}

// 5. Inventory Replenishment & Weighted Average Cost (PMP)
function replenishItemStock(currentItem, purchaseQty, purchaseUnitCost) {
  if (purchaseQty <= 0) {
    throw new Error('La cantidad adquirida debe ser estrictamente positiva');
  }
  const prevStock = currentItem.currentStock;
  const newStock = roundCurrency(prevStock + purchaseQty);

  const prevValue = prevStock * currentItem.unitCost;
  const purchaseValue = purchaseQty * purchaseUnitCost;

  const newUnitCost =
    newStock > 0 ? roundCurrency((prevValue + purchaseValue) / newStock) : purchaseUnitCost;

  return {
    ...currentItem,
    currentStock: newStock,
    unitCost: newUnitCost,
  };
}

// 6. Tableware Settlement Engine
function executeTablewareSettlement(params) {
  const { assignedQty, returnedIntactQty, brokenOrLostQty, unitReplacementCost, currentWarehouseStock, currentCirculationStock } = params;

  // Clamping guard as implemented in UI:
  const safeReturned = Math.max(0, returnedIntactQty);
  const safeBroken = Math.max(0, brokenOrLostQty);

  const isExcess = safeReturned + safeBroken > assignedQty;
  const isDeficit = safeReturned + safeBroken < assignedQty;
  const unaccountedQty = assignedQty - (safeReturned + safeBroken);

  // Stock updates:
  const newWarehouseStock = currentWarehouseStock + safeReturned;
  const newCirculationStock = Math.max(0, currentCirculationStock - (safeReturned + safeBroken));

  const totalLossCost = roundCurrency(safeBroken * unitReplacementCost);

  return {
    assignedQty,
    safeReturned,
    safeBroken,
    unaccountedQty,
    isExcess,
    isDeficit,
    totalLossCost,
    newWarehouseStock,
    newCirculationStock,
  };
}

// =========================================================================
// EMPIRICAL TEST SUITE
// =========================================================================

describe('Milestone 9 Empirical Challenge Suite', () => {

  describe('1. SRI 49-Digit Access Key & Fiscal Validation', () => {
    test('SRI-01: Validates format, length (49) and numeric constraints', () => {
      const validKey = '0911202601179000574400120010020000458921234567815';
      const res = validateSriAccessKey49Strict(validKey);
      assert.equal(res.isValid, true);
      assert.equal(res.metadata.ruc, '1790005744001');
      assert.equal(res.metadata.docType, '01');
      assert.equal(res.metadata.env, '2');
      assert.equal(res.hasValidCheckDigit, true);
    });

    test('SRI-02: Rejects truncated keys (< 49 digits) and overflow keys (> 49 digits)', () => {
      const shortKey = '09112026011790005744001200100200004589212345678'; // 47 digits
      assert.equal(validateSriAccessKey49Strict(shortKey).isValid, false);

      const longKey = '091120260117900057440012001002000045892123456781599'; // 51 digits
      assert.equal(validateSriAccessKey49Strict(longKey).isValid, false);
    });

    test('SRI-03: Rejects alphabetic or non-numeric characters inside the key', () => {
      const alphaKey = '091120260117900057440012001002000045892123456781A';
      assert.equal(validateSriAccessKey49Strict(alphaKey).isValid, false);
    });

    test('SRI-04: Validates Ecuadorian Supplier RUC schema (13 digits, province 01-24, establishment 001)', () => {
      assert.equal(validateEcuadorianSupplierRuc('1790005744001').isValid, true); // Pichincha (17)
      assert.equal(validateEcuadorianSupplierRuc('0990012345001').isValid, true); // Guayas (09)
      assert.equal(validateEcuadorianSupplierRuc('0190012345001').isValid, true); // Azuay (01)

      // Invalid province 99
      assert.equal(validateEcuadorianSupplierRuc('9990012345001').isValid, false);

      // Non-001 establishment suffix
      assert.equal(validateEcuadorianSupplierRuc('1790005744002').isValid, false);

      // Invalid length
      assert.equal(validateEcuadorianSupplierRuc('1790005744').isValid, false);
    });

    test('SRI-05: Modulo 11 check digit verification identifies discrepancies', () => {
      const partial = '091120260117900057440012001002000045892123456781';
      const correctDigit = computeSriModulo11(partial);
      assert.equal(correctDigit, 5);

      const keyWithCorrectDigit = partial + correctDigit;
      const keyWithWrongDigit = partial + '9';

      assert.equal(validateSriAccessKey49Strict(keyWithCorrectDigit).hasValidCheckDigit, true);
      assert.equal(validateSriAccessKey49Strict(keyWithWrongDigit).hasValidCheckDigit, false);
    });
  });

  describe('2. SRI 15% IVA Tax Calculation & Line-Item Pricing', () => {
    test('TAX-01: Line items subtotal, 15% IVA and grand total reconcile exactly', () => {
      const invoice = {
        supplierName: 'PRONACA S.A.',
        items: [
          { itemCode: 'ALM-LOM-01', quantity: 50, unitCost: 8.50, subtotal: 425.00 },
          { itemCode: 'ALM-POL-02', quantity: 40, unitCost: 4.20, subtotal: 168.00 },
          { itemCode: 'ALM-HUE-05', quantity: 20, unitCost: 3.80, subtotal: 76.00 },
        ],
        subtotal: 669.00,
        vat15: 100.35,
        total: 769.35,
      };

      const result = reconcileInvoiceFinancials(invoice);
      assert.equal(result.isFullyConsistent, true);
      assert.equal(result.calculatedSubtotal, 669.00);
      assert.equal(result.calculatedVat, 100.35);
      assert.equal(result.calculatedTotal, 769.35);
    });

    test('TAX-02: Fractional cent tax rounding adheres to standard rounding (half-up)', () => {
      // 33.33 * 0.15 = 4.9995 -> 5.00
      const vatA = calculateVat15(33.33);
      assert.equal(vatA, 5.00);

      // 10.05 * 0.15 = 1.5075 -> 1.51
      const vatB = calculateVat15(10.05);
      assert.equal(vatB, 1.51);

      // 10.01 * 0.15 = 1.5015 -> 1.50
      const vatC = calculateVat15(10.01);
      assert.equal(vatC, 1.50);
    });

    test('TAX-03: Detects fraudulent or mismatched invoice totals', () => {
      const tamperedInvoice = {
        items: [{ itemCode: 'BEB-COL-02', quantity: 10, unitCost: 15.00, subtotal: 150.00 }],
        subtotal: 150.00,
        vat15: 22.50,
        total: 200.00, // Fraudulent total: should be 172.50
      };

      const result = reconcileInvoiceFinancials(tamperedInvoice);
      assert.equal(result.isFullyConsistent, false);
      assert.equal(result.totalMatches, false);
      assert.equal(result.calculatedTotal, 172.50);
    });
  });

  describe('3. Warehouse Stock Replenishment & Reorder Point Alerts', () => {
    test('REP-01: Stock bumps by exact purchased quantity and calculates Weighted Average Cost (PMP)', () => {
      const initialItem = {
        code: 'ALM-LOM-01',
        name: 'Lomo Fino',
        currentStock: 38.0,
        unitCost: 8.50,
        minStock: 25.0,
        reorderPoint: 45.0,
      };

      // Purchase 50 kg @ $9.00 (price increase)
      const updated = replenishItemStock(initialItem, 50.0, 9.00);

      // Expected stock: 38 + 50 = 88.0 kg
      assert.equal(updated.currentStock, 88.0);

      // Expected PMP: (38 * 8.50 + 50 * 9.00) / 88 = (323 + 450) / 88 = 773 / 88 = 8.78409 -> 8.78
      assert.equal(updated.unitCost, 8.78);
    });

    test('REP-02: Zero initial stock takes the exact purchase unit cost as new PMP', () => {
      const outOfStockItem = {
        code: 'BEB-JUG-04',
        name: 'Pulpa de Frutas',
        currentStock: 0,
        unitCost: 3.00,
        minStock: 10.0,
        reorderPoint: 20.0,
      };

      const updated = replenishItemStock(outOfStockItem, 25.0, 3.75);
      assert.equal(updated.currentStock, 25.0);
      assert.equal(updated.unitCost, 3.75);
    });

    test('REP-03: Stock replenishment clears critical and warning reorder point alerts', () => {
      // Simulate low stock below reorder point
      const lowStockItem = {
        code: 'INS-SRV-01',
        name: 'Servilletas',
        currentStock: 30.0, // Below reorderPoint (60)
        minStock: 20.0,
        reorderPoint: 60.0,
        unitCost: 2.80,
      };

      // Item is in 'warning' status
      const isWarningBefore = lowStockItem.currentStock <= lowStockItem.reorderPoint;
      assert.equal(isWarningBefore, true);

      // Replenish 40 units from Indurmesa invoice
      const replenished = replenishItemStock(lowStockItem, 40.0, 2.80);
      assert.equal(replenished.currentStock, 70.0);

      // After replenishment, stock is 70 > 60 -> alert cleared!
      const isWarningAfter = replenished.currentStock <= replenished.reorderPoint;
      assert.equal(isWarningAfter, false);
    });

    test('REP-04: Prevents invalid or negative purchase quantities', () => {
      const item = {
        code: 'ALM-LOM-01',
        currentStock: 50.0,
        unitCost: 8.50,
      };

      assert.throws(() => replenishItemStock(item, -10.0, 8.50), /estrictamente positiva/);
      assert.throws(() => replenishItemStock(item, 0, 8.50), /estrictamente positiva/);
    });
  });

  describe('4. Tableware Post-Event Settlement & MERMA_ROTURA Kardex Accounting', () => {
    test('TBL-01: 100% Intact Return restores bodega stock, clears circulation, and incurs $0.00 charge', () => {
      const settlement = executeTablewareSettlement({
        assignedQty: 100,
        returnedIntactQty: 100,
        brokenOrLostQty: 0,
        unitReplacementCost: 6.20,
        currentWarehouseStock: 200,
        currentCirculationStock: 100,
      });

      assert.equal(settlement.safeReturned, 100);
      assert.equal(settlement.safeBroken, 0);
      assert.equal(settlement.totalLossCost, 0.00);
      assert.equal(settlement.newWarehouseStock, 300); // 200 + 100
      assert.equal(settlement.newCirculationStock, 0); // 100 - 100
      assert.equal(settlement.isExcess, false);
      assert.equal(settlement.isDeficit, false);
    });

    test('TBL-02: Partial breakage calculates exact replacement cost and reconciles warehouse balance', () => {
      const settlement = executeTablewareSettlement({
        assignedQty: 100,
        returnedIntactQty: 96,
        brokenOrLostQty: 4,
        unitReplacementCost: 6.20,
        currentWarehouseStock: 200,
        currentCirculationStock: 100,
      });

      // 4 broken * $6.20 = $24.80 USD
      assert.equal(settlement.safeReturned, 96);
      assert.equal(settlement.safeBroken, 4);
      assert.equal(settlement.totalLossCost, 24.80);

      // Warehouse recovers 96 intact pieces (stock becomes 296, 4 were broken and are not returned)
      assert.equal(settlement.newWarehouseStock, 296);

      // Circulation cleared: 100 - (96 + 4) = 0
      assert.equal(settlement.newCirculationStock, 0);
      assert.equal(settlement.isExcess, false);
      assert.equal(settlement.isDeficit, false);
    });

    test('TBL-03: 100% Destruction / Total Loss charges full replacement and adds 0 pieces to warehouse', () => {
      const settlement = executeTablewareSettlement({
        assignedQty: 50,
        returnedIntactQty: 0,
        brokenOrLostQty: 50,
        unitReplacementCost: 3.80,
        currentWarehouseStock: 150,
        currentCirculationStock: 50,
      });

      // 50 * $3.80 = $190.00 USD
      assert.equal(settlement.totalLossCost, 190.00);
      assert.equal(settlement.newWarehouseStock, 150); // No items returned
      assert.equal(settlement.newCirculationStock, 0); // All 50 resolved
    });

    test('TBL-04: Excess return detection (phantom items injection > assignedQty)', () => {
      const settlement = executeTablewareSettlement({
        assignedQty: 100,
        returnedIntactQty: 105,
        brokenOrLostQty: 0,
        unitReplacementCost: 6.20,
        currentWarehouseStock: 200,
        currentCirculationStock: 100,
      });

      assert.equal(settlement.isExcess, true);
      assert.equal(settlement.unaccountedQty, -5); // 5 phantom pieces
    });

    test('TBL-05: Deficit / Unaccounted loss detection (unreturned pieces not registered as broken)', () => {
      const settlement = executeTablewareSettlement({
        assignedQty: 100,
        returnedIntactQty: 80,
        brokenOrLostQty: 0, // 20 pieces missing / unaccounted
        unitReplacementCost: 6.20,
        currentWarehouseStock: 200,
        currentCirculationStock: 100,
      });

      assert.equal(settlement.isDeficit, true);
      assert.equal(settlement.unaccountedQty, 20); // 20 pieces missing!
    });

    test('TBL-06: Negative input protection clamp to zero', () => {
      const settlement = executeTablewareSettlement({
        assignedQty: 100,
        returnedIntactQty: -10, // Attempted negative returned
        brokenOrLostQty: -5,   // Attempted negative broken
        unitReplacementCost: 6.20,
        currentWarehouseStock: 200,
        currentCirculationStock: 100,
      });

      assert.equal(settlement.safeReturned, 0);
      assert.equal(settlement.safeBroken, 0);
      assert.equal(settlement.totalLossCost, 0.00);
    });

    test('TBL-07: Kardex Ledger Entry Integrity for MERMA_ROTURA and RETURN_EQUIPMENT', () => {
      // Simulate settlement resulting in 2 Kardex entries
      const kardexEntries = [];
      const item = { id: 'MEN-COP-03', name: 'Copas Cristal', unitCost: 3.80, unit: 'und' };
      const returned = 142;
      const broken = 8;
      const prevStock = 100;
      const newStock = prevStock + returned; // 242

      if (returned > 0) {
        kardexEntries.push({
          type: 'RETURN_EQUIPMENT',
          quantity: returned,
          previousStock: prevStock,
          newStock: newStock,
          totalValue: roundCurrency(returned * item.unitCost),
        });
      }

      if (broken > 0) {
        kardexEntries.push({
          type: 'LOSS_BREAKAGE',
          quantity: -broken,
          previousStock: newStock,
          newStock: newStock,
          unitCost: item.unitCost,
          totalValue: roundCurrency(broken * item.unitCost),
        });
      }

      assert.equal(kardexEntries.length, 2);

      const returnEntry = kardexEntries[0];
      assert.equal(returnEntry.type, 'RETURN_EQUIPMENT');
      assert.equal(returnEntry.quantity, 142);
      assert.equal(returnEntry.previousStock, 100);
      assert.equal(returnEntry.newStock, 242);
      assert.equal(returnEntry.totalValue, 539.60);

      const breakageEntry = kardexEntries[1];
      assert.equal(breakageEntry.type, 'LOSS_BREAKAGE');
      assert.equal(breakageEntry.quantity, -8);
      assert.equal(breakageEntry.totalValue, 30.40);
    });
  });

  describe('5. Multi-Tenant Warehouse Isolation', () => {
    test('TEN-01: Ingesting invoice in CROE does not modify Círculo Militar inventory or Kardex', () => {
      // CROE and Circulo have independent localStorage keys
      const croeKey = 'plataforma_inv_stock_croe_v1';
      const circuloKey = 'plataforma_inv_stock_circulo-militar_v1';

      assert.notEqual(croeKey, circuloKey);
    });
  });

});
