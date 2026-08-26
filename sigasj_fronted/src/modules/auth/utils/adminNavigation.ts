import type { AdminNavIconName } from '../../admin-panel/components/AdminNavIcon'
import type { AdminNavItem } from '../../../app/router/privateRoutes'
import { ADMIN_BASE_PATH } from '../../../app/router/adminPaths'
import {
  LANDING_ROUTE_PATH,
} from '../../../app/router/routePaths'
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
  const userRole = normalizeInternalRole(user?.role)
  if (!userRole || allowedRoles.length === 0) {
    return false
  }

  return allowedRoles.some((allowed) => normalizeInternalRole(allowed) === userRole)
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

export function canAccessAdminRoute(
  user: AuthUser | null,
  path: string,
): boolean {
  if (!user || isAbonadoRole(user.role)) {
    return false
  }

  const module = resolveAdminModuleFromPath(path)
  if (!module) {
    return false
  }

  return canAccessAdminModule(user, module.segment)
}

export function getAllowedRolesForAdminPath(
  path: string,
): readonly InternalAdminRole[] | undefined {
  return resolveAdminModuleFromPath(path)?.allowedRoles
}

export function getAdminNavItemsForUser(user: AuthUser | null): AdminNavItem[] {
  if (!user) {
    return []
  }

  return ADMIN_MODULE_ACCESS.filter(
    (module) => module.availableInNav && canAccessAdminModule(user, module.segment),
  ).map(({ segment, title }) => ({
    path: `${ADMIN_BASE_PATH}/${segment}`,
    title,
    icon: segment,
  }))
}

/** Opciones de menú de Gestión de Abonados según el rol autenticado. */
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
