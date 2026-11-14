import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { AuthUser } from '../types/authUser'
import { fetchCurrentUser } from '../services/authApi'
import { normalizeInternalRole } from '../utils/internalRoles'
import {
  clearAuthSession,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAuthSession,
  setAuthUser,
  subscribeAuthUser,
} from '../utils/authStorage'

export type AuthSession = {
  accessToken: string
  user: AuthUser
}

type AuthContextValue = {
  user: AuthUser | null
  isAuthenticated: boolean
  /** True mientras se valida la sesión local contra /auth/me. */
  isLoading: boolean
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

const mapMeToAuthUser = (me: {
  id: string | number
  email: string
  role: string
  name?: string
}): AuthUser => {
  const rawRole = typeof me.role === 'string' ? me.role.trim() : ''
  const normalizedRole = normalizeInternalRole(rawRole)

  return {
    id: String(me.id).trim(),
    email: typeof me.email === 'string' ? me.email.trim() : undefined,
    role: normalizedRole ?? rawRole,
    name:
      typeof me.name === 'string' && me.name.trim() ? me.name.trim() : 'Usuario',
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const snapshot = useSyncExternalStore(
    subscribeToAuth,
    getAuthSnapshot,
    getAuthSnapshot,
  )
  const [isLoading, setIsLoading] = useState(() =>
    Boolean(getAccessToken()?.trim()),
  )

  useEffect(() => {
    let cancelled = false
    const token = getAccessToken()?.trim()
    if (!token) {
      setIsLoading(false)
      return
    }

    void (async () => {
      try {
        const me = await fetchCurrentUser()
        if (cancelled) return
        setAuthUser(mapMeToAuthUser(me))
      } catch (error) {
        if (cancelled) return
        const isUnauthorized =
          error instanceof Error && /^HTTP 401:/.test(error.message)
        clearAuthSession(isUnauthorized ? 'expired' : undefined)
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback((session: AuthSession) => {
    setAuthSession(session)
    setIsLoading(false)
  }, [])

  const logout = useCallback(() => {
    clearAuthSession()
    setIsLoading(false)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user: snapshot.user,
      isAuthenticated: snapshot.authenticated,
      isLoading,
      login,
      logout,
    }),
    [isLoading, login, logout, snapshot.authenticated, snapshot.user],
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
