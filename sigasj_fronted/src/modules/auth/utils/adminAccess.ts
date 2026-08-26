import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../../app/router/routePaths'
import type { AuthUser } from '../types/authUser'
import {
  canAccessAdminRoute,
  getAllowedRolesForAdminPath,
  getDefaultAdminHomePath,
  hasAnyAdminAccess,
  isInternalAdminRole,
  userHasAllowedRole,
} from './adminNavigation'
import { isAbonadoRole } from './internalRoles'

export type AdminAccessRedirect = {
  to: string
  state?: { from: string }
}

export type AdminAccessDecision = 'allow' | AdminAccessRedirect

const loginRedirect = (fromPath?: string): AdminAccessRedirect => ({
  to: LOGIN_ROUTE_PATH,
  ...(fromPath ? { state: { from: fromPath } } : {}),
})

const unauthorizedRedirect = (): AdminAccessRedirect => ({
  to: UNAUTHORIZED_ROUTE_PATH,
})

export function evaluateAdminAreaAccess(
  isAuthenticated: boolean,
  user: AuthUser | null,
): AdminAccessDecision {
  if (!isAuthenticated || !user) {
    return loginRedirect()
  }

  if (isAbonadoRole(user.role)) {
    return unauthorizedRedirect()
  }

  if (!isInternalAdminRole(user.role) || !hasAnyAdminAccess(user)) {
    return loginRedirect()
  }

  if (!getDefaultAdminHomePath(user)) {
    return unauthorizedRedirect()
  }

  return 'allow'
}

/**
 * Autorización reutilizable: sesión + roles permitidos + destino.
 * El rol proviene del usuario autenticado (AuthContext), no del JWT.
 */
export function evaluateRoleAccess(
  isAuthenticated: boolean,
  user: AuthUser | null,
  allowedRoles: readonly string[],
  fromPath?: string,
): AdminAccessDecision {
  if (!isAuthenticated || !user) {
    return loginRedirect(fromPath)
  }

  if (userHasAllowedRole(user, allowedRoles)) {
    return 'allow'
  }

  if (isInternalAdminRole(user.role) || isAbonadoRole(user.role)) {
    return unauthorizedRedirect()
  }

  return loginRedirect(fromPath)
}

/**
 * Acceso directo por URL (no usa el menú).
 */
export function evaluateDirectRouteAccess(
  isAuthenticated: boolean,
  user: AuthUser | null,
  path: string,
  allowedRoles?: readonly string[],
): AdminAccessDecision {
  if (!isAuthenticated || !user) {
    return loginRedirect(path)
  }

  if (allowedRoles && userHasAllowedRole(user, allowedRoles)) {
    return 'allow'
  }

  if (isAbonadoRole(user.role)) {
    return unauthorizedRedirect()
  }

  return evaluateAdminRouteAccess(true, user, path, allowedRoles)
}

export function evaluateAdminRouteAccess(
  isAuthenticated: boolean,
  user: AuthUser | null,
  path: string,
  allowedRoles?: readonly string[],
): AdminAccessDecision {
  if (!isAuthenticated || !user) {
    return loginRedirect(path)
  }

  if (isAbonadoRole(user.role)) {
    return unauthorizedRedirect()
  }

  const declaredRoles = allowedRoles ?? getAllowedRolesForAdminPath(path)

  if (declaredRoles && declaredRoles.length > 0) {
    const roleDecision = evaluateRoleAccess(
      true,
      user,
      declaredRoles,
      path,
    )
    if (roleDecision !== 'allow') {
      return roleDecision
    }
  } else if (!isInternalAdminRole(user.role) || !hasAnyAdminAccess(user)) {
    return loginRedirect(path)
  }

  if (!canAccessAdminRoute(user, path)) {
    return unauthorizedRedirect()
  }

  return 'allow'
}
