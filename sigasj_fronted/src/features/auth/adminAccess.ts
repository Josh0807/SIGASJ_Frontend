import {
  LOGIN_ROUTE_PATH,
  UNAUTHORIZED_ROUTE_PATH,
} from '../../routes/routePaths'
import {
  canAccessAdminRoute,
  getDefaultAdminHomePath,
  hasAnyAdminAccess,
  isInternalAdminRole,
} from './adminNavigation'
import type { AuthUser } from './auth.types'

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

  if (!isInternalAdminRole(user.rol) || !hasAnyAdminAccess(user)) {
    return loginRedirect()
  }

  if (!getDefaultAdminHomePath(user)) {
    return unauthorizedRedirect()
  }

  return 'allow'
}

export function evaluateAdminRouteAccess(
  isAuthenticated: boolean,
  user: AuthUser | null,
  path: string,
): AdminAccessDecision {
  if (!isAuthenticated || !user) {
    return loginRedirect(path)
  }

  if (!isInternalAdminRole(user.rol) || !hasAnyAdminAccess(user)) {
    return loginRedirect(path)
  }

  if (!canAccessAdminRoute(user, path)) {
    return unauthorizedRedirect()
  }

  return 'allow'
}
