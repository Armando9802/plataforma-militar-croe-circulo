import { describe, it, expect } from 'vitest';
import { calculateExplosion, calculateSupplyExplosion } from '../../src/utils/recipeExplosion';
import { RecipeFormula, InventoryItem } from '../../src/types/inventory';

describe('Tier 2: Boundary Domain 2.7 — Inventory & BoM Calculations', () => {
  const mockFormula: RecipeFormula = {
    id: 'form-almuerzo-test',
    type: 'shift',
    code: 'almuerzo',
    name: 'Almuerzo de Guarnición Militar',
    description: 'Menú de almuerzo estándar con proteína y guarnición',
    mealCourse: 'Almuerzo',
    requirements: [
      {
        itemCode: 'ALM-LOM-01',
        name: 'Lomo Fino de Res Premium',
        category: 'kitchen_food',
        quantityPerPax: 0.12, // 120 grams per pax
        unit: 'kg',
        isReturnable: false,
      },
      {
        itemCode: 'BEB-COL-02',
        name: 'Gaseosa Coca-Cola 355ml',
        category: 'beverages',
        quantityPerPax: 1,
        unit: 'botella',
        isReturnable: false,
      },
      {
        itemCode: 'MEN-PLA-01',
        name: 'Plato Llano Porcelana',
        category: 'tableware',
        quantityPerPax: 1,
        unit: 'und',
        isReturnable: true,
      },
    ],
  };

  it('T2-IBD-01: Detects and Flags Shortage When Required Quantity Exceeds Stock', () => {
    const limitedStockItems: InventoryItem[] = [
      {
        id: 'item-lom',
        tenantId: 'croe',
        code: 'ALM-LOM-01',
        name: 'Lomo Fino de Res Premium',
        category: 'kitchen_food',
        unit: 'kg',
        currentStock: 5.0, // Only 5 kg available
        minStock: 10,
        reorderPoint: 25,
        optimalStock: 100,
        unitCost: 8.5,
        isReturnable: false,
        inCirculationStock: 0,
        location: 'Cámara 1',
        lastRestocked: '2026-11-01',
      },
      {
        id: 'item-col',
        tenantId: 'croe',
        code: 'BEB-COL-02',
        name: 'Gaseosa Coca-Cola 355ml',
        category: 'beverages',
        unit: 'botella',
        currentStock: 200,
        minStock: 24,
        reorderPoint: 48,
        optimalStock: 300,
        unitCost: 0.75,
        isReturnable: false,
        inCirculationStock: 0,
        location: 'Bodega Secos',
        lastRestocked: '2026-11-01',
      },
      {
        id: 'item-pla',
        tenantId: 'croe',
        code: 'MEN-PLA-01',
        name: 'Plato Llano Porcelana',
        category: 'tableware',
        unit: 'und',
        currentStock: 150,
        minStock: 30,
        reorderPoint: 60,
        optimalStock: 200,
        unitCost: 6.0,
        isReturnable: true,
        inCirculationStock: 0,
        location: 'Vajilla',
        lastRestocked: '2026-11-01',
      },
    ];

    // Requesting 100 PAX requires 12.0 kg of lomo (current stock is 5.0 kg)
    const result = calculateExplosion(mockFormula, 100, limitedStockItems);

    expect(result.hasAnyShortage).toBe(true);
    const lomoPreview = result.previews.find((p) => p.item.code === 'ALM-LOM-01');
    expect(lomoPreview?.hasShortage).toBe(true);
    expect(lomoPreview?.requiredQty).toBe(12.0);
    expect(lomoPreview?.shortageAmount).toBe(7.0); // 12 - 5
    expect(lomoPreview?.projectedStatus).toBe('critical');
  });

  it('T2-IBD-02: Zero PAX Computes 0 Deductions and Zero Costs Without Corrupting State', () => {
    const stockItems: InventoryItem[] = [
      {
        id: 'item-lom',
        tenantId: 'croe',
        code: 'ALM-LOM-01',
        name: 'Lomo Fino de Res Premium',
        category: 'kitchen_food',
        unit: 'kg',
        currentStock: 50.0,
        minStock: 10,
        reorderPoint: 25,
        optimalStock: 100,
        unitCost: 8.5,
        isReturnable: false,
        inCirculationStock: 0,
        location: 'Cámara 1',
        lastRestocked: '2026-11-01',
      },
    ];

    const result = calculateExplosion(mockFormula, 0, stockItems);

    expect(result.hasAnyShortage).toBe(false);
    expect(result.totalEstimatedCost).toBe(0);
    const lomoPreview = result.previews.find((p) => p.item.code === 'ALM-LOM-01');
    expect(lomoPreview?.requiredQty).toBe(0);
    expect(lomoPreview?.projectedStock).toBe(50.0);
  });

  it('T2-IBD-03: Exact Boundary Transition When Projected Stock Equals Reorder Point', () => {
    const stockItems: InventoryItem[] = [
      {
        id: 'item-col',
        tenantId: 'croe',
        code: 'BEB-COL-02',
        name: 'Gaseosa Coca-Cola 355ml',
        category: 'beverages',
        unit: 'botella',
        currentStock: 48, // Exactly equal to reorderPoint
        minStock: 24,
        reorderPoint: 48,
        optimalStock: 200,
        unitCost: 0.75,
        isReturnable: false,
        inCirculationStock: 0,
        location: 'Bodega Secos',
        lastRestocked: '2026-11-01',
      },
    ];

    // 0 consumption keeps stock at exactly 48 (reorder point) -> should trigger warning
    const resultWarning = calculateExplosion(mockFormula, 0, stockItems);
    const colPreviewWarning = resultWarning.previews.find((p) => p.item.code === 'BEB-COL-02');
    expect(colPreviewWarning?.projectedStatus).toBe('warning');

    // If stock is 49 (reorderPoint + 1) -> optimal
    stockItems[0].currentStock = 49;
    const resultOptimal = calculateExplosion(mockFormula, 0, stockItems);
    const colPreviewOptimal = resultOptimal.previews.find((p) => p.item.code === 'BEB-COL-02');
    expect(colPreviewOptimal?.projectedStatus).toBe('optimal');

    // If stock drops to minStock (24) -> critical
    stockItems[0].currentStock = 24;
    const resultCritical = calculateExplosion(mockFormula, 0, stockItems);
    const colPreviewCritical = resultCritical.previews.find((p) => p.item.code === 'BEB-COL-02');
    expect(colPreviewCritical?.projectedStatus).toBe('critical');
  });

  it('T2-IBD-04: High-Precision Decimal Calculations in Protein Portioning', () => {
    // 85 PAX at 0.12 kg/PAX = 10.20 kg exactly
    const explosion85 = calculateSupplyExplosion({
      serviceType: 'shift',
      shiftType: 'almuerzo',
      paxCount: 85,
    });

    const lomo = explosion85.find((i) => i.sku === 'ALM-LOM-01');
    expect(lomo).toBeDefined();
    expect(lomo?.totalQuantity).toBe(10.2);

    // 127 PAX at 0.12 kg/PAX = 15.24 kg
    const explosion127 = calculateSupplyExplosion({
      serviceType: 'shift',
      shiftType: 'almuerzo',
      paxCount: 127,
    });

    const lomo127 = explosion127.find((i) => i.sku === 'ALM-LOM-01');
    expect(lomo127?.totalQuantity).toBe(15.24);
  });
});
