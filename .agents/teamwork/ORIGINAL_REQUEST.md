# Original User Request

## Approved Task Prompt — 2026-11-09T01:44:25Z

Construir un prototipo web interactivo funcional con dos portales diferenciados por institución (CROE y Círculo Militar del Ecuador) y un plan de ejecución técnico integral con arquitectura para presentar a los directivos y cerrar el negocio en la reunión del martes.

Working directory: c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca
Integrity mode: development

## Requirements

### R1. Portales web interactivos para CROE y Círculo Militar
Desarrollar una aplicación web interactiva con arquitectura multi-tenant (o selector institucional) que permita navegar dos portales diferenciados con la identidad visual institucional de cada club:
- **CROE (Club de Recreación de Oficiales del Ejército):** Identidad con escudo C.R.O.E, estrella dorada, lema "EL PLACER DE SERVIR" y paleta institucional en rojo vino/granate (`#8B1E24`), dorado y gris oscuro.
- **Círculo Militar del Ecuador:** Identidad con sello circular institucional y paleta en azul marino profundo (`#1B365D` / `#1E3A8A`), dorado y blanco.
Construida con un stack web moderno estándar (Next.js o React con TypeScript y Tailwind CSS) que se ejecute localmente de forma autónoma.

### R2. Módulos clave interactivos para la demostración
La aplicación debe implementar funcionalmente los tres flujos prioritarios para la reunión:
1. **Portal del Socio y Carné Digital:** Expediente del socio militar, categoría activa y carné digital interactivo con código QR verificable.
2. **Sistema de Reservas:** Flujo interactivo de consulta de disponibilidad, selección de fechas y reserva tanto de habitaciones de hospedaje como de canchas y espacios recreativos.
3. **Simulación de Pasarela de Pagos:** Flujo simulado de cobro integrado (Payphone / Kushki) con selección de método de pago, confirmación de transacción y generación de comprobante digital emitido.

### R3. Plan de ejecución técnico y arquitectura integral
Entregar un documento técnico exhaustivo (`PLAN_EJECUCION_TECNICA.md`) que sirva de base para la construcción completa de la plataforma, que incluya:
- Modelo de datos entidad-relación detallado (socios, dependientes, membresías, reservas, pagos, convenios).
- Especificación de arquitectura multi-tenant / marca blanca compartida entre ambas organizaciones.
- Diseño de integración de pasarelas de pago locales (Payphone / Kushki con webhooks y conciliación).
- Hoja de ruta por fases y cronograma de implementación para cubrir los 11 módulos funcionales y 2 transversales de las propuestas institucionales.
- Arquitectura de seguridad, control de acceso (RBAC), auditoría y cumplimiento de la LOPDP (Ecuador).

## Acceptance Criteria

### Prototipo Web y Navegación
- [ ] La aplicación compila e inicia localmente mediante un comando estándar documentado (ej. `npm run dev`) sin errores.
- [ ] Existen vistas funcionales para ambas organizaciones (CROE y Círculo Militar), reflejando sus respectivas paletas de colores e insignias institucionales.
- [ ] El carné digital de socio renderiza un código QR interactivo con datos del socio.
- [ ] El módulo de reservas permite seleccionar fecha, tipo de servicio (hospedaje o espacio deportivo), y confirmar una reserva registrando el estado en memoria o base de datos local.
- [ ] El flujo de pago permite simular una transacción exitosa (Payphone / Kushki) y muestra el comprobante digital con número de autorización y detalle del consumo.

### Documentación y Plan de Ejecución
- [ ] Existe en la raíz del proyecto el archivo `PLAN_EJECUCION_TECNICA.md` con las especificaciones de base de datos, arquitectura multi-tenant, pasarelas de pago y roadmap por fases para los 11 módulos.
- [ ] Existe un archivo `README.md` con instrucciones claras para ejecutar y demostrar la aplicación en la reunión.

## Follow-up — 2026-11-09T03:28:23Z

El usuario revisó el prototipo y solicita agregar esta funcionalidad clave para la reunión del martes (puedes proceder directamente a implementarla sin entrevista adicional si tu flujo lo permite):

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

## Follow-up — 2026-11-09T03:31:29Z

El usuario acaba de agregar un requerimiento clave adicional para este mismo módulo de Inventarios y Kardex que están construyendo ahora mismo:

> "y en este modulo, quizas crear un motor donde se suba la factura de adquisicion y se vaya aumentando al kardex las existencias"

Alcance para integrar dentro del módulo de Inventarios / Economato y en `PLAN_EJECUCION_TECNICA.md`:
- **Motor de Carga de Facturas de Adquisición (Ingresos a Bodega / Kardex):**
  - Permitir subir un archivo de factura de adquisición (PDF / XML electrónico del SRI / imagen o seleccionar facturas de proveedores reales pre-cargadas para demostración en un clic en la reunión) o ingresar sus ítems.
  - Mostrar el procesamiento/lectura automática de la factura del proveedor (RUC del proveedor, N.º de factura SRI `001-002-...`, fecha, listado de insumos adquiridos como paquetes de servilletas, fundas de vasos, jabas de colas, cortes de carne/alimentos, menaje, costo unitario y total).
  - Al confirmar el ingreso de la factura de adquisición, **aumentar automáticamente las existencias en el inventario** y registrar los movimientos de **ENTRADA (Compra / Factura de Adquisición)** en el **Kardex**, actualizando en tiempo real las barras de stock y levantando alertas de stock bajo cuando se reabastece un insumo crítico.
  - Documentar este flujo de abastecimiento y lectura de facturas electrónicas (XML/PDF SRI) en `PLAN_EJECUCION_TECNICA.md` y `README.md`.
