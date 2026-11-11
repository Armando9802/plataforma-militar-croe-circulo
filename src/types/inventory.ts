import { TenantId } from './tenant';

export type InventoryCategory = 'disposables' | 'tableware' | 'beverages' | 'kitchen_food';

export type UnitOfMeasure = 'unidad' | 'paquete' | 'kg' | 'litro' | 'porcion' | 'jaba' | 'caja' | 'rollo' | 'botella' | 'set';

export type StockStatusLevel = 'optimal' | 'warning' | 'critical';

export interface InventoryItem {
  id: string;
  tenantId: TenantId;
  code: string;               // e.g. 'INS-SRV-01', 'MEN-PLA-01', 'BEB-COL-01', 'ALM-LOM-01'
  name: string;
  category: InventoryCategory;
  unit: UnitOfMeasure;
  currentStock: number;
  minStock: number;           // Nivel crítico (alerta roja)
  reorderPoint: number;       // Punto de reorden (alerta ámbar)
  optimalStock: number;       // Capacidad máxima de bodega
  unitCost: number;           // Costo unitario en USD
  isReturnable: boolean;      // True para menaje y vajilla
  inCirculationStock: number; // Cantidad actualmente en evento/comedor
  location: string;           // e.g. 'Bodega Central Economato', 'Cámara Fría 1'
  lastRestocked: string;      // Fecha ISO
  supplierRuc?: string;
  supplierName?: string;
}

export type KardexMovementType =
  | 'INITIAL_BALANCE'      // Inventario Inicial
  | 'IN_PURCHASE'          // Compra Proveedor (Factura SRI)
  | 'OUT_SHIFT'            // Salida por Turno (Desayuno, Almuerzo, Cena)
  | 'OUT_EVENT'            // Despacho Evento / Banquete
  | 'RETURN_EQUIPMENT'     // Retorno de Menaje Sano post-evento
  | 'LOSS_BREAKAGE'        // Merma de Cocina o Rotura de Menaje
  | 'ADJUSTMENT';          // Ajuste de Conteo Físico

export interface KardexEntry {
  id: string;
  tenantId: TenantId;
  itemId: string;
  itemCode: string;
  itemName: string;
  category: InventoryCategory;
  unit: UnitOfMeasure;
  timestamp: string;          // ISO String
  type: KardexMovementType;
  quantity: number;           // Positivo para IN/RETURN, negativo para OUT/LOSS
  previousStock: number;
  newStock: number;
  unitCost: number;
  totalValue: number;         // Math.abs(quantity) * unitCost
  referenceDoc: string;       // e.g. 'FAC-SRI-001-002-000045892', 'TURNO-ALMUERZO-45PAX'
  responsible: string;        // e.g. 'Sgto. Bodeguero M. Gómez', 'Chef Ejecutivo Castrense'
  notes?: string;
}

export interface RecipeRequirement {
  itemCode: string;
  name: string;
  category: InventoryCategory;
  quantityPerPax: number;
  unit: UnitOfMeasure;
  isReturnable: boolean;
}

export type ServiceShiftType = 'desayuno' | 'almuerzo' | 'cena';
export type ServiceEventType = 'banquete_gala' | 'cocktail_militar' | 'asado_campero';

export interface RecipeFormula {
  id: string;
  type: 'shift' | 'event';
  code: ServiceShiftType | ServiceEventType;
  name: string;
  description: string;
  mealCourse: string;
  requirements: RecipeRequirement[];
}

export interface StockDeductionPreview {
  item: InventoryItem;
  requiredQty: number;
  currentStock: number;
  projectedStock: number;
  unitCost: number;
  totalItemCost: number;
  hasShortage: boolean;
  shortageAmount: number;
  projectedStatus: StockStatusLevel;
  isReturnable: boolean;
}

export interface ExplosionResult {
  formula: RecipeFormula;
  pax: number;
  previews: StockDeductionPreview[];
  hasAnyShortage: boolean;
  totalEstimatedCost: number;
  disposableCount: number;
  foodPortionsCount: number;
  beverageCount: number;
  tablewareAssignedCount: number;
}

export interface TablewareAuditItem {
  itemCode: string;
  name: string;
  assignedQty: number;
  returnedIntactQty: number;
  brokenOrLostQty: number;
  unitReplacementCost: number;
  totalLossCost: number;
}

export interface EventSettlementRecord {
  id: string;
  tenantId: TenantId;
  eventName: string;
  eventDate: string;
  pax: number;
  settledAt: string;
  responsible: string;
  tablewareAudits: TablewareAuditItem[];
  totalBreakageCost: number;
  status: 'SETTLED' | 'PENDING_AUDIT';
  notes?: string;
}

export interface SupplierInvoiceItem {
  itemCode: string;
  itemName: string;
  category: InventoryCategory;
  quantity: number;
  unit: UnitOfMeasure;
  unitCost: number;
  subtotal: number;
}

export interface SupplierInvoice {
  id: string;
  tenantId: TenantId;
  supplierName: string;
  supplierRuc: string;
  invoiceNumber: string;       // e.g. '001-002-000045892'
  accessKey49: string;         // Clave de acceso de 49 dígitos SRI
  issueDate: string;
  items: SupplierInvoiceItem[];
  subtotal: number;
  vat15: number;
  total: number;
  paymentTerms: 'CONTADO' | 'CRÉDITO 30 DÍAS';
  sourceType: 'PRELOADED' | 'UPLOAD_PDF' | 'UPLOAD_XML' | 'MANUAL';
  status?: 'PENDING' | 'PROCESSED';
}
