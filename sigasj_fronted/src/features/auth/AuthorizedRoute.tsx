import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import {
  evaluateAdminAreaAccess,
  evaluateAdminRouteAccess,
} from './adminAccess'
import { useAuth } from './AuthContext'

type AuthorizedRouteProps = {
  children: ReactNode
  requiredPath?: string
}

const AuthorizedRoute = ({ children, requiredPath }: AuthorizedRouteProps) => {
  const location = useLocation()
  const { isAuthenticated, user } = useAuth()
  const path = requiredPath ?? location.pathname
  const decision = evaluateAdminRouteAccess(isAuthenticated, user, path)

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
