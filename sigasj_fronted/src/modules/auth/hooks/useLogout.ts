import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/publicRoutes'
import { useAuth } from '../components/AuthContext'

/** Logout reutilizable para cualquier superficie privada interna. */
export function useLogout() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return useCallback(() => {
    logout()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [logout, navigate])
}
