import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AuthProvider } from '../../modules/auth/components/AuthContext'
import UnauthorizedPage from '../../modules/auth/components/UnauthorizedPage'
import {
  clearAccessToken,
  isAuthenticated,
} from '../../modules/auth/utils/authStorage'
import { fetchWithAuth } from '../../services/http/httpClient'
import { loginAsRole } from '../../test/authTestHelpers'
import { mountAppRoutes } from '../../test/render-app-routes'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from './publicRoutes'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'

describe('frontend — distinción 401 vs 403', () => {
  beforeEach(() => {
    clearAccessToken()
  })

  afterEach(() => {
    clearAccessToken()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('401: fetchWithAuth falla y no trata la respuesta como datos', async () => {
    loginAsRole('Administradora')
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

  it('401 de API no cierra la sesión por sí solo (no hay interceptor de logout)', async () => {
    loginAsRole('Administradora')
    expect(isAuthenticated()).toBe(true)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '',
      }),
    )

    await expect(fetchWithAuth('/usuarios')).rejects.toThrow(/401/)
    expect(isAuthenticated()).toBe(true)
  })

  it('403: fetchWithAuth falla como Forbidden y NO ejecuta logout', async () => {
    loginAsRole('Abonado')
    expect(isAuthenticated()).toBe(true)

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => '',
      }),
    )

    await expect(fetchWithAuth('/usuarios')).rejects.toThrow(
      'HTTP 403: Forbidden',
    )
    expect(isAuthenticated()).toBe(true)
  })

  it('403 de ruta: Abonado autenticado ve Acceso denegado y no va a login', async () => {
    loginAsRole('Abonado')
    const app = await mountAppRoutes('/admin/abonados')

    try {
      expect(isAuthenticated()).toBe(true)
      expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
      expect(app.currentPath()).not.toBe(LOGIN_ROUTE_PATH)
      expect(app.container.innerHTML).toContain('Acceso denegado')
      expect(app.container.innerHTML).not.toContain('Iniciar sesión')
    } finally {
      await app.cleanup()
    }
  })

  it('UnauthorizedPage sin sesión equivale a 401 de UI: redirige a login', async () => {
    const container = document.createElement('div')
    document.body.appendChild(container)
    const root = createRoot(container)

    await act(async () => {
      root.render(
        <AuthProvider>
          <MemoryRouter initialEntries={[UNAUTHORIZED_ROUTE_PATH]}>
            <UnauthorizedPage />
          </MemoryRouter>
        </AuthProvider>,
      )
    })

    expect(isAuthenticated()).toBe(false)
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })
})
