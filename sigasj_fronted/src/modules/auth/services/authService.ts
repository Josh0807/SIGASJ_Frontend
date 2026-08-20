import { fetchWithAuth } from '../../../services/http/httpClient'
import type { AuthSession } from '../utils/authStorage'
import type { AuthUser } from '../types/authUser'
import {
  normalizeInternalRole,
  type InternalAdminRole,
} from '../utils/internalRoles'

export type AuthLoginResponse = {
  accessToken: string
  tokenType: 'Bearer'
  user: {
    id: string
    email: string
    role: string
    name: string
  }
}

export type LoginCredentials = {
  email: string
  password: string
}

const DEV_TOKEN_PATH = '/v1/auth/dev-token'
const LOGIN_PATH = '/v1/auth/login'

function mapBackendAuthUser(user: AuthLoginResponse['user']): AuthUser {
  const role = normalizeInternalRole(user.role) ?? user.role.trim()
  const nameParts = user.name.trim().split(/\s+/).filter(Boolean)
  const name = nameParts[0] ?? 'Usuario'
  const lastName = nameParts.slice(1).join(' ') || role

  return {
    id: user.id,
    email: user.email,
    role,
    name,
    lastName,
  }
}

function mapLoginResponse(payload: AuthLoginResponse): AuthSession {
  return {
    accessToken: payload.accessToken,
    user: mapBackendAuthUser(payload.user),
  }
}

export async function requestDevToken(
  role: InternalAdminRole,
): Promise<AuthSession> {
  const payload = await fetchWithAuth<AuthLoginResponse>(DEV_TOKEN_PATH, {
    method: 'POST',
    body: JSON.stringify({ rol: role }),
  })

  return mapLoginResponse(payload)
}

export async function loginWithCredentials(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const payload = await fetchWithAuth<AuthLoginResponse>(LOGIN_PATH, {
    method: 'POST',
    body: JSON.stringify(credentials),
  })

  return mapLoginResponse(payload)
}
