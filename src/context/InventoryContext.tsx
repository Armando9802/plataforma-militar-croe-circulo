import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useTenant } from './TenantContext';
import {
  InventoryItem,
  KardexEntry,
  RecipeFormula,
  SupplierInvoice,
  EventSettlementRecord,
  TablewareAuditItem,
  ExplosionResult,
  KardexMovementType,
} from '../types/inventory';
import { ShiftType, EventType } from '../types/restaurant';
import {
  CROE_INVENTORY_SEED,
  CIRCULO_INVENTORY_SEED,
  RECIPE_FORMULAS,
  INITIAL_KARDEX_ENTRIES_CROE,
  INITIAL_KARDEX_ENTRIES_CIRCULO,
} from '../data/mockInventory';
import { PRELOADED_SUPPLIER_INVOICES } from '../data/mockInvoices';
import { calculateExplosion, SHIFT_RECIPE_BOM, EVENT_RECIPE_BOM } from '../utils/recipeExplosion';

interface InventoryContextType {
  inventory: InventoryItem[];
  kardex: KardexEntry[];
  invoices: SupplierInvoice[];
  settlements: EventSettlementRecord[];
  recipes: RecipeFormula[];
  totalValuation: number;
  criticalItemsCount: number;
  warningItemsCount: number;
  tablewareInCirculationCount: number;
  deductShiftConsumption: (
    shiftType: ShiftType,
    pax: number,
    referenceDoc?: string,
    responsible?: string
  ) => boolean;
  deductEventConsumption: (
    eventType: EventType,
    pax: number,
    referenceDoc?: string,
    responsible?: string
  ) => boolean;
  executeDispatch: (
    formulaCode: string,
    pax: number,
    referenceDoc?: string,
    responsible?: string
  ) => boolean;
  settleEventTableware: (params: {
    eventName: string;
    eventDate: string;
    pax: number;
    responsible: string;
    audits: TablewareAuditItem[];
    notes?: string;
  }) => EventSettlementRecord;
  processSupplierInvoice: (invoiceId: string) => boolean;
  adjustStockManual: (
    itemCode: string,
    newQuantity: number,
    reason: string,
    responsible?: string
  ) => boolean;
  calculateLiveExplosion: (formulaCode: string, pax: number) => ExplosionResult | null;
  resetInventoryToDefaults: () => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentTenant } = useTenant();
  const tenantId = currentTenant.id;

  const storageKeyStock = `plataforma_inv_stock_${tenantId}_v1`;
  const storageKeyKardex = `plataforma_inv_kardex_${tenantId}_v1`;
  const storageKeyInvoices = `plataforma_inv_invoices_${tenantId}_v1`;
  const storageKeySettlements = `plataforma_inv_settlements_${tenantId}_v1`;

  // 1. Inventory Stock State
  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeyStock);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading inventory from localStorage:', e);
    }
    return tenantId === 'croe' ? CROE_INVENTORY_SEED : CIRCULO_INVENTORY_SEED;
  });

  // 2. Kardex Entries State
  const [kardex, setKardex] = useState<KardexEntry[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeyKardex);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading kardex from localStorage:', e);
    }
    return tenantId === 'croe'
      ? INITIAL_KARDEX_ENTRIES_CROE
      : INITIAL_KARDEX_ENTRIES_CIRCULO;
  });

  // 3. Supplier Invoices State
  const [invoices, setInvoices] = useState<SupplierInvoice[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeyInvoices);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading invoices from localStorage:', e);
    }
    return PRELOADED_SUPPLIER_INVOICES.map((inv) => ({
      ...inv,
      tenantId,
    }));
  });

  // 4. Event Settlement Records State
  const [settlements, setSettlements] = useState<EventSettlementRecord[]>(() => {
    try {
      const saved = localStorage.getItem(storageKeySettlements);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error loading settlements from localStorage:', e);
    }
    return [];
  });

  // Re-hydrate when tenant changes
  useEffect(() => {
    try {
      const savedStock = localStorage.getItem(storageKeyStock);
      setInventory(
        savedStock
          ? JSON.parse(savedStock)
          : tenantId === 'croe'
          ? CROE_INVENTORY_SEED
          : CIRCULO_INVENTORY_SEED
      );

      const savedKardex = localStorage.getItem(storageKeyKardex);
      setKardex(
        savedKardex
          ? JSON.parse(savedKardex)
          : tenantId === 'croe'
          ? INITIAL_KARDEX_ENTRIES_CROE
          : INITIAL_KARDEX_ENTRIES_CIRCULO
      );

      const savedInvoices = localStorage.getItem(storageKeyInvoices);
      setInvoices(
        savedInvoices
          ? JSON.parse(savedInvoices)
          : PRELOADED_SUPPLIER_INVOICES.map((inv) => ({ ...inv, tenantId }))
      );

      const savedSettlements = localStorage.getItem(storageKeySettlements);
      setSettlements(savedSettlements ? JSON.parse(savedSettlements) : []);
    } catch (err) {
      console.error('Tenant switch hydration error:', err);
    }
  }, [tenantId, storageKeyStock, storageKeyKardex, storageKeyInvoices, storageKeySettlements]);

  // Persist helpers
  const saveInventory = (newInv: InventoryItem[]) => {
    setInventory(newInv);
    try {
      localStorage.setItem(storageKeyStock, JSON.stringify(newInv));
    } catch (e) {
      console.error('Failed to save inventory:', e);
    }
  };

  const saveKardex = (newKardex: KardexEntry[]) => {
    setKardex(newKardex);
    try {
      localStorage.setItem(storageKeyKardex, JSON.stringify(newKardex));
    } catch (e) {
      console.error('Failed to save kardex:', e);
    }
  };

  const saveInvoices = (newInvoices: SupplierInvoice[]) => {
    setInvoices(newInvoices);
    try {
      localStorage.setItem(storageKeyInvoices, JSON.stringify(newInvoices));
    } catch (e) {
      console.error('Failed to save invoices:', e);
    }
  };

  const saveSettlements = (newSettlements: EventSettlementRecord[]) => {
    setSettlements(newSettlements);
    try {
      localStorage.setItem(storageKeySettlements, JSON.stringify(newSettlements));
    } catch (e) {
      console.error('Failed to save settlements:', e);
    }
  };

  // KPIs
  const totalValuation = useMemo(() => {
    const val = inventory.reduce((acc, item) => acc + item.currentStock * item.unitCost, 0);
    return Math.round(val * 100) / 100;
  }, [inventory]);

  const criticalItemsCount = useMemo(() => {
    return inventory.filter((item) => item.currentStock <= item.minStock).length;
  }, [inventory]);

  const warningItemsCount = useMemo(() => {
    return inventory.filter(
      (item) => item.currentStock > item.minStock && item.currentStock <= item.reorderPoint
    ).length;
  }, [inventory]);

  const tablewareInCirculationCount = useMemo(() => {
    return inventory
      .filter((item) => item.isReturnable)
      .reduce((acc, item) => acc + (item.inCirculationStock || 0), 0);
  }, [inventory]);

  // Deduct shift consumption
  const deductShiftConsumption = useCallback(
    (
      shiftType: ShiftType,
      pax: number,
      referenceDoc = `TURNO-${shiftType.toUpperCase()}-${pax}PAX`,
      responsible = 'Chef Ejecutivo Castrense'
    ): boolean => {
      const bomItems = SHIFT_RECIPE_BOM[shiftType];
      if (!bomItems || bomItems.length === 0 || pax <= 0) return false;

      const updatedInventory = [...inventory];
      const newKardexEntries: KardexEntry[] = [];
      const now = new Date().toISOString();

      bomItems.forEach((req) => {
        const itemIdx = updatedInventory.findIndex((i) => i.code === req.sku);
        if (itemIdx === -1) return;

        const currentItem = updatedInventory[itemIdx];
        const consumedQty = Math.round(req.quantityPerPax * pax * 100) / 100;

        if (req.isConsumable) {
          const prevStock = currentItem.currentStock;
          const newStock = Math.max(0, Math.round((prevStock - consumedQty) * 100) / 100);

          updatedInventory[itemIdx] = {
            ...currentItem,
            currentStock: newStock,
          };

          newKardexEntries.unshift({
            id: `kdx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            tenantId,
            itemId: currentItem.id,
            itemCode: currentItem.code,
            itemName: currentItem.name,
            category: currentItem.category,
            unit: currentItem.unit,
            timestamp: now,
            type: 'OUT_SHIFT',
            quantity: -consumedQty,
            previousStock: prevStock,
            newStock,
            unitCost: currentItem.unitCost,
            totalValue: Math.round(consumedQty * currentItem.unitCost * 100) / 100,
            referenceDoc,
            responsible,
            notes: `Consumo turno ${shiftType} para ${pax} comensales.`,
          });
        }
      });

      saveInventory(updatedInventory);
      saveKardex([...newKardexEntries, ...kardex]);
      return true;
    },
    [inventory, kardex, tenantId]
  );

  // Deduct event consumption
  const deductEventConsumption = useCallback(
    (
      eventType: EventType,
      pax: number,
      referenceDoc = `EVENTO-${eventType.toUpperCase()}-${pax}PAX`,
      responsible = 'Mayordomo de Gala Castrense'
    ): boolean => {
      const bomItems = EVENT_RECIPE_BOM[eventType];
      if (!bomItems || bomItems.length === 0 || pax <= 0) return false;

      const updatedInventory = [...inventory];
      const newKardexEntries: KardexEntry[] = [];
      const now = new Date().toISOString();

      bomItems.forEach((req) => {
        const itemIdx = updatedInventory.findIndex((i) => i.code === req.sku);
        if (itemIdx === -1) return;

        const currentItem = updatedInventory[itemIdx];
        const qty = Math.round(req.quantityPerPax * pax * 100) / 100;

        if (req.isConsumable) {
          const prevStock = currentItem.currentStock;
          const newStock = Math.max(0, Math.round((prevStock - qty) * 100) / 100);

          updatedInventory[itemIdx] = {
            ...currentItem,
            currentStock: newStock,
          };

          newKardexEntries.unshift({
            id: `kdx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            tenantId,
            itemId: currentItem.id,
            itemCode: currentItem.code,
            itemName: currentItem.name,
            category: currentItem.category,
            unit: currentItem.unit,
            timestamp: now,
            type: 'OUT_EVENT',
            quantity: -qty,
            previousStock: prevStock,
            newStock,
            unitCost: currentItem.unitCost,
            totalValue: Math.round(qty * currentItem.unitCost * 100) / 100,
            referenceDoc,
            responsible,
            notes: `Despacho banquete ${eventType} (${pax} PAX).`,
          });
        } else {
          // Tableware assignment
          const assignedQty = Math.round(qty);
          const prevStock = currentItem.currentStock;
          const newStock = Math.max(0, prevStock - assignedQty);
          const inCirc = (currentItem.inCirculationStock || 0) + assignedQty;

          updatedInventory[itemIdx] = {
            ...currentItem,
            currentStock: newStock,
            inCirculationStock: inCirc,
          };

          newKardexEntries.unshift({
            id: `kdx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            tenantId,
            itemId: currentItem.id,
            itemCode: currentItem.code,
            itemName: currentItem.name,
            category: currentItem.category,
            unit: currentItem.unit,
            timestamp: now,
            type: 'OUT_EVENT',
            quantity: -assignedQty,
            previousStock: prevStock,
            newStock,
            unitCost: currentItem.unitCost,
            totalValue: Math.round(assignedQty * currentItem.unitCost * 100) / 100,
            referenceDoc,
            responsible,
            notes: `Despliegue de vajilla protocolar para salón de evento (${pax} PAX).`,
          });
        }
      });

      saveInventory(updatedInventory);
      saveKardex([...newKardexEntries, ...kardex]);
      return true;
    },
    [inventory, kardex, tenantId]
  );

  // General executeDispatch
  const executeDispatch = useCallback(
    (
      formulaCode: string,
      pax: number,
      referenceDoc?: string,
      responsible?: string
    ): boolean => {
      if (['desayuno', 'almuerzo', 'cena'].includes(formulaCode)) {
        return deductShiftConsumption(formulaCode as ShiftType, pax, referenceDoc, responsible);
      }
      return deductEventConsumption(formulaCode as EventType, pax, referenceDoc, responsible);
    },
    [deductShiftConsumption, deductEventConsumption]
  );

  // Tableware settlement after event
  const settleEventTableware = useCallback(
    (params: {
      eventName: string;
      eventDate: string;
      pax: number;
      responsible: string;
      audits: TablewareAuditItem[];
      notes?: string;
    }): EventSettlementRecord => {
      const { eventName, eventDate, pax, responsible, audits, notes } = params;
      const updatedInventory = [...inventory];
      const newKardexEntries: KardexEntry[] = [];
      const now = new Date().toISOString();
      let totalBreakageCost = 0;

      audits.forEach((audit) => {
        const itemIdx = updatedInventory.findIndex((i) => i.code === audit.itemCode);
        if (itemIdx === -1) return;

        const currentItem = updatedInventory[itemIdx];
        const prevCirc = currentItem.inCirculationStock || 0;
        const prevStock = currentItem.currentStock;

        // Sound return
        const returnedQty = Math.max(0, audit.returnedIntactQty);
        // Broken / Lost
        const brokenQty = Math.max(0, audit.brokenOrLostQty);

        const newCirc = Math.max(0, prevCirc - (returnedQty + brokenQty));
        const newStock = prevStock + returnedQty;

        updatedInventory[itemIdx] = {
          ...currentItem,
          currentStock: newStock,
          inCirculationStock: newCirc,
        };

        if (returnedQty > 0) {
          newKardexEntries.unshift({
            id: `kdx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            tenantId,
            itemId: currentItem.id,
            itemCode: currentItem.code,
            itemName: currentItem.name,
            category: currentItem.category,
            unit: currentItem.unit,
            timestamp: now,
            type: 'RETURN_EQUIPMENT',
            quantity: returnedQty,
            previousStock: prevStock,
            newStock,
            unitCost: currentItem.unitCost,
            totalValue: Math.round(returnedQty * currentItem.unitCost * 100) / 100,
            referenceDoc: `RETORNO-${eventName.substring(0, 16)}`,
            responsible,
            notes: `Retorno íntegro de menaje tras evento ${eventName}.`,
          });
        }

        if (brokenQty > 0) {
          const lossCost = Math.round(brokenQty * audit.unitReplacementCost * 100) / 100;
          totalBreakageCost += lossCost;

          newKardexEntries.unshift({
            id: `kdx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            tenantId,
            itemId: currentItem.id,
            itemCode: currentItem.code,
            itemName: currentItem.name,
            category: currentItem.category,
            unit: currentItem.unit,
            timestamp: now,
            type: 'LOSS_BREAKAGE',
            quantity: -brokenQty,
            previousStock: newStock,
            newStock: newStock,
            unitCost: audit.unitReplacementCost,
            totalValue: lossCost,
            referenceDoc: `MERMA-${eventName.substring(0, 16)}`,
            responsible,
            notes: `Rotura/extravío de ${brokenQty} ${currentItem.unit}(s) en evento. Cargo por reposición: $${lossCost.toFixed(2)}.`,
          });
        }
      });

      const record: EventSettlementRecord = {
        id: `stl-${Date.now()}`,
        tenantId,
        eventName,
        eventDate,
        pax,
        settledAt: now,
        responsible,
        tablewareAudits: audits,
        totalBreakageCost: Math.round(totalBreakageCost * 100) / 100,
        status: 'SETTLED',
        notes,
      };

      saveInventory(updatedInventory);
      saveKardex([...newKardexEntries, ...kardex]);
      saveSettlements([record, ...settlements]);

      return record;
    },
    [inventory, kardex, settlements, tenantId]
  );

  // Process supplier invoice (ingreso a bodega)
  const processSupplierInvoice = useCallback(
    (invoiceId: string): boolean => {
      const invIdx = invoices.findIndex((i) => i.id === invoiceId);
      if (invIdx === -1) return false;

      const invoice = invoices[invIdx];
      const updatedInventory = [...inventory];
      const newKardexEntries: KardexEntry[] = [];
      const now = new Date().toISOString();

      invoice.items.forEach((line) => {
        const itemIdx = updatedInventory.findIndex((i) => i.code === line.itemCode);
        if (itemIdx === -1) return;

        const currentItem = updatedInventory[itemIdx];
        const prevStock = currentItem.currentStock;
        const newStock = Math.round((prevStock + line.quantity) * 100) / 100;

        // Calculate new Weighted Average Cost (PMP)
        const prevTotalVal = prevStock * currentItem.unitCost;
        const lineTotalVal = line.quantity * line.unitCost;
        const newUnitCost =
          newStock > 0
            ? Math.round(((prevTotalVal + lineTotalVal) / newStock) * 100) / 100
            : currentItem.unitCost;

        updatedInventory[itemIdx] = {
          ...currentItem,
          currentStock: newStock,
          unitCost: newUnitCost,
          lastRestocked: now,
        };

        newKardexEntries.unshift({
          id: `kdx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          tenantId,
          itemId: currentItem.id,
          itemCode: currentItem.code,
          itemName: currentItem.name,
          category: currentItem.category,
          unit: currentItem.unit,
          timestamp: now,
          type: 'IN_PURCHASE',
          quantity: line.quantity,
          previousStock: prevStock,
          newStock,
          unitCost: line.unitCost,
          totalValue: line.subtotal,
          referenceDoc: `FAC-${invoice.invoiceNumber}`,
          responsible: 'Sgto. Bodeguero M. Gómez',
          notes: `Ingreso por adquisición de ${invoice.supplierName}. Clave SRI: ${invoice.accessKey49.substring(0, 16)}...`,
        });
      });

      const updatedInvoices = [...invoices];
      updatedInvoices[invIdx] = {
        ...invoice,
        status: 'PROCESSED',
      };

      saveInventory(updatedInventory);
      saveKardex([...newKardexEntries, ...kardex]);
      saveInvoices(updatedInvoices);

      return true;
    },
    [invoices, inventory, kardex, tenantId]
  );

  // Adjust stock manually
  const adjustStockManual = useCallback(
    (
      itemCode: string,
      newQuantity: number,
      reason: string,
      responsible = 'Mayor L. Andrade - Jefe Mayordomía'
    ): boolean => {
      const itemIdx = inventory.findIndex((i) => i.code === itemCode);
      if (itemIdx === -1) return false;

      const currentItem = inventory[itemIdx];
      const prevStock = currentItem.currentStock;
      const diff = Math.round((newQuantity - prevStock) * 100) / 100;
      if (diff === 0) return true;

      const updatedInventory = [...inventory];
      updatedInventory[itemIdx] = {
        ...currentItem,
        currentStock: Math.max(0, newQuantity),
      };

      const now = new Date().toISOString();
      const entry: KardexEntry = {
        id: `kdx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        tenantId,
        itemId: currentItem.id,
        itemCode: currentItem.code,
        itemName: currentItem.name,
        category: currentItem.category,
        unit: currentItem.unit,
        timestamp: now,
        type: 'ADJUSTMENT' as KardexMovementType,
        quantity: diff,
        previousStock: prevStock,
        newStock: Math.max(0, newQuantity),
        unitCost: currentItem.unitCost,
        totalValue: Math.round(Math.abs(diff) * currentItem.unitCost * 100) / 100,
        referenceDoc: 'AJUSTE-CONTEO-FISICO',
        responsible,
        notes: reason || 'Ajuste de arqueo físico en economato.',
      };

      saveInventory(updatedInventory);
      saveKardex([entry, ...kardex]);
      return true;
    },
    [inventory, kardex, tenantId]
  );

  // Live explosion helper
  const calculateLiveExplosion = useCallback(
    (formulaCode: string, pax: number): ExplosionResult | null => {
      const formula = RECIPE_FORMULAS.find((f) => f.code === formulaCode);
      if (!formula) return null;
      return calculateExplosion(formula, pax, inventory);
    },
    [inventory]
  );

  // Reset to default
  const resetInventoryToDefaults = useCallback(() => {
    const defaultStock = tenantId === 'croe' ? CROE_INVENTORY_SEED : CIRCULO_INVENTORY_SEED;
    const defaultKardex =
      tenantId === 'croe' ? INITIAL_KARDEX_ENTRIES_CROE : INITIAL_KARDEX_ENTRIES_CIRCULO;
    const defaultInvoices = PRELOADED_SUPPLIER_INVOICES.map((inv) => ({ ...inv, tenantId }));

    saveInventory(defaultStock);
    saveKardex(defaultKardex);
    saveInvoices(defaultInvoices);
    saveSettlements([]);
  }, [tenantId]);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        kardex,
        invoices,
        settlements,
        recipes: RECIPE_FORMULAS,
        totalValuation,
        criticalItemsCount,
        warningItemsCount,
        tablewareInCirculationCount,
        deductShiftConsumption,
        deductEventConsumption,
        executeDispatch,
        settleEventTableware,
        processSupplierInvoice,
        adjustStockManual,
        calculateLiveExplosion,
        resetInventoryToDefaults,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
