import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useIsAuthenticated } from '../hooks/useIsAuthenticated'

type ProtectedRouteProps = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation()
  const authenticated = useIsAuthenticated()

  if (!authenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
