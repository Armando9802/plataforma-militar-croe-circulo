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
