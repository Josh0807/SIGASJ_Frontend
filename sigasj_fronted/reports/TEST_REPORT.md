# SIGASJ Frontend — Reporte de pruebas Épica 11.4

Generado: 2026-08-17 (tarea 11.4.5 — navegación y accesos por rol)

## Resumen ejecutivo

| Verificación | Resultado |
| --- | --- |
| Suite completa (`npm run test`) | **30 archivos, 237 pruebas — APROBADO** |
| Suite por roles (`npm run test:roles`) | **3 archivos, 79 pruebas — APROBADO** |
| Build (`npm run build`) | **APROBADO** (última verificación 2026-08-16) |

## Equivalencia de roles (tarea ↔ sistema)

| Rol en la tarea | Rol técnico en SIGASJ |
| --- | --- |
| Administradora | `Administradora` |
| Secretaria Ejecutiva | `Secretaria` |
| Fontanero | `Fontanero` |

Fuente de permisos: `docs/SIGASJ_AUTHORIZATION_MODEL.md` y `src/features/auth/adminNavigation.config.ts`.

## Matriz de menú y rutas verificada

### Administradora (10 módulos)

Menú y acceso directo permitido a:

- `/admin/dashboard`
- `/admin/usuarios`
- `/admin/abonados`
- `/admin/inventario`
- `/admin/solicitudes`
- `/admin/lecturas`
- `/admin/averias`
- `/admin/reportes`
- `/admin/galeria`
- `/admin/transparencia`

### Secretaria Ejecutiva (8 módulos)

**Visible y permitido:** dashboard, abonados, inventario, solicitudes, lecturas, averías, galería, transparencia.

**Oculto y bloqueado (URL directa → `/unauthorized`):**

- `/admin/usuarios`
- `/admin/reportes`

### Fontanero (2 módulos)

**Visible y permitido:** dashboard, averías.

**Oculto y bloqueado (URL directa → `/unauthorized`):** usuarios, abonados, inventario, solicitudes, lecturas, reportes, galería, transparencia.

## Criterios de aceptación (11.4.5)

| Criterio | Estado | Evidencia |
| --- | --- | --- |
| Cada rol visualiza únicamente sus opciones | ✅ | `adminRoleAccess.test.tsx`, `roleAccessMatrix.test.ts` |
| Los accesos permitidos funcionan | ✅ | 22 pruebas de acceso directo permitido por rol |
| Los accesos restringidos son rechazados | ✅ | 18 pruebas de bloqueo → `/unauthorized` |
| Pantalla de acceso no autorizado funciona | ✅ | Mensaje + enlace “Volver al panel” |
| Backend rechaza operaciones no permitidas | ✅* | Contrato de permisos + propagación HTTP 403 |
| Las pruebas quedan aprobadas | ✅ | 237/237 passing |

\* El workspace actual no incluye el código del Back-end NestJS. Las pruebas verifican:

1. **Contrato de permisos** alineado a SIGASJ (`backendRoleAuthorization.test.ts`).
2. **Propagación de HTTP 403** en el cliente (`requestJson` → `ApiError`).
3. **Módulo Transparencia admin** ya incluye prueba de 403 (`adminTransparencia.test.ts`).

Pendiente manual con Back-end en ejecución: llamar endpoints protegidos con token de Fontanero/Secretaria y confirmar 403 real vía `POST /api/auth/dev-token`.

## Archivos de prueba (11.4.5)

| Archivo | Qué valida |
| --- | --- |
| `src/test/roleAccessFixtures.ts` | Matriz esperada por rol |
| `src/features/auth/roleAccessMatrix.test.ts` | Menú, rutas y permisos (unitario) |
| `src/routes/adminRoleAccess.test.tsx` | Integración router + sidebar + guards |
| `src/features/auth/backendRoleAuthorization.test.ts` | Contrato Backend + HTTP 403 |

## Comandos

```bash
cd sigasj_fronted
npm run test:roles   # solo pruebas 11.4.5
npm run test         # suite completa
npm run build
```

## Prueba manual recomendada (con Back-end)

1. Levantar Back-end y Front-end (`npm run dev`).
2. Ir a `/login` y entrar como cada rol interno.
3. Confirmar menú lateral según matriz anterior.
4. Probar URL directa prohibida (p. ej. Fontanero → `/admin/abonados`).
5. Verificar que la API responde 403 en operaciones fuera de permiso.

## Dependencias cumplidas

- Tareas 11.4.1 a 11.4.4 implementadas.
- Usuarios de prueba vía `POST /api/auth/dev-token` con rol seleccionado en login.
