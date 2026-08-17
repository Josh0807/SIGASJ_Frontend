import type { AuthSession, AuthUser } from './auth.types'
import { notifyAuthChanged } from './authEvents'

const TOKEN_STORAGE_KEY = 'sigasj_access_token'
const USER_STORAGE_KEY = 'sigasj_auth_user'

function readStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as AuthUser
    if (
      typeof parsed?.rol !== 'string' ||
      typeof parsed?.idUsuario !== 'number'
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function getAccessToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function getAuthUser(): AuthUser | null {
  if (!getAccessToken()?.trim()) {
    return null
  }

  return readStoredUser()
}

export function setAuthSession(session: AuthSession): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, session.accessToken)
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user))
  notifyAuthChanged()
}

/** Compatibilidad con pruebas y código legacy que solo guardaba el token. */
export function setAccessToken(
  token: string,
  user: AuthUser = { rol: 'Administradora', idUsuario: 0 },
): void {
  setAuthSession({ accessToken: token, user })
}

export function clearAccessToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
  notifyAuthChanged()
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken()?.trim() && getAuthUser())
}
