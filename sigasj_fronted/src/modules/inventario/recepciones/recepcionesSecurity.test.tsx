import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'

describe('seguridad de recepción de materiales', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('redirige al login sin sesión', async () => {
    const view = await mountAppRoutes('/admin/inventario/recepciones')
    expect(view.currentPath()).toBe('/login')
    await view.cleanup()
  })

  it.each(['Secretaria', 'Fontanero'])('deniega el acceso directo a %s', async (role) => {
    loginAsRole(role)
    const view = await mountAppRoutes('/admin/inventario/recepciones')
    expect(view.currentPath()).toBe('/unauthorized')
    await view.cleanup()
  })

  it('permite la consulta a la Administradora', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
    } as Response))
    const view = await mountAppRoutes('/admin/inventario/recepciones')
    expect(view.currentPath()).toBe('/admin/inventario/recepciones')
    expect(view.container.textContent).toContain('Recepción de materiales')
    await view.cleanup()
  })
})
