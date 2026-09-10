# Certificación QA Frontend — Catálogo de materiales

Fecha: 2026-09-09

## Alcance

Se validó exclusivamente el catálogo de materiales: listado, detalle, registro, edición y cambio lógico de estado. No se incluyeron entradas, salidas, movimientos, solicitudes, reposición ni alertas.

## Resultado automatizado

- Suite ejecutada: `npm.cmd test -- --run src/modules/inventario src/app/router/routeConfig.test.ts src/modules/auth/utils/roleAccessMatrix.test.ts src/modules/auth/config/adminNavigation.config.test.ts`
- Resultado final: 7 archivos y 89 pruebas aprobadas.
- Compilación TypeScript/Vite: aprobada.
- ESLint del módulo `src/modules/inventario`: aprobado.

## Cobertura frontend

| Área | Verificación | Resultado |
|---|---|---|
| Registro | POST, obligatorios, opcionales, límites, stock entero no negativo, 409 | Aprobado |
| Listado | Paginación, búsqueda, filtro activo/inactivo, carga, error y vacío | Aprobado |
| Detalle | GET por ID, carga directa/recarga y mensajes 400/404 | Aprobado |
| Edición | PATCH, precarga, conservación de datos y exclusión de `stockActual` | Aprobado |
| Estado | Endpoint dedicado, confirmación al desactivar, reactivación y refresco | Aprobado |
| Seguridad | Administradora administra; Secretaria y Fontanero solo leen; rutas privadas protegidas | Aprobado |
| Responsive | Reglas para escritorio, tableta y móvil; tabla convertida en tarjetas | Aprobado por inspección estructural |

## Contratos comprobados

- `GET /api/v1/inventario/materiales`
- `GET /api/v1/inventario/materiales/:id`
- `POST /api/v1/inventario/materiales`
- `PATCH /api/v1/inventario/materiales/:id`
- `PATCH /api/v1/inventario/materiales/:id/estado`

Los payloads de registro y edición no contienen `stockActual`. No existe operación `DELETE` en el módulo.

## Garantías externas

La persistencia SQL Server, integridad referencial, ausencia de borrado físico y RBAC efectivo del API se consideran certificados por la suite Backend reportada de 148 pruebas. Este repositorio frontend no tiene acceso directo a SQL Server y no duplica esa certificación.

## Observación visual

La validación automatizada confirma las reglas responsive. La revisión manual con navegador real y Backend autenticado debe formar parte del smoke test del ambiente integrado antes del cierre definitivo.
