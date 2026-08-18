import type { AuthUser } from '../types/authUser'

const TOKEN_STORAGE_KEY = 'sigasj_access_token'
const USER_STORAGE_KEY = 'sigasj_auth_user'

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
    user.role = candidate.role.trim()
  }

  if (isPresent(candidate.avatar)) {
    user.avatar = candidate.avatar.trim()
  }

  return Object.keys(user).length > 0 ? user : null
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
}

export function getAuthUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)

    if (!raw) {
      return null
    }

    return sanitizeAuthUser(JSON.parse(raw))
  } catch {
    return null
  }
}

export function setAuthUser(user: AuthUser): void {
  const sanitized = sanitizeAuthUser(user)

  if (!sanitized) {
    localStorage.removeItem(USER_STORAGE_KEY)
    return
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(sanitized))
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken()?.trim())
}
