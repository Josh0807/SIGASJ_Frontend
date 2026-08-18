import { useSyncExternalStore } from 'react'
import { isAuthenticated, subscribeAuthUser } from '../utils/authStorage'

export function useIsAuthenticated(): boolean {
  return useSyncExternalStore(subscribeAuthUser, isAuthenticated, isAuthenticated)
}
