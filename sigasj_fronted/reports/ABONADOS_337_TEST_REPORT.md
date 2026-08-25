# SIGASJ — Reporte de pruebas PBI #337 (Registro de nuevos abonados)

Generado: 2026-08-25 (tarea #684 — Joshua Solorzano)

## Resumen ejecutivo

| Verificación | Resultado |
| --- | --- |
| Frontend — `abonadosTask684.test.tsx` | **9 pruebas — APROBADO** |
| Frontend — suites #340–#683 | **Referenciadas — APROBADO** |
| Backend — `abonados.registro.proceso.spec.ts` | **8 pruebas — APROBADO** |
| Backend — suites #338–#339 | **Referenciadas — APROBADO** |

## Tarea #684 — Proceso de registro

### Frontend (`abonadosTask684.test.tsx`)

| Escenario | Cobertura |
| --- | --- |
| Registro con datos válidos | Flujo listado → formulario → confirmación → consulta |
| Registro desde solicitud aprobada | Envío con `idSolicitud` y datos del servicio |
| Campos obligatorios vacíos | Validación local, sin llamada al backend |
| Cédula / NIS / medidor duplicados | Mensajes 409 del backend visibles en UI |
| Relación abonado-servicio | Payload incluye datos personales y `servicio` |
| Permisos de acceso | Rol Abonado bloqueado en `/admin/abonados/nuevo` |
| Confirmación y resumen | Nombre, cédula, NIS, medidor + acción «Registrar otro» |

### Backend (`abonados.registro.proceso.spec.ts`)

| Escenario | Cobertura |
| --- | --- |
| Registro manual | Sin marcar solicitud |
| Solicitud aprobada | Marca `utilizada` y `idAbonadoRegistrado` |
| Solicitud ya utilizada | `ConflictException`, sin transacción |
| Duplicados | Cédula, NIS y medidor rechazados antes de persistir |
| Payload incompleto | HTTP 400 (ValidationPipe) |
| Permisos | Abonado recibe HTTP 403 en POST |

## Suites relacionadas

| Tarea | Archivo |
| --- | --- |
| #338 | `solicitudes.service.spec.ts`, `solicitudes.authz.spec.ts` |
| #339 | `abonados.registro.spec.ts`, `abonados.registro.authz.spec.ts` |
| #340 | `abonadosTask340.test.tsx` |
| #341 | `abonadosTask341.test.tsx`, `abonadosApi.test.ts` |
| #683 | `abonadosTask683.test.tsx` |
| Autorización | `abonadosAuthorization.functional.test.tsx` |

## Comandos

```bash
# Frontend (desde sigasj_fronted/)
npm test -- --run abonadosTask684 abonadosTask340 abonadosTask341 abonadosTask683 abonadosApi.test

# Backend (desde Backend_SIGASJ/)
npm test -- abonados.registro.proceso.spec.ts
npm test -- abonados.registro.spec.ts abonados.registro.authz.spec.ts
```

## Criterios de aceptación (#684)

- [x] El abonado y su servicio se registran correctamente
- [x] Las solicitudes aprobadas se relacionan con el abonado
- [x] Los datos duplicados son rechazados
- [x] No quedan registros incompletos cuando ocurre un error
- [x] Solo usuarios autorizados pueden registrar abonados
- [x] La confirmación y el resumen muestran los datos correctos
- [x] Todas las pruebas quedan aprobadas
