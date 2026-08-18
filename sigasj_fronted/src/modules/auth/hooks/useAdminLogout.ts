import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH } from '../../../app/router/publicRoutes'
import { clearAccessToken } from '../utils/authStorage'

export function useAdminLogout() {
  const navigate = useNavigate()

  return useCallback(() => {
    clearAccessToken()
    navigate(LOGIN_ROUTE_PATH, { replace: true })
  }, [navigate])
}
