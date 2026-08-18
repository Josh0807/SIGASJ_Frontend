import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/routePaths'
import { useAuth } from './AuthContext'

type ProtectedRouteProps = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return (
      <Navigate to={LOGIN_ROUTE_PATH} replace state={{ from: location.pathname }} />
    )
  }

  return children
}

export default ProtectedRoute
