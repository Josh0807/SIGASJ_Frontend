import type { AdminNavIconName } from '../../admin-panel/components/AdminNavIcon'
import type { AdminNavItem } from '../../../app/router/privateRoutes'
import { ADMIN_BASE_PATH } from '../../../app/router/privateRoutes'
import { LANDING_ROUTE_PATH } from '../../../app/router/routePaths'
import {
  ADMIN_MODULE_ACCESS,
  ADMIN_MODULE_ACCESS_BY_SEGMENT,
  ROLE_PERMISSIONS,
} from '../config/adminNavigation.config'
import type { AuthUser } from '../types/authUser'
import {
  INTERNAL_ADMIN_ROLES,
  isInternalAdminRole,
  normalizeInternalRole,
  type InternalAdminRole,
} from './internalRoles'

export { isInternalAdminRole, normalizeInternalRole }
export { INTERNAL_ADMIN_ROLES, type InternalAdminRole }

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
  const role = normalizeInternalRole(user?.role)
  if (!user || !role) {
    return false
  }

  const module = ADMIN_MODULE_ACCESS_BY_SEGMENT[segment]
  if (!module.allowedRoles.includes(role)) {
    return false
  }

  return userHasPermissions(user, module.requiredPermissions)
}

const normalizeAdminPath = (path: string): string =>
  path.replace(/\/+$/, '') || '/'

const ADMIN_MODULE_BY_PATH = new Map(
  ADMIN_MODULE_ACCESS.map((module) => [
    `${ADMIN_BASE_PATH}/${module.segment}`,
    module,
  ]),
)

export function canAccessAdminRoute(
  user: AuthUser | null,
  path: string,
): boolean {
  if (!user) {
    return false
  }

  const module = ADMIN_MODULE_BY_PATH.get(normalizeAdminPath(path))
  if (!module) {
    return false
  }

  return canAccessAdminModule(user, module.segment)
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
  if (requestedPath && canAccessAdminRoute(user, requestedPath)) {
    return requestedPath
  }

  return getDefaultAdminHomePath(user) ?? LANDING_ROUTE_PATH
}
