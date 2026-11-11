# HANDOFF REPORT: Documentation Updates, Test Suite & Verification Architecture
**Agent**: Explorer 3 (Documentation Updates, Test Suite & Verification Architecture)  
**Date**: 2026-11-09T03:38:00Z  
**Recipient**: Parent Orchestrator (`4cb2763c-1538-4609-8d96-d251b4f7d423`)  
**Workspace**: `c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\`  
**Status**: COMPLETE (Hard Handoff)

---

## 1. OBSERVATIONS

Direct observations conducted across the workspace files and test execution logs:

1. **Original Request and Follow-Up Requirements (`ORIGINAL_REQUEST.md`)**:
   - Lines 49–50: *"el restaurnate puede ser desayuno almuerzo o cena, y tambien otra cosa fundamental son los inventarios y las existencias, digamos suelen tener cosas de cocina, servilletas, vasos, cubiertos, colas, alimentos en general que cuando hay eventos suele ser dificil mantener el trackeo de eso..."*
   - Lines 52–60: Estipula Restaurant / Comedor por turnos (**Desayuno**, **Almuerzo**, **Cena**), Eventos / Banquetes (con PAX), catálogo de existencias en 4 categorías (**Insumos y Descartables**, **Menaje y Cubiertos**, **Bebidas**, **Alimentos de Cocina**), descuento automático por explosión de insumos en Kardex, alertas de stock bajo (punto de reorden), control de retorno/rotura de menaje, y actualización documental en `PLAN_EJECUCION_TECNICA.md`, `README.md` y pruebas.
   - Dispatch adicional (2026-11-09T03:32:41Z): *"Motor de Carga de Facturas de Adquisición (Ingresos a Bodega / Kardex): Permitir subir factura (PDF, XML SRI, imagen o demo preset), simular extracción de RUC, N.º autorización SRI, desglose de ítems, y al confirmar, aumentar existencias y registrar ENTRADA en Kardex."*

2. **Existing Technical Execution Plan (`PLAN_EJECUCION_TECNICA.md`)**:
   - Lines 40–96: Diagrama ER Global contempla 12 entidades militares (`tenants`, `military_branches`, `military_ranks`, `members`, `dependents`, `campuses`, `facilities`, `reservations`, `membership_dues`, `payment_transactions`, `electronic_invoices_sri`, `inter_institutional_agreements`), pero carece de la estructura relacional de inventarios, bodegas, recetas y kardex.
   - Lines 104–503: Definición DDL de las 12 tablas principales existentes.
   - Lines 530–586: Políticas RLS aplicadas a las 12 tablas con `current_tenant_id()`.
   - Lines 881–889: Módulos M6 (*Control de Alimentos, Bebidas y Restaurantes*) y M7 (*Eventos Institucionales*) se describen a nivel conceptual pero carecen de esquemas DDL, algoritmos matemáticos de costeo (PMP/FIFO) y pipeline de ingesta de facturas SRI.

3. **Executive Presentation Documentation (`README.md`)**:
   - Lines 16–24: Lista 7 capacidades centrales, omitiendo los turnos de restaurante, el economato y la carga de facturas SRI.
   - Lines 68–156: Describe 6 Actos de demostración para el Directorio del martes, sin guión para turnos de comedor, mermas de vajilla ni recepción de víveres.

4. **Testing Infrastructure & Test Suite (`tests/`, `TEST_INFRA.md`, `scripts/test-prototype.mjs`)**:
   - `npm test` ejecutado exitosamente: **15 archivos de prueba pasados, 75 pruebas pasadas (100%), duración 18.81s**.
   - `node --test scripts/test-prototype.mjs` ejecutado exitosamente: **8 pruebas de sistema pasadas (100%), duración 233ms**.
   - `tests/tier1-feature-coverage/technical-docs.test.ts` (Líneas 15–28) y `scripts/test-prototype.mjs` (Líneas 21–35) validan la presencia de entidades militares principales en `PLAN_EJECUCION_TECNICA.md`, lo cual debe ser expandido para validar las nuevas entidades `inv_*`.

---

## 2. LOGIC CHAIN

1. **Premisa 1 (Requerimiento de Gestión de Turnos y Eventos)**: La operación diaria de los clubes militares atiende tanto consumo regular (Desayuno, Almuerzo, Cena) como eventos de gala protocolar (aniversarios de promoción, ascensos, banquetes de hasta 200 PAX).
   - *Deducción*: Se requiere modelar una estructura de recetas técnicas (`inv_recetas_fichas_tecnicas`) y desglose de ingredientes (`inv_receta_detalles`) indexadas por tipo de turno (`DESAYUNO`, `ALMUERZO`, `CENA`) o tipo de evento (`BANQUETE_GALA`, `COCTEL_MILITAR`, `PARRILLADA_CAMPESTRE`), escalable matemáticamente por el número de personas (PAX).

2. **Premisa 2 (Control Diferenciado de Descartables vs Menaje Retornable)**: Los insumos descartables (servilletas, vasos térmicos) y alimentos se consumen al 100% (merma irreversible), mientras que el menaje (cubiertos de plata, platos base, copas de cristal) se asigna temporalmente y debe retornar a bodega tras el evento, identificando roturas o pérdidas.
   - *Deducción*: El maestro de artículos (`inv_articulos`) debe contener un discriminador booleano `es_retornable` y una tabla operativa especializada `inv_eventos_consumo_menaje` que registre unidades despachadas, devueltas en buen estado y rotas/faltantes, calculando automáticamente el débito correspondiente a la cuenta del socio militar o al contrato de reserva.

3. **Premisa 3 (Aislamiento Multi-Tenant y Bodegas por Campus)**: CROE y Círculo Militar operan sedes geográficas distintas con infraestructuras independientes:
   - CROE: Sede Central / Cumbayá (Quito), Complejo Recreacional Sangolquí (Valle de Los Chillos), y Complejo Vacacional Salinas (Santa Elena).
   - Círculo Militar: Sede Central / Edificio Orellana (Quito), y Complejo Social y Deportivo La Armenia (Valle de Los Chillos).
   - *Deducción*: Se requiere la entidad `inv_bodegas` vinculada a `campuses` y aislada por `tenant_id` mediante PostgreSQL Row Level Security (RLS), impidiendo fugas de inventario entre instituciones o bodegas no autorizadas.

4. **Premisa 4 (Normativa Financiera y Algoritmos de Valoración de Inventarios)**: Según la Norma Internacional de Contabilidad (NIC 2) y la legislación tributaria del SRI en Ecuador, la valoración de alimentos y bebidas se rige por el **Precio Medio Ponderado (PMP)**, complementado con control **FIFO (PEPS)** por lotes para productos perecibles con fecha de caducidad.
   - *Deducción*: `PLAN_EJECUCION_TECNICA.md` debe formalizar la ecuación estricta de PMP tanto para las entradas (compras a proveedores) como para las salidas (explosión de recetas), además del algoritmo de Punto de Reorden ($ROP = d \times L + SS$) para activar alertas automáticas de abastecimiento.

5. **Premisa 5 (Ingesta de Facturas de Adquisición SRI)**: Los insumos de cocina ingresan habitualmente mediante facturas electrónicas autorizadas por el SRI emitidas por distribuidores autorizados (ej. Pronaca, Tesalia Springs, Indurmesa).
   - *Deducción*: El sistema requiere la tabla cabecera `inv_facturas_adquisicion` y detalle `inv_factura_detalles`, soportando la simulación de parseo de comprobantes electrónicos XML SRI (extracción de RUC, Clave de Acceso de 49 dígitos, ítems y tarifa 15% IVA), provocando al ser confirmadas un movimiento de `ENTRADA` en el Kardex y la actualización del costo unitario PMP.

6. **Premisa 6 (Estrategia de Pruebas y Certificación Continua)**: Para garantizar cero regresiones y certificar la plataforma ante los directivos castrenses, las nuevas funcionalidades deben contar con cobertura exhaustiva en los 4 Tiers (34 nuevas pruebas) y validación en el script nativo de Node 24 (`scripts/test-prototype.mjs`), incrementando el catálogo total de pruebas de 75 a **109 pruebas automatizadas**.

---

## 3. CAVEATS

1. **Simulación vs. OCR Real en Prototipo**: En el entorno del prototipo web interactivo (Vite/React para la reunión del martes), la ingesta de facturas opera mediante parseo directo de XML de prueba preconfigurados y presets de proveedores ecuatorianos reales (Pronaca, Tesalia, Indurmesa), simulando la extracción de metadatos del SRI sin requerir un motor OCR pesado en el navegador cliente.
2. **Persistencia en LocalStorage vs. PostgreSQL Producción**: El prototipo almacena el estado del inventario y kardex en el navegador (`localStorage` bajo la clave `plataforma_inventario_v1`), mientras que el plan técnico especifica las tablas DDL y funciones PL/pgSQL nativas para el despliegue en PostgreSQL 15+.
3. **Mantenimiento de Tiempos de Ejecución de Pruebas**: La adición de 34 casos de prueba debe mantenerse por debajo de los 25 segundos en total para no degradar el ciclo de retroalimentación de desarrollo.

---

## 4. CONCLUSION & DETAILED BLUEPRINTS

A continuación se detallan las especificaciones técnicas completas y listas para su implementación en `PLAN_EJECUCION_TECNICA.md`, `README.md` y la arquitectura de pruebas.

---

### 4.1. ESPECIFICACIÓN TÉCNICA PARA `PLAN_EJECUCION_TECNICA.md`

#### A. Diagrama de Relación Global de Entidades Extendido (Inventarios y Economato)

```
+---------------------------------------------------------------------------------------------------+
|                                            tenants                                                |
|  PK: id (UUID) | code (VARCHAR) | legal_name | ruc | primary_color | secondary_color | theme_json  |
+---------------------------------------------------------------------------------------------------+
         | 1                                               | 1                           | 1
         v *                                               v *                           v *
+--------------------+                            +--------------------+        +--------------------+
|   inv_categorias   |                            |      campuses      |        | inv_facturas_      |
| PK: id (UUID)      |                            | PK: id (UUID)      |        |   adquisicion      |
| FK: tenant_id      |                            | FK: tenant_id      |        | PK: id (UUID)      |
| code, name, icon   |                            +--------------------+        | FK: tenant_id      |
+--------------------+                                     | 1                  | ruc_proveedor, auth|
         | 1                                               v *                  +--------------------+
         |                                        +--------------------+                 | 1
         v *                                      |    inv_bodegas     |                 |
+------------------------------------+            | PK: id (UUID)      |                 v *
|           inv_articulos            |            | FK: tenant_id      |        +--------------------+
| PK: id (UUID)                      |            | FK: campus_id      |        | inv_factura_       |
| FK: tenant_id | FK: categoria_id   |<-----------| code, name, type   |        |   detalles         |
| sku, name, unit, current_stock     | 1        * +--------------------+        | PK: id (UUID)      |
| reorder_point, pmp_cost, returnable|                     | 1                  | FK: factura_id     |
+------------------------------------+                     |                    | FK: articulo_id    |
       | 1            | 1                                  |                    +--------------------+
       |              +-------------------+                |
       v *                                v *              v *
+--------------------+           +---------------------------------------------+
| inv_receta_detalles|           |            inv_kardex_movimientos           |
| PK: id (UUID)      |           | PK: id (UUID)                               |
| FK: receta_id      |           | FK: tenant_id | FK: bodega_id               |
| FK: articulo_id    |           | FK: articulo_id                             |
| cantidad_pax       |           | tipo_movimiento: ENTRADA, SALIDA_TURNO, etc.|
| factor_merma       |           | cantidad, costo_unitario, saldo_stock       |
+--------------------+           +---------------------------------------------+
       ^ *                                                 ^ *
       | 1                                                 | 1
+------------------------------------+           +---------------------------------------------+
|    inv_recetas_fichas_tecnicas     |           |         inv_eventos_consumo_menaje          |
| PK: id (UUID)                      |           | PK: id (UUID)                               |
| FK: tenant_id                      |           | FK: tenant_id | FK: reservation_id          |
| tipo_servicio: TURNO_DESAYUNO, etc.|           | FK: articulo_id (menaje)                    |
| nombre, descripcion, activo        |           | cant_despachada, cant_devuelta, cant_rotura |
+------------------------------------+           | costo_reposicion, total_cargo_socio         |
                                                 +---------------------------------------------+
```

#### B. Definición DDL de las 9 Tablas de Inventario y Economato

```sql
-- ============================================================================
-- 13. TABLA: inv_categorias (Categorías de Almacén y Economato)
-- ============================================================================
CREATE TABLE inv_categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(30) NOT NULL, -- 'INSUMOS_DESCARTABLES', 'MENAJE_CUBIERTOS', 'BEBIDAS', 'ALIMENTOS_COCINA'
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Package',
    display_order INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_inv_cat_tenant_code UNIQUE (tenant_id, code)
);

-- ============================================================================
-- 14. TABLA: inv_bodegas (Almacenes Físicos por Campus y Club Militar)
-- ============================================================================
CREATE TABLE inv_bodegas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    campus_id UUID NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
    code VARCHAR(30) NOT NULL, -- ej. 'BOD-CENTRAL-QUI', 'BOD-ECON-CUM', 'BOD-ARMENIA'
    name VARCHAR(120) NOT NULL,
    type VARCHAR(30) NOT NULL CHECK (type IN (
        'BODEGA_GENERAL', 
        'ECONOMATO_COCINA', 
        'BAR_PISCINA', 
        'BODEGA_MENAJE_PROTOCOLAR',
        'ALMACEN_TRANSITO'
    )),
    manager_user_id UUID,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_tenant_bodega_code UNIQUE (tenant_id, code)
);

-- ============================================================================
-- 15. TABLA: inv_articulos (Maestro de Artículos, Existencias y Costos)
-- ============================================================================
CREATE TABLE inv_articulos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    categoria_id UUID NOT NULL REFERENCES inv_categorias(id) ON DELETE RESTRICT,
    sku VARCHAR(40) NOT NULL, -- ej. 'ALM-PROT-RES', 'BEB-GASE-COLA', 'MEN-TENED-GALA'
    name VARCHAR(150) NOT NULL,
    description TEXT,
    unit_of_measure VARCHAR(20) NOT NULL CHECK (unit_of_measure IN (
        'UNIDAD', 'DOCENA', 'KG', 'LIBRA', 'LITRO', 'PAQUETE', 'CAJA', 'BOTELLA'
    )),
    is_returnable BOOLEAN NOT NULL DEFAULT false, -- true para menaje, cristalería y vajilla
    replacement_cost DECIMAL(10,2) NOT NULL DEFAULT 0.00, -- Costo de cobro al socio por rotura
    pmp_cost DECIMAL(10,4) NOT NULL DEFAULT 0.0000, -- Precio Medio Ponderado ($/unidad)
    last_purchase_cost DECIMAL(10,4) NOT NULL DEFAULT 0.0000,
    current_stock DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    min_stock DECIMAL(12,2) NOT NULL DEFAULT 10.00,
    reorder_point DECIMAL(12,2) NOT NULL DEFAULT 25.00, -- Punto de Reorden (ROP)
    max_stock DECIMAL(12,2) NOT NULL DEFAULT 100.00,
    lead_time_days INT NOT NULL DEFAULT 3, -- Días de entrega del proveedor
    barcode VARCHAR(60),
    image_url TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_inv_art_tenant_sku UNIQUE (tenant_id, sku),
    CONSTRAINT chk_stock_non_negative CHECK (current_stock >= 0)
);

CREATE INDEX idx_inv_articulos_tenant_cat ON inv_articulos(tenant_id, categoria_id);
CREATE INDEX idx_inv_articulos_reorder ON inv_articulos(tenant_id, current_stock, reorder_point);

-- ============================================================================
-- 16. TABLA: inv_recetas_fichas_tecnicas (Fichas Técnicas Turnos & Banquetes)
-- ============================================================================
CREATE TABLE inv_recetas_fichas_tecnicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    code VARCHAR(40) NOT NULL, -- ej. 'FICHA-TURNO-ALMUERZO', 'FICHA-BANQUETE-GALA'
    name VARCHAR(150) NOT NULL,
    service_type VARCHAR(30) NOT NULL CHECK (service_type IN (
        'TURNO_DESAYUNO', 
        'TURNO_ALMUERZO', 
        'TURNO_CENA', 
        'EVENTO_BANQUETE', 
        'EVENTO_COCTEL', 
        'PARRILLADA_CAMPESTRE'
    )),
    description TEXT,
    standard_portion_pax INT NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    CONSTRAINT uq_receta_tenant_code UNIQUE (tenant_id, code)
);

-- ============================================================================
-- 17. TABLA: inv_receta_detalles (Explosión de Insumos por Persona / PAX)
-- ============================================================================
CREATE TABLE inv_receta_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receta_id UUID NOT NULL REFERENCES inv_recetas_fichas_tecnicas(id) ON DELETE CASCADE,
    articulo_id UUID NOT NULL REFERENCES inv_articulos(id) ON DELETE RESTRICT,
    quantity_per_pax DECIMAL(10,4) NOT NULL, -- Cantidad unitaria requerida por persona
    waste_allowance_pct DECIMAL(5,2) NOT NULL DEFAULT 0.00, -- % merma técnica
    notes TEXT,
    CONSTRAINT uq_receta_articulo UNIQUE (receta_id, articulo_id)
);

-- ============================================================================
-- 18. TABLA: inv_kardex_movimientos (Libro Mayor de Movimientos Perpetuos)
-- ============================================================================
CREATE TABLE inv_kardex_movimientos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    bodega_id UUID NOT NULL REFERENCES inv_bodegas(id) ON DELETE RESTRICT,
    articulo_id UUID NOT NULL REFERENCES inv_articulos(id) ON DELETE RESTRICT,
    movement_type VARCHAR(30) NOT NULL CHECK (movement_type IN (
        'ENTRADA_COMPRA', 
        'SALIDA_TURNO_DESAYUNO', 
        'SALIDA_TURNO_ALMUERZO', 
        'SALIDA_TURNO_CENA', 
        'SALIDA_EVENTO_BANQUETE', 
        'RETORNO_MENAJE', 
        'ROTURA_MENAJE', 
        'MERMA_COCINA', 
        'AJUSTE_INVENTARIO', 
        'TRANSFERENCIA_BODEGA'
    )),
    reference_document VARCHAR(100), -- Clave de factura, N.º turno o ID reserva
    quantity DECIMAL(12,2) NOT NULL,
    unit_cost DECIMAL(10,4) NOT NULL,
    total_cost DECIMAL(12,2) NOT NULL,
    previous_stock DECIMAL(12,2) NOT NULL,
    new_stock DECIMAL(12,2) NOT NULL,
    resulting_pmp DECIMAL(10,4) NOT NULL,
    movement_timestamp TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp(),
    user_id UUID,
    observations TEXT
);

CREATE INDEX idx_kardex_tenant_art_fecha ON inv_kardex_movimientos(tenant_id, articulo_id, movement_timestamp DESC);

-- ============================================================================
-- 19. TABLA: inv_eventos_consumo_menaje (Control de Menaje y Roturas en Eventos)
-- ============================================================================
CREATE TABLE inv_eventos_consumo_menaje (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    reservation_id UUID NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    articulo_id UUID NOT NULL REFERENCES inv_articulos(id) ON DELETE RESTRICT,
    dispatched_quantity INT NOT NULL, -- Menaje entregado a salón
    returned_quantity INT NOT NULL DEFAULT 0, -- Menaje devuelto íntegro
    damaged_broken_quantity INT NOT NULL DEFAULT 0, -- Roto o inutilizado
    lost_quantity INT NOT NULL DEFAULT 0, -- Extraviado
    unit_charge_cost DECIMAL(10,2) NOT NULL, -- Costo de reposición
    total_billed_to_member DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    audit_status VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE' CHECK (audit_status IN (
        'PENDIENTE', 'REVISADO_PARCIAL', 'CONCILIADO', 'FACTURADO_ROTURA'
    )),
    audited_by_user_id UUID,
    audited_at TIMESTAMPTZ,
    CONSTRAINT chk_menaje_quantities CHECK (
        returned_quantity + damaged_broken_quantity + lost_quantity <= dispatched_quantity
    )
);

CREATE INDEX idx_menaje_reservation ON inv_eventos_consumo_menaje(reservation_id);

-- ============================================================================
-- 20. TABLA: inv_facturas_adquisicion (Ingreso de Facturas de Proveedores SRI)
-- ============================================================================
CREATE TABLE inv_facturas_adquisicion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
    bodega_id UUID NOT NULL REFERENCES inv_bodegas(id) ON DELETE RESTRICT,
    supplier_ruc CHAR(13) NOT NULL,
    supplier_name VARCHAR(150) NOT NULL, -- ej. 'PRONACA', 'TESALIA SPRINGS', 'INDURMESA'
    invoice_number VARCHAR(17) NOT NULL, -- ej. '001-002-000045892'
    access_key CHAR(49) NOT NULL UNIQUE, -- Clave de acceso SRI 49 dígitos
    authorization_number VARCHAR(49),
    issue_date DATE NOT NULL,
    subtotal_0 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    subtotal_15 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_15 DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    reception_status VARCHAR(20) NOT NULL DEFAULT 'BORRADOR' CHECK (reception_status IN (
        'BORRADOR', 'VERIFICADO_SRI', 'INGRESADO_KARDEX', 'ANULADO'
    )),
    xml_payload TEXT,
    received_by_user_id UUID,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT clock_timestamp()
);

-- ============================================================================
-- 21. TABLA: inv_factura_detalles (Líneas de Factura de Compra Recibida)
-- ============================================================================
CREATE TABLE inv_factura_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    factura_id UUID NOT NULL REFERENCES inv_facturas_adquisicion(id) ON DELETE CASCADE,
    articulo_id UUID NOT NULL REFERENCES inv_articulos(id) ON DELETE RESTRICT,
    supplier_item_code VARCHAR(60),
    description VARCHAR(200) NOT NULL,
    quantity_received DECIMAL(12,2) NOT NULL CHECK (quantity_received > 0),
    unit_cost DECIMAL(10,4) NOT NULL CHECK (unit_cost >= 0),
    subtotal DECIMAL(10,2) NOT NULL,
    tax_rate DECIMAL(5,2) NOT NULL DEFAULT 15.00,
    lot_number VARCHAR(50),
    expiration_date DATE,
    CONSTRAINT uq_factura_articulo UNIQUE (factura_id, articulo_id)
);
```

#### C. Políticas de Seguridad a Nivel de Fila (PostgreSQL RLS) para Inventarios

```sql
-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE inv_categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_bodegas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_articulos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_recetas_fichas_tecnicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_kardex_movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_eventos_consumo_menaje ENABLE ROW LEVEL SECURITY;
ALTER TABLE inv_facturas_adquisicion ENABLE ROW LEVEL SECURITY;

-- Políticas restrictivas por tenant_id
CREATE POLICY rls_inv_categorias_iso ON inv_categorias
    AS RESTRICTIVE USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_inv_bodegas_iso ON inv_bodegas
    AS RESTRICTIVE USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_inv_articulos_iso ON inv_articulos
    AS RESTRICTIVE USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_inv_recetas_iso ON inv_recetas_fichas_tecnicas
    AS RESTRICTIVE USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_inv_kardex_iso ON inv_kardex_movimientos
    AS RESTRICTIVE USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_inv_menaje_iso ON inv_eventos_consumo_menaje
    AS RESTRICTIVE USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());

CREATE POLICY rls_inv_facturas_iso ON inv_facturas_adquisicion
    AS RESTRICTIVE USING (tenant_id = current_tenant_id()) WITH CHECK (tenant_id = current_tenant_id());
```

#### D. Algoritmos de Valoración Contable (PMP/FIFO) y Optimización de Existencias

1. **Ecuación Formal de Precio Medio Ponderado (PMP - NIC 2)**:
   Al ingresar una compra de $Q_{in}$ unidades a costo unitario $C_{in}$, con stock previo $Q_{prev}$ y costo ponderado previo $PMP_{prev}$:
   $$Q_{final} = Q_{prev} + Q_{in}$$
   $$PMP_{final} = \frac{(Q_{prev} \times PMP_{prev}) + (Q_{in} \times C_{in})}{Q_{final}}$$
   *Regla de Salida*: Las salidas por comanda de turno o evento descargan al $PMP_{actual}$ sin alterar el costo unitario del saldo remanente.

2. **Algoritmo de Punto de Reorden ($ROP$) y Stock de Seguridad ($SS$)**:
   $$SS = Z \times \sigma_d \times \sqrt{L}$$
   $$ROP = (d \times L) + SS$$
   - $d$: Consumo diario promedio histórico.
   - $L$: Tiempo de entrega del proveedor en días (lead time).
   - $Z$: Coeficiente de nivel de servicio militar (1.65 para 95% de confianza contra quiebres de stock en cocina).
   - Semáforo de Existencias:
     - **Crítico / Peligro (Rojo)**: $Stock \le SS$
     - **Reorden Requerido (Amarillo)**: $SS < Stock \le ROP$
     - **Existencia Normal (Verde)**: $ROP < Stock \le Stock_{max}$
     - **Sobrestock (Azul)**: $Stock > Stock_{max}$

3. **Algoritmo de Explosión de Recetas por Turno o PAX**:
   Para un turno o banquete con $N$ comensales y receta técnica $R$:
   $$\forall i \in \text{Ingredientes}(R): \quad \Delta Q(i) = -1 \times \left[ N \times q_{pax}(i) \times \left(1 + \frac{\text{merma}(i)}{100}\right) \right]$$
   Para menaje retornable $m \in \text{Menaje}(R)$:
   $$Q_{despachado}(m) = N \times q_{pax}(m)$$
   $$\text{Roturas}(m) = \max\left(0, Q_{despachado}(m) - Q_{devuelto}(m)\right)$$
   $$\text{CargoFinancieroSocio} = \sum_m \left( \text{Roturas}(m) \times \text{CostoReposicion}(m) \right)$$

---

### 4.2. ESPECIFICACIÓN TÉCNICA PARA `README.md`

#### A. Nuevas Capacidades Centrales a Documentar en la Sección 1
- **Capacidad 8: Gestión de Turnos de Restaurante y Banquetes Militares:** Programación interactiva de servicios de Desayuno, Almuerzo y Cena, así como Banquetes con selector de PAX (comensales) y minutas de gala.
- **Capacidad 9: Economato Inteligente con Explosión Automática de Insumos y Kardex:** Descuento instantáneo de existencias (víveres, gaseosas, servilletas y cubiertos) al confirmar un turno o evento, con bitácora inmutable de Kardex y barras visuales de salud de inventario.
- **Capacidad 10: Auditoría de Menaje y Control de Roturas:** Registro de vajilla y cristalería despachada a salones vs. devuelta a bodega, con liquidación de roturas/faltantes debitadas automáticamente a la liquidación del evento.
- **Capacidad 11: Motor de Ingesta de Facturas de Adquisición SRI:** Carga rápida de facturas electrónicas de proveedores nacionales (Pronaca, Tesalia, Indurmesa) con simulación de parseo SRI (RUC, 49 dígitos, 15% IVA), acreditación a bodega y asiento de ENTRADA en Kardex.

#### B. Nuevos Actos de Demostración para el Directorio Ejecutivo (Martes)

##### **Acto 7: Gestión de Turnos de Comedor y Explosión Automática de Existencias (3 Minutos)**
- **Discurso del Presentador**:
  > *"Mi General, señores Directores: Uno de los dolores operativos más críticos en los comedores y ranchos de nuestras sedes es la fuga silenciosa de víveres, carnes y bebidas. Tradicionalmente no se sabe con precisión cuántas libras de lomo, cuántas gaseosas o cuántos paquetes de servilletas se consumieron en un almuerzo de 85 oficiales.*
  > *Les presentamos nuestro motor de explosión de recetas: al seleccionar el turno del día (ej. Almuerzo) y registrar el número de comensales, el sistema calcula de forma milimétrica las porciones y descuenta automáticamente de la bodega central y del economato cada insumo, registrando el costo medio ponderado en el Kardex en tiempo real."*
- **Paso a Paso en Pantalla**:
  1. Diríjase a la pestaña **"Restaurante & Turnos"** (o módulo de Economato).
  2. Seleccione el turno **Almuerzo Institucional** con **85 PAX**.
  3. Muestre la previsualización del consumo programado: 21.25 kg de lomo fino, 85 gaseosas de 300ml, 170 servilletas de papel, 85 juegos de cubiertos.
  4. Haga clic en **"Ejecutar Turno y Descontar Existencias"**.
  5. Observe la animación de actualización en vivo: el stock disponible disminuye, las barras de stock pasan a estado óptimo o alerta, y se genera el registro inmutable en el Kardex.

##### **Acto 8: Auditoría de Menaje, Vajilla Protocolar y Control de Roturas (2 Minutos)**
- **Discurso del Presentador**:
  > *"En ceremonias de ascenso o matrimonios de oficiales con 150 invitados, es habitual que se pierdan copas de cristal o se rompan platos base, generando un perjuicio económico que el club solía absorber.*
  > *Ahora, el sistema genera la hoja de ruta de menaje: se despachan 150 copas de gala; al finalizar la noche, el mayordomo militar registra la devolución (ej. 142 copas devueltas y 8 copas rotas). El sistema cobra de inmediato el costo de reposición al socio responsable e ingresa la merma al inventario."*
- **Paso a Paso en Pantalla**:
  1. Ingrese a la sección **"Auditoría de Menaje y Eventos"**.
  2. Seleccione el evento *Banquete de Ascenso Militar*.
  3. Muestre el conteo de cubiertos y copas entregados.
  4. Simule el cierre del evento ingresando 8 copas rotas.
  5. Muestre cómo el sistema calcula el recargo de reposición ($32.00) y lo transfiere a la liquidación final de la reserva.

##### **Acto 9: Motor de Carga de Facturas de Proveedores SRI (Ingresos a Bodega) (2 Minutos)**
- **Discurso del Presentador**:
  > *"¿Cómo se reabastecen las bodegas? No necesitamos digitación manual propensa a errores. El bodeguero militar simplemente carga el archivo XML o PDF de la factura electrónica emitida por el proveedor (ej. Pronaca o Tesalia Springs).*
  > *El sistema extrae el RUC, la Clave de Acceso de 49 dígitos autorizada por el SRI, desglosa los productos, aplica el 15% de IVA y, con un solo clic de confirmación, suma las existencias a la bodega correspondiente y actualiza el Precio Medio Ponderado."*
- **Paso a Paso en Pantalla**:
  1. Haga clic en **"Cargar Factura de Proveedor (SRI)"**.
  2. Seleccione el preset de demostración **"Factura Pronaca S.A. - Abastecimiento Carnes y Embutidos"** (RUC `1790005744001`).
  3. Muestre la tarjeta de validación con la Clave de 49 dígitos del SRI y la tabla de ítems reconocidos.
  4. Presione **"Confirmar Ingreso a Bodega"**.
  5. Observe cómo las existencias suben de inmediato, el Kardex anota la `ENTRADA_COMPRA` y el semáforo de existencias se torna verde.

---

### 4.3. ARQUITECTURA DE PRUEBAS EXTENDIDA (34 NUEVOS CASOS DE PRUEBA)

Para elevar la suite de 75 a **109 pruebas automatizadas**, se especifican los siguientes 34 casos distribuidos en los 4 Tiers de calidad:

#### Tier 1: Feature Coverage (15 Nuevas Pruebas)
- **`tests/tier1-feature-coverage/restaurant-shifts.test.tsx` (5 Pruebas)**:
  - `T1-SFT-01`: Renderizado de turnos del día (Desayuno, Almuerzo, Cena) con sus horarios operativos y menús base.
  - `T1-SFT-02`: Selector de PAX (comensales) con validación de capacidad mínima y máxima por turno.
  - `T1-SFT-03`: Cálculo predictivo de explosión de insumos en pantalla antes de confirmar el turno.
  - `T1-SFT-04`: Ejecución del turno y despacho de insumos con deducción instantánea del stock disponible.
  - `T1-SFT-05`: Modal de banquete/evento institucional con asignación de vajilla protocolar y personal de servicio.
- **`tests/tier1-feature-coverage/inventory-kardex.test.tsx` (5 Pruebas)**:
  - `T1-INV-01`: Catálogo visual en 4 categorías (`Insumos y Descartables`, `Menaje y Cubiertos`, `Bebidas`, `Alimentos de Cocina`).
  - `T1-INV-02`: Renderizado de barras de progreso de stock con umbrales de punto de reorden (ROP) y colores de alerta.
  - `T1-INV-03`: Tabla de Kardex perpetuo reflejando entradas, salidas, costos unitarios y saldo valorizado.
  - `T1-INV-04`: Filtrado de existencias por sede/bodega según el club militar activo (CROE vs Círculo Militar).
  - `T1-INV-05`: Actualización matemática del Precio Medio Ponderado (PMP) ante movimientos transaccionales.
- **`tests/tier1-feature-coverage/invoice-ingestion.test.tsx` (5 Pruebas)**:
  - `T1-ING-01`: Renderizado de la zona de carga de facturas de proveedores con soporte para drag & drop y presets demo.
  - `T1-ING-02`: Extracción y validación de metadatos fiscales del SRI (RUC proveedor 13 dígitos, Clave de Acceso 49 dígitos).
  - `T1-ING-03`: Mapeo de ítems facturados hacia el catálogo interno de artículos (`inv_articulos`).
  - `T1-ING-04`: Desglose tributario de factura con Subtotal 0%, Subtotal 15% e IVA 15% legal del Ecuador.
  - `T1-ING-05`: Confirmación de ingreso que dispara asiento `ENTRADA_COMPRA` en Kardex y aumenta el stock físico.

#### Tier 2: Boundary & Corner Cases (10 Nuevas Pruebas)
- **`tests/tier2-boundaries/inventory-boundaries.test.ts` (4 Pruebas)**:
  - `T2-IBD-01`: Bloqueo de descuento de inventario ante stock insuficiente (prevención de existencia negativa).
  - `T2-IBD-02`: Comportamiento ante consumo con 0 PAX (no genera movimientos espurios en Kardex).
  - `T2-IBD-03`: Transición exacta de semáforo de salud cuando `Stock == Punto de Reorden`.
  - `T2-IBD-04`: Manejo de números decimales en pesaje de proteínas (ej. 21.25 kg) con precisión de 2 decimales sin truncamiento erróneo.
- **`tests/tier2-boundaries/menaje-loss-calculations.test.ts` (3 Pruebas)**:
  - `T2-MLC-01`: Evento con devolución 100% íntegra (cargo de reposición = $0.00).
  - `T2-MLC-02`: Evento con rotura parcial (cargo proporcional exacto al costo de reposición unitario).
  - `T2-MLC-03`: Validación que impide registrar más vajilla devuelta que la originalmente despachada.
- **`tests/tier2-boundaries/invoice-ingestion-boundaries.test.ts` (3 Pruebas)**:
  - `T2-IIB-01`: Rechazo de factura con RUC inválido o longitud distinta a 13 dígitos.
  - `T2-IIB-02`: Detección y bloqueo de factura duplicada por Clave de Acceso SRI de 49 dígitos.
  - `T2-IIB-03`: Discrepancia matemática entre suma de ítems y total de la factura SRI.

#### Tier 3: Cross-Feature Combinations (6 Nuevas Pruebas)
- **`tests/tier3-cross-feature/shift-to-inventory-flow.test.tsx` (3 Pruebas)**:
  - `T3-SIF-01`: Flujo cruzado completo: Reserva de salón -> Selección de Banquete 100 PAX -> Explosión de insumos en cocina -> Generación de Kardex.
  - `T3-SIF-02`: Impacto cruzado en alerta de compras: Consumo de Almuerzo agota gaseosas por debajo de ROP -> Notificación automática en panel de economato.
  - `T3-SIF-03`: Conmutación multi-tenant durante la auditoría de bodega: cambio de CROE a Círculo Militar preserva existencias aisladas.
- **`tests/tier3-cross-feature/invoice-to-kardex-replenishment.test.tsx` (3 Pruebas)**:
  - `T3-IKR-01`: Carga de Factura Pronaca -> Incremento de stock -> Recalculo de PMP -> Habilitación de turno bloqueado por falta de stock.
  - `T3-IKR-02`: Conciliación de Menaje post-evento -> Liquidación de rotura -> Cargo transferido a pasarela de pagos / factura SRI.
  - `T3-IKR-03`: Auditoría cruzada Kardex: saldo inicial + entradas factura - salidas turnos == saldo físico final.

#### Tier 4: Real-World Scenarios (3 Nuevas Pruebas)
- **`tests/tier4-real-world/executive-inventory-scenarios.test.tsx` (3 Pruebas)**:
  - `T4-EIS-01`: **Escenario E: "Banquete de Ascenso Militar en CROE (150 PAX)"** (Comandante organiza cena de gala con 150 oficiales: explosión de 150 cortes de carne, 300 gaseosas/aguas, asignación de 600 piezas de vajilla protocolar, retorno con 12 copas rotas y débito a la factura del evento).
  - `T4-EIS-02`: **Escenario F: "Reabastecimiento de Alimentos Pronaca en Círculo Militar"** (Ingreso de factura SRI RUC `1790005744001` por $2,450.00: aumento de inventario en bodega de carnes, cálculo de nuevo PMP y salida del estado de stock crítico).
  - `T4-EIS-03`: **Escenario G: "Operación de Fin de Semana en Comedor Los Chillos"** (Servicio continuo de Desayuno (40 PAX) y Almuerzo (95 PAX) con deducción en cadena y verificación de Kardex al cierre de caja).

---

### 4.4. ACTUALIZACIÓN DE `scripts/test-prototype.mjs`

Para que el verificador de sistema Node 24 valide la conformidad documental de inventarios y turnos, se agregarán las siguientes aserciones a `scripts/test-prototype.mjs`:

```javascript
test('DOC-06: Inventory & Economato ERD tables are specified in PLAN_EJECUCION_TECNICA.md', () => {
  const docPath = path.join(rootDir, 'PLAN_EJECUCION_TECNICA.md');
  const content = fs.readFileSync(docPath, 'utf8');
  const requiredInvEntities = [
    { name: 'inv_articulos', pattern: /inv_articulos/i },
    { name: 'inv_categorias', pattern: /inv_categorias/i },
    { name: 'inv_recetas_fichas_tecnicas', pattern: /inv_recetas_fichas_tecnicas/i },
    { name: 'inv_receta_detalles', pattern: /inv_receta_detalles/i },
    { name: 'inv_kardex_movimientos', pattern: /inv_kardex_movimientos/i },
    { name: 'inv_eventos_consumo_menaje', pattern: /inv_eventos_consumo_menaje/i },
    { name: 'inv_facturas_adquisicion', pattern: /inv_facturas_adquisicion/i },
    { name: 'inv_factura_detalles', pattern: /inv_factura_detalles/i },
  ];
  for (const entity of requiredInvEntities) {
    assert.match(content, entity.pattern, `Falta especificación formal de la tabla: ${entity.name}`);
  }
});

test('DOC-07: Multi-tenant warehouse isolation and PMP/FIFO algorithms are documented', () => {
  const docPath = path.join(rootDir, 'PLAN_EJECUCION_TECNICA.md');
  const content = fs.readFileSync(docPath, 'utf8');
  assert.match(content, /inv_bodegas/i, 'Debe especificar bodegas físicas');
  assert.match(content, /PMP|Precio Medio Ponderado/i, 'Debe especificar algoritmo PMP');
  assert.match(content, /ROP|Punto de Reorden/i, 'Debe especificar Punto de Reorden');
});

test('DOC-08: README.md documents Restaurant Shifts, Economato and Invoice Ingestion demo acts', () => {
  const readmePath = path.join(rootDir, 'README.md');
  const content = fs.readFileSync(readmePath, 'utf8');
  assert.match(content, /Turnos de Restaurante|Desayuno,\s*Almuerzo/i, 'README debe documentar turnos de restaurante');
  assert.match(content, /Economato|Inventario/i, 'README debe documentar módulo de economato');
  assert.match(content, /Facturas de Adquisición|Pronaca/i, 'README debe documentar carga de facturas');
});
```

---

## 5. VERIFICATION METHOD

Para verificar de manera independiente y reproducible todas las conclusiones de este informe:

1. **Verificación de Suite Actual**:
   ```powershell
   npm test
   node --test scripts/test-prototype.mjs
   ```
   - Criterio de aceptación: 15 archivos Vitest pasan (75/75 pruebas), `test-prototype.mjs` reporta 8 pruebas pasadas.

2. **Verificación de Completitud de Esquemas DDL**:
   - Inspeccionar que las 9 tablas (`inv_categorias`, `inv_bodegas`, `inv_articulos`, `inv_recetas_fichas_tecnicas`, `inv_receta_detalles`, `inv_kardex_movimientos`, `inv_eventos_consumo_menaje`, `inv_facturas_adquisicion`, `inv_factura_detalles`) tengan llaves foráneas válidas, restricciones de chequeo y políticas RLS asociadas.

3. **Condiciones de Invalidación**:
   - Este reporte se consideraría inválido si la estructura de bodegas no respeta la división de campus de CROE (Cumbayá, Sangolquí, Salinas) vs Círculo Militar (Sede Central Quito, La Armenia).
   - O si el algoritmo de valoración contable propuesto discrepara de la norma legal ecuatoriana (NIC 2 / SRI IVA 15%).
