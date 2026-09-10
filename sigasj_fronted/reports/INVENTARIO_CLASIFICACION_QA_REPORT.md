# Certificación QA — Clasificación de materiales (Backlog 3.2)

Fecha: 2026-09-09

## Alcance

Gestión de categorías y relación `Material–CategoriaMaterial`: creación, consulta, edición, estado lógico, asignación, cambio, desvinculación, filtros, selector y permisos. No incluye movimientos de inventario.

## Frontend verificado

| Caso | Resultado |
|---|---|
| Crear y editar categoría mediante API autenticada | Aprobado |
| Validar nombre, longitudes, duplicados y errores HTTP | Aprobado |
| Listar, buscar, paginar y filtrar categorías por estado | Aprobado |
| Activar/desactivar mediante PATCH, sin DELETE | Aprobado |
| Confirmación antes de desactivar | Aprobado |
| Asignar `idCategoria` al registrar un material | Aprobado |
| Cambiar o desvincular con `idCategoria: null` | Aprobado |
| Filtrar materiales por `idCategoria` | Aprobado |
| Mostrar categoría anidada o “Sin categoría” | Aprobado |
| Selector consulta `activo=true&limit=100` | Aprobado |
| No ofrecer categorías inactivas nuevas | Aprobado |
| Conservar como opción la categoría inactiva histórica actual | Aprobado |
| Carga/error independiente del selector | Aprobado |
| Administradora administra; Secretaria y Fontanero solo leen | Aprobado |
| Responsive de tabla, filtros y formularios | Aprobado por reglas automatizadas |

## Contratos cubiertos

- CRUD lógico de `/api/v1/inventario/categorias`.
- `POST/PATCH /api/v1/inventario/materiales` con `idCategoria`.
- `GET /api/v1/inventario/materiales?idCategoria=X`.
- Respuestas de material con `idCategoria` y `categoria` anidada o ambos en `null`.
- Manejo de 400, 401, 403, 404 y 409.

## Backend y SQL Server

La existencia de la llave foránea, persistencia, integridad referencial, rechazo de categorías inexistentes/inactivas y conservación histórica se consideran respaldados por la certificación Backend informada: 223 pruebas aprobadas, TypeScript y ESLint sin errores y build exitoso. El frontend no accede directamente a SQL Server.

## Evidencia de ejecución

Ejecutar:

```text
npm.cmd test -- --run src/modules/inventario src/modules/auth/utils/roleAccessMatrix.test.ts src/app/router/routeConfig.test.ts
npm.cmd run build
npx.cmd eslint src/modules/inventario
```

La inspección visual manual contra un ambiente autenticado sigue recomendada como smoke test previo a producción.
