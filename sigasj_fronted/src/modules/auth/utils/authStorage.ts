import type { AuthUser } from '../types/authUser'
import { normalizeInternalRole } from './internalRoles'

export type AuthSession = {
  accessToken: string
  user: AuthUser
}

const TOKEN_STORAGE_KEY = 'sigasj_access_token'
const USER_STORAGE_KEY = 'sigasj_auth_user'

type AuthUserListener = () => void
const authUserListeners = new Set<AuthUserListener>()

const notifyAuthUserChange = (): void => {
  authUserListeners.forEach((listener) => {
    listener()
  })
}

export function subscribeAuthUser(listener: AuthUserListener): () => void {
  authUserListeners.add(listener)

  return () => {
    authUserListeners.delete(listener)
  }
}

const isPresent = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const sanitizeAuthUser = (value: unknown): AuthUser | null => {
  if (!value || typeof value !== 'object') {
    return null
  }

  const candidate = value as Record<string, unknown>
  const user: AuthUser = {}

  if (isPresent(candidate.id)) {
    user.id = candidate.id.trim()
  }

  if (isPresent(candidate.name)) {
    user.name = candidate.name.trim()
  }

  if (isPresent(candidate.lastName)) {
    user.lastName = candidate.lastName.trim()
  }

  if (isPresent(candidate.email)) {
    user.email = candidate.email.trim()
  }

  if (isPresent(candidate.role)) {
    const normalizedRole = normalizeInternalRole(candidate.role)
    user.role = normalizedRole ?? candidate.role.trim()
  }

  if (isPresent(candidate.avatar)) {
    user.avatar = candidate.avatar.trim()
  }

  return Object.keys(user).length > 0 ? user : null
}

let cachedAuthUser: AuthUser | null = null
let cachedAuthUserRaw: string | null | undefined = undefined

const syncAuthUserCache = (raw: string | null, user: AuthUser | null): AuthUser | null => {
  cachedAuthUserRaw = raw
  cachedAuthUser = user
  return user
}

const readAuthUserFromStorage = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)

    if (raw === cachedAuthUserRaw) {
      return cachedAuthUser
    }

    if (!raw) {
      return syncAuthUserCache(null, null)
    }

    return syncAuthUserCache(raw, sanitizeAuthUser(JSON.parse(raw)))
  } catch {
    return syncAuthUserCache(null, null)
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function setAccessToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token)
  notifyAuthUserChange()
}

export function getAuthUser(): AuthUser | null {
  return readAuthUserFromStorage()
}

export function setAuthUser(user: AuthUser): void {
  const sanitized = sanitizeAuthUser(user)

  if (!sanitized) {
    localStorage.removeItem(USER_STORAGE_KEY)
    syncAuthUserCache(null, null)
    notifyAuthUserChange()
    return
  }

  const serialized = JSON.stringify(sanitized)
  localStorage.setItem(USER_STORAGE_KEY, serialized)
  syncAuthUserCache(serialized, sanitized)
  notifyAuthUserChange()
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  syncAuthUserCache(null, null)
  notifyAuthUserChange()
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken()?.trim())
}

export function setAuthSession(session: AuthSession): void {
  setAccessToken(session.accessToken)
  setAuthUser(session.user)
}
