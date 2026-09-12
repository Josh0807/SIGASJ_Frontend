# Reporte QA Frontend — Salidas de Inventario 4.5

Fecha: 11 de septiembre de 2026  
Resultado: **Aprobado**

## Alcance validado

- Carga del formulario y consulta de materiales activos.
- Exclusión visual de materiales inactivos o sin existencias.
- Consulta previa `GET /inventario/materiales/:id/disponibilidad?cantidad=X` con el contrato vigente.
- Registro `POST /inventario/salidas` con material, cantidad, observación y relaciones opcionales.
- Ausencia de `idUsuario` y `fontaneroId` en el body; el responsable depende del JWT.
- Conservación de `idAveria` al abrir `/admin/inventario/salidas?idAveria=42`.
- Consulta `GET /inventario/salidas/averia/:idAveria`.
- Validación de cantidades cero, negativas y decimales antes del POST.
- Mensajes para respuestas 400, 401, 403 y 404.
- Conservación de los campos ante errores corregibles.
- Bloqueo de doble envío y estado de carga.
- Confirmación con movimiento SALIDA, stock anterior y stock actualizado.
- Limpieza del formulario y recarga del catálogo después del 201.
- Acceso permitido para Fontanero y Administradora; denegado para Secretaría y usuarios sin sesión.
- Reglas responsive heredadas del módulo para escritorio, tableta y celular.

## Contratos comprobados

El POST enviado por React contiene exclusivamente:

```json
{
  "idMaterial": 4,
  "cantidad": 4,
  "idAveria": 42,
  "idSolicitud": null,
  "observacion": "Reparación"
}
```

La disponibilidad usa los campos validados por Backend: `idMaterial`, `nombreMaterial`, `disponible`, `stockActual`, `stockMinimo`, `cantidadSolicitada`, `stockResultante`, `esAgotamientoTotal`, `esBajoMinimo` y `mensaje`.

La respuesta 201 se interpreta con `mensaje`, `stockAnterior`, `stockActual`, `diferencia`, `agotadoTotal`, `bajoStockMinimo` y `movimiento`.

## Evidencia automatizada

- 4 archivos de pruebas específicas de salidas.
- 11 casos específicos aprobados.
- Compilación TypeScript y build de producción aprobados.
- ESLint sobre todo el módulo de salidas: sin errores.

## Límites de esta ejecución

Las pruebas de SQL Server, rollback transaccional y concurrencia pertenecen al Backend y Base de Datos. En esta ejecución Frontend se usaron respuestas HTTP controladas que reproducen el contrato que Backend reportó como validado; no se modificó directamente el stock desde React.
