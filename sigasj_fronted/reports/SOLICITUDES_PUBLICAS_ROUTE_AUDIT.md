# Auditoría de rutas públicas de solicitudes

Fecha de revisión: 20 de octubre de 2026

## Alcance

Se revisaron la configuración de React Router, la página informativa, sus Cards, los componentes asociados y los clientes HTTP existentes. Esta auditoría cubre el módulo público de solicitudes descrito en el backlog; no confunde ese módulo con solicitudes internas de materiales o ausencias.

## Resumen ejecutivo

- La página informativa muestra **4 de las 8 Cards requeridas**.
- Las 4 Cards existentes enlazan a rutas públicas registradas, pero todas renderizan `PublicFormPlaceholder`, un `<main>` vacío.
- Solo 3 de esas 4 rutas coinciden con los slugs oficiales del backend.
- `/solicitudes/constancia-servicio` es incorrecta para el catálogo oficial; el backend publica `servicio-existente`.
- No hay rutas públicas para infraestructura frente a linderos, disponibilidad de servicios, otros formularios ni seguimiento.
- No se encontraron dos rutas públicas que atiendan la misma funcionalidad. Sí existe una colisión conceptual de nombres con módulos privados de solicitudes, pero sus prefijos son distintos y no constituyen rutas duplicadas.
- El cliente `src/services/api/solicitudesApi.ts` solo consume el endpoint administrativo de solicitudes aprobadas pendientes. No existe todavía integración pública con tipos, detalle por slug o seguimiento.

## Configuración de enrutamiento encontrada

`src/app/router/AppRoutes.tsx` registra todas las entradas de `PUBLIC_ROUTES` fuera del guard de autenticación. Por tanto, las rutas del catálogo público son realmente públicas.

`src/app/router/publicRoutes.tsx` agrega las entradas declaradas en `PUBLIC_SERVICE_REQUEST_ROUTES` y las resuelve con el mismo componente `PublicFormPlaceholder`.

`src/modules/landing/config/serviceRequestRoutes.ts` es la fuente actual de las cuatro rutas de solicitudes. `src/modules/landing/components/RequestsSection.tsx` reutiliza esas constantes al construir las Cards.

## Inventario Card → trámite → ruta

| Card requerida | Estado en la landing | Ruta actual | Ruta canónica recomendada | Componente actual | Hallazgo |
|---|---|---|---|---|---|
| 1. Arreglo de Pago | Existe | `/solicitudes/arreglo-pago` | `/solicitudes/arreglo-pago` | `PublicFormPlaceholder` | Ruta correcta; pantalla vacía. |
| 2. Cambio de Titular | Existe | `/solicitudes/cambio-titular` | `/solicitudes/cambio-titular` | `PublicFormPlaceholder` | Ruta correcta; pantalla vacía. |
| 3. Infraestructura Frente a Linderos | Falta | — | `/solicitudes/infraestructura-linderos` | — | Faltan Card, ruta y pantalla. |
| 4. Afiliación | Existe | `/solicitudes/afiliacion` | `/solicitudes/afiliacion` | `PublicFormPlaceholder` | Ruta correcta; pantalla vacía. |
| 5. Disponibilidad de Servicios | Falta | — | `/solicitudes/disponibilidad-servicios` | — | Faltan Card, ruta y pantalla. |
| 6. Servicio Existente | Existe con nombre genérico | `/solicitudes/constancia-servicio` | `/solicitudes/servicio-existente` | `PublicFormPlaceholder` | Ruta actual no coincide con el slug oficial. Debe migrarse o redirigirse. |
| 7. Otros Formularios | Falta | — | `/solicitudes/otros-formularios` | — | Faltan Card, ruta y página de descargas. No corresponde a un slug de los seis trámites. |
| 8. Seguimiento de Solicitudes | Falta | — | `/solicitudes/seguimiento` | — | Faltan Card, ruta y consulta por código e identificación. |

## Componentes reutilizables

- `RequestsSection`: estructura responsive, identidad visual, grilla y renderizado de Cards. Debe ampliarse a ocho elementos y conviene mover el catálogo de Cards a configuración tipada.
- `RequestService` y `RequestsSectionProps`: base tipada reutilizable. El tipo de icono deberá ampliarse para las cuatro Cards nuevas.
- `ServiceIcon`: patrón visual reutilizable; necesita iconos para linderos, disponibilidad, descargas y seguimiento.
- `PublicFormPlaceholder`: solo es útil como marcador temporal y no satisface ningún formulario oficial.
- `FormSuccessResult`: puede reutilizarse al confirmar el envío y presentar el código de seguimiento.
- Estilos y layout de `RequestsSection`: ya contemplan dos columnas y una columna bajo 760 px; son una base adecuada para móvil, tableta y escritorio.
- Infraestructura HTTP en `src/services/http/publicApi.ts` y `src/services/http/httpClient.ts`: base reutilizable para los tres endpoints públicos.

## Páginas vacías o incompletas

Las siguientes rutas existen, pero su elemento final es un `<main aria-label="…" />` sin contenido:

- `/solicitudes/arreglo-pago`
- `/solicitudes/cambio-titular`
- `/solicitudes/afiliacion`
- `/solicitudes/constancia-servicio`

No permiten completar el trámite, adjuntar requisitos ni descargar el documento original.

Además, `/admin/solicitudes` existe como ruta protegida, pero renderiza `PrivateModulePlaceholder`; esto queda fuera del alcance público del presente backlog, aunque debe considerarse al desarrollar la gestión administrativa.

## Rutas relacionadas que no son duplicados

- `/admin/solicitudes`: gestión administrativa general, actualmente placeholder.
- `/fontanero/mis-solicitudes` y `/fontanero/mis-solicitudes/:id`: solicitudes de ausencia del personal.
- `/admin/inventario/solicitudes` y rutas de `solicitudes-materiales`: flujo interno de inventario.

Estas rutas representan dominios distintos. No deben reutilizarse para los trámites ciudadanos ni renombrarse como parte del módulo público.

## Contrato de rutas que debe conservarse

Para evitar duplicados, la implementación posterior debe usar una sola ruta dinámica para los seis trámites oficiales:

```text
/solicitudes/:slug
```

Los únicos valores admitidos para `:slug` deben ser:

```text
arreglo-pago
cambio-titular
infraestructura-linderos
afiliacion
disponibilidad-servicios
servicio-existente
```

Las funcionalidades que no representan un tipo oficial deben mantenerse como rutas estáticas y declararse antes de la dinámica:

```text
/solicitudes/otros-formularios
/solicitudes/seguimiento
```

La ruta dinámica deberá validar el slug contra `GET /solicitudes/tipos/:slug` y mostrar un estado 404 cuando el backend no lo reconozca.

## Duplicados e inconsistencias detectadas

1. No existen duplicados exactos en `PUBLIC_ROUTES`.
2. `/solicitudes/constancia-servicio` no corresponde a ningún slug oficial. Se recomienda redirigirla con `replace` a `/solicitudes/servicio-existente` durante la transición, en vez de mantener dos pantallas.
3. Los IDs visuales y las rutas se declaran por separado entre `RequestsSection.tsx` y `serviceRequestRoutes.ts`. Aunque hoy usan constantes para el enlace, mantener dos catálogos facilita desalineaciones. Se recomienda una única definición tipada por Card.
4. Las pruebas de rutas fijan explícitamente el slug incorrecto `constancia-servicio`; deberán actualizarse junto con la migración.

## Integración pública faltante

Se requiere un cliente público para:

- `GET /solicitudes/tipos`
- `GET /solicitudes/tipos/:slug`
- `GET /solicitudes/seguimiento/:codigoSeguimiento`

No se encontró consumo de esos endpoints ni modelos frontend para `TipoSolicitud`, el detalle de seguimiento o los estados `PENDIENTE`, `EN_REVISION`, `APROBADA`, `RECHAZADA`, `FINALIZADA` y `CANCELADA`.

La descripción funcional menciona que el seguimiento usa código e identificación, mientras la guía de backend documenta únicamente el código en el endpoint. Esta diferencia de contrato debe resolverse antes de implementar el envío de la Card 8; no debe simularse una validación de identificación solo en frontend.

## Decisiones para el siguiente desarrollo

1. Conservar sin cambios las tres rutas ya correctas: arreglo de pago, cambio de titular y afiliación.
2. Reemplazar la ruta incorrecta de constancia de servicio por el slug oficial `servicio-existente`, dejando solo una redirección de compatibilidad si existen enlaces publicados.
3. Crear `infraestructura-linderos` y `disponibilidad-servicios` dentro de la misma pantalla dinámica, no como componentes de ruta duplicados.
4. Crear páginas estáticas independientes para otros formularios y seguimiento.
5. Sustituir los placeholders únicamente cuando estén disponibles los documentos oficiales, porque el requisito exige reproducir exactamente todos sus campos, opciones, requisitos y secciones.
6. Añadir pruebas que verifiquen ocho Cards, unicidad de rutas, slugs oficiales y navegación pública responsive.

## Resultado de los criterios

| Criterio | Resultado de auditoría |
|---|---|
| Se conocen todas las rutas existentes | Cumplido. |
| Se identifican componentes reutilizables | Cumplido. |
| Se conocen las rutas faltantes | Cumplido. |
| No se crean rutas duplicadas | Cumplido en esta tarea; se definió el contrato canónico. |
| Existe una ruta definida para cada funcionalidad pública necesaria | Cumplido como contrato documentado; la aplicación todavía debe implementar cinco rutas funcionales y migrar una ruta incorrecta. |
