import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { useIsAuthenticated } from '../hooks/useIsAuthenticated'

type ProtectedRouteProps = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation()
  const authenticated = useIsAuthenticated()

  if (!authenticated) {
    return (
      <Navigate to={LOGIN_ROUTE_PATH} replace state={{ from: location.pathname }} />
    )
  }

  return children
}

export default ProtectedRoute
