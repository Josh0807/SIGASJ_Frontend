import { useSyncExternalStore } from 'react'
import type { AuthUser } from '../types/authUser'
import { getAuthUser, subscribeAuthUser } from '../utils/authStorage'

export function useAuthUser(): AuthUser | null {
  return useSyncExternalStore(subscribeAuthUser, getAuthUser, getAuthUser)
}
