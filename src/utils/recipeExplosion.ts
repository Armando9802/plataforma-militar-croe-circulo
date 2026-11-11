import { ShiftType, EventType, RecipeRequirementItem } from '../types/restaurant';
import {
  InventoryItem,
  RecipeFormula,
  StockDeductionPreview,
  ExplosionResult,
  StockStatusLevel,
} from '../types/inventory';

export const SHIFT_RECIPE_BOM: Record<ShiftType, RecipeRequirementItem[]> = {
  desayuno: [
    { sku: 'ALM-HUE-05', itemName: 'Huevos de Campo Andinos', category: 'alimentos_cocina', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'ALM-QUE-06', itemName: 'Queso Fresco de Hoja / Andino', category: 'alimentos_cocina', quantityPerPax: 0.08, unit: 'kg', isConsumable: true },
    { sku: 'ALM-CAF-07', itemName: 'Café Molido de Altura Loja', category: 'alimentos_cocina', quantityPerPax: 0.02, unit: 'paquete', isConsumable: true },
    { sku: 'BEB-JUG-04', itemName: 'Pulpa de Frutas / Jugo Natural', category: 'bebidas', quantityPerPax: 0.15, unit: 'kg', isConsumable: true },
    { sku: 'INS-SRV-01', itemName: 'Servilletas de Mesa Institucionales', category: 'insumos_descartables', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'MEN-PLA-01', itemName: 'Plato Porcelana Desayuno', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'und', isConsumable: false },
    { sku: 'MEN-CUB-02', itemName: 'Juego de Cubiertos de Acero Inox', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-VAS-04', itemName: 'Vaso de Vidrio Alto Jugo', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'und', isConsumable: false },
  ],
  almuerzo: [
    { sku: 'ALM-LOM-01', itemName: 'Lomo Fino de Res Premium', category: 'alimentos_cocina', quantityPerPax: 0.12, unit: 'kg', isConsumable: true },
    { sku: 'ALM-POL-02', itemName: 'Pechuga de Pollo Fileteada', category: 'alimentos_cocina', quantityPerPax: 0.10, unit: 'kg', isConsumable: true },
    { sku: 'ALM-ARR-03', itemName: 'Arroz Flor Extra Envejecido', category: 'alimentos_cocina', quantityPerPax: 0.15, unit: 'kg', isConsumable: true },
    { sku: 'ALM-PAP-04', itemName: 'Papa Chola Seleccionada', category: 'alimentos_cocina', quantityPerPax: 0.20, unit: 'kg', isConsumable: true },
    { sku: 'BEB-COL-02', itemName: 'Gaseosa Coca-Cola 355ml', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'BEB-GUT-01', itemName: 'Agua Mineral Güitig 500ml', category: 'bebidas', quantityPerPax: 0.5, unit: 'botella', isConsumable: true },
    { sku: 'INS-SRV-01', itemName: 'Servilletas de Mesa Institucionales', category: 'insumos_descartables', quantityPerPax: 3, unit: 'und', isConsumable: true },
    { sku: 'MEN-PLA-01', itemName: 'Plato Llano Porcelana Institucional', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'und', isConsumable: false },
    { sku: 'MEN-CUB-02', itemName: 'Juego de Cubiertos de Acero Inox', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-VAS-04', itemName: 'Vaso de Vidrio Alto', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'und', isConsumable: false },
  ],
  cena: [
    { sku: 'ALM-POL-02', itemName: 'Pechuga de Ave Grillada', category: 'alimentos_cocina', quantityPerPax: 0.18, unit: 'kg', isConsumable: true },
    { sku: 'ALM-PAP-04', itemName: 'Papas al Vapor Rústicas', category: 'alimentos_cocina', quantityPerPax: 0.14, unit: 'kg', isConsumable: true },
    { sku: 'BEB-GUT-01', itemName: 'Agua Mineral Güitig 500ml', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'INS-SRV-01', itemName: 'Servilletas de Mesa Institucionales', category: 'insumos_descartables', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'MEN-PLA-01', itemName: 'Plato Llano Porcelana', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'und', isConsumable: false },
    { sku: 'MEN-CUB-02', itemName: 'Juego de Cubiertos de Acero Inox', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
  ],
};

export const EVENT_RECIPE_BOM: Record<EventType, RecipeRequirementItem[]> = {
  banquete_gala: [
    { sku: 'ALM-LOM-01', itemName: 'Lomo Fino Medallón Premium', category: 'alimentos_cocina', quantityPerPax: 0.28, unit: 'kg', isConsumable: true },
    { sku: 'ALM-PAP-04', itemName: 'Papa Chaucha Gratinada', category: 'alimentos_cocina', quantityPerPax: 0.16, unit: 'kg', isConsumable: true },
    { sku: 'ALM-ARR-03', itemName: 'Arroz Aromático Florentino', category: 'alimentos_cocina', quantityPerPax: 0.10, unit: 'kg', isConsumable: true },
    { sku: 'BEB-GUT-01', itemName: 'Agua Güitig en Vidrio', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'BEB-COL-02', itemName: 'Gaseosas Línea Coca-Cola', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'INS-SRV-01', itemName: 'Servilletas Institucionales de Gala', category: 'insumos_descartables', quantityPerPax: 4, unit: 'und', isConsumable: true },
    { sku: 'MEN-PLA-01', itemName: 'Platos Base y Fuerte Porcelana', category: 'menaje_cubiertos', quantityPerPax: 2, unit: 'und', isConsumable: false },
    { sku: 'MEN-CUB-02', itemName: 'Juegos Cubiertos Acero Gala', category: 'menaje_cubiertos', quantityPerPax: 2, unit: 'set', isConsumable: false },
    { sku: 'MEN-COP-03', itemName: 'Copas de Cristal Vino/Brindis', category: 'menaje_cubiertos', quantityPerPax: 2, unit: 'und', isConsumable: false },
  ],
  almuerzo_campestre: [
    { sku: 'ALM-LOM-01', itemName: 'Corte de Res Parrillero', category: 'alimentos_cocina', quantityPerPax: 0.25, unit: 'kg', isConsumable: true },
    { sku: 'ALM-POL-02', itemName: 'Pollo Parrillero a la Brasa', category: 'alimentos_cocina', quantityPerPax: 0.20, unit: 'kg', isConsumable: true },
    { sku: 'ALM-PAP-04', itemName: 'Papa Asada al Carbón', category: 'alimentos_cocina', quantityPerPax: 0.25, unit: 'kg', isConsumable: true },
    { sku: 'BEB-COL-02', itemName: 'Gaseosas Refrescantes', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'BEB-GUT-01', itemName: 'Agua Güitig Mineral', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'INS-VAS-02', itemName: 'Vasos Descartables Biodegradables', category: 'insumos_descartables', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'INS-SRV-01', itemName: 'Servilletas de Mesa', category: 'insumos_descartables', quantityPerPax: 4, unit: 'und', isConsumable: true },
    { sku: 'MEN-PLA-01', itemName: 'Plato Llano Resistente', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'und', isConsumable: false },
    { sku: 'MEN-CUB-02', itemName: 'Juego Cubiertos Parrilleros', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
  ],
  coctel_honor: [
    { sku: 'ALM-POL-02', itemName: 'Bocaditos de Ave & Canapés', category: 'alimentos_cocina', quantityPerPax: 0.10, unit: 'kg', isConsumable: true },
    { sku: 'ALM-QUE-06', itemName: 'Quesos Finos & Tabla de Degustación', category: 'alimentos_cocina', quantityPerPax: 0.08, unit: 'kg', isConsumable: true },
    { sku: 'BEB-GUT-01', itemName: 'Agua Mineral Güitig con Gas', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'BEB-COL-02', itemName: 'Gaseosas & Coctelería', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'INS-SRV-01', itemName: 'Servilletas de Cóctel', category: 'insumos_descartables', quantityPerPax: 5, unit: 'und', isConsumable: true },
    { sku: 'MEN-COP-03', itemName: 'Copas de Cristal Flauta/Vino', category: 'menaje_cubiertos', quantityPerPax: 2, unit: 'und', isConsumable: false },
  ],
  desayuno_trabajo: [
    { sku: 'ALM-HUE-05', itemName: 'Huevos Revueltos / Benedictinos', category: 'alimentos_cocina', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'ALM-QUE-06', itemName: 'Queso Andino de Finca', category: 'alimentos_cocina', quantityPerPax: 0.06, unit: 'kg', isConsumable: true },
    { sku: 'ALM-CAF-07', itemName: 'Café Molido Gourmet Vilcabamba', category: 'alimentos_cocina', quantityPerPax: 0.025, unit: 'paquete', isConsumable: true },
    { sku: 'BEB-JUG-04', itemName: 'Jugo Natural de Frutas', category: 'bebidas', quantityPerPax: 0.20, unit: 'kg', isConsumable: true },
    { sku: 'INS-SRV-01', itemName: 'Servilletas de Mesa', category: 'insumos_descartables', quantityPerPax: 3, unit: 'und', isConsumable: true },
    { sku: 'MEN-PLA-01', itemName: 'Platos de Porcelana Desayuno', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'und', isConsumable: false },
    { sku: 'MEN-CUB-02', itemName: 'Juego de Cubiertos y Cucharas', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-VAS-04', itemName: 'Vaso de Vidrio Alto', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'und', isConsumable: false },
  ],
  evento_social: [
    { sku: 'ALM-LOM-01', itemName: 'Lomo Fino de Res Asado', category: 'alimentos_cocina', quantityPerPax: 0.22, unit: 'kg', isConsumable: true },
    { sku: 'ALM-ARR-03', itemName: 'Guarnición Arroz Florentino', category: 'alimentos_cocina', quantityPerPax: 0.15, unit: 'kg', isConsumable: true },
    { sku: 'ALM-PAP-04', itemName: 'Papas Salteadas al Romero', category: 'alimentos_cocina', quantityPerPax: 0.18, unit: 'kg', isConsumable: true },
    { sku: 'BEB-COL-02', itemName: 'Bebidas Gaseosas y Refrescos', category: 'bebidas', quantityPerPax: 1.5, unit: 'botella', isConsumable: true },
    { sku: 'BEB-GUT-01', itemName: 'Agua Güitig en Vidrio', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'INS-SRV-01', itemName: 'Servilletas de Gala', category: 'insumos_descartables', quantityPerPax: 4, unit: 'und', isConsumable: true },
    { sku: 'MEN-PLA-01', itemName: 'Platos Base y Fuerte Porcelana', category: 'menaje_cubiertos', quantityPerPax: 2, unit: 'und', isConsumable: false },
    { sku: 'MEN-CUB-02', itemName: 'Juego Cubiertos de Gala', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-COP-03', itemName: 'Copas de Cristal para Brindis', category: 'menaje_cubiertos', quantityPerPax: 2, unit: 'und', isConsumable: false },
  ],
};

export function calculateSupplyExplosion(params: {
  serviceType: 'shift' | 'event';
  shiftType?: ShiftType;
  eventType?: EventType;
  paxCount: number;
}): { sku: string; itemName: string; category: string; totalQuantity: number; unit: string; isConsumable: boolean }[] {
  const { serviceType, shiftType, eventType, paxCount } = params;
  const items =
    serviceType === 'shift' && shiftType
      ? SHIFT_RECIPE_BOM[shiftType] || []
      : eventType
      ? EVENT_RECIPE_BOM[eventType] || []
      : [];

  return items.map((item) => ({
    sku: item.sku,
    itemName: item.itemName,
    category: item.category,
    totalQuantity: Math.round(item.quantityPerPax * paxCount * 100) / 100,
    unit: item.unit,
    isConsumable: item.isConsumable,
  }));
}

/**
 * Calculates detailed stock deduction previews and shortage analysis
 * against actual inventory items in stock.
 */
export function calculateExplosion(
  formula: RecipeFormula,
  pax: number,
  inventory: InventoryItem[]
): ExplosionResult {
  const itemMap = new Map<string, InventoryItem>();
  inventory.forEach((item) => itemMap.set(item.code, item));

  let hasAnyShortage = false;
  let totalEstimatedCost = 0;
  let disposableCount = 0;
  let foodPortionsCount = 0;
  let beverageCount = 0;
  let tablewareAssignedCount = 0;

  const previews: StockDeductionPreview[] = formula.requirements.map((req) => {
    const item = itemMap.get(req.itemCode);
    const requiredQty = Math.round(req.quantityPerPax * pax * 1000) / 1000;

    if (!item) {
      // Fallback virtual item if not in inventory
      const fallbackItem: InventoryItem = {
        id: `mock-${req.itemCode}`,
        tenantId: 'croe',
        code: req.itemCode,
        name: req.name,
        category: req.category,
        unit: req.unit,
        currentStock: 100,
        minStock: 20,
        reorderPoint: 40,
        optimalStock: 200,
        unitCost: 2.5,
        isReturnable: req.isReturnable,
        inCirculationStock: 0,
        location: 'Bodega Central',
        lastRestocked: new Date().toISOString(),
      };
      const projectedStock = Math.max(0, fallbackItem.currentStock - requiredQty);
      return {
        item: fallbackItem,
        requiredQty,
        currentStock: fallbackItem.currentStock,
        projectedStock,
        unitCost: fallbackItem.unitCost,
        totalItemCost: Math.round(requiredQty * fallbackItem.unitCost * 100) / 100,
        hasShortage: false,
        shortageAmount: 0,
        projectedStatus: 'optimal' as StockStatusLevel,
        isReturnable: req.isReturnable,
      };
    }

    const projectedStock = Math.round((item.currentStock - requiredQty) * 100) / 100;
    const hasShortage = projectedStock < 0;
    const shortageAmount = hasShortage ? Math.abs(projectedStock) : 0;
    if (hasShortage) hasAnyShortage = true;

    let projectedStatus: StockStatusLevel = 'optimal';
    if (projectedStock <= item.minStock) {
      projectedStatus = 'critical';
    } else if (projectedStock <= item.reorderPoint) {
      projectedStatus = 'warning';
    }

    const itemCost = Math.round(requiredQty * item.unitCost * 100) / 100;
    totalEstimatedCost += itemCost;

    if (item.category === 'disposables') disposableCount += requiredQty;
    if (item.category === 'kitchen_food') foodPortionsCount += requiredQty;
    if (item.category === 'beverages') beverageCount += requiredQty;
    if (item.category === 'tableware') tablewareAssignedCount += requiredQty;

    return {
      item,
      requiredQty,
      currentStock: item.currentStock,
      projectedStock: Math.max(0, projectedStock),
      unitCost: item.unitCost,
      totalItemCost: itemCost,
      hasShortage,
      shortageAmount,
      projectedStatus,
      isReturnable: item.isReturnable,
    };
  });

  return {
    formula,
    pax,
    previews,
    hasAnyShortage,
    totalEstimatedCost: Math.round(totalEstimatedCost * 100) / 100,
    disposableCount: Math.round(disposableCount * 100) / 100,
    foodPortionsCount: Math.round(foodPortionsCount * 100) / 100,
    beverageCount: Math.round(beverageCount * 100) / 100,
    tablewareAssignedCount: Math.round(tablewareAssignedCount * 100) / 100,
  };
}
