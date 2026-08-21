import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAccessToken,
  isAuthenticated,
  setAccessToken,
} from '../../modules/auth/utils/authStorage'
import { fetchWithAuth } from '../../services/http/httpClient'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import { LOGIN_ROUTE_PATH } from './publicRoutes'

/** JWT de forma válida con exp en el pasado (payload fijo de prueba, no de un usuario real). */
const EXPIRED_TEST_JWT =
  'eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIiwiZXhwIjoxfQ.invalid'

describe('seguridad — JWT vencido (frontend)', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('isAuthenticated no inspecciona exp: un token vencido en storage sigue contando como sesión', () => {
    setAccessToken(EXPIRED_TEST_JWT)
    expect(isAuthenticated()).toBe(true)
  })

  it('rutas privadas siguen disponibles en el cliente mientras el token no vacío exista', async () => {
    loginAsRole('Administradora')
    setAccessToken(EXPIRED_TEST_JWT)

    const app = await mountAppRoutes('/admin/abonados')

    try {
      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('admin-layout')
    } finally {
      await app.cleanup()
    }
  })

  it('si el backend responde 401, fetchWithAuth falla y no trata la respuesta como datos', async () => {
    setAccessToken(EXPIRED_TEST_JWT)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '',
      }),
    )

    await expect(fetchWithAuth('/usuarios')).rejects.toThrow(
      'HTTP 401: Unauthorized',
    )
  })

  it('no hay refresh token ni invalidación automática de sesión por expiración', () => {
    const httpSource = readFileSync(
      resolve(process.cwd(), 'src/services/http/httpClient.ts'),
      'utf8',
    )
    const storageSource = readFileSync(
      resolve(process.cwd(), 'src/modules/auth/utils/authStorage.ts'),
      'utf8',
    )

    expect(httpSource).not.toMatch(/refreshToken|refresh_token/)
    expect(storageSource).not.toMatch(/expir/)
    expect(httpSource).not.toContain("'/login'")
  })
})
