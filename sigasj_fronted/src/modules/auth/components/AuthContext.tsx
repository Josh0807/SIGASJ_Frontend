import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../types/authUser'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAuthSession,
  subscribeAuthUser,
} from '../utils/authStorage'

export type AuthSession = {
  accessToken: string
  user: AuthUser
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (session: AuthSession) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

type AuthSnapshot = {
  user: AuthUser | null
  authenticated: boolean
}

let cachedSnapshot: AuthSnapshot | null = null
let cachedSnapshotKey = ''

const buildSnapshotKey = (): string => {
  const token = getAccessToken()?.trim() ?? ''
  const user = getAuthUser()
  return `${token}|${user?.id ?? ''}|${user?.role ?? ''}`
}

const invalidateAuthSnapshot = () => {
  cachedSnapshotKey = ''
  cachedSnapshot = null
}

const getAuthSnapshot = (): AuthSnapshot => {
  const nextKey = buildSnapshotKey()
  if (cachedSnapshot && cachedSnapshotKey === nextKey) {
    return cachedSnapshot
  }

  cachedSnapshotKey = nextKey
  cachedSnapshot = {
    user: getAuthUser(),
    authenticated: isAuthenticated(),
  }
  return cachedSnapshot
}

const subscribeToAuth = (onStoreChange: () => void) =>
  subscribeAuthUser(() => {
    invalidateAuthSnapshot()
    onStoreChange()
  })

export function AuthProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getAuthSnapshot,
  )

  const login = useCallback((session: AuthSession) => {
    setAuthSession(session)
  }, [])

  const logout = useCallback(() => {
    clearAccessToken()
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: snapshot.user,
      isAuthenticated: snapshot.authenticated,
      login,
      logout,
    }),
    [login, logout, snapshot.authenticated, snapshot.user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider')
  }

  return context
}
