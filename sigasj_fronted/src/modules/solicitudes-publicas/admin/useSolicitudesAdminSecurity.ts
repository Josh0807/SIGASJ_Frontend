import { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/routePaths'
import { useAuth } from '../../auth/components/AuthContext'

export const solicitudesAdminHttpStatus = (error: unknown) => {
  if (!(error instanceof Error)) return null
  const match = error.message.match(/^HTTP\s+(401|403)\b/)
  return match ? Number(match[1]) as 401 | 403 : null
}

export const useSolicitudesAdminSecurity = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  return useCallback((error: unknown) => {
    const status = solicitudesAdminHttpStatus(error)
    if (status === 401) {
      logout()
      navigate(LOGIN_ROUTE_PATH, {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}`,
          message: 'Su sesión ha expirado. Por favor inicie sesión nuevamente.',
        },
      })
      return true
    }
    if (status === 403) {
      navigate(UNAUTHORIZED_ROUTE_PATH, { replace: true })
      return true
    }
    return false
  }, [location.pathname, location.search, logout, navigate])
}
