import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGIN_ROUTE_PATH, UNAUTHORIZED_ROUTE_PATH } from '../../../app/router/publicRoutes'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'
import { clearAccessToken } from '../../auth/utils/authStorage'
import { SALIDAS_PATH } from '../inventarioPaths'

const emptyCatalog = { data: [], total: 0, page: 1, limit: 100, totalPages: 0 }

describe('autorización del registro de salidas', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, status: 200, json: async () => emptyCatalog } as Response)))
  })
  afterEach(() => { vi.unstubAllGlobals(); clearAccessToken(); document.body.innerHTML = '' })

  it('permite el acceso directo al Fontanero', async () => {
    loginAsRole('Fontanero')
    const app = await mountAppRoutes(SALIDAS_PATH)
    expect(app.currentPath()).toBe(SALIDAS_PATH)
    expect(app.container.textContent).toContain('Registrar salida de materiales')
    await app.cleanup()
  })

  it('rechaza a un rol interno no autorizado', async () => {
    loginAsRole('Secretaria')
    const app = await mountAppRoutes(SALIDAS_PATH)
    expect(app.currentPath()).toBe(UNAUTHORIZED_ROUTE_PATH)
    expect(app.container.textContent).toContain('Acceso denegado')
    await app.cleanup()
  })

  it('envía al login cuando no existe una sesión', async () => {
    const app = await mountAppRoutes(SALIDAS_PATH)
    expect(app.currentPath()).toBe(LOGIN_ROUTE_PATH)
    await app.cleanup()
  })
})
