# Dispatch: Explorer 2 (Inventory, Economato, Stock Explosion & Kardex Engine)
Investigate the technical and architectural design for the complete interactive Inventory/Economato module: catalog by club, categories (Insumos, Menaje/Cubiertos, Bebidas, Alimentos), automated bill of materials / recipe explosion, real-time stock deduction, Kardex audit log, reorder point alerts, and damage/loss tracking.

## 2026-11-09T03:30:49Z
Scope and Objective:
Investigate and design the technical architecture for the interactive Inventory & Economato module requested in ORIGINAL_REQUEST.md follow-up:
1. Catalog of stock / existencias per club/tenant (CROE and Círculo Militar) across the 4 required categories:
   - Insumos y Descartables (servilletas, vasos descartables, empaques, etc.)
   - Menaje y Cubiertos (cubiertos de acero, vajilla, cristalería, con control de retorno vs rotura/merma en eventos)
   - Bebidas (colas/gaseosas, aguas minerales, jugos)
   - Alimentos de Cocina (proteínas: lomo, pollo; guarniciones: arroz, papas, ensaladas; insumos para desayuno/almuerzo/cena)
2. Automated Explosion / Bill of Materials (Recetas / Ficha Técnica) per shift (Desayuno, Almuerzo, Cena) and per Event/Banquete:
   - Formulas per PAX / plate (e.g., 1 almuerzo = 1 porción proteína, 1 guarnición, 1 bebida/cola, 2 servilletas, 1 juego cubiertos, etc.).
   - Multiplied by number of comensales / PAX.
3. Real-time deduction from current stock:
   - Before/after visual stock impact, percentage bars, warning badges for low stock / reorder point (punto de reorden).
   - Event completion / post-event settlement (retorno de menaje, registro de roturas / mermas).
   - Kardex / Bitácora de movimientos (Entrada inicial, Salida por turno desayuno/almuerzo/cena, Salida por evento, Merma/rotura, Reabastecimiento simulado).
4. LocalStorage persistence and React Context architecture (`InventoryContext`).

Boundaries:
- You are read-only. Do NOT write or modify application source code.
- Write your analysis and handoff report to `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\explorer_survey_inv_2\handoff.md`.
- Include concrete type definitions, initial seed datasets, calculation logic, and UI mock layout.
- Send a completion message via send_message to the orchestrator when done.

## 2026-11-09T03:32:35Z
Sender: 4cb2763c-1538-4609-8d96-d251b4f7d423
Priority: MESSAGE_PRIORITY_HIGH
Context: Survey of Inventory, Economato & Kardex Engine
Content: Additional requirement just received from user:
"Motor de Carga de Facturas de Adquisición (Ingresos a Bodega / Kardex)":
1. Permitir subir un archivo de factura de adquisición (soporte para PDF, XML electrónico del SRI, imagen o selección rápida de facturas pre-cargadas de proveedores reales para demostración con un solo clic en la reunión del martes).
2. Simular el procesamiento/lectura automática de la factura del proveedor: RUC del proveedor, N.º de factura SRI (ej. 001-002-000045892), fecha de emisión, desglose de ítems adquiridos (paquetes de servilletas, fundas de vasos descartables, jabas de colas, cortes de carne/proteínas, menaje/vajilla, costo unitario, subtotal e IVA).
3. Al confirmar el ingreso de la factura: AUMENTAR AUTOMÁTICAMENTE las existencias en el inventario, registrar las entradas en el Kardex (ENTRADA - Compra Factura SRI), actualizar las barras de nivel de stock en tiempo real y mitigar/resolver alertas de stock crítico.
Action: Include this acquisition invoice ingestion engine in your architectural handoff and schema design.
