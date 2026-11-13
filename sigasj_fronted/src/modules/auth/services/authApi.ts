import { fetchWithAuth } from '../../../services/http/httpClient'

/** Body alineado con LoginDto del Backend (`email` + `password`). */
export type LoginCredentials = {
  email: string
  password: string
}

export type AuthLoginUserDto = {
  id: string | number
  email: string
  role: string
  name?: string
}

export type AuthLoginResponse = {
  accessToken: string
  user: AuthLoginUserDto
}

/** Endpoint relativo al API client (`/api/v1` en dev vía proxy). */
export const AUTH_LOGIN_ENDPOINT = '/auth/login'
export const AUTH_ME_ENDPOINT = '/auth/me'

/**
 * POST /api/v1/auth/login
 * No envía rol ni campos extra. No requiere Authorization previa.
 */
export async function loginWithCredentials(
  credentials: LoginCredentials,
): Promise<AuthLoginResponse> {
  return fetchWithAuth<AuthLoginResponse>(AUTH_LOGIN_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  })
}

/**
 * GET /api/v1/auth/me
 * Requiere Authorization Bearer. La identidad sale del JWT, no de query/body.
 */
export async function fetchCurrentUser(): Promise<AuthLoginUserDto> {
  return fetchWithAuth<AuthLoginUserDto>(AUTH_ME_ENDPOINT, {
    method: 'GET',
  })
}
