# INFORME DE HANDOFF: ARQUITECTURA DE RESTAURANTE POR TURNOS, BANQUETES Y EXPLOSIÓN DE INSUMOS MULTI-TENANT (CROE & CÍRCULO MILITAR)

**Agente:** Explorer 1 (`explorer_survey_shift_1`)  
**Fecha:** 2026-11-09T03:38:00Z  
**Destinatario:** Orquestador (`4cb2763c-1538-4609-8d96-d251b4f7d423`) & Worker Implementador  
**Directorio de Trabajo:** `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_shift_1\`  
**Estado:** Hard Handoff (Investigación completa, libre de errores)

---

## 1. OBSERVATION

De acuerdo con la inspección directa del código fuente, suite de pruebas y archivos de especificación:

### 1.1. Arquitectura de Navegación y Vistas Existente
- **`src/App.tsx` (L16-73)**:
  - Gestiona el estado de navegación mediante `const [activeTab, setActiveTab] = useState<ActiveTab>('home');`.
  - Las pestañas actuales renderizan condicionalmente: `'home'` (`<InstitutionalHero />`), `'socio'` (`<SocioProfileView />`), `'reservations'` (`<ReservationView />`), `'payment'` (`<PaymentView />`).
  - Líneas 56-68: La navegación a pago transfiere la reserva seleccionada directamente a `initiatePayment({...})` del `PaymentContext` y cambia `activeTab` a `'payment'`.
- **`src/components/common/Navbar.tsx` (L16-37)**:
  - Define `export type ActiveTab = 'home' | 'socio' | 'reservations' | 'payment';`.
  - Define el arreglo de navegación con etiquetas e iconos de `lucide-react`:
    ```typescript
    const navItems = [
      { id: 'home' as ActiveTab, label: 'Inicio', icon: Home },
      { id: 'socio' as ActiveTab, label: 'Portal del Socio & Carné', icon: UserCheck },
      { id: 'reservations' as ActiveTab, label: 'Reservas & Deportes', icon: CalendarCheck },
      { id: 'payment' as ActiveTab, label: 'Pasarela de Pagos (SRI)', icon: CreditCard },
    ];
    ```
  - Las pruebas E2E (ej. `tests/tier1-feature-coverage/reservation-engine.test.tsx:17`, `tests/tier3-cross-feature/cross-feature-flows.test.tsx:68`) realizan búsquedas estrictas sobre:
    `screen.getByRole('button', { name: /reservas & deportes/i })`.

### 1.2. Modelo de Datos y Contexto de Reservas
- **`src/types/reservation.ts` (L1-40)**:
  - `export type FacilityCategory = 'lodging' | 'sports';`
  - `Facility` define campos: `id`, `tenantId`, `name`, `category`, `subcategory`, `capacity`, `description`, `amenities`, `imageUrl`, `memberPrice`, `guestPrice`, `unit: 'noche' | 'hora' | 'evento'`, `available`, `location`.
  - `Reservation` define: `id`, `tenantId`, `facilityId`, `facilityName`, `category`, `checkIn`, `checkOut`, `guests`, `socioId`, `socioName`, `subtotal`, `discount`, `vat`, `total`, `status`, `paymentStatus`, `transactionId`, `createdAt`.
- **`src/context/ReservationContext.tsx` (L50-93)**:
  - `ECUADOR_IVA_RATE = 0.15;`
  - `computeBillingBreakdown`: calcula `subtotal`, `militaryDiscount`, `taxableSubtotal`, `vat` (15%), `total` con redondeo monetario estricto.
  - Almacenamiento en `localStorage` particionado por tenant: `STORAGE_KEYS = { croe: 'croe_reservations', 'circulo-militar': 'circulo_reservations' }`.

### 1.3. Catálogo Multi-Tenant Actual
- **`src/data/croeData.ts` (L30-143)**:
  - 7 instalaciones registradas (3 de hospedaje: Cabaña Familiar, Suite Ejecutiva, Habitación Confort; 3 deportivas: Cancha Tenis Arcilla, Pádel Panorámica, Piscina Climatizada; 1 de reunión/asados: Pérgola BBQ Familiar 3 con `unit: 'evento'`).
  - Paleta: Granate `#8B1E24`, Dorado `#D4AF37`, Lema: *"EL PLACER DE SERVIR"*.
- **`src/data/circuloData.ts` (L31-144)**:
  - 7 instalaciones registradas (3 hospedaje: Suite de Honor, Habitación Clásica, Cabaña Campestre; 3 deportivas: Cancha Squash, Tenis Rápida, Pista Atlética; 1 protocolar: Salón de Armas con `unit: 'evento'`).
  - Paleta: Azul Marino `#1B365D`, Dorado Imperial `#C8A051`, Lema: *"TRADICIÓN, HONOR Y FRATERNIDAD"*, Fundado en 1918.

### 1.4. Estado de Pruebas Automatizadas
- Ejecución de `vitest run`: **75 de 75 pruebas pasando al 100%** (15 archivos de test, duración ~25s).
- Ejecución de `node scripts/test-prototype.mjs`: **8 de 8 pruebas del sistema y documentación aprobadas al 100%**.

---

## 2. LOGIC CHAIN

### 2.1. Arquitectura de Navegación y Pestañas
1. **Paso 1 (Inferencia de requerimientos de demostración):** El usuario requiere explícitamente diferenciar el servicio de Restaurante por turno diario (Desayuno, Almuerzo, Cena) y Eventos / Banquetes (con PAX), así como controlar inventarios y existencias con descuento automático.
2. **Paso 2 (Integración sin regresión en Navbar):** Para brindar máxima visibilidad ante los directivos en la reunión del martes sin alterar los selectores que esperan las pruebas existentes, `ActiveTab` debe expandirse a:
   `export type ActiveTab = 'home' | 'socio' | 'reservations' | 'restaurant' | 'inventory' | 'payment';`
   - Mantener intacto el botón con etiqueta `"Reservas & Deportes"` para satisfacer `tests/tier1-feature-coverage/reservation-engine.test.tsx:17`.
   - Incorporar `"Restaurante & Eventos"` (icono `UtensilsCrossed` de Lucide) e `"Inventario & Economato"` (icono `PackageCheck` o `Boxes`).
   - En `ReservationView`, añadir enlaces cruzados hacia "Restaurante & Eventos" para que un socio navegando instalaciones pueda reservar directamente comedores o salones.

### 2.2. Diseño Funcional: Restaurante / Comedor por Turnos Diarios
1. **Turnos Reglamentarios Castrenses**:
   - **Desayuno Militar / Campestre (06:30 - 09:30)**:
     - CROE: *Desayuno Campestre Cumbayá* ($4.50 socio / $7.50 invitado). Huevos de campo, tamal lojano, queso de hoja, café pasado de Loja, pan de horno de leña, jugo natural.
     - Círculo Militar: *Desayuno Continental de Oficiales* ($5.00 socio / $8.00 invitado). Revuelto campestre con jamón, tostadas francesas o pan brioche, café espresso, fruta de temporada, jugo de naranja.
   - **Almuerzo Ejecutivo de Guarnición / Gala (12:00 - 15:00)**:
     - CROE: *Almuerzo de Guarnición Cumbayá* ($6.50 socio / $10.00 invitado). Locro de papa con aguacate, Lomo fino a la parrilla con chimichurri / Suprema de pollo con papas rústicas y ensalada fresca, Dulce de higos con queso, gaseosa o jugo natural.
     - Círculo Militar: *Almuerzo de Gala Mayor* ($7.00 socio / $11.00 invitado). Ceviche de palmito / Crema minestrone, Filete Mignon en salsa de champiñones / Corvina en salsa de camarones con arroz florentino, postre imperial, agua Güitig o cola.
   - **Cena de Confraternidad (18:30 - 21:30)**:
     - CROE: *Cena de Confraternidad Andina* ($5.50 socio / $9.00 invitado). Crema de espárragos, Medallones de lomo a la pimienta verde o Trucha asada al ajillo, guarnición ligera, infusión o cola.
     - Círculo Militar: *Cena de Honor de Estado Mayor* ($6.00 socio / $9.50 invitado). Consomé de ave clarificado, Pechuga Cordon Bleu o Baby Beef a la plancha con puré rústico y ensalada caprese, postre de la casa, bebida.
2. **Modalidad Dual de Operación**:
   - *Modo A: Reserva Individual / Familiar de Mesa (Socio Militar)*: Reserva de 1 a 12 comensales, selecciona fecha, turno, menú y solicitudes especiales. Se genera código localizador oficial (`RSV-CROE-XXXX`), se calcula subtotal con subsidio militar y 15% IVA SRI, y se envía a la pasarela Payphone/Kushki o pago en garita.
   - *Modo B: Despacho / Cierre Operativo de Turno (Comandancia / Mayordomía)*: Permite al jefe de comedor registrar el número real de comensales servidos en el día (ej. 45 raciones de almuerzo) con un solo clic en **"Registrar y Descontar Turno del Día"**, disparando la explosión y deducción de insumos en el economato.

### 2.3. Diseño Funcional: Eventos y Banquetes Institucionales
1. **Tipos de Eventos Castrenses y Sociales**:
   - `banquete_gala`: Banquete de Gala Militar / Ascenso de Oficiales (formal, protocolo de estado mayor).
   - `almuerzo_campestre`: Almuerzo Campestre de Confraternidad (parrillada al aire libre, ambiente familiar).
   - `coctel_honor`: Cóctel de Honor / Brindis Protocolar (recepción de pie, canapés y champaña).
   - `desayuno_trabajo`: Desayuno de Trabajo Ejecutivo (coffee break continuo, reuniones de comando).
   - `evento_social`: Fiesta Social / Matrimonio / Aniversario de Oficial (cena servida, pista y descorche).
2. **Menús Especiales de Banquete**:
   - *Menú Gala de las Armas (3 Tiempos)*: $22.00 socio / $32.00 invitado. Tournedó de lomo fino con salsa demiglace, milhojas de papa, espárragos, mousse de chocolate Arriba 70%, 2 colas, agua mineral.
   - *Parrillada Militar Campestre*: $16.00 socio / $24.00 invitado. Bife de chorizo, pechuga parrillera, chorizo artesanal, papas chauchas con queso, ensalada fresca, 2 bebidas.
   - *Cóctel de Honor (Bocaditos & Brindis)*: $12.00 socio / $18.00 invitado. 6 variedades de canapés gourmet, copa de espumante para brindis, gaseosas y agua Güitig.
   - *Desayuno Buffet Ejecutivo*: $8.50 socio / $13.00 invitado. Estación de frutas, quesos, revuelto campestre, variedad de panes, jugo natural y café continuo.
3. **Distribución y Montajes (Room Setups)**:
   - `banquete_mesas`: Mesas redondas de 8 a 10 comensales con mantelería de etiqueta institucional.
   - `imperial_u`: Mesa presidencial larga en U para ceremonias de Estado Mayor y comandantes.
   - `auditorio`: Disposición frontal en filas con atril y estandarte para asambleas.
   - `coctel_lounge`: Mesas periqueras altas y livings lounge para recepciones dinámicas.
4. **Instalaciones de Eventos Domiciliadas por Club**:
   - **CROE**:
     - *Salón del Sol & El Valle*: Capacidad hasta 250 personas, ventanales panorámicos, audio integrado.
     - *Pérgola BBQ Los Pinos*: Capacidad hasta 80 personas, parrilla argentina industrial de acero.
     - *Terraza Campestre "El Placer de Servir"*: Capacidad hasta 120 personas para cócteles al atardecer.
   - **Círculo Militar**:
     - *Salón de Armas (Piso Principal)*: Capacidad 150 personas, vitrinas con espadas y sables históricos, arañas de cristal, parquet pulido.
     - *Gran Salón de los Generales*: Capacidad 350 personas, escenario de gala, acústica profesional.
     - *Salón Protocolario 1918*: Capacidad 60 personas, mobiliario de caoba republicana.
     - *Rincón Campestre Sangolquí*: Capacidad 100 personas para almuerzos al aire libre.
5. **Estructura Tarifaria y Liquidación Financiera**:
   - Tarifa de salón base (con 40% a 50% de subsidio a socios militares).
   - Tarifa de menú por PAX (comensales declarados).
   - Servicios adicionales opcionales: Mantelería de Gala ($50 USD), Sonido/Proyector HD ($75 USD), Mayordomía Militar de guante blanco ($120 USD), Decoración Floral Protocolar ($80 USD).
   - Subtotal general + 15% IVA SRI Ecuador.

### 2.4. Motor de Explosión de Insumos y Conexión con Economato / Kardex
1. **Ficha Técnica y Matriz de Consumo por Comensal (BOM Unitario)**:
   Cada ración de turno o banquete se desglosa matemáticamente:
   - **Desayuno (x1 PAX)**:
     - 2 huevos de campo (Alimentos)
     - 0.05 kg queso andino (Alimentos)
     - 2 unidades pan de horno (Alimentos)
     - 0.015 kg café molido de altura (Alimentos)
     - 0.25 L jugo de frutas natural (Bebidas)
     - 2 servilletas descartables (Insumos)
     - 1 juego de vajilla y cubiertos asignados (Menaje Retornable)
   - **Almuerzo (x1 PAX)**:
     - 0.20 kg lomo fino de res / suprema de pollo (Alimentos)
     - 0.15 kg arroz / papas andinas (Alimentos)
     - 0.08 kg verduras / ensalada fresca (Alimentos)
     - 1 unidad cola/gaseosa 355ml (Bebidas)
     - 0.5 unidades agua mineral Güitig (Bebidas)
     - 2 servilletas de mesa (Insumos)
     - 1 vaso de vidrio asignado (Menaje Retornable)
     - 1 juego de cubiertos de acero asignado (Menaje Retornable)
   - **Cena (x1 PAX)**:
     - 0.22 kg medallón de carne / pescado (Alimentos)
     - 0.12 kg papas rústicas (Alimentos)
     - 0.08 kg vegetales salteados (Alimentos)
     - 1 unidad bebida gaseosa / agua mineral (Bebidas)
     - 2 servilletas de mesa (Insumos)
     - 1 juego de cubiertos y vajilla asignados (Menaje Retornable)
   - **Banquete de Gala (x1 PAX)**:
     - 0.25 kg tournedó de lomo fino premium (Alimentos)
     - 0.18 kg guarnición gourmet milhojas (Alimentos)
     - 0.10 kg espárragos y vegetales glaseados (Alimentos)
     - 2 unidades colas / refrescos (Bebidas)
     - 1 unidad agua Güitig con gas (Bebidas)
     - 3 servilletas de tela/papel de gala (Insumos)
     - 1 set completo vajilla de gala (Menaje Retornable)
     - 3 copas de cristal (agua, vino, brindis) (Menaje Retornable)
     - 1 set cubiertos de gala (Menaje Retornable)
2. **Algoritmo de Deducción y Kardex**:
   - Al disparar `deductServiceConsumption({ tenantId, serviceType, shiftName, paxCount, menuId, referenceId })`:
     - Para consumibles (`Insumos`, `Alimentos`, `Bebidas`): `nuevoStock = stockActual - (paxCount * racionUnitaria)`.
     - Para menaje (`Menaje y Cubiertos`): se traslada de `disponible` a `enUsoEnEventos`.
     - Se emite registro formal en el **Kardex**:
       - Tipo de Movimiento: `'SALIDA_TURNO'` o `'SALIDA_EVENTO'`
       - Referencia: ej. `Almuerzo Ejecutivo - 60 PAX` o `Banquete Gala Ascensos - 120 PAX`
       - Fecha, hora, SKU, cantidad descontada, saldo resultante y operador responsable.
     - Si `nuevoStock <= reorderPoint`, se activa alerta visual de **Stock Bajo / Punto de Reorden**.
3. **Cierre de Evento y Control de Retorno / Rotura de Menaje**:
   - Una vez finalizado el evento, la mayordomía inspecciona el salón y registra el retorno:
     - Items devueltos intactos retornan a `disponible`.
     - Vajilla o cristalería rota/extraviada se descuenta definitivamente y se asienta en el Kardex como `'MERMA_ROTURA_EVENTO'`.

---

## 3. CAVEATS

1. **Persistencia del Prototipo:** El prototipo opera en memoria y `localStorage` (`croe_restaurant_bookings`, `circulo_restaurant_bookings`, `croe_inventory_stock`, `circulo_inventory_stock`). No requiere conexión a base de datos externa para funcionar de forma autónoma durante la reunión ejecutiva.
2. **Compatibilidad con las 75 pruebas:** Todas las pruebas actuales deben continuar ejecutándose en verde. Las nuevas interfaces de Restaurante e Inventario deben extender `App.tsx` y `Navbar.tsx` sin eliminar los botones existentes ni cambiar las clases de las pruebas Tier 1 a 4.
3. **Precios y Valores:** Las tarifas propuestas respetan la moneda de curso legal de Ecuador (USD) y contemplan la tarifa vigente de IVA del 15% (según reforma tributaria ecuatoriana 2024).

---

## 4. CONCLUSION & CONCRETE CODE CONTRACTS FOR WORKER

### 4.1. Nuevas Interfaces TypeScript Propuestas (`src/types/restaurant.ts`)

```typescript
// src/types/restaurant.ts
import { TenantId } from './tenant';

export type ShiftType = 'desayuno' | 'almuerzo' | 'cena';

export type EventType = 
  | 'banquete_gala' 
  | 'almuerzo_campestre' 
  | 'coctel_honor' 
  | 'desayuno_trabajo' 
  | 'evento_social';

export type RoomSetup = 
  | 'banquete_mesas' 
  | 'imperial_u' 
  | 'auditorio' 
  | 'coctel_lounge';

export interface ShiftInfo {
  type: ShiftType;
  label: string;
  hours: string;
  description: string;
  memberPrice: number;
  guestPrice: number;
  iconName: string;
}

export interface DiningHallFacility {
  id: string;
  tenantId: TenantId;
  name: string;
  hallType: 'comedor' | 'salon_eventos' | 'pergola_exterior';
  capacity: number;
  description: string;
  amenities: string[];
  imageUrl: string;
  supportedShifts: ShiftType[];
  supportsEvents: boolean;
  baseRentalMember: number;
  baseRentalGuest: number;
  location: string;
}

export interface MenuItemOption {
  id: string;
  tenantId: TenantId;
  category: 'desayuno' | 'almuerzo' | 'cena' | 'banquete_gala' | 'coctel' | 'campestre';
  name: string;
  description: string;
  starter?: string;
  mainCourse: string;
  dessert?: string;
  drinksIncluded: string;
  memberPricePerPax: number;
  guestPricePerPax: number;
}

export interface RestaurantShiftBooking {
  id: string; // e.g. RSV-SHF-CROE-1029
  tenantId: TenantId;
  facilityId: string;
  facilityName: string;
  shiftType: ShiftType;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  paxCount: number;
  isOperationalExecution: boolean; // True if executed by comedor management, false if socio table reservation
  socioId: string;
  socioName: string;
  menuId: string;
  menuName: string;
  subtotal: number;
  militaryDiscount: number;
  vat: number;
  total: number;
  status: 'confirmed' | 'executed' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  stockDeducted: boolean;
  createdAt: string;
  notes?: string;
}

export interface EventBanquetBooking {
  id: string; // e.g. EVT-CROE-2041
  tenantId: TenantId;
  facilityId: string;
  facilityName: string;
  eventType: EventType;
  eventName: string;
  date: string;
  startTime: string;
  endTime: string;
  paxCount: number;
  roomSetup: RoomSetup;
  menuId: string;
  menuName: string;
  hallRentalPrice: number;
  cateringPrice: number;
  additionalServices: {
    serviceId: string;
    name: string;
    price: number;
    selected: boolean;
  }[];
  subtotal: number;
  militaryDiscount: number;
  vat: number;
  total: number;
  socioId: string;
  socioName: string;
  status: 'confirmed' | 'in_progress' | 'settled' | 'cancelled';
  paymentStatus: 'pending' | 'paid';
  tablewareDeployed: boolean;
  tablewareReturned: boolean;
  stockDeducted: boolean;
  createdAt: string;
  notes?: string;
}

export interface RecipeRequirementItem {
  sku: string;
  itemName: string;
  category: 'insumos_descartables' | 'menaje_cubiertos' | 'bebidas' | 'alimentos_cocina';
  quantityPerPax: number;
  unit: string;
  isConsumable: boolean; // False for tableware (retornable)
}
```

### 4.2. Definición del Contrato de Conexión de Insumos (`RecipeExplosionEngine`)

```typescript
// src/utils/recipeExplosion.ts
import { ShiftType, EventType, RecipeRequirementItem } from '../types/restaurant';

export const SHIFT_RECIPE_BOM: Record<ShiftType, RecipeRequirementItem[]> = {
  desayuno: [
    { sku: 'ALM-HUEV-01', itemName: 'Huevos de Campo Andinos', category: 'alimentos_cocina', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'ALM-PAN-01', itemName: 'Pan de Horno de Leña / Brioche', category: 'alimentos_cocina', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'ALM-QUES-01', itemName: 'Queso Fresco de Hoja', category: 'alimentos_cocina', quantityPerPax: 0.05, unit: 'kg', isConsumable: true },
    { sku: 'ALM-CAF-01', itemName: 'Café Molido de Altura Loja', category: 'alimentos_cocina', quantityPerPax: 0.015, unit: 'kg', isConsumable: true },
    { sku: 'BEB-JUG-01', itemName: 'Jugo Natural de Naranja/Mora', category: 'bebidas', quantityPerPax: 0.25, unit: 'L', isConsumable: true },
    { sku: 'INS-SERV-01', itemName: 'Servilletas de Mesa Institucionales', category: 'insumos_descartables', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'MEN-CUB-01', itemName: 'Juego de Cubiertos de Acero Inox', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-VAJ-01', itemName: 'Vajilla y Taza Institucional', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
  ],
  almuerzo: [
    { sku: 'ALM-LOM-01', itemName: 'Lomo Fino de Res / Suprema Pollo', category: 'alimentos_cocina', quantityPerPax: 0.20, unit: 'kg', isConsumable: true },
    { sku: 'ALM-ARR-01', itemName: 'Arroz Flor / Papas Chauchas', category: 'alimentos_cocina', quantityPerPax: 0.15, unit: 'kg', isConsumable: true },
    { sku: 'ALM-VER-01', itemName: 'Verduras y Ensalada de la Huerta', category: 'alimentos_cocina', quantityPerPax: 0.08, unit: 'kg', isConsumable: true },
    { sku: 'BEB-COL-01', itemName: 'Colas / Gaseosas 355ml (Coca-Cola/Sprite)', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'BEB-AGU-01', itemName: 'Agua Mineral Güitig 500ml', category: 'bebidas', quantityPerPax: 0.5, unit: 'botella', isConsumable: true },
    { sku: 'INS-SERV-01', itemName: 'Servilletas de Mesa Institucionales', category: 'insumos_descartables', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'MEN-CUB-01', itemName: 'Juego de Cubiertos de Acero Inox', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-VAS-01', itemName: 'Vaso de Vidrio Alto', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'und', isConsumable: false },
    { sku: 'MEN-VAJ-02', itemName: 'Plato Fuerte y Base de Porcelana', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
  ],
  cena: [
    { sku: 'ALM-LOM-01', itemName: 'Medallón de Lomo / Pescado Corvina', category: 'alimentos_cocina', quantityPerPax: 0.22, unit: 'kg', isConsumable: true },
    { sku: 'ALM-ARR-01', itemName: 'Papas Rústicas al Horno / Puré', category: 'alimentos_cocina', quantityPerPax: 0.12, unit: 'kg', isConsumable: true },
    { sku: 'ALM-VER-01', itemName: 'Vegetales Salteados al Vapor', category: 'alimentos_cocina', quantityPerPax: 0.08, unit: 'kg', isConsumable: true },
    { sku: 'BEB-COL-01', itemName: 'Bebida Gaseosa o Agua Mineral Güitig', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'INS-SERV-01', itemName: 'Servilletas de Mesa Institucionales', category: 'insumos_descartables', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'MEN-CUB-01', itemName: 'Juego de Cubiertos de Acero Inox', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-VAJ-02', itemName: 'Plato Fuerte de Porcelana', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
  ],
};

export const EVENT_RECIPE_BOM: Record<EventType, RecipeRequirementItem[]> = {
  banquete_gala: [
    { sku: 'ALM-LOM-01', itemName: 'Tournedó de Lomo Fino de Res Premium', category: 'alimentos_cocina', quantityPerPax: 0.25, unit: 'kg', isConsumable: true },
    { sku: 'ALM-ARR-01', itemName: 'Milhojas de Papa / Risotto Gourmet', category: 'alimentos_cocina', quantityPerPax: 0.18, unit: 'kg', isConsumable: true },
    { sku: 'ALM-VER-01', itemName: 'Espárragos y Vegetales Glaseados', category: 'alimentos_cocina', quantityPerPax: 0.10, unit: 'kg', isConsumable: true },
    { sku: 'BEB-COL-01', itemName: 'Colas / Gaseosas Variadas 355ml', category: 'bebidas', quantityPerPax: 2, unit: 'botella', isConsumable: true },
    { sku: 'BEB-AGU-01', itemName: 'Agua Mineral Güitig en Vidrio', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'INS-SERV-02', itemName: 'Servilletas de Tela de Gala', category: 'insumos_descartables', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'MEN-CUB-02', itemName: 'Set de Cubiertos de Gala Plateados', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-VAJ-03', itemName: 'Vajilla de Gala (3 Platos)', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-COP-01', itemName: 'Copas de Cristal (Agua, Vino, Brindis)', category: 'menaje_cubiertos', quantityPerPax: 3, unit: 'und', isConsumable: false },
  ],
  almuerzo_campestre: [
    { sku: 'ALM-LOM-01', itemName: 'Cortes de Parrilla Mixta (Bife/Pollo/Chorizo)', category: 'alimentos_cocina', quantityPerPax: 0.35, unit: 'kg', isConsumable: true },
    { sku: 'ALM-ARR-01', itemName: 'Papas Chauchas con Salsa de Queso', category: 'alimentos_cocina', quantityPerPax: 0.20, unit: 'kg', isConsumable: true },
    { sku: 'BEB-COL-01', itemName: 'Colas y Bebidas Refrescantes', category: 'bebidas', quantityPerPax: 2, unit: 'botella', isConsumable: true },
    { sku: 'INS-SERV-01', itemName: 'Servilletas de Mesa', category: 'insumos_descartables', quantityPerPax: 3, unit: 'und', isConsumable: true },
    { sku: 'INS-VAS-01', itemName: 'Vasos Descartables Biodegradables', category: 'insumos_descartables', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'MEN-CUB-01', itemName: 'Juego de Cubiertos Parrilleros', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
  ],
  coctel_honor: [
    { sku: 'ALM-BOC-01', itemName: 'Bocaditos Gourmet Calientes y Fríos', category: 'alimentos_cocina', quantityPerPax: 6, unit: 'und', isConsumable: true },
    { sku: 'BEB-VIN-01', itemName: 'Vino Espumante / Brindis Protocolar', category: 'bebidas', quantityPerPax: 0.25, unit: 'botella', isConsumable: true },
    { sku: 'BEB-AGU-01', itemName: 'Agua Güitig y Gaseosas', category: 'bebidas', quantityPerPax: 1, unit: 'botella', isConsumable: true },
    { sku: 'INS-SERV-01', itemName: 'Servilletas de Cóctel', category: 'insumos_descartables', quantityPerPax: 4, unit: 'und', isConsumable: true },
    { sku: 'MEN-COP-01', itemName: 'Copas Flauta y Vasos Cortos', category: 'menaje_cubiertos', quantityPerPax: 2, unit: 'und', isConsumable: false },
  ],
  desayuno_trabajo: [
    { sku: 'ALM-HUEV-01', itemName: 'Huevos Revueltos / Benedictinos', category: 'alimentos_cocina', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'ALM-PAN-01', itemName: 'Canasta de Panes Finos Artesanales', category: 'alimentos_cocina', quantityPerPax: 2, unit: 'und', isConsumable: true },
    { sku: 'ALM-CAF-01', itemName: 'Café Espresso Continuo de Especialidad', category: 'alimentos_cocina', quantityPerPax: 0.025, unit: 'kg', isConsumable: true },
    { sku: 'BEB-JUG-01', itemName: 'Jugo Natural de Frutas', category: 'bebidas', quantityPerPax: 0.30, unit: 'L', isConsumable: true },
    { sku: 'INS-SERV-01', itemName: 'Servilletas de Mesa', category: 'insumos_descartables', quantityPerPax: 3, unit: 'und', isConsumable: true },
    { sku: 'MEN-CUB-01', itemName: 'Juego de Cubiertos y Tazas', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
  ],
  evento_social: [
    { sku: 'ALM-LOM-01', itemName: 'Cena Servida de 3 Tiempos (Proteína)', category: 'alimentos_cocina', quantityPerPax: 0.22, unit: 'kg', isConsumable: true },
    { sku: 'ALM-ARR-01', itemName: 'Guarnición y Ensalada de Banquete', category: 'alimentos_cocina', quantityPerPax: 0.20, unit: 'kg', isConsumable: true },
    { sku: 'BEB-COL-01', itemName: 'Bebidas Gaseosas y Hielo', category: 'bebidas', quantityPerPax: 2, unit: 'botella', isConsumable: true },
    { sku: 'INS-SERV-02', itemName: 'Servilletas de Gala', category: 'insumos_descartables', quantityPerPax: 3, unit: 'und', isConsumable: true },
    { sku: 'MEN-CUB-01', itemName: 'Cubiertos y Vajilla Completa', category: 'menaje_cubiertos', quantityPerPax: 1, unit: 'set', isConsumable: false },
    { sku: 'MEN-COP-01', itemName: 'Cristalería de Banquete', category: 'menaje_cubiertos', quantityPerPax: 2, unit: 'und', isConsumable: false },
  ],
};

export function calculateSupplyExplosion(params: {
  serviceType: 'shift' | 'event';
  shiftType?: ShiftType;
  eventType?: EventType;
  paxCount: number;
}): { sku: string; itemName: string; category: string; totalQuantity: number; unit: string; isConsumable: boolean }[] {
  const { serviceType, shiftType, eventType, paxCount } = params;
  const items = serviceType === 'shift' && shiftType 
    ? SHIFT_RECIPE_BOM[shiftType] 
    : eventType 
    ? EVENT_RECIPE_BOM[eventType] 
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
```

### 4.3. Recomendaciones Clave de Implementación para el Worker
1. **Creación de Componentes Dedicados:**
   - Crear `src/components/restaurant/RestaurantView.tsx` como componente orquestador con dos pestañas internas prominentes:
     - *Turnos Diarios de Comedor (Desayuno / Almuerzo / Cena)*
     - *Banquetes y Eventos Institucionales*
   - Añadir una barra de estado o modal de **"Explosión Instantánea de Insumos"** donde los directivos puedan mover el selector de PAX (ej. de 20 a 150) y ver cómo en tiempo real se calculan los kg de carne, colas, servilletas y cubiertos requeridos.
   - Enlace directo a pago: un botón **"Pagar con Payphone / Kushki"** que conecte con `PaymentContext.initiatePayment` para demostrar el cobro del evento o turno de inmediato con comprobante SRI de 15% IVA.
2. **Compatibilidad con `ReservationContext` y `App.tsx`:**
   - Para que los eventos y comidas aparezcan en "Mis Reservas", al confirmar un turno o banquete se puede invocar `confirmBooking` o agregar la reserva al ledger en `ReservationContext`, manteniendo el localizador `RSV-CROE-XXXX` o `RSV-CIR-XXXX`.
   - Modificar `Navbar.tsx` para incluir `restaurant` e `inventory` sin modificar el nombre de `reservations` ("Reservas & Deportes").
3. **Multi-Tenant Styling:**
   - Usar las variables institucionales `--color-primary`, `--color-primary-dark` y `--color-accent` para que en CROE luzca con bordes granates y dorados y en Círculo Militar con azul marino profundo y dorado imperial.

---

## 5. VERIFICATION METHOD

El Worker y revisores pueden verificar de manera independiente el cumplimiento mediante:

1. **Verificación de Ejecución de Pruebas Unitarias y E2E Existentes:**
   ```powershell
   npm test
   ```
   *Criterio de éxito:* 75/75 pruebas pasan al 100% sin regresiones (0 fallos).

2. **Verificación del Validador de Documentación y Arquitectura CLI de Node 24:**
   ```powershell
   node scripts/test-prototype.mjs
   ```
   *Criterio de éxito:* 8/8 pruebas de sistema, layout y documentación pasan con código de salida 0.

3. **Verificación de Compilación y Tipado TypeScript:**
   ```powershell
   npm run build
   ```
   *Criterio de éxito:* `tsc && vite build` finaliza sin errores de tipo ni de importación sintáctica.

4. **Condiciones de Invalidación:**
   - La propuesta quedaría invalidada si el cambio de pestañas rompiera las pruebas en `tests/tier1-feature-coverage/reservation-engine.test.tsx` (que buscan `reservas & deportes`).
   - La propuesta quedaría invalidada si la explosión de recetas no contemplara las 4 categorías requeridas por el usuario (`Insumos y Descartables`, `Menaje y Cubiertos`, `Bebidas`, `Alimentos de Cocina`).
