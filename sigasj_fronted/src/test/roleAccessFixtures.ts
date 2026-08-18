import type { InternalAdminRole } from '../modules/auth/utils/internalRoles'
import { ADMIN_MODULE_ACCESS } from '../modules/auth/config/adminNavigation.config'
import { ADMIN_BASE_PATH } from '../app/router/privateRoutes'

/** En SIGASJ el rol técnico es `Secretaria` (equivalente a “Secretaria Ejecutiva” en la tarea). */
export const ROLE_TASK_LABELS: Record<InternalAdminRole, string> = {
  Administradora: 'Administradora',
  Secretaria: 'Secretaria Ejecutiva',
  Fontanero: 'Fontanero',
}

export const ALL_ADMIN_MODULE_PATHS = ADMIN_MODULE_ACCESS.filter(
  (module) => module.availableInNav,
).map((module) => `${ADMIN_BASE_PATH}/${module.segment}`)

const pathsForRoles = (...roles: InternalAdminRole[]) =>
  ADMIN_MODULE_ACCESS.filter(
    (module) =>
      module.availableInNav &&
      module.allowedRoles.some((role) => roles.includes(role)),
  ).map((module) => `${ADMIN_BASE_PATH}/${module.segment}`)

export const EXPECTED_NAV_PATHS: Record<InternalAdminRole, readonly string[]> = {
  Administradora: pathsForRoles('Administradora'),
  Secretaria: pathsForRoles('Secretaria'),
  Fontanero: pathsForRoles('Fontanero'),
}

export const EXPECTED_BLOCKED_PATHS: Record<
  InternalAdminRole,
  readonly string[]
> = {
  Administradora: [],
  Secretaria: ALL_ADMIN_MODULE_PATHS.filter(
    (path) => !EXPECTED_NAV_PATHS.Secretaria.includes(path),
  ),
  Fontanero: ALL_ADMIN_MODULE_PATHS.filter(
    (path) => !EXPECTED_NAV_PATHS.Fontanero.includes(path),
  ),
}

export const INTERNAL_ROLES_UNDER_TEST: InternalAdminRole[] = [
  'Administradora',
  'Secretaria',
  'Fontanero',
]

export const SAMPLE_ALLOWED_CONTENT: Record<string, string> = {
  '/admin/dashboard': 'Dashboard administrativo',
  '/admin/usuarios': 'Gestión de usuarios',
  '/admin/abonados': 'Gestión de abonados',
  '/admin/inventario': 'Gestión de inventario',
  '/admin/solicitudes': 'Gestión de solicitudes',
  '/admin/lecturas': 'Gestión de lecturas',
  '/admin/averias': 'Gestión de averías',
  '/admin/reportes': 'Gestión de reportes',
  '/admin/galeria': 'Galería de fotografías',
  '/admin/transparencia': 'Transparencia y calidad del agua',
}
