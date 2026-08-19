import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  evaluateAdminAreaAccess,
  evaluateDirectRouteAccess,
} from '../utils/adminAccess'
import { useAuth } from './AuthContext'

type AuthorizedRouteProps = {
  children: ReactNode
  /** Ruta canónica del grupo (p. ej. `/admin/abonados`). */
  requiredPath?: string
  /** Roles que pueden ver este grupo. Si se omite, se leen de la config por ruta. */
  allowedRoles?: readonly string[]
}

const AuthorizedRoute = ({
  children,
  requiredPath,
  allowedRoles,
}: AuthorizedRouteProps) => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const path = requiredPath ?? location.pathname
  const decision = evaluateDirectRouteAccess(
    isAuthenticated,
    user,
    path,
    allowedRoles,
  )

  if (decision !== 'allow') {
    return <Navigate to={decision.to} replace state={decision.state} />
  }

  return children
}

export default AuthorizedRoute

export function AdminAreaGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth()
  const decision = evaluateAdminAreaAccess(isAuthenticated, user)

  if (decision !== 'allow') {
    return <Navigate to={decision.to} replace state={decision.state} />
  }

  return children
}
