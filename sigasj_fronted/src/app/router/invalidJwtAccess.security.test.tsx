import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAccessToken } from '../../modules/auth/utils/authStorage'
import { isAuthenticated } from '../../modules/auth/utils/authStorage'
import { fetchWithAuth } from '../../services/http/httpClient'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import { LOGIN_ROUTE_PATH } from './publicRoutes'

const INVALID_PLACEHOLDER_TOKEN = 'invalid.jwt.token'

describe('seguridad — JWT inválido (frontend)', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('la sesión local no valida la firma JWT: un token no vacío sigue contando como autenticado', async () => {
    setAccessToken(INVALID_PLACEHOLDER_TOKEN)
    expect(isAuthenticated()).toBe(true)

    loginAsRole('Administradora')
    setAccessToken(INVALID_PLACEHOLDER_TOKEN)

    const app = await mountAppRoutes('/admin/abonados')

    try {
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('admin-layout')
    } finally {
      await app.cleanup()
    }
  })

  it('fetchWithAuth no trata 401 como éxito ni expone el cuerpo como datos válidos', async () => {
    setAccessToken(INVALID_PLACEHOLDER_TOKEN)

    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => '',
    })
    vi.stubGlobal('fetch', mockFetch)

    await expect(fetchWithAuth('/usuarios')).rejects.toThrow(
      'HTTP 401: Unauthorized',
    )

    const [, options] = mockFetch.mock.calls[0] as [string, { headers: Record<string, string> }]
    expect(options.headers.Authorization?.startsWith('Bearer ')).toBe(true)
    expect(options.headers.Authorization).not.toContain('eyJ')
  })
})
