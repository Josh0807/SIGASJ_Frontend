import type { AdminNavIconName } from '../../admin-panel/components/AdminNavIcon'
import type { AdminNavItem } from '../../../app/router/privateRoutes'
import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'
import {
  LANDING_ROUTE_PATH,
} from '../../../app/router/routePaths'
import {
  FONTANERO_AVERIAS_PATH,
  FONTANERO_AVERIAS_TITLE,
  isFontaneroAveriasPath,
} from '../../averias/fontanero/averiasFontaneroPaths'
import {
  FONTANERO_MIS_SOLICITUDES_PATH,
  FONTANERO_MIS_SOLICITUDES_TITLE,
  FONTANERO_SOLICITAR_PERMISO_PATH,
  FONTANERO_SOLICITAR_PERMISO_TITLE,
  FONTANERO_SOLICITAR_VACACIONES_PATH,
  FONTANERO_SOLICITAR_VACACIONES_TITLE,
  isFontaneroMisSolicitudesPath,
  isFontaneroSolicitarAusenciaPath,
  isSolicitudesAusenciaAdminPath,
} from '../../solicitudes-ausencia/solicitudesAusenciaPaths'
import {
  FONTANERO_MI_SALDO_PATH,
  FONTANERO_MI_SALDO_TITLE,
  isFontaneroMiSaldoPath,
  normalizeRrhhAdminPath,
} from '../../recursos-humanos/recursosHumanosPaths'
import {
  ADMIN_MODULE_ACCESS,
  ADMIN_MODULE_ACCESS_BY_SEGMENT,
  ROLE_PERMISSIONS,
} from '../config/adminNavigation.config'
import type { AuthUser } from '../types/authUser'
import {
  INTERNAL_ADMIN_ROLES,
  InternalAdminRoleName,
  isInternalAdminRole,
  normalizeInternalRole,
  type InternalAdminRole,
  ABONADO_ROLE,
  isAbonadoRole,
} from './internalRoles'

export {
  isInternalAdminRole,
  normalizeInternalRole,
  InternalAdminRoleName,
  isAbonadoRole,
}
export { INTERNAL_ADMIN_ROLES, type InternalAdminRole, ABONADO_ROLE }

export function getPermissionsForRole(role: string): readonly string[] {
  const normalized = normalizeInternalRole(role)
  if (!normalized) {
    return []
  }

  return ROLE_PERMISSIONS[normalized]
}

export function userHasPermissions(
  user: AuthUser,
  requiredPermissions: readonly string[],
): boolean {
  if (requiredPermissions.length === 0) {
    return true
  }

  const granted = new Set(getPermissionsForRole(user.role ?? ''))
  return requiredPermissions.every((permission) => granted.has(permission))
}

export function canAccessAdminModule(
  user: AuthUser | null,
  segment: AdminNavIconName,
): boolean {
  if (!user) {
    return false
  }

  const module = ADMIN_MODULE_ACCESS_BY_SEGMENT[segment]
  if (!userHasAllowedRole(user, module.allowedRoles)) {
    return false
  }

  return userHasPermissions(user, module.requiredPermissions)
}

/** Comprueba el rol del usuario autenticado contra una lista declarada. No usa JWT. */
export function userHasAllowedRole(
  user: AuthUser | null,
  allowedRoles: readonly string[],
): boolean {
  if (!user?.role || allowedRoles.length === 0) {
    return false
  }

  const normalizedUserRole = user.role.trim().toLowerCase()
  return allowedRoles.some((allowed) => allowed.trim().toLowerCase() === normalizedUserRole)
}

const normalizeAdminPath = (path: string): string =>
  path.replace(/\/+$/, '') || '/'

const ADMIN_MODULE_BY_PATH = new Map(
  ADMIN_MODULE_ACCESS.map((module) => [
    `${ADMIN_BASE_PATH}/${module.segment}`,
    module,
  ]),
)

function resolveAdminModuleFromPath(path: string) {
  const normalized = normalizeAdminPath(path)
  const exact = ADMIN_MODULE_BY_PATH.get(normalized)
  if (exact) {
    return exact
  }

  let matchedPath = ''
  for (const modulePath of ADMIN_MODULE_BY_PATH.keys()) {
    if (
      normalized.startsWith(`${modulePath}/`) &&
      modulePath.length > matchedPath.length
    ) {
      matchedPath = modulePath
    }
  }

  return matchedPath ? ADMIN_MODULE_BY_PATH.get(matchedPath) : undefined
}

/**
 * Subrutas de inventario con roles más estrictos que el módulo padre.
 * Alineado con InventarioRoutes (AuthorizedRoute anidados).
 */
function resolveInventarioPathRoles(
  path: string,
): readonly InternalAdminRole[] | undefined {
  const normalized = normalizeAdminPath(path)
  if (
    normalized !== `${ADMIN_BASE_PATH}/inventario` &&
    !normalized.startsWith(`${ADMIN_BASE_PATH}/inventario/`)
  ) {
    return undefined
  }

  if (normalized.startsWith(`${ADMIN_BASE_PATH}/inventario/solicitudes-materiales`)) {
    return [InternalAdminRoleName.Fontanero]
  }

  if (normalized.startsWith(`${ADMIN_BASE_PATH}/inventario/salidas`)) {
    return [InternalAdminRoleName.Administradora, InternalAdminRoleName.Fontanero]
  }

  const adminOnlyPrefixes = [
    `${ADMIN_BASE_PATH}/inventario/alertas-reposicion`,
    `${ADMIN_BASE_PATH}/inventario/reposiciones`,
    `${ADMIN_BASE_PATH}/inventario/recepciones`,
    `${ADMIN_BASE_PATH}/inventario/movimientos`,
    `${ADMIN_BASE_PATH}/inventario/reportes`,
    `${ADMIN_BASE_PATH}/inventario/imprimir`,
    `${ADMIN_BASE_PATH}/inventario/entradas`,
    `${ADMIN_BASE_PATH}/inventario/solicitudes`,
    `${ADMIN_BASE_PATH}/inventario/proveedores/nuevo`,
    `${ADMIN_BASE_PATH}/inventario/materiales/nuevo`,
    `${ADMIN_BASE_PATH}/inventario/categorias/nueva`,
  ] as const

  if (
    adminOnlyPrefixes.some(
      (prefix) => normalized === prefix || normalized.startsWith(`${prefix}/`),
    ) ||
    /\/proveedores\/\d+\/editar$/.test(normalized) ||
    /\/materiales\/\d+\/editar$/.test(normalized) ||
    /\/categorias\/\d+\/editar$/.test(normalized)
  ) {
    return [InternalAdminRoleName.Administradora]
  }

  return [
    InternalAdminRoleName.Administradora,
    InternalAdminRoleName.Secretaria,
    InternalAdminRoleName.Fontanero,
  ]
}

export function canAccessAdminRoute(
  user: AuthUser | null,
  path: string,
): boolean {
  if (!user || isAbonadoRole(user.role)) {
    return false
  }

  const resolvedPath = normalizeRrhhAdminPath(path)

  if (
    isFontaneroAveriasPath(resolvedPath) ||
    isFontaneroSolicitarAusenciaPath(resolvedPath) ||
    isFontaneroMisSolicitudesPath(resolvedPath) ||
    isFontaneroMiSaldoPath(resolvedPath)
  ) {
    return userHasAllowedRole(user, [InternalAdminRoleName.Fontanero])
  }

  if (isSolicitudesAusenciaAdminPath(resolvedPath)) {
    return userHasAllowedRole(user, [InternalAdminRoleName.Administradora])
  }

  const inventarioRoles = resolveInventarioPathRoles(resolvedPath)
  if (inventarioRoles) {
    return (
      userHasAllowedRole(user, inventarioRoles) &&
      canAccessAdminModule(user, 'inventario')
    )
  }

  const module = resolveAdminModuleFromPath(resolvedPath)
  if (!module || module.availableAsRoute === false) {
    return false
  }

  return canAccessAdminModule(user, module.segment)
}

export function getAllowedRolesForAdminPath(
  path: string,
): readonly InternalAdminRole[] | undefined {
  const resolvedPath = normalizeRrhhAdminPath(path)

  if (
    isFontaneroAveriasPath(resolvedPath) ||
    isFontaneroSolicitarAusenciaPath(resolvedPath) ||
    isFontaneroMisSolicitudesPath(resolvedPath) ||
    isFontaneroMiSaldoPath(resolvedPath)
  ) {
    return [InternalAdminRoleName.Fontanero]
  }

  if (isSolicitudesAusenciaAdminPath(resolvedPath)) {
    return [InternalAdminRoleName.Administradora]
  }

  const inventarioRoles = resolveInventarioPathRoles(resolvedPath)
  if (inventarioRoles) {
    return inventarioRoles
  }

  const module = resolveAdminModuleFromPath(resolvedPath)
  if (!module || module.availableAsRoute === false) {
    return undefined
  }

  return module.allowedRoles
}

export function getAdminNavItemsForUser(user: AuthUser | null): AdminNavItem[] {
  if (!user) {
    return []
  }

  const items = ADMIN_MODULE_ACCESS.filter(
    (module) => module.availableInNav && canAccessAdminModule(user, module.segment),
  ).map(({ segment, title }) => ({
    path: `${ADMIN_BASE_PATH}/${segment}`,
    title,
    icon: segment,
  }))

  if (userHasAllowedRole(user, [InternalAdminRoleName.Fontanero])) {
    items.push({
      path: FONTANERO_AVERIAS_PATH,
      title: FONTANERO_AVERIAS_TITLE,
      icon: 'averias',
    })
    items.push({
      path: FONTANERO_SOLICITAR_PERMISO_PATH,
      title: FONTANERO_SOLICITAR_PERMISO_TITLE,
      icon: 'rrhh',
    })
    items.push({
      path: FONTANERO_SOLICITAR_VACACIONES_PATH,
      title: FONTANERO_SOLICITAR_VACACIONES_TITLE,
      icon: 'rrhh',
    })
    items.push({
      path: FONTANERO_MIS_SOLICITUDES_PATH,
      title: FONTANERO_MIS_SOLICITUDES_TITLE,
      icon: 'rrhh',
    })
    items.push({
      path: FONTANERO_MI_SALDO_PATH,
      title: FONTANERO_MI_SALDO_TITLE,
      icon: 'rrhh',
    })
  }

  return items
}

/** Opciones de menú de Gestión de asociados según el rol autenticado. */
export function getAbonadosNavItemsForUser(user: AuthUser | null): AdminNavItem[] {
  return getAdminNavItemsForUser(user).filter(
    (item) => item.path === `${ADMIN_BASE_PATH}/abonados`,
  )
}

export function getDefaultAdminHomePath(user: AuthUser | null): string | null {
  const navItems = getAdminNavItemsForUser(user)
  return navItems[0]?.path ?? null
}

export function hasAnyAdminAccess(user: AuthUser | null): boolean {
  return getAdminNavItemsForUser(user).length > 0
}

/** Evita redirigir a rutas no permitidas tras iniciar sesión. */
export function resolvePostLoginAdminPath(
  user: AuthUser,
  requestedPath?: string,
): string {
  if (isAbonadoRole(user.role)) {
    return LANDING_ROUTE_PATH
  }

  if (requestedPath && canAccessAdminRoute(user, requestedPath)) {
    return requestedPath
  }

  return getDefaultAdminHomePath(user) ?? LANDING_ROUTE_PATH
}
