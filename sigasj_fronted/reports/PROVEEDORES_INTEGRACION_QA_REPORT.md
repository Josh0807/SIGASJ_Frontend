# Certificación QA — Proveedores e integración con materiales (Backlog 3.3)

Fecha: 2026-09-10

## Alcance ejecutado en este repositorio

Se verificaron el mantenimiento frontend de proveedores, su autorización por rol y el contrato HTTP de la relación opcional `Proveedor 1:N Material`. La persistencia y el RBAC del servidor deben ejecutarse en el repositorio/ambiente Backend conectado a SQL Server; no se simula acceso a la base de datos desde el navegador.

## Resultado automatizado

- Suite: `npm.cmd test -- --run src/modules/inventario`
- Resultado: **11 archivos y 56 pruebas aprobadas**.
- Build TypeScript/Vite: aprobado.
- ESLint de `src/modules/inventario`: aprobado.

## Cobertura frontend automatizada

| Área | Casos cubiertos | Resultado |
|---|---|---|
| Contrato proveedores | GET listado/detalle, POST, PATCH edición y PATCH estado | Aprobado |
| Registro | Nombre obligatorio, correo, límites, opcionales y normalización `trim`/`null` | Aprobado |
| Errores | Mensajes comprensibles para 400, 401, 403, 404 y 409 | Aprobado |
| Listado | Datos existentes, carga, error con reintento y lista vacía | Aprobado |
| Roles | Administradora administra; Secretaria y Fontanero no acceden a alta/edición | Aprobado |
| Sesión | Acceso directo sin sesión redirige al inicio de sesión | Aprobado |
| Estado lógico | Confirmación antes de desactivar y uso de PATCH, nunca DELETE | Aprobado |
| Formulario | Evita doble envío y bloquea el botón mientras guarda | Aprobado |
| Material–Proveedor | Envío de `idProveedor`, desvinculación con `null` y filtro por ID | Aprobado |
| Selector | Solicita `activo=true`; proveedor inactivo actual se conserva solo como histórico | Aprobado por contrato y estructura |
| Visual responsive | Tabla en tarjetas y formularios/filtros a una columna bajo 760 px | Aprobado por reglas automatizadas |

## Contratos comprobados

- `GET /api/v1/inventario/proveedores?search=...&activo=...&page=...&limit=...`
- `GET /api/v1/inventario/proveedores/:id`
- `POST /api/v1/inventario/proveedores`
- `PATCH /api/v1/inventario/proveedores/:id`
- `PATCH /api/v1/inventario/proveedores/:id/estado`
- `GET /api/v1/inventario/materiales?idProveedor=:id`
- `POST /api/v1/inventario/materiales` con `idProveedor` o `null`
- `PUT /api/v1/inventario/materiales/:id` con `idProveedor` o `null`

## Matriz de integración Backend/SQL Server pendiente de ejecución

Estas comprobaciones requieren el Backend levantado, credenciales para cada rol y una base SQL Server de pruebas. No quedan certificadas únicamente por la suite frontend.

| Caso integrado | Resultado esperado |
|---|---|
| POST válido y consulta posterior | 201; fila persistida con campos sanitizados |
| POST sin nombre/correo inválido | 400; ninguna fila nueva |
| Nombre o identificación duplicada | 409; no se altera el registro existente |
| GET de ID inexistente | 404 |
| PATCH de datos válidos | 200; valores actualizados en `Proveedor` |
| Desactivar y consultar nuevamente | `activo = 0`; misma fila e ID, sin borrado físico |
| Reactivar | `activo = 1` |
| Asignar proveedor activo a material | FK `Material.idProveedor` guardada y objeto `proveedor` incluido |
| Asignar ID inexistente | 404/400 según contrato; FK sin cambios |
| Asignar proveedor inactivo como relación nueva | 400; FK sin cambios |
| Desactivar proveedor ya relacionado | Material conserva `idProveedor` y detalle histórico |
| Administradora en endpoints de escritura | Operación permitida |
| Secretaria/Fontanero en endpoints de escritura | 403 |
| Sin token/token inválido o vencido | 401 |

## Consultas de verificación SQL sugeridas

Ejecutar sobre una base exclusiva de QA y reemplazar los parámetros por los IDs creados durante la prueba:

```sql
SELECT id, nombre, identificacion, telefono, correo, activo, createdAt, updatedAt
FROM Proveedor
WHERE id = @idProveedor;

SELECT id, nombre, idProveedor
FROM Material
WHERE id = @idMaterial;

SELECT m.id, m.nombre AS material, p.id AS proveedorId, p.nombre AS proveedor, p.activo
FROM Material m
LEFT JOIN Proveedor p ON p.id = m.idProveedor
WHERE m.id = @idMaterial;
```

Después de desactivar, el primer `SELECT` debe devolver la misma fila con `activo = 0`; el tercero debe conservar la relación. No debe ejecutarse `DELETE` como parte del cambio de estado.

## Smoke test visual recomendado

Antes del cierre en ambiente integrado, revisar manualmente en anchos aproximados de 1440 px, 768 px y 390 px: listado, búsqueda, filtro, formularios, diálogo de desactivación, mensajes y selector con proveedor activo/inactivo histórico. Repetir los endpoints de escritura con Administradora, Secretaria, Fontanero, sin token y token vencido, verificando también la respuesta real en la pestaña Network.

## Conclusión

La parte frontend y su contrato de integración quedan aprobados por pruebas automatizadas. El cierre completo de Backend y SQL Server queda condicionado a ejecutar la matriz integrada anterior en el ambiente que contiene esos servicios y conservar la evidencia de respuestas y consultas SQL.
