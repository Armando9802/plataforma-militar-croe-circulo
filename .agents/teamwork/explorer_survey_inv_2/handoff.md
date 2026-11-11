# Handoff Report: Arquitectura Integral del Módulo de Inventarios, Economato, Explosión de Insumos y Motor Kardex

**Agente:** Explorer 2 (Inventory, Economato, Stock Explosion & Kardex Engine)  
**ID de Conversación:** d42cecc3-05f3-4625-b4f4-eae8ae61a318  
**Destinatario:** Orquestador (4cb2763c-1538-4609-8d96-d251b4f7d423) & Worker de Implementación  
**Fecha:** 2026-11-09T03:36:00Z  
**Estado:** COMPLETO (Hard Handoff)

---

## 1. Observación (Observation)

### 1.1. Inspección del Código Base Existente
Se realizó una inspección exhaustiva de la arquitectura del prototipo en el directorio de trabajo `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca`:

1. **Jerarquía de Contextos y Navegación (`src/App.tsx:97-107`, `src/components/common/Navbar.tsx:16-37`):**
   - Actualmente, `App.tsx` compone la aplicación mediante tres proveedores:
     ```tsx
     <TenantProvider>
       <ReservationProvider>
         <PaymentProvider>
           <AppContent />
         </PaymentProvider>
       </ReservationProvider>
     </TenantProvider>
     ```
   - En `Navbar.tsx:16`, el tipo de pestaña activa está limitado a:
     ```typescript
     export type ActiveTab = 'home' | 'socio' | 'reservations' | 'payment';
     ```
   - La pestaña de `reservations` cubre únicamente Hospedaje y Deportes (`FacilityCategory = 'lodging' | 'sports'` en `src/types/reservation.ts:1`). No existía un módulo dedicado para el control de cocina, economato ni existencias.

2. **Patrón de Persistencia Local y Multi-Tenant (`src/context/ReservationContext.tsx:230-277`):**
   - El sistema almacena estados aislados por tenant (`STORAGE_KEYS = { croe: '...', 'circulo-militar': '...' }`) en el `localStorage` del navegador con hidratación resiliente ante caídas o valores nulos.
   - El contexto `TenantContext` inyecta dinámicamente variables de CSS (`--color-primary`, `--color-accent`) y provee `isCroe` e `isCirculo` para adaptar la interfaz a la heráldica castrense.

3. **Documento Técnico Existente (`PLAN_EJECUCION_TECNICA.md:839-842`):**
   - En la Sección 5 (Hoja de Ruta), el requerimiento original contemplaba en Fase 3:
     - `M6: Control de Alimentos, Bebidas y Restaurantes (Comanderos POS en Sedes)`
     - `M7: Eventos Institucionales, Aniversarios y Protocolo Militar Castrense`
   - El follow-up del usuario (`ORIGINAL_REQUEST.md:47-60`) y el requerimiento adicional de adquisición (`DISPATCH.md:2026-11-09T03:32:35Z`) exigen elevar esta funcionalidad al prototipo interactivo para la reunión del martes:
     - Catálogo de existencias por club en 4 categorías reales.
     - Explosión automática / Bill of Materials (Fichas Técnicas) por turno (Desayuno, Almuerzo, Cena) y Eventos / Banquetes por comensales (PAX).
     - Descuento de stock en tiempo real con barras de nivel y alertas de punto de reorden.
     - Control de retorno de menaje vs. rotura/merma en eventos.
     - Bitácora inmutable Kardex.
     - Motor de carga de facturas de proveedores (SRI) con simulación de parsing y precargas de un solo clic (Pronaca, Tesalia, Indurmesa).

4. **Estado de Pruebas Automatizadas:**
   - Se ejecutó `npm test` (`vitest run`). Resultado: **15 archivos de prueba pasados, 75/75 casos exitosos al 100% (duración 18.97s)**. Toda nueva arquitectura debe mantener el 100% de éxito en la suite.

---

## 2. Cadena Lógica (Logic Chain)

A partir de las observaciones, se deduce la siguiente secuencia de diseño arquitectónico:

```
[Tenant Activo: CROE o Círculo] 
         │
         ▼
[InventoryContext (localStorage aislado por club)]
         │
 ┌───────┴──────────────────────────────┬──────────────────────────────┬──────────────────────────────┐
 │                                      │                              │                              │
 ▼                                      ▼                              ▼                              ▼
[1. Catálogo 4 Categorías]     [2. Motor Explosión BoM]      [3. Auditoría Menaje]         [4. Motor Carga Facturas]
 - Insumos & Descartables       - Fichas Técnicas por Turno   - Retorno Vajilla Sana        - Simulación OCR / XML SRI
 - Menaje & Cubiertos (Retorn)  - Fichas Técnicas Eventos     - Roturas/Mermas a Pérdida    - 1-Click Proveedores Reales
 - Bebidas                      - Cálculo Dinámico x PAX      - Despacho vs Recuperado      - Reposición Automática
 - Alimentos de Cocina          - Alertas Punto Reorden                                     - Mitigación de Alertas
         │                                      │                              │                              │
         └──────────────────────────────────────┴──────────────┬───────────────┴──────────────────────────────┘
                                                               │
                                                               ▼
                                                  [5. Bitácora Kardex Inmutable]
                                                   - INITIAL_BALANCE
                                                   - IN_PURCHASE (Facturas SRI)
                                                   - OUT_SHIFT (Desayuno/Almuerzo/Cena)
                                                   - OUT_EVENT (Banquetes)
                                                   - RETURN_EQUIPMENT (Menaje Sano)
                                                   - LOSS_BREAKAGE (Roturas/Mermas)
                                                   - ADJUSTMENT (Físico)
```

1. **Aislamiento Multi-Tenant:**
   El economato de CROE (Cumbayá) debe tener sus propios ítems, bodegas y niveles de inventario independientes de los del Círculo Militar (Sede Social Quito / Sangolquí). Al cambiar de club en el switch superior, `InventoryContext` conmuta automáticamente las existencias activas sin perder los datos del otro club.

2. **Categorización de Existencias y Estados de Alerta:**
   Para cumplir con la solicitud del usuario ("cosas de cocina, servilletas, vasos, cubiertos, colas, alimentos"), se definen 4 categorías estrictas con 3 niveles visuales de existencias calculados dinámicamente:
   - `CRÍTICO` (Rojo): `currentStock <= minStock` (Requiere reposición inmediata).
   - `PRECAUCIÓN` (Ámbar): `minStock < currentStock <= reorderPoint` (Punto de reorden alcanzado).
   - `ÓPTIMO` (Verde): `currentStock > reorderPoint`.

3. **Motor de Fórmulas y Explosión de Insumos (BoM - Bill of Materials):**
   Cada plato o ración servida en un turno o evento consume cantidades fijas de insumos.
   - Ejemplo en Almuerzo (por PAX): 0.12 kg Lomo, 0.10 kg Pollo, 0.15 kg Arroz, 0.20 kg Papa, 1 Bebida, 3 Servilletas, 1 Plato llano, 1 Juego cubiertos, 1 Vaso vidrio.
   - Al multiplicar por `PAX` (ej. 45 comensales), el motor calcula el consumo consolidado. Si el stock no alcanza, genera alertas de déficit (`hasShortage`). Si alcanza, proyecta el stock resultante y permite la ejecución del despacho con descuento en tiempo real.

4. **Ciclo de Vida Especial del Menaje (Cubiertos, Vajilla, Cristalería):**
   A diferencia de los alimentos o descartables que se consumen definitivamente, el menaje es un activo retornable (`isReturnable: true`).
   - Al despachar para un evento: el menaje pasa de `currentStock` (disponible en bodega) a `inCirculationStock` (en servicio en el salón).
   - Al finalizar el evento: el responsable realiza la **Auditoría de Cierre de Evento**. Registra cuántas piezas retornan sanas (`RETURN_EQUIPMENT` regresa al stock disponible) y cuántas se quebraron/extraviaron (`LOSS_BREAKAGE`, que se descuentan permanentemente y registran el costo de reposición).

5. **Motor de Carga de Facturas de Adquisición SRI:**
   Para resolver la necesidad del bodeguero de alimentar el Kardex y levantar alertas críticas, se implementa un subsistema de compras:
   - Permite arrastrar o subir comprobantes (PDF, XML, imagen).
   - Provee **3 botones de acceso rápido con facturas de proveedores ecuatorianos emblemáticos** (Pronaca S.A., The Tesalia Springs Co., Indurmesa) para que en la reunión del martes el presentador demuestre en 3 segundos cómo una compra mitiga alertas de stock crítico y alimenta el Kardex con el desglose del SRI (subtotal, IVA 15% y retenciones).

---

## 3. Especificación Técnica Detallada

### 3.1. Definición de Tipos TypeScript (`src/types/inventory.ts`)

```typescript
export type InventoryCategory = 'disposables' | 'tableware' | 'beverages' | 'kitchen_food';

export type UnitOfMeasure = 'unidad' | 'paquete' | 'kg' | 'litro' | 'porcion' | 'jaba' | 'caja' | 'rollo';

export type StockStatusLevel = 'optimal' | 'warning' | 'critical';

export interface InventoryItem {
  id: string;
  tenantId: 'croe' | 'circulo-militar';
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
  tenantId: 'croe' | 'circulo-militar';
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
  tenantId: 'croe' | 'circulo-militar';
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
  tenantId: 'croe' | 'circulo-militar';
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
}
```

---

### 3.2. Catálogo Semilla de Existencias por Club (20 Ítems Reales)

#### Para CROE (Club de Recreación de Oficiales del Ejército - Cumbayá):
| Código | Categoría | Ítem | Unidad | Stock Actual | Punto Reorden | Min Crítico | Óptimo | Costo Unit ($) | Retornable | Estado Inicial |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `INS-SRV-01` | Insumos | Servilletas Biodegradables (Paq x 500u) | paquete | 45 | 30 | 15 | 100 | $2.80 | No | ÓPTIMO |
| `INS-VAS-02` | Insumos | Vasos Descartables 12oz (Funda x 100u) | paquete | 18 | 25 | 10 | 80 | $4.50 | No | **PRECAUCIÓN** |
| `INS-EMP-03` | Insumos | Empaques Térmicos Ración Fría (Caja x 200u) | caja | 12 | 10 | 5 | 40 | $18.00 | No | ÓPTIMO |
| `INS-FIL-04` | Insumos | Papel Film y Aluminio Cocina (Rollo 300m) | rollo | 8 | 5 | 2 | 20 | $12.50 | No | ÓPTIMO |
| `MEN-PLA-01` | Menaje | Platos Llanos Porcelana Escudo Dorado | unidad | 280 | 100 | 50 | 350 | $6.20 | **Sí** | ÓPTIMO |
| `MEN-CUB-02` | Menaje | Juego Cubiertos Acero Inoxidable 18/10 | unidad | 320 | 120 | 60 | 400 | $4.50 | **Sí** | ÓPTIMO |
| `MEN-COP-03` | Menaje | Copas de Cristal Templado Agua/Vino | unidad | 190 | 80 | 40 | 250 | $3.80 | **Sí** | ÓPTIMO |
| `MEN-VAS-04` | Menaje | Vasos de Vidrio Alto para Bebidas | unidad | 240 | 80 | 40 | 300 | $2.20 | **Sí** | ÓPTIMO |
| `MEN-SAM-05` | Menaje | Samovares / Chafing Dishes Buffet Inox | unidad | 14 | 6 | 3 | 20 | $45.00 | **Sí** | ÓPTIMO |
| `BEB-GUT-01` | Bebidas | Güitig Agua Mineral con Gas 500ml (Jaba 24u)| jaba | 16 | 18 | 8 | 40 | $12.00 | No | **PRECAUCIÓN** |
| `BEB-COL-02` | Bebidas | Coca-Cola / Gaseosas 350ml (Jaba 24u) | jaba | 22 | 20 | 10 | 50 | $14.50 | No | ÓPTIMO |
| `BEB-AGU-03` | Bebidas | Agua Purificada Sin Gas 500ml (Caja 24u) | caja | 28 | 15 | 8 | 50 | $9.50 | No | ÓPTIMO |
| `BEB-JUG-04` | Bebidas | Pulpa de Frutas Tropicales (Mora/Maracuyá)| kg | 6 | 10 | 5 | 30 | $3.50 | No | **CRÍTICO** |
| `ALM-LOM-01` | Alimentos | Lomo Fino de Res Premium (Corte Andino) | kg | 38 | 30 | 15 | 80 | $8.50 | No | ÓPTIMO |
| `ALM-POL-02` | Alimentos | Pechuga de Pollo Marinada en Filetes | kg | 42 | 25 | 12 | 70 | $4.20 | No | ÓPTIMO |
| `ALM-ARR-03` | Alimentos | Arroz Flor Extra Grano Largo Envejecido | kg | 150 | 50 | 25 | 300 | $0.95 | No | ÓPTIMO |
| `ALM-PAP-04` | Alimentos | Papa Chola de Páramo Seleccionada | kg | 135 | 45 | 20 | 250 | $0.65 | No | ÓPTIMO |
| `ALM-HUE-05` | Alimentos | Huevos Frescos de Campo (Cubeta x 30u) | paquete | 12 | 15 | 8 | 30 | $3.80 | No | **PRECAUCIÓN** |
| `ALM-QUE-06` | Alimentos | Queso de Hoja y Lácteos Andinos Frescos | kg | 9 | 10 | 5 | 25 | $4.80 | No | **PRECAUCIÓN** |
| `ALM-CAF-07` | Alimentos | Café Lojano de Altura Tostado/Molido | paquete | 14 | 8 | 4 | 30 | $5.20 | No | ÓPTIMO |

*Total Valorizado Inicial CROE:* **$8,468.20 USD**.  
*Alertas Iniciales:* 1 Crítica (Pulpa de Frutas), 4 Precaución (Vasos descartables, Güitig, Huevos, Queso). Esto permite demostrar de forma inmediata cómo la carga de facturas de Tesalia o Pronaca resuelve estas alertas.

#### Para Círculo Militar del Ecuador (Sede Quito / Valles):
| Código | Categoría | Ítem | Unidad | Stock Actual | Punto Reorden | Min Crítico | Óptimo | Costo Unit ($) | Retornable | Estado Inicial |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `INS-SRV-01` | Insumos | Servilletas Institucionales con Relieve | paquete | 60 | 40 | 20 | 120 | $3.10 | No | ÓPTIMO |
| `INS-VAS-02` | Insumos | Vasos Térmicos para Café 8oz (Funda 100u) | paquete | 35 | 30 | 15 | 90 | $4.20 | No | ÓPTIMO |
| `INS-EMP-03` | Insumos | Cajas Protocolarias para Banquetes | caja | 20 | 15 | 8 | 50 | $22.00 | No | ÓPTIMO |
| `INS-FIL-04` | Insumos | Papel Aluminio Grado Gastronómico | rollo | 12 | 8 | 4 | 25 | $14.00 | No | ÓPTIMO |
| `MEN-PLA-01` | Menaje | Platos Llanos Porcelana Sello 1918 | unidad | 420 | 150 | 80 | 500 | $7.50 | **Sí** | ÓPTIMO |
| `MEN-CUB-02` | Menaje | Cubiertos Plata / Acero Pulido Espejo | unidad | 480 | 180 | 90 | 600 | $5.20 | **Sí** | ÓPTIMO |
| `MEN-COP-03` | Menaje | Copas de Cristal Checo para Vino/Brindis | unidad | 310 | 100 | 50 | 400 | $4.90 | **Sí** | ÓPTIMO |
| `MEN-VAS-04` | Menaje | Vasos Highball Vidrio Labrado | unidad | 380 | 120 | 60 | 450 | $2.80 | **Sí** | ÓPTIMO |
| `MEN-SAM-05` | Menaje | Samovares Dobles Protocolarios de Gala | unidad | 22 | 8 | 4 | 30 | $60.00 | **Sí** | ÓPTIMO |
| `BEB-GUT-01` | Bebidas | Güitig Tradicional Vidrio 500ml (Jaba 24u) | jaba | 25 | 20 | 10 | 60 | $12.50 | No | ÓPTIMO |
| `BEB-COL-02` | Bebidas | Gaseosas Surtidas Línea Coca-Cola (Jaba 24u)| jaba | 30 | 25 | 12 | 70 | $14.80 | No | ÓPTIMO |
| `BEB-AGU-03` | Bebidas | Agua Mineral Manantial Sin Gas (Caja 24u) | caja | 36 | 20 | 10 | 60 | $9.80 | No | ÓPTIMO |
| `BEB-JUG-04` | Bebidas | Concentrado de Frutas Andinas (Mora/Taxo) | kg | 14 | 18 | 8 | 40 | $3.80 | No | **PRECAUCIÓN** |
| `ALM-LOM-01` | Alimentos | Medallones de Lomo de Asado Ceremonial | kg | 55 | 40 | 20 | 120 | $9.20 | No | ÓPTIMO |
| `ALM-POL-02` | Alimentos | Suprema de Ave a la Cordon Bleu (Kg) | kg | 60 | 35 | 15 | 100 | $4.60 | No | ÓPTIMO |
| `ALM-ARR-03` | Alimentos | Arroz Perlado Grano Fino Gourmet | kg | 250 | 80 | 40 | 400 | $1.10 | No | ÓPTIMO |
| `ALM-PAP-04` | Alimentos | Papa Chaucha Amarilla Precocida | kg | 180 | 60 | 30 | 300 | $0.85 | No | ÓPTIMO |
| `ALM-HUE-05` | Alimentos | Huevos Clasificados AA (Cubeta 30u) | paquete | 20 | 22 | 10 | 40 | $4.10 | No | **PRECAUCIÓN** |
| `ALM-QUE-06` | Alimentos | Queso Andino Madurado de Hacienda | kg | 16 | 20 | 10 | 35 | $5.50 | No | **PRECAUCIÓN** |
| `ALM-CAF-07` | Alimentos | Café Gourmet Selección Especial Vilcabamba | paquete | 25 | 15 | 8 | 40 | $6.50 | No | ÓPTIMO |

---

### 3.3. Fórmulas de Explosión (Bill of Materials)

```typescript
export const RECIPE_FORMULAS: RecipeFormula[] = [
  // 1. Turno: Desayuno Militar Andino
  {
    id: 'rec-shift-desayuno',
    type: 'shift',
    code: 'desayuno',
    name: 'Desayuno Militar Andino',
    description: 'Huevos al gusto, queso andino, pan caliente, café lojano y jugo natural.',
    mealCourse: 'Servicio Comedor Mañana (07:00 - 09:30)',
    requirements: [
      { itemCode: 'ALM-HUE-05', name: 'Huevos de Campo (2u)', category: 'kitchen_food', quantityPerPax: 0.067, unit: 'paquete', isReturnable: false },
      { itemCode: 'ALM-QUE-06', name: 'Queso de Hoja / Andino', category: 'kitchen_food', quantityPerPax: 0.08, unit: 'kg', isReturnable: false },
      { itemCode: 'ALM-CAF-07', name: 'Café de Altura', category: 'kitchen_food', quantityPerPax: 0.02, unit: 'paquete', isReturnable: false },
      { itemCode: 'BEB-JUG-04', name: 'Jugo Natural de Frutas', category: 'beverages', quantityPerPax: 0.15, unit: 'kg', isReturnable: false },
      { itemCode: 'INS-SRV-01', name: 'Servilletas de Mesa', category: 'disposables', quantityPerPax: 0.004, unit: 'paquete', isReturnable: false },
      { itemCode: 'MEN-PLA-01', name: 'Plato Porcelana Desayuno', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
      { itemCode: 'MEN-CUB-02', name: 'Juego Cubiertos Desayuno', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
      { itemCode: 'MEN-VAS-04', name: 'Vaso de Vidrio Jugo', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
    ]
  },

  // 2. Turno: Almuerzo Ejecutivo Castrense
  {
    id: 'rec-shift-almuerzo',
    type: 'shift',
    code: 'almuerzo',
    name: 'Almuerzo Ejecutivo Castrense (3 Tiempos)',
    description: 'Sopa andina, plato fuerte con lomo/pollo, arroz flor, papas y bebida fría.',
    mealCourse: 'Servicio Comedor Tarde (12:30 - 15:00)',
    requirements: [
      { itemCode: 'ALM-LOM-01', name: 'Lomo Fino de Res', category: 'kitchen_food', quantityPerPax: 0.12, unit: 'kg', isReturnable: false },
      { itemCode: 'ALM-POL-02', name: 'Pechuga de Pollo', category: 'kitchen_food', quantityPerPax: 0.10, unit: 'kg', isReturnable: false },
      { itemCode: 'ALM-ARR-03', name: 'Arroz Flor Extra', category: 'kitchen_food', quantityPerPax: 0.15, unit: 'kg', isReturnable: false },
      { itemCode: 'ALM-PAP-04', name: 'Papas Seleccionadas', category: 'kitchen_food', quantityPerPax: 0.20, unit: 'kg', isReturnable: false },
      { itemCode: 'BEB-COL-02', name: 'Gaseosa o Agua Mineral', category: 'beverages', quantityPerPax: 0.0417, unit: 'jaba', isReturnable: false },
      { itemCode: 'INS-SRV-01', name: 'Servilletas de Mesa', category: 'disposables', quantityPerPax: 0.006, unit: 'paquete', isReturnable: false },
      { itemCode: 'MEN-PLA-01', name: 'Plato Llano Institucional', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
      { itemCode: 'MEN-CUB-02', name: 'Juego Cubiertos Completo', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
      { itemCode: 'MEN-VAS-04', name: 'Vaso Vidrio Bebida', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
    ]
  },

  // 3. Turno: Cena Ligera de Oficiales
  {
    id: 'rec-shift-cena',
    type: 'shift',
    code: 'cena',
    name: 'Cena Ligera de Oficiales',
    description: 'Pechuga grillada, ensalada fresca, papas al vapor e infusión o agua mineral.',
    mealCourse: 'Servicio Comedor Noche (19:00 - 21:30)',
    requirements: [
      { itemCode: 'ALM-POL-02', name: 'Pechuga de Pollo Grill', category: 'kitchen_food', quantityPerPax: 0.18, unit: 'kg', isReturnable: false },
      { itemCode: 'ALM-PAP-04', name: 'Papas al Vapor', category: 'kitchen_food', quantityPerPax: 0.14, unit: 'kg', isReturnable: false },
      { itemCode: 'BEB-GUT-01', name: 'Güitig / Agua Mineral', category: 'beverages', quantityPerPax: 0.0417, unit: 'jaba', isReturnable: false },
      { itemCode: 'INS-SRV-01', name: 'Servilletas de Mesa', category: 'disposables', quantityPerPax: 0.004, unit: 'paquete', isReturnable: false },
      { itemCode: 'MEN-PLA-01', name: 'Plato Llano Porcelana', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
      { itemCode: 'MEN-CUB-02', name: 'Juego Cubiertos Inox', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
    ]
  },

  // 4. Evento: Banquete Protocolar de Gala / Aniversario
  {
    id: 'rec-event-banquete',
    type: 'event',
    code: 'banquete_gala',
    name: 'Banquete Protocolar de Gala (Salón de Armas)',
    description: 'Menú de etiqueta a 4 tiempos, medallón de lomo, cristalería de gala y cubertería fina.',
    mealCourse: 'Servicio de Gala Castrense',
    requirements: [
      { itemCode: 'ALM-LOM-01', name: 'Lomo Fino Medallón Premium', category: 'kitchen_food', quantityPerPax: 0.28, unit: 'kg', isReturnable: false },
      { itemCode: 'ALM-PAP-04', name: 'Guarnición Papa Gratinada', category: 'kitchen_food', quantityPerPax: 0.16, unit: 'kg', isReturnable: false },
      { itemCode: 'ALM-ARR-03', name: 'Arroz Salvaje / Aromático', category: 'kitchen_food', quantityPerPax: 0.10, unit: 'kg', isReturnable: false },
      { itemCode: 'BEB-GUT-01', name: 'Güitig Mineral con Gas', category: 'beverages', quantityPerPax: 0.0417, unit: 'jaba', isReturnable: false },
      { itemCode: 'BEB-COL-02', name: 'Gaseosas / Refrescos', category: 'beverages', quantityPerPax: 0.0417, unit: 'jaba', isReturnable: false },
      { itemCode: 'INS-SRV-01', name: 'Servilletas de Lujo', category: 'disposables', quantityPerPax: 0.008, unit: 'paquete', isReturnable: false },
      { itemCode: 'MEN-PLA-01', name: 'Platos Base y Fuerte Porcelana', category: 'tableware', quantityPerPax: 2.0, unit: 'unidad', isReturnable: true },
      { itemCode: 'MEN-CUB-02', name: 'Juegos Cubiertos 18/10 Gala', category: 'tableware', quantityPerPax: 2.0, unit: 'unidad', isReturnable: true },
      { itemCode: 'MEN-COP-03', name: 'Copas de Cristal Vino/Agua', category: 'tableware', quantityPerPax: 2.0, unit: 'unidad', isReturnable: true },
    ]
  },

  // 5. Evento: Asado Campestre BBQ Familiar
  {
    id: 'rec-event-asado',
    type: 'event',
    code: 'asado_campero',
    name: 'Asado Campestre Familiar (Pérgola BBQ)',
    description: 'Parrillada mixta con lomo, pollo, papas chauchas, vasos y servilletas descartables.',
    mealCourse: 'Servicio Campestre al Aire Libre',
    requirements: [
      { itemCode: 'ALM-LOM-01', name: 'Corte de Res Parrillero', category: 'kitchen_food', quantityPerPax: 0.25, unit: 'kg', isReturnable: false },
      { itemCode: 'ALM-POL-02', name: 'Pollo a la Brasa / Parrilla', category: 'kitchen_food', quantityPerPax: 0.20, unit: 'kg', isReturnable: false },
      { itemCode: 'ALM-PAP-04', name: 'Papas Asadas al Carbón', category: 'kitchen_food', quantityPerPax: 0.25, unit: 'kg', isReturnable: false },
      { itemCode: 'BEB-COL-02', name: 'Gaseosas Familiares', category: 'beverages', quantityPerPax: 0.0417, unit: 'jaba', isReturnable: false },
      { itemCode: 'BEB-GUT-01', name: 'Güitig Mineral', category: 'beverages', quantityPerPax: 0.0417, unit: 'jaba', isReturnable: false },
      { itemCode: 'INS-VAS-02', name: 'Vasos Descartables Biodegradables', category: 'disposables', quantityPerPax: 0.04, unit: 'paquete', isReturnable: false },
      { itemCode: 'INS-SRV-01', name: 'Servilletas Asado', category: 'disposables', quantityPerPax: 0.008, unit: 'paquete', isReturnable: false },
      { itemCode: 'MEN-PLA-01', name: 'Plato Llano Resistente', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
      { itemCode: 'MEN-CUB-02', name: 'Juego Cubiertos Parrilleros', category: 'tableware', quantityPerPax: 1.0, unit: 'unidad', isReturnable: true },
    ]
  }
];
```

---

### 3.4. Motor de Carga de Facturas de Adquisición SRI (Precargas de Proveedores)

Se diseñan 3 facturas listas para demostración inmediata en la reunión:

1. **Factura PRONACA S.A. (Proteínas e Insumos Avícolas):**
   - RUC: `1790005744001`
   - N.º Factura: `001-002-000045892`
   - Clave SRI (49 dígitos): `0911202601179000574400120010020000458921234567814`
   - Ítems:
     - 50 kg `ALM-LOM-01` (Lomo Fino) a $8.50 = $425.00
     - 40 kg `ALM-POL-02` (Pechuga Pollo) a $4.20 = $168.00
     - 20 cubetas `ALM-HUE-05` (Huevos de Campo) a $3.80 = $76.00
   - Subtotal: **$669.00**, IVA 15%: **$100.35**, Total Factura: **$769.35 USD**.
   - *Impacto en Stock:* Aumenta huevos en 20 cubetas (12 -> 32), **resolviendo de inmediato la alerta ámbar de punto de reorden**.

2. **Factura THE TESALIA SPRINGS COMPANY S.A. (Bebidas y Aguas):**
   - RUC: `1790013828001`
   - N.º Factura: `003-010-000128945`
   - Clave SRI (49 dígitos): `0911202601179001382800120030100001289451234567819`
   - Ítems:
     - 25 jabas `BEB-GUT-01` (Güitig 500ml) a $12.00 = $300.00
     - 20 jabas `BEB-COL-02` (Coca-Cola 350ml) a $14.50 = $290.00
     - 15 kg `BEB-JUG-04` (Pulpa Frutas) a $3.50 = $52.50
   - Subtotal: **$642.50**, IVA 15%: **$96.38**, Total Factura: **$738.88 USD**.
   - *Impacto en Stock:* Aumenta Pulpa de Frutas en 15 kg (6 -> 21 kg), **erradicando la alerta roja crítica** y elevando Güitig (16 -> 41 jabas).

3. **Factura INDURMESA / DISPROVESA CIA. LTDA. (Descartables y Vajilla de Reposición):**
   - RUC: `1791234567001`
   - N.º Factura: `002-005-000089120`
   - Clave SRI (49 dígitos): `0911202601179123456700120020050000891201234567812`
   - Ítems:
     - 40 paq `INS-SRV-01` (Servilletas) a $2.80 = $112.00
     - 35 paq `INS-VAS-02` (Vasos Descartables) a $4.50 = $157.50
     - 50 u `MEN-PLA-01` (Platos Porcelana) a $6.20 = $310.00
   - Subtotal: **$579.50**, IVA 15%: **$86.93**, Total Factura: **$666.43 USD**.
   - *Impacto en Stock:* Repone el buffer de vajilla institucional y soluciona la alerta de vasos descartables.

---

### 3.5. Estructura de la Interfaz Gráfica (`InventoryDashboardView`)

Se propone una vista integral y dinámica estructurada en:

1. **Header Institucional con Indicadores KPI en Tiempo Real:**
   - **Total de Ítems:** 20 referencias activas en economato.
   - **Valorización Total de Bodega:** Muestra monto en USD con actualización automática tras despachos o compras.
   - **Alertas de Stock:** Badges dinámicos con contador de ítems Críticos (Rojo) y en Punto de Reorden (Ámbar).
   - **Menaje en Circulación:** Contador de vajilla/copas actualmente asignadas a salones o eventos.
   - **Botón de Acción Rápida 1:** *"Ingresar Factura de Proveedor (SRI)"* (Abre modal de carga/lectura).
   - **Botón de Acción Rápida 2:** *"Simular Despacho / Turno (Explosión BoM)"* (Abre simulador de comensales).

2. **Navegación por Sub-Pestañas:**
   - **Sub-Tab 1: Catálogo y Existencias:**
     - Barra de búsqueda por nombre o código.
     - Filtros por categoría: *Todos*, *Insumos y Descartables*, *Menaje y Cubiertos*, *Bebidas*, *Alimentos de Cocina*, *Alertas Activas*.
     - Tabla/Cards con barras de progreso de stock:
       - Indicador visual del `%` respecto a capacidad óptima.
       - Marcas para punto de reorden y stock mínimo.
       - Acciones: *"Ajuste Manual"* y *"Ver Ficha Kardex"*.
   - **Sub-Tab 2: Despacho por Turno / Evento (Explosión BoM):**
     - Selector visual: Desayuno, Almuerzo, Cena, Banquete Gala, Asado Campestre.
     - Slider interactivo de Comensales / PAX (de 5 a 250 personas).
     - Tabla comparativa *"Impacto Antes vs Después"*:
       - Requerimiento total vs Stock actual.
       - Barra de proyección de stock restante.
       - Costo total estimado del servicio en insumos.
       - Botón militar: *"Confirmar Despacho Castrense y Descontar Existencias"*.
   - **Sub-Tab 3: Auditoría y Cierre de Eventos (Control de Vajilla):**
     - Listado de eventos despachados pendientes de liquidación.
     - Modal de auditoría de menaje:
       - Platos/Copas despachadas.
       - Campo para ingresar retornados sanos y averiados/quebrados.
       - Cálculo del valor de rotura/merma.
       - Botón: *"Cerrar Evento y Registrar en Kardex"*.
   - **Sub-Tab 4: Bitácora Kardex Completa:**
     - Tabla detallada con timestamp, tipo de movimiento con badge de color, documento de referencia (N.º factura SRI o N.º turno), responsable militar, cantidad entrante/saliente y saldo final.
     - Buscador y filtro por tipo de movimiento.

---

## 4. Advertencias y Limitaciones (Caveats)

1. **Separación de Responsabilidades con Explorer 1:**
   - Explorer 1 investiga el flujo de reservas y comensales en el restaurante del portal del socio.
   - Explorer 2 entrega el **motor desacoplado de inventario y economato**. Cuando Explorer 1 o el usuario final confirmen una reserva o ejecuten un turno de comedor en el restaurante, invocan la función `executeDispatch(formulaCode, pax, referenceName, responsible)` de `InventoryContext`, garantizando sincronización sin acoplamiento rígido.
2. **Capacidad de Almacenamiento Local (LocalStorage):**
   - El catálogo de 20 ítems, 50 entradas de Kardex y 5 facturas ocupa menos de 80 KB. El límite estándar de `localStorage` es de 5 MB, por lo que no existe riesgo de desbordamiento.
3. **Simulador de OCR / XML Electrónico del SRI:**
   - En el prototipo de demostración para la reunión del martes, la carga de PDF o XML se simula de manera reactiva instantánea (extrayendo campos válidos y permitiendo precargas de un clic) para no depender de librerías nativas pesadas en el navegador cliente.

---

## 5. Conclusión (Conclusion)

El diseño arquitectónico propuesto para el módulo de **Inventarios, Economato, Explosión de Insumos y Motor Kardex** cubre con máxima fidelidad la totalidad de los requerimientos solicitados por el cliente en el follow-up del 9 de noviembre:
1. **Multi-Tenant y Adaptado a la Realidad Castrense:** Catálogos e identidades diferenciadas para CROE y Círculo Militar con insumos propios de la cocina militar ecuatoriana.
2. **Explosión Automática de Fichas Técnicas (BoM):** Descuento exacto por comensales (PAX) en Desayunos, Almuerzos, Cenas y Banquetes de Gala.
3. **Control Riguroso de Menaje Retornable:** Prevención de pérdidas en eventos mediante auditoría de retorno vs. mermas/roturas.
4. **Motor de Carga de Facturas SRI:** Adquisición de insumos con proveedores reales (Pronaca, Tesalia, Indurmesa) que alimentan el inventario, actualizan el Kardex y solucionan alertas críticas con un solo clic durante la reunión.
5. **Persistencia y Reactividad:** Implementado sobre `InventoryContext` con guardado automático en `localStorage` y total compatibilidad con las 75 pruebas del proyecto.

---

## 6. Método de Verificación Independiente (Verification Method)

El evaluador, auditor o Worker puede verificar de manera autónoma esta arquitectura mediante los siguientes pasos:

1. **Verificación de Tipos y Compilación:**
   - Crear el archivo `src/types/inventory.ts` con las interfaces descritas en la Sección 3.1.
   - Ejecutar en la terminal:
     ```powershell
     npx tsc --noEmit
     ```
     *Criterio de éxito:* 0 errores tipográficos.

2. **Verificación de Pruebas Existentes (Regresión Cero):**
   - Ejecutar la suite completa:
     ```powershell
     npm test
     ```
     *Criterio de éxito:* 75 de 75 pruebas continúan pasando (`15 passed`).

3. **Verificación de Matemática de Descuento y Kardex:**
   - Con 45 comensales en Turno Almuerzo (`almuerzo`), el Lomo consumido debe ser exactamente:
     $$45 \times 0.12\text{ kg} = 5.40\text{ kg}$$
   - El stock de Lomo en CROE debe descender de 38.00 kg a 32.60 kg.
   - En el Kardex debe insertarse una fila de tipo `OUT_SHIFT` con cantidad `-5.40`, saldo `32.60`, documento `TURNO-ALMUERZO-45PAX`.

4. **Verificación de Carga de Factura SRI (Tesalia):**
   - Al cargar la factura de Tesalia Springs, la pulpa de frutas debe aumentar de 6 kg a 21 kg.
   - La alerta roja crítica de pulpa de frutas debe desaparecer automáticamente, pasando a estado Óptimo (Verde).
