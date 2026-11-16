import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { evaluateAdminAreaAccess, evaluateDirectRouteAccess } from '../utils/adminAccess'
import { useAuth } from './AuthContext'

type AuthorizedRouteProps = {
  children: ReactNode
  /** Canonical group path (for example, `/admin/abonados`). */
  requiredPath?: string
  /** Roles allowed to view the group. Route config is used when omitted. */
  allowedRoles?: readonly string[]
}

const AuthorizedRoute = ({ children, requiredPath, allowedRoles }: AuthorizedRouteProps) => {
  const location = useLocation()
  const { isAuthenticated, isLoading, user } = useAuth()

  // Do not authorize local data until /auth/me confirms the user and role.
  if (isLoading) return null

  const path = requiredPath ?? location.pathname
  const decision = evaluateDirectRouteAccess(isAuthenticated, user, path, allowedRoles)

  if (decision !== 'allow') {
    return <Navigate to={decision.to} replace state={decision.state} />
  }

  return children
}

export default AuthorizedRoute

export function AdminAreaGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth()

  if (isLoading) return null

  const decision = evaluateAdminAreaAccess(isAuthenticated, user)
  if (decision !== 'allow') {
    return <Navigate to={decision.to} replace state={decision.state} />
  }

  return children
}
