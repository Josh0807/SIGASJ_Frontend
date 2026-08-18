import { useMemo } from 'react'
import type { AuthUser } from '../types/authUser'
import { getAuthUser } from '../utils/authStorage'

export function useAuthUser(): AuthUser | null {
  return useMemo(() => getAuthUser(), [])
}
