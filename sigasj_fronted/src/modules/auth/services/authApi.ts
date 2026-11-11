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
