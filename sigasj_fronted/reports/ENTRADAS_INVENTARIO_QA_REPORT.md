# Certificación QA — Registro de entradas de materiales (Backlog 4.4)

Fecha: 2026-09-11

## Alcance

Validación del formulario, contrato HTTP, autorización, relación con materiales/proveedores, respuesta enriquecida, documentos y manejo seguro de resultados parciales. Las pruebas de este repositorio verifican el comportamiento frontend. La atomicidad y persistencia SQL Server se documentan con base en la evidencia Backend suministrada y deben conservarse junto con la ejecución de su suite.

## Resultado frontend automatizado

Comandos de evidencia:

```text
npm.cmd test -- --run src/modules/inventario
npx.cmd eslint src/modules/inventario
npm.cmd run build
```

| Área | Verificación | Resultado |
|---|---|---|
| Formulario | Material, unidad derivada, cantidad, proveedor y observación | Aprobado |
| Catálogos | Materiales y proveedores consultados con `activo=true` | Aprobado |
| Cantidad | Rechaza vacío, cero, negativos y decimales | Aprobado |
| Payload | Envía ID, cantidad, proveedor opcional y observación; nunca stock | Aprobado |
| Envío | POST autenticado y prevención de doble envío | Aprobado |
| Respuesta | Muestra mensaje Backend, movimiento y stock anterior/actual | Aprobado |
| Estado | Conserva datos tras 400 y limpia después de 201 | Aprobado |
| Errores | Manejo de 400, 401, 403 y 404; logout ante 401 | Aprobado |
| Seguridad de ruta | Administradora permitida; Secretaria, Fontanero, Abonado y anónimo denegados | Aprobado |
| Documentos | Selección múltiple, quitar, formatos, MIME y máximo 10 MB | Aprobado |
| Multipart | Campo `archivo`, sin `Content-Type` manual, asociado a `movimiento.id` | Aprobado |
| Fallo documental | Reintenta sobre el mismo movimiento sin duplicar la entrada | Aprobado |
| Referencias | Rechaza URL externa y path traversal antes de enviar JWT | Aprobado |
| Responsive | Formulario a una columna bajo 760 px y controles adaptables | Aprobado por reglas estructurales |

## Contratos cubiertos

- `GET /api/v1/inventario/materiales?activo=true`
- `GET /api/v1/inventario/proveedores?activo=true`
- `POST /api/v1/inventario/entradas`
- `POST /api/v1/inventario/entradas/:movimientoId/documentos`
- `GET /api/v1/inventario/entradas/:movimientoId/documentos`
- Descarga autenticada desde `rutaReferenciaArchivo`

El frontend utiliza `response.movimiento.id`, `response.movimiento.tipo`, `response.stockAnterior`, `response.stockActual` y `response.mensaje`. No calcula `stockActual`, no envía `idUsuario` y no escribe directamente en Material.

## Evidencia Backend y SQL Server suministrada

El equipo Backend reporta como cubiertos:

- Transacción única para actualizar `Material.stockActual` e insertar `MovimientoInventario`.
- Rollback de ambas operaciones ante cualquier fallo.
- Acumulación correcta de entradas consecutivas.
- Movimiento con tipo `ENTRADA`, material, cantidad, fecha, usuario JWT, proveedor y observación.
- Rechazo de material/proveedor inexistente o inactivo.
- RBAC exclusivo de escritura para `ADMINISTRADORA`.
- Documentos relacionados con el movimiento, sin modificar existencias.
- Validación binaria, formatos permitidos y límite de 10 MB.

Estas garantías pertenecen a la suite Backend/SQL Server informada; los mocks frontend no sustituyen una prueba transaccional de base de datos.

## Matriz integrada de cierre

| Escenario | API/SQL esperado |
|---|---|
| Stock 20 + entrada 15 | 201, `stockAnterior=20`, `stockActual=35`, un movimiento ENTRADA por 15 |
| Entradas sucesivas +10, +25, +5 | Incremento total 40 y tres movimientos relacionados |
| Cantidad 0, negativa o decimal | 400; stock y movimientos sin cambios |
| Sin material | 400; sin cambios |
| Material/proveedor inexistente | 404; sin cambios |
| Material/proveedor inactivo | 400; sin cambios |
| Fallo al guardar movimiento | Rollback; stock original y ningún movimiento nuevo |
| Fallo al actualizar stock | Rollback; ningún movimiento nuevo |
| Documento válido | 201; FK al movimiento exacto; stock sin cambios |
| Documento inválido o >10 MB | 400; sin documento; entrada/stock previamente confirmados permanecen |
| Escritura Secretaria/Fontanero/Abonado | 403 |
| Sin JWT/JWT inválido o vencido | 401 |

## Consultas SQL de verificación

Usar una base exclusiva de QA y los IDs devueltos por el API:

```sql
SELECT id, nombre, stockActual
FROM Material
WHERE id = @idMaterial;

SELECT id, tipo, cantidad, fechaMovimiento, observacion,
       idMaterial, idUsuario, idProveedor, createdAt
FROM MovimientoInventario
WHERE id = @idMovimiento;

SELECT id, nombreOriginal, tipoArchivo, tamanio, idMovimiento, createdAt
FROM DocumentoMovimientoInventario
WHERE idMovimiento = @idMovimiento;
```

Para probar rollback, capturar stock y conteo de movimientos antes de inducir el fallo y repetir ambas consultas después. Los valores deben permanecer idénticos.

## Smoke test visual

Ejecutar con Backend real y sesiones de cada rol en 1440 px, 768 px y 390 px. Verificar teclado, mensajes, bloqueo durante envío, archivos seleccionados, reintento documental y pestaña Network. Confirmar que solo existe un POST de entrada frente a doble clic o fallo posterior de adjuntos.

## Conclusión

El frontend del Backlog 4.4 queda cubierto funcionalmente y preparado para integración real. El cierre integral se sustenta en la suite Backend/SQL Server reportada más la ejecución frontend documentada aquí; cualquier certificación de atomicidad debe conservar evidencia de la prueba transaccional Backend, no solo capturas de la interfaz.
