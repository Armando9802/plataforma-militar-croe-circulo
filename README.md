# Plataforma Web Multi-Tenant CROE & Círculo Militar del Ecuador
## Prototipo Interactivo Funcional y Guía Ejecutiva de Demostración para Cierre de Directorio

> **Reunión Estratégica de Directorio:** Martes  
> **Objetivo de la Sesión:** Demostración interactiva en vivo, validación de arquitectura técnica y firma de acuerdo para inicio de la Fase 1.  
> **Instituciones Participantes:**
> - **CROE:** Club de Recreación de Oficiales del Ejército (*"El Placer de Servir"*) — Paleta Vino Tinto / Granate (`#8B1E24`) y Dorado (`#D4AF37`).
> - **Círculo Militar del Ecuador:** Fundado en 1918 (*"Unión, Honor y Tradición"*) — Paleta Azul Marino Institucional (`#1B365D`) y Dorado Imperial (`#C8A051`).

---

## 1. VISTA GENERAL DEL PROYECTO

La **Plataforma Tecnológica Multi-Tenant para Clubes Militares del Ecuador** es una solución integral diseñada para modernizar la gestión operativa, recreacional, de seguridad física y financiera de las dos instituciones sociales castrenses más insignes de las Fuerzas Armadas del Ecuador: el **CROE** y el **Círculo Militar**.

### Capacidades Centrales del Prototipo Interactivo:
1. **Arquitectura Multi-Tenant de Marca Blanca:** Conmutación instantánea y sin recarga de página entre la identidad visual y heráldica del CROE y del Círculo Militar, inyectando paletas cromáticas, escudos de armas y lemas oficiales mediante variables CSS dinámicas.
2. **Expediente del Socio Militar & Carné Digital 3D:** Consulta de hoja de vida militar (grado, arma o especialidad, promoción de egreso ESMIL, estado de aportaciones) y credencial digital interactiva con giro tridimensional y acabado holográfico castrense.
3. **Código QR Criptográfico Dinámico (TOTP):** Generación de código QR rotativo con semilla criptográfica que se refresca cada 45 segundos, imposibilitando el fraude por capturas de pantalla de WhatsApp en los controles de acceso.
4. **Simulador de Terminal de Garita Militar:** Interfaz táctil para los Oficiales y Clases de Guardia en garita, capaz de escanear la credencial, validar la vigencia de membresía, autorizar el ingreso del vehículo y verificar cargas familiares autorizadas.
5. **Motor de Reservas Dual (Hospedaje & Deportes):** Catálogo interactivo para reservar cabañas vacacionales en Salinas y Suites en Los Chillos, así como canchas de pádel y tenis de arcilla, con calendario interactivo y prevención automática de colisiones.
6. **Simulación de Pasarelas de Pago Ecuatorianas (Payphone & Kushki):** Modal de cobro unificado con flujo móvil push (Payphone) y tarjeta bancaria con tokenización y 3-D Secure (Kushki).
7. **Comprobante Digital y Facturación SRI:** Emisión del voucher legal con desglose del 15% de IVA, número de autorización y Clave de Acceso de 49 dígitos conforme a la normativa oficial del Servicio de Rentas Internas del Ecuador, listo para impresión o exportación digital.
8. **Gestión de Turnos de Restaurante y Banquetes Militares:** Programación interactiva de servicios de Desayuno, Almuerzo y Cena para rancho y comedor de oficiales, así como Banquetes y Eventos Institucionales con selector de comensales (PAX) y minutas de gala.
9. **Economato Inteligente con Explosión Automática de Insumos y Kardex:** Descuento instantáneo de existencias (víveres, carnes, gaseosas, servilletas y cubiertos) al confirmar un turno o evento, con bitácora inmutable de Kardex perpetuo, costeo PMP (Precio Medio Ponderado) y semáforo visual de stock crítico/reorden.
10. **Auditoría de Menaje y Control de Roturas Post-Evento:** Hoja de ruta y balance físico de vajilla protocolar y cristalería despachada a salones vs devuelta a bodega, con cálculo automático del cargo por reposición de piezas rotas o faltantes liquidado a la cuenta del socio militar.
11. **Motor de Carga de Facturas de Adquisición SRI:** Carga rápida de facturas electrónicas de proveedores nacionales (Pronaca, Tesalia Springs, Indurmesa) con simulación de parseo SRI (RUC proveedor 13 dígitos, Clave de Acceso 49 dígitos, tarifa 15% IVA), acreditación a bodega y asiento de ENTRADA en Kardex.

---

## 2. REQUISITOS DEL SISTEMA E INSTRUCCIONES DE EJECUCIÓN LOCAL

La aplicación ha sido desarrollada como un prototipo web interactivo autónomo de alto rendimiento, optimizado para ejecutarse localmente sin depender de configuraciones complejas de servidores externos durante la presentación ejecutiva.

### 2.1. Requisitos Previos
- **Node.js:** Versión 18.x, 20.x o 24.x LTS instalada en el equipo.
- **Navegador Web Moderno:** Google Chrome, Microsoft Edge, Brave o Mozilla Firefox (se recomienda Chrome o Edge para aceleración 3D del carné).
- **Resolución Recomendada:** 1920x1080 o superior (óptimo para proyector o pantalla de sala de juntas de directorio).

### 2.2. Paso a Paso para Iniciar la Aplicación

1. **Abrir una terminal en el directorio raíz del proyecto:**
   ```bash
   cd "c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca"
   ```

2. **Instalar dependencias del proyecto:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de desarrollo local:**
   ```bash
   npm run dev
   ```

4. **Acceder a la plataforma:**
   Abra su navegador web e ingrese a la dirección indicada por la consola (habitualmente `http://localhost:5173` o el puerto asignado por Vite).

5. **(Opcional) Ejecución de Pruebas Automatizadas de Verificación:**
   Para validar la integridad de todos los módulos antes de la reunión:
   ```bash
   npm test
   ```
   O ejecutar el verificador nativo de sistema:
   ```bash
   node --test scripts/test-prototype.mjs
   ```

---

## 3. GUÍA EJECUTIVA Y GUIÓN DE PRESENTACIÓN PARA EL DIRECTORIO (MARTES)

> **Perfil de la Audiencia:** Señores Oficiales Generales, Coroneles, Presidentes y Miembros del Directorio Ejecutivo de CROE y Círculo Militar del Ecuador.  
> **Tono Sugerido:** Respetuoso, castrense, ejecutivo, enfocado en eficiencia de recursos, soberanía de datos y prestigio institucional.  
> **Duración Estimada:** 20 minutos (12 min de demo guiada + 8 min de preguntas y cierre).

---

### Acto 1: Apertura y el Reto Institucional (2 Minutos)

**Discurso del Presentador:**
> *"Mi General, señores Oficiales miembros del Directorio: Es un honor presentarles la solución tecnológica definitiva diseñada específicamente para la realidad de nuestros clubes militares. Históricamente, el CROE y el Círculo Militar han operado como entidades hermanas pero en islas digitales separadas, obligando a nuestros socios a realizar trámites manuales, utilizar carnés plastificados vulnerables a falsificación y depender de transferencias bancarias que demoran días en conciliarse.*  
> *Hoy les presentamos no una promesa en diapositivas, sino una plataforma web interactiva y funcional, con arquitectura de grado militar, soberanía de datos bajo la ley ecuatoriana y un modelo multi-tenant que respeta al 100% la identidad, autonomía e historia de cada institución."*

---

### Acto 2: El Selector Institucional Multi-Tenant y Marca Blanca (2 Minutos)

**Acción en Pantalla:**
1. Muestre la barra superior de selección institucional (`CROE` vs `Círculo Militar`).
2. Haga clic en **CROE**: Observe cómo la interfaz adopta el color vino tinto/granate (`#8B1E24`), el escudo C.R.O.E con su estrella dorada y el lema *"EL PLACER DE SERVIR"*.
3. Haga clic inmediatamente en **Círculo Militar del Ecuador**: Observe la transición instantánea a la paleta azul marino (`#1B365D`), el sello circular tradicional de 1918 y el lema *"UNIÓN, HONOR Y TRADICIÓN"*.

**Argumento Clave para el Directorio:**
> *"Ambas instituciones comparten la misma infraestructura de software reduciendo los costos de mantenimiento en un 65%, pero cada club preserva de forma inquebrantable su marca, sus colores de gala y sus finanzas independientes mediante aislamiento de datos de nivel bancario (PostgreSQL Row Level Security)."*

---

### Acto 3: Expediente Militar y Carné Digital 3D Inviolable (3 Minutos)

**Acción en Pantalla:**
1. Ingrese a la pestaña **"Mi Carné / Perfil"**.
2. Muestre la hoja de vida militar del socio: Grado (ej. *Grab. o Crnl.*), Arma o Especialidad (ej. *Infantería*), Promoción de Egreso ESMIL y estado de aportaciones (*Al Día*).
3. Mueva el cursor sobre el **Carné Digital 3D**: Demuestre el efecto tridimensional de giro y la textura metalizada de la tarjeta.
4. Señale el **Código QR Dinámico**: Muestre el contador regresivo de **45 segundos**.

**Argumento Clave para el Directorio:**
> *"El carné físico tradicional hoy en día se presta a familiares o amigos para ingresar a las sedes sin autorización. Nuestro carné digital utiliza criptografía militar rotativa (TOTP): el código QR cambia cada 45 segundos. Si alguien le toma una foto o captura de pantalla en WhatsApp y se la envía a un tercero, al llegar a la garita el código ya habrá expirado y será rechazado automáticamente."*

---

### Acto 4: Terminal de Garita Militar en Acción (2 Minutos)

**Acción en Pantalla:**
1. Haga clic en el botón **"Simulador de Garita / Control de Acceso"**.
2. Presione **"Escanear Carné del Socio"**: El sistema valida el hash criptográfico del QR en tiempo real.
3. Se despliega la pantalla del Centinela de Guardia:
   - Fotografía oficial del titular y grado militar.
   - Estado de membresía: **AL DÍA (ACCESO AUTORIZADO)**.
   - Lista de cargas familiares autorizadas (cónyuge e hijos con acceso a piscina y canchas).
   - Placa de vehículo registrada para ingreso vehicular expedito.

**Argumento Clave para el Directorio:**
> *"El Oficial de Guardia y los Clases de servicio en la garita de Los Chillos o Salinas ya no tendrán que revisar listas impresas en papel ni discutir en la barrera vehicular. En un solo segundo el sistema verifica la legitimidad del socio y registra la hora exacta de ingreso."*

---

### Acto 5: Motor de Reservas y Reciprocidad Inter-Clubes (3 Minutos)

**Acción en Pantalla:**
1. Ingrese a **"Reservas e Instalaciones"**.
2. Filtre por **Hospedaje Vacacional**: Seleccione la *Cabaña Familiar en Salinas* o la *Suite Ejecutiva en Los Chillos*.
3. Filtre por **Espacios Deportivos**: Seleccione una *Cancha de Pádel* o *Cancha Central de Tenis de Arcilla*.
4. Seleccione las fechas u horario en el calendario interactivo.
5. Muestre el desglose de tarifas: Tarifa preferencial para socio militar activo vs tarifa de convenio interinstitucional CROE - Círculo Militar.
6. Haga clic en **"Continuar al Pago"**.

**Argumento Clave para el Directorio:**
> *"Con el módulo M8 de reciprocidad, un oficial del Ejército socio de CROE puede vacacionar en las cabañas del Círculo Militar aplicando un descuento automático de convenio, optimizando la ocupación hotelera en ambas instituciones sin duplicar afiliaciones."*

---

### Acto 6: Pasarela de Pagos (Payphone / Kushki) y Comprobante SRI (2 Minutos)

**Acción en Pantalla:**
1. En el modal de pago integrado, muestre los dos métodos ecuatorianos:
   - **Opción A: Payphone:** Ingrese número de celular ecuatoriano (ej. `0998765432`) y simule la notificación push a la app móvil.
   - **Opción B: Kushki:** Seleccione pago con tarjeta y muestre la opción de diferido (corriente o 3 meses sin intereses).
2. Procese el pago: La máquina de estados aprueba la transacción de forma inmediata con lluvia de confeti institucional.
3. Se despliega el **Comprobante Digital / Factura Electrónica SRI**:
   - RUC de la institución militar emisora.
   - Desglose oficial de impuestos: Subtotal y **Tarifa de IVA al 15%** vigente en Ecuador.
   - **Clave de Acceso de 49 dígitos** calculada con el algoritmo oficial Módulo 11 del SRI.
   - Botón interactivo de **"Imprimir Comprobante / Guardar PDF"**.

**Argumento Clave para el Directorio:**
> *"Cero fricción financiera. El socio paga en 10 segundos desde su teléfono inteligente y recibe su factura electrónica autorizada por el SRI de manera instantánea, eliminando por completo la cartera vencida y los cheques devueltos."*

---

### Acto 7: Turnos de Restaurante y Explosión Instantánea de Existencias (3 Minutos)

**Discurso del Presentador:**
> *"Mi General, señores Directores: Uno de los dolores operativos más críticos en los comedores y ranchos de nuestras sedes es la fuga silenciosa de víveres, carnes y bebidas. Tradicionalmente no se sabe con precisión cuántas libras de lomo, cuántas gaseosas o cuántos paquetes de servilletas se consumieron en un almuerzo de 85 oficiales.*  
> *Les presentamos nuestro motor de explosión de recetas: al seleccionar el turno del día (ej. Desayuno, Almuerzo o Cena) y registrar el número de comensales (PAX), el sistema calcula de forma milimétrica las porciones y descuenta automáticamente de la bodega central y del economato cada insumo, registrando el costo medio ponderado en el Kardex en tiempo real."*

**Acción en Pantalla:**
1. Diríjase a la pestaña **"Restaurante & Eventos"**.
2. Seleccione la sub-pestaña **"Turnos Diarios de Comedor"** y elija el turno **Almuerzo de Guarnición Cumbayá** con **50 PAX** (o ajuste con el slider interactivo).
3. Muestre la previsualización del consumo programado de ingredientes: cortes de lomo fino, botellas de gaseosa, servilletas y cubertería.
4. Haga clic en **"Registrar Turno y Descontar Existencias"**.
5. Observe la notificación de éxito y pase a la pestaña **"Inventario & Economato"**: el stock disponible ha disminuido de forma inmediata y se ha registrado el asiento `SALIDA_TURNO_ALMUERZO` en la bitácora de Kardex.

---

### Acto 8: Control de Existencias y Menaje Post-Evento / Auditoría de Roturas (2 Minutos)

**Discurso del Presentador:**
> *"En ceremonias de ascenso militar o banquetes de gala con 150 invitados, es habitual que se extravíen cubiertos o se rompan copas de cristal de gala, generando un perjuicio económico que el club solía absorber por falta de inventarios inmediatos.*  
> *Ahora, el sistema genera la hoja de ruta de menaje: se despachan las piezas de gala; al finalizar la noche, el mayordomo militar abre la auditoría de cierre, registra la vajilla sana retornada (ej. 142 copas devueltas y 8 copas rotas). El sistema calcula al instante el cargo por reposición ($32.00) y asienta la merma en Kardex sin discrepancias."*

**Acción en Pantalla:**
1. En la vista **"Inventario & Economato"**, haga clic en **"Auditoría de Menaje Post-Evento"**.
2. Observe el listado de vajilla y cristalería en circulación para el evento institucional activo (platos llanos, copas de cristal, cubiertos).
3. Ajuste los contadores de piezas retornadas intactas y piezas dañadas/rotas.
4. Muestre cómo el sistema calcula dinámicamente el **Cargo Total por Reposición de Vajilla Rota**.
5. Haga clic en **"Cerrar Evento y Registrar en Kardex"**: el menaje íntegro reingresa al almacén (`RETORNO_MENAJE`) y la merma queda documentada (`MERMA_ROTURA`).

---

### Acto 9: Abastecimiento y Carga de Facturas de Proveedores SRI (2 Minutos)

**Discurso del Presentador:**
> *"¿Cómo se reabastecen las bodegas? No necesitamos digitación manual propensa a errores. El bodeguero militar simplemente carga el archivo XML o PDF de la factura electrónica emitida por el proveedor (ej. Pronaca S.A., Tesalia Springs o Indurmesa).*  
> *El sistema extrae el RUC, la Clave de Acceso de 49 dígitos autorizada por el SRI, desglosa los productos, aplica la tarifa legal del 15% de IVA y, con un solo clic de confirmación, suma las existencias a la bodega correspondiente y actualiza el Precio Medio Ponderado."*

**Acción en Pantalla:**
1. En **"Inventario & Economato"**, haga clic en el botón superior **"Ingresar Factura SRI"**.
2. Demuestre la zona de carga de archivos XML/PDF y haga clic en el botón de demostración rápida **"PRONACA S.A. (Carnes & Embutidos)"** (RUC `1790005744001`).
3. Muestre la extracción automática de datos: Clave de Acceso de 49 dígitos, fecha, subtotal 0%, subtotal 15%, IVA 15% ($100.35) y total ($769.35).
4. Revise el desglose de ítems (Lomo Fino de Res, Pechuga de Pollo).
5. Haga clic en **"Confirmar Ingreso a Bodega"**: confirme cómo las alertas de stock bajo desaparecen, el inventario aumenta y se asienta el movimiento inmutable de `ENTRADA_COMPRA` en el Kardex.

---

## 4. PREGUNTAS FRECUENTES Y ARGUMENTOS DE CIERRE PARA EL DIRECTORIO

### P1: *"¿Nuestra información militar y la de los señores Generales estará segura en una base de datos compartida?"*
**Respuesta:**  
Absolutamente. La arquitectura no mezcla los datos a nivel de aplicación. PostgreSQL implementa **Row Level Security (RLS)** a nivel de motor de datos: ninguna consulta de un club puede ver jamás los registros del otro a menos que exista un convenio explícito de reciprocidad. Además, la plataforma cumple con la **Ley Orgánica de Protección de Datos Personales del Ecuador (LOPDP)**, cifrando en reposo (AES-256) toda información sensible de escalafón militar y cédulas de identidad.

### P2: *"¿Qué ocurre si se va el internet en la garita de la sede de Salinas?"*
**Respuesta:**  
El sistema de garita cuenta con un modo de contingencia offline criptográfico. El código QR del socio contiene una firma criptográfica asimétrica que el terminal de la guardia puede verificar localmente sin necesidad de conexión activa a internet, sincronizando la bitácora de accesos automáticamente en cuanto se restablezca la red.

### P3: *"¿Cómo se implementará el cobro de cuotas a través del ISSFA?"*
**Respuesta:**  
El módulo M5 incluye la generación del archivo plano normalizado para descuento directo por rol de pagos en coordinación con el Instituto de Seguridad Social de las Fuerzas Armadas (ISSFA) y débitos bancarios automáticos con Banco Pichincha, Banco General Rumiñahui (BGR) y Banco del Pacífico.

### P4: *"¿Cuál es el tiempo de entrega y el cronograma para tener esto operando en nuestras sedes?"*
**Respuesta:**  
El plan de ejecución contempla un despliegue por fases a lo largo de 10 meses. Sin embargo, **la Fase 1 (Padrón militar, carné digital 3D y lectores en garitas) entrará en operación en tan solo 60 días**, permitiendo que los socios disfruten de los beneficios inmediatos mientras se despliegan los módulos de restaurantes POS y convenios.

---

## 5. ESTRUCTURA DEL REPOSITORIO Y ARTEFACTOS TÉCNICOS

```
c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\
├── PLAN_EJECUCION_TECNICA.md    # Especificación de ingeniería: ERD, RLS, Payphone, Kushki, LOPDP y Roadmap 11+2
├── README.md                    # Esta guía ejecutiva de instalación y guión de demostración
├── package.json                 # Dependencias y scripts de ejecución
├── vite.config.ts               # Configuración de compilación ultrarrápida
├── tailwind.config.js           # Configuración de tokens de diseño militar
├── tsconfig.json                # Configuración de TypeScript estricto
├── src/
│   ├── main.tsx                 # Punto de entrada de la aplicación React
│   ├── App.tsx                  # Enrutador principal y cascarón visual
│   ├── index.css                # Estilos base y definición de variables CSS dinámicas
│   ├── context/
│   │   ├── TenantContext.tsx    # Contexto multi-tenant y conmutador CROE / Círculo
│   │   ├── ReservationContext.tsx# Estado transaccional del catálogo y reservas
│   │   └── PaymentContext.tsx   # Máquina de estados de pasarelas de pago y SRI
│   ├── types/                   # Tipos TypeScript para socios, reservas y pagos
│   ├── data/                    # Semillas de datos castrenses de CROE y Círculo Militar
│   ├── components/
│   │   ├── common/              # Navbar institucional, footer y selector
│   │   ├── badges/              # Escudo oficial CROE y Sello Círculo Militar en SVG
│   │   ├── socio/               # Expediente, carné 3D, QR dinámico y terminal garita
│   │   ├── reservations/        # Catálogo de hospedaje/canchas y modal de fechas
│   │   └── payment/             # Checkout Payphone/Kushki y comprobante digital SRI
│   └── utils/                   # Algoritmos Módulo 11 SRI, fechas y formateo de moneda
```

---

## 6. DOCUMENTACIÓN TÉCNICA DE REFERENCIA
Para consultar en detalle las especificaciones de ingeniería, definiciones DDL de base de datos, políticas RLS y la hoja de ruta de los 11 módulos funcionales + 2 transversales, consulte el documento maestro:
👉 **`c:\Users\eretm\OneDrive\Desktop\Projecto Hernan Fonseca\PLAN_EJECUCION_TECNICA.md`**

---
*Plataforma Multi-Tenant CROE & Círculo Militar del Ecuador — Desarrollada con honor, disciplina y excelencia tecnológica.*
