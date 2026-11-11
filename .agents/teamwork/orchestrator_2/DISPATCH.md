## 2026-11-09T03:29:25Z
El usuario revisó el prototipo y solicita agregar esta funcionalidad clave para la reunión del martes:

> "Esta bastante bien, pero por ejemplo el restaurnate puede ser desayuno almuerzo o cena, y tambien otra cosa fundamental son los inventarios y las existencias, digamos suelen tener cosas de cocina, servilletas, vasos, cubiertos, colas, alimentos en general que cuando hay eventos suele ser dificil mantener el trackeo de eso, quisiera ver alguna forma de mantener a raya ese inventario y que se descuente de las existencias segun el evento o dia"

Alcance requerido para integrar en el prototipo interactivo (tanto para CROE como para Círculo Militar) y en `PLAN_EJECUCION_TECNICA.md`:
1. **Restaurante / Comedor por Turnos (Desayuno, Almuerzo, Cena) y Eventos:**
   - Permitir gestionar/reservar el servicio de Restaurante diferenciando por turno del día (**Desayuno**, **Almuerzo**, **Cena**) y por **Eventos / Banquetes** (con cantidad de comensales / PAX).
2. **Módulo Interactivo de Control de Inventarios, Economato y Existencias (Cocina, Bebidas, Menaje y Desechables):**
   - Catálogo de existencias por sede/club con categorías reales: **Insumos y Descartables** (servilletas, vasos, empaques), **Menaje y Cubiertos** (cubiertos, vajilla, cristalería con control de retorno/rotura en eventos), **Bebidas** (colas/gaseosas, aguas, jugos) y **Alimentos de Cocina** (proteínas, guarniciones, insumos para desayuno/almuerzo/cena).
   - **Descuento Automático de Existencias por Evento o Turno del Día (Explosión de Insumos / Kardex):**
     - Al registrar/ejecutar un turno del día (Desayuno, Almuerzo o Cena) o un Evento institucional según el número de asistentes/platos, el sistema calcula y descuenta automáticamente de las existencias los insumos correspondientes (ej. servilletas, vasos, colas, porciones de alimentos y asignación de cubiertos).
     - Mostrar visualmente el impacto antes/después en las barras de stock, alertas de stock crítico/bajo (punto de reorden), control de mermas/pérdidas en eventos y bitácora (Kardex) de movimientos por día/evento.
3. **Actualización de `PLAN_EJECUCION_TECNICA.md`, `README.md` y Pruebas:**
   - Añadir las tablas de inventario/economato, recetas/explosión de insumos y kardex en `PLAN_EJECUCION_TECNICA.md` y asegurar que el build y las pruebas sigan pasando al 100%.

Working directory: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\orchestrator_2\
Original Request file: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\.agents\teamwork\ORIGINAL_REQUEST.md

## 2026-11-09T03:32:01Z
NUEVO REQUERIMIENTO COMPLEMENTARIO DEL USUARIO PARA EL MÓDULO DE INVENTARIOS Y KARDEX:

El usuario solicita incorporar un motor de carga de facturas de adquisición para abastecer el Kardex:

> "y en este modulo, quizas crear un motor donde se suba la factura de adquisicion y se vaya aumentando al kardex las existencias"

Detalle del alcance para integrar en el prototipo interactivo (ambos tenants CROE y Círculo Militar) y en `PLAN_EJECUCION_TECNICA.md`:
1. **Motor de Carga de Facturas de Adquisición (Ingresos a Bodega / Kardex):**
   - Permitir subir un archivo de factura de adquisición (soporte para PDF, XML electrónico del SRI, imagen o selección rápida de facturas pre-cargadas de proveedores reales para demostración con un solo clic en la reunión del martes).
   - Simular el procesamiento/lectura automática de la factura del proveedor: RUC del proveedor, N.º de factura SRI (ej. `001-002-000045892`), fecha de emisión, desglose de ítems adquiridos (paquetes de servilletas, fundas de vasos descartables, jabas de colas, cortes de carne/proteínas, menaje/vajilla, costo unitario, subtotal e IVA).
   - Al confirmar el ingreso de la factura: **AUMENTAR AUTOMÁTICAMENTE las existencias en el inventario**, registrar las entradas en el Kardex (`ENTRADA - Compra Factura SRI`), actualizar las barras de nivel de stock en tiempo real y mitigar/resolver alertas de stock crítico.
2. **Actualización Documental y Pruebas:**
   - Incorporar este flujo de abastecimiento y lectura de facturas electrónicas en `PLAN_EJECUCION_TECNICA.md`, `README.md` y ampliar la suite de pruebas automatizadas.
