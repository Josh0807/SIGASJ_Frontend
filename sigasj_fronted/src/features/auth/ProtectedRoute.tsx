import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { LOGIN_ROUTE_PATH } from '../../routes/routePaths'

type ProtectedRouteProps = {
  children: ReactNode
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_ROUTE_PATH} replace state={{ from: location.pathname }} />
  }

  return children
}

export default ProtectedRoute
