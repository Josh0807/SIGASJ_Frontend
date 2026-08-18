import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { clearAccessToken } from '../utils/authStorage'

export function useAdminLogout() {
  const navigate = useNavigate()

  return useCallback(() => {
    clearAccessToken()
    navigate('/login', { replace: true })
  }, [navigate])
}
