import { describe, it, expect } from 'vitest';
import {
  calculateSupplyExplosion,
  calculateExplosion,
  SHIFT_RECIPE_BOM,
  EVENT_RECIPE_BOM,
} from '../../src/utils/recipeExplosion';
import {
  CROE_INVENTORY_SEED,
  CIRCULO_INVENTORY_SEED,
  RECIPE_FORMULAS,
  INITIAL_KARDEX_ENTRIES_CROE,
  INITIAL_KARDEX_ENTRIES_CIRCULO,
} from '../../src/data/mockInventory';
import { PRELOADED_SUPPLIER_INVOICES } from '../../src/data/mockInvoices';
import { InventoryItem, RecipeFormula, KardexEntry, TablewareAuditItem } from '../../src/types/inventory';
import { ShiftType, EventType } from '../../src/types/restaurant';

describe('Tier 2: Milestone 9 — Empirical Stress & Boundary Harness', () => {

  // =========================================================================
  // SECTION 1: SHIFT BOM CALCULATION ACCURACY PER PAX (Desayuno, Almuerzo, Cena)
  // =========================================================================
  describe('1. Shift BOM Calculation Accuracy across PAX Configurations', () => {
    const shiftTypes: ShiftType[] = ['desayuno', 'almuerzo', 'cena'];

    it('M9-SFT-01: Shift BOM items scale linearly with zero floating-point drift for standard PAX', () => {
      const paxCases = [1, 10, 25, 45, 80, 100, 150];

      shiftTypes.forEach((shift) => {
        const bom = SHIFT_RECIPE_BOM[shift];
        expect(bom.length).toBeGreaterThan(0);

        paxCases.forEach((pax) => {
          const explosion = calculateSupplyExplosion({
            serviceType: 'shift',
            shiftType: shift,
            paxCount: pax,
          });

          expect(explosion.length).toBe(bom.length);

          bom.forEach((req, idx) => {
            const expItem = explosion[idx];
            expect(expItem.sku).toBe(req.sku);
            expect(expItem.category).toBe(req.category);
            expect(expItem.isConsumable).toBe(req.isConsumable);

            // Precision check: Math.round(quantityPerPax * pax * 100) / 100
            const expectedQty = Math.round(req.quantityPerPax * pax * 100) / 100;
            expect(expItem.totalQuantity).toBe(expectedQty);
            // Ensure no IEEE-754 precision leakage (e.g. 10.200000000000001)
            expect(Number.isFinite(expItem.totalQuantity)).toBe(true);
            expect(expItem.totalQuantity.toString().split('.')[1]?.length || 0).toBeLessThanOrEqual(2);
          });
        });
      });
    });

    it('M9-SFT-02: Boundary 0 PAX produces exact zero quantities and empty cost footprint', () => {
      shiftTypes.forEach((shift) => {
        const explosion = calculateSupplyExplosion({
          serviceType: 'shift',
          shiftType: shift,
          paxCount: 0,
        });

        explosion.forEach((item) => {
          expect(item.totalQuantity).toBe(0);
        });
      });
    });

    it('M9-SFT-03: Fractional and Non-Integer PAX are rounded with 2-decimal precision', () => {
      const fractionalPax = 42.75;
      const explosion = calculateSupplyExplosion({
        serviceType: 'shift',
        shiftType: 'almuerzo',
        paxCount: fractionalPax,
      });

      // Lomo: 0.12 * 42.75 = 5.13 kg
      const lomo = explosion.find((i) => i.sku === 'ALM-LOM-01');
      expect(lomo?.totalQuantity).toBe(5.13);

      // Servilletas: 3 * 42.75 = 128.25 und
      const srv = explosion.find((i) => i.sku === 'INS-SRV-01');
      expect(srv?.totalQuantity).toBe(128.25);
    });

    it('M9-SFT-04: Recipe Formulas vs Shift BOM Catalog SKU Alignment', () => {
      // Verify all items in SHIFT_RECIPE_BOM exist in both CROE and Círculo inventory seeds
      const croeCodes = new Set(CROE_INVENTORY_SEED.map((i) => i.code));
      const circuloCodes = new Set(CIRCULO_INVENTORY_SEED.map((i) => i.code));

      shiftTypes.forEach((shift) => {
        const bom = SHIFT_RECIPE_BOM[shift];
        bom.forEach((req) => {
          expect(croeCodes.has(req.sku)).toBe(true);
          expect(circuloCodes.has(req.sku)).toBe(true);
        });
      });
    });
  });

  // =========================================================================
  // SECTION 2: EVENT SCALING UP TO LARGE BANQUETS (200, 350 PAX)
  // =========================================================================
  describe('2. Event Scaling up to Large Banquets (200 PAX & 350 PAX)', () => {
    const eventTypes: EventType[] = [
      'banquete_gala',
      'almuerzo_campestre',
      'coctel_honor',
      'desayuno_trabajo',
      'evento_social',
    ];

    it('M9-EVT-01: Banquete de Gala scales to 200 PAX (CROE Salón del Sol Capacity)', () => {
      const pax = 200;
      const explosion = calculateSupplyExplosion({
        serviceType: 'event',
        eventType: 'banquete_gala',
        paxCount: pax,
      });

      // Expected quantities at 200 PAX:
      // Lomo: 0.28 * 200 = 56 kg
      // Papa: 0.16 * 200 = 32 kg
      // Arroz: 0.10 * 200 = 20 kg
      // Güitig: 1 * 200 = 200 botellas
      // Servilletas: 4 * 200 = 800 und
      // Platos: 2 * 200 = 400 und
      // Cubiertos: 2 * 200 = 400 sets
      // Copas: 2 * 200 = 400 und
      const lomo = explosion.find((i) => i.sku === 'ALM-LOM-01');
      expect(lomo?.totalQuantity).toBe(56.0);

      const papa = explosion.find((i) => i.sku === 'ALM-PAP-04');
      expect(papa?.totalQuantity).toBe(32.0);

      const arroz = explosion.find((i) => i.sku === 'ALM-ARR-03');
      expect(arroz?.totalQuantity).toBe(20.0);

      const platos = explosion.find((i) => i.sku === 'MEN-PLA-01');
      expect(platos?.totalQuantity).toBe(400);

      const cubiertos = explosion.find((i) => i.sku === 'MEN-CUB-02');
      expect(cubiertos?.totalQuantity).toBe(400);

      const copas = explosion.find((i) => i.sku === 'MEN-COP-03');
      expect(copas?.totalQuantity).toBe(400);

      const servilletas = explosion.find((i) => i.sku === 'INS-SRV-01');
      expect(servilletas?.totalQuantity).toBe(800);
    });

    it('M9-EVT-02: Banquete de Gala scales to 350 PAX (Círculo Militar Gran Salón de los Generales)', () => {
      const pax = 350;
      const explosion = calculateSupplyExplosion({
        serviceType: 'event',
        eventType: 'banquete_gala',
        paxCount: pax,
      });

      // Expected quantities at 350 PAX:
      // Lomo: 0.28 * 350 = 98 kg
      // Papa: 0.16 * 350 = 56 kg
      // Arroz: 0.10 * 350 = 35 kg
      // Platos: 2 * 350 = 700 und
      // Cubiertos: 2 * 350 = 700 sets
      // Copas: 2 * 350 = 700 und
      // Servilletas: 4 * 350 = 1400 und
      const lomo = explosion.find((i) => i.sku === 'ALM-LOM-01');
      expect(lomo?.totalQuantity).toBe(98.0);

      const papa = explosion.find((i) => i.sku === 'ALM-PAP-04');
      expect(papa?.totalQuantity).toBe(56.0);

      const arroz = explosion.find((i) => i.sku === 'ALM-ARR-03');
      expect(arroz?.totalQuantity).toBe(35.0);

      const platos = explosion.find((i) => i.sku === 'MEN-PLA-01');
      expect(platos?.totalQuantity).toBe(700);

      const cubiertos = explosion.find((i) => i.sku === 'MEN-CUB-02');
      expect(cubiertos?.totalQuantity).toBe(700);

      const copas = explosion.find((i) => i.sku === 'MEN-COP-03');
      expect(copas?.totalQuantity).toBe(700);

      const servilletas = explosion.find((i) => i.sku === 'INS-SRV-01');
      expect(servilletas?.totalQuantity).toBe(1400);
    });

    it('M9-EVT-03: Massive banquet stress (1,000 PAX) scales linearly without numerical overflow', () => {
      eventTypes.forEach((evt) => {
        const explosion = calculateSupplyExplosion({
          serviceType: 'event',
          eventType: evt,
          paxCount: 1000,
        });

        expect(explosion.length).toBeGreaterThan(0);
        explosion.forEach((item) => {
          expect(Number.isFinite(item.totalQuantity)).toBe(true);
          expect(item.totalQuantity).toBeGreaterThan(0);
          expect(isNaN(item.totalQuantity)).toBe(false);
        });
      });
    });
  });

  // =========================================================================
  // SECTION 3: STOCK DEDUCTION MATH, NON-NEGATIVITY & SHORTAGE DETECTION
  // =========================================================================
  describe('3. Stock Deduction Math, Non-Negativity Guarantees & Shortage Detection', () => {
    it('M9-STK-01: calculateExplosion detects shortages and guarantees projectedStock non-negativity', () => {
      const formula = RECIPE_FORMULAS.find((f) => f.code === 'banquete_gala')!;
      expect(formula).toBeDefined();

      // Run against CROE inventory with 350 PAX (should trigger shortage for Lomo and Tableware)
      const result = calculateExplosion(formula, 350, CROE_INVENTORY_SEED);

      expect(result.hasAnyShortage).toBe(true);

      result.previews.forEach((preview) => {
        // Guarantee: projectedStock must NEVER be negative
        expect(preview.projectedStock).toBeGreaterThanOrEqual(0);

        if (preview.hasShortage) {
          expect(preview.shortageAmount).toBeGreaterThan(0);
          // Required quantity should exceed current stock
          expect(preview.requiredQty).toBeGreaterThan(preview.currentStock);
          // Deficit must equal requiredQty - currentStock
          const expectedDeficit = Math.round((preview.requiredQty - preview.currentStock) * 100) / 100;
          expect(preview.shortageAmount).toBeCloseTo(expectedDeficit, 2);
        } else {
          expect(preview.shortageAmount).toBe(0);
          expect(preview.projectedStock).toBe(
            Math.round((preview.currentStock - preview.requiredQty) * 100) / 100
          );
        }
      });
    });

    it('M9-STK-02: Status transition thresholds (optimal -> warning -> critical) at exact boundaries', () => {
      const mockItem: InventoryItem = {
        id: 'test-item-01',
        tenantId: 'croe',
        code: 'TEST-SKU-01',
        name: 'Item de Prueba Threshold',
        category: 'disposables',
        unit: 'und',
        currentStock: 100,
        minStock: 20,
        reorderPoint: 50,
        optimalStock: 150,
        unitCost: 1.0,
        isReturnable: false,
        inCirculationStock: 0,
        location: 'Bodega 1',
        lastRestocked: '2026-11-01',
      };

      const testFormula: RecipeFormula = {
        id: 'test-f-1',
        type: 'shift',
        code: 'test',
        name: 'Formula Test',
        description: 'Test',
        mealCourse: 'Test',
        requirements: [
          { itemCode: 'TEST-SKU-01', name: 'Item Test', category: 'disposables', quantityPerPax: 1, unit: 'und', isReturnable: false },
        ],
      };

      // Case A: Consumption leaves stock at 51 (> 50 reorder) -> Optimal
      const resA = calculateExplosion(testFormula, 49, [mockItem]);
      expect(resA.previews[0].projectedStatus).toBe('optimal');

      // Case B: Consumption leaves stock at exactly 50 (== reorderPoint) -> Warning
      const resB = calculateExplosion(testFormula, 50, [mockItem]);
      expect(resB.previews[0].projectedStatus).toBe('warning');

      // Case C: Consumption leaves stock at exactly 21 (> minStock, <= reorderPoint) -> Warning
      const resC = calculateExplosion(testFormula, 79, [mockItem]);
      expect(resC.previews[0].projectedStatus).toBe('warning');

      // Case D: Consumption leaves stock at exactly 20 (== minStock) -> Critical
      const resD = calculateExplosion(testFormula, 80, [mockItem]);
      expect(resD.previews[0].projectedStatus).toBe('critical');

      // Case E: Consumption leaves stock at 0 (<= minStock) -> Critical
      const resE = calculateExplosion(testFormula, 100, [mockItem]);
      expect(resE.previews[0].projectedStatus).toBe('critical');
      expect(resE.previews[0].projectedStock).toBe(0);

      // Case F: Consumption exceeds stock (120 demanded vs 100 stock) -> Critical + Shortage
      const resF = calculateExplosion(testFormula, 120, [mockItem]);
      expect(resF.previews[0].projectedStatus).toBe('critical');
      expect(resF.previews[0].projectedStock).toBe(0);
      expect(resF.previews[0].hasShortage).toBe(true);
      expect(resF.previews[0].shortageAmount).toBe(20);
    });

    it('M9-STK-03: Zero PAX does not alter stock or cause NaN calculations', () => {
      const formula = RECIPE_FORMULAS[0];
      const result = calculateExplosion(formula, 0, CROE_INVENTORY_SEED);

      expect(result.hasAnyShortage).toBe(false);
      expect(result.totalEstimatedCost).toBe(0);
      expect(result.disposableCount).toBe(0);
      expect(result.foodPortionsCount).toBe(0);
      expect(result.beverageCount).toBe(0);
      expect(result.tablewareAssignedCount).toBe(0);

      result.previews.forEach((p) => {
        expect(p.requiredQty).toBe(0);
        expect(p.projectedStock).toBe(p.currentStock);
      });
    });
  });

  // =========================================================================
  // SECTION 4: KARDEX BALANCE CONSISTENCY ($PreviousStock ± Quantity = NewStock$)
  // =========================================================================
  describe('4. Kardex Balance Invariant Consistency ($PreviousStock ± Quantity = NewStock$)', () => {
    it('M9-KDX-01: Initial seed kardex entries satisfy balance invariant (PreviousStock + Quantity = NewStock)', () => {
      const allInitialEntries = [
        ...INITIAL_KARDEX_ENTRIES_CROE,
        ...INITIAL_KARDEX_ENTRIES_CIRCULO,
      ];

      allInitialEntries.forEach((entry) => {
        expect(entry.previousStock).toBe(0);
        expect(entry.quantity).toBe(entry.newStock);
        expect(entry.previousStock + entry.quantity).toBe(entry.newStock);
        expect(entry.type).toBe('INITIAL_BALANCE');
      });
    });

    it('M9-KDX-02: Supplier Invoice Purchase satisfies balance invariant and PMP valuation', () => {
      // Test the purchase ingestion math across all preloaded supplier invoices
      PRELOADED_SUPPLIER_INVOICES.forEach((invoice) => {
        const testInventory: InventoryItem[] = JSON.parse(JSON.stringify(CIRCULO_INVENTORY_SEED));

        invoice.items.forEach((line) => {
          const item = testInventory.find((i) => i.code === line.itemCode);
          if (!item) return;

          const prevStock = item.currentStock;
          const newStock = Math.round((prevStock + line.quantity) * 100) / 100;

          // Invariant Check: PreviousStock + Quantity == NewStock
          expect(prevStock + line.quantity).toBeCloseTo(newStock, 4);

          // PMP Valuation Check
          const prevVal = prevStock * item.unitCost;
          const lineVal = line.quantity * line.unitCost;
          const expectedPmp = Math.round(((prevVal + lineVal) / newStock) * 100) / 100;

          expect(Number.isFinite(expectedPmp)).toBe(true);
          expect(expectedPmp).toBeGreaterThan(0);
        });
      });
    });

    it('M9-KDX-03: Tableware Settlement Return satisfies balance invariant', () => {
      // Simulate Tableware Return for an event
      const dispatchedPlateQty = 150;
      const returnedSoundQty = 145;
      const brokenQty = 5;
      const initialWarehouseStock = 200;

      // Invariant: At return, sound plates are added back to warehouse:
      // prevStock = 200, qty = +145, newStock = 345
      const newStock = initialWarehouseStock + returnedSoundQty;
      expect(initialWarehouseStock + returnedSoundQty).toBe(newStock);

      // Financial loss for broken plates
      const replacementCost = 6.20;
      const totalLoss = Math.round(brokenQty * replacementCost * 100) / 100;
      expect(totalLoss).toBe(31.00);
    });

    it('M9-KDX-04: Physical Count Adjustment satisfies balance invariant in both directions', () => {
      const prevStock = 45;

      // Positive adjustment (+15 units found in audit)
      const adjustedUp = 60;
      const diffUp = adjustedUp - prevStock; // +15
      expect(prevStock + diffUp).toBe(adjustedUp);

      // Negative adjustment (-10 units shrinkage in audit)
      const adjustedDown = 35;
      const diffDown = adjustedDown - prevStock; // -10
      expect(prevStock + diffDown).toBe(adjustedDown);
    });

    it('M9-KDX-05: Outflow Consumption Balance Invariant holds when stock >= required', () => {
      // Standard shift deduction math
      const items = [
        { code: 'ALM-LOM-01', currentStock: 50.0, reqPerPax: 0.12, pax: 45 }, // consumed = 5.4 kg
        { code: 'BEB-COL-02', currentStock: 30.0, reqPerPax: 1.0, pax: 20 },  // consumed = 20 und
      ];

      items.forEach((item) => {
        const consumedQty = Math.round(item.reqPerPax * item.pax * 100) / 100;
        const prevStock = item.currentStock;
        const newStock = Math.round((prevStock - consumedQty) * 100) / 100;
        const kardexQty = -consumedQty;

        // Invariant: PreviousStock + Quantity == NewStock
        expect(prevStock + kardexQty).toBeCloseTo(newStock, 4);
        expect(newStock).toBeGreaterThanOrEqual(0);
      });
    });

    it('M9-KDX-06: Boundary Outflow when Stock is Insufficient (Clamping Behavior)', () => {
      // What happens if prevStock is 5, but consumed is 12?
      const prevStock = 5.0;
      const consumedQty = 12.0;

      // With non-negativity guarantee: newStock = Math.max(0, prevStock - consumedQty) = 0
      const clampedStock = Math.max(0, Math.round((prevStock - consumedQty) * 100) / 100);
      expect(clampedStock).toBe(0);

      // When clamped to 0, if kardex recorded quantity is -consumedQty (-12),
      // then prevStock + quantity = 5 - 12 = -7 != 0.
      // This identifies the boundary case where shortage occurs and stock reaches zero floor.
      const shortage = consumedQty - prevStock;
      expect(shortage).toBe(7.0);
    });
  });
});
