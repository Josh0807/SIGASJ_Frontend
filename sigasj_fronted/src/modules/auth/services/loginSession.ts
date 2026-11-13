import type { AuthSession } from '../utils/authStorage'
import { normalizeInternalRole } from '../utils/internalRoles'
import type { AuthLoginResponse } from './authApi'
import { GENERIC_LOGIN_ERROR_MESSAGE } from './loginErrors'

const SENSITIVE_USER_KEYS = ['password', 'passwordHash', 'password_hash'] as const

export class LoginResponseSecurityError extends Error {
  readonly code = 'LOGIN_RESPONSE_SECURITY' as const

  constructor(message: string) {
    super(message)
    this.name = 'LoginResponseSecurityError'
  }
}

const hasSensitiveUserFields = (user: unknown): boolean => {
  if (!user || typeof user !== 'object') {
    return false
  }
  const record = user as Record<string, unknown>
  return SENSITIVE_USER_KEYS.some((key) => key in record && record[key] != null)
}

/**
 * Construye la sesión Auth exclusivamente desde la respuesta real del Backend.
 * - Exige accessToken real (no inventa token).
 * - Usa rol del Backend (normalizado a roles internos cuando aplica).
 * - Nunca incluye password ni passwordHash.
 *
 * Si el Backend devolviera password/passwordHash: BUG DE SEGURIDAD BACKEND.
 * Se rechaza la sesión en lugar de almacenar datos sensibles.
 */
export const buildAuthSessionFromLoginResponse = (
  payload: AuthLoginResponse,
): AuthSession => {
  if (hasSensitiveUserFields(payload.user)) {
    throw new LoginResponseSecurityError(
      'BUG DE SEGURIDAD BACKEND: la respuesta de login incluye campos sensibles (password/passwordHash).',
    )
  }

  const accessToken =
    typeof payload.accessToken === 'string' ? payload.accessToken.trim() : ''
  if (!accessToken) {
    throw new Error(GENERIC_LOGIN_ERROR_MESSAGE)
  }

  const rawRole =
    typeof payload.user?.role === 'string' ? payload.user.role.trim() : ''
  if (!rawRole) {
    throw new Error(GENERIC_LOGIN_ERROR_MESSAGE)
  }

  const id =
    payload.user?.id === undefined || payload.user?.id === null
      ? ''
      : String(payload.user.id).trim()
  if (!id) {
    throw new Error(GENERIC_LOGIN_ERROR_MESSAGE)
  }

  const normalizedRole = normalizeInternalRole(rawRole)
  if (!normalizedRole) {
    throw new LoginResponseSecurityError(
      'La respuesta de login contiene un rol sin acceso al Frontend interno.',
    )
  }

  return {
    accessToken,
    user: {
      id,
      email:
        typeof payload.user.email === 'string'
          ? payload.user.email.trim()
          : undefined,
      role: normalizedRole,
      name:
        typeof payload.user.name === 'string' && payload.user.name.trim()
          ? payload.user.name.trim()
          : 'Usuario',
    },
  }
}
