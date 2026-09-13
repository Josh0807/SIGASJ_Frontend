import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'

describe('seguridad de la revisión de solicitudes de materiales', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
    document.body.innerHTML = ''
  })

  it('redirige al login sin sesión', async () => {
    const view = await mountAppRoutes('/admin/inventario/solicitudes')
    expect(view.currentPath()).toBe('/login')
    await view.cleanup()
  })

  it.each(['Secretaria', 'Fontanero'])('deniega el acceso directo a %s', async (role) => {
    loginAsRole(role)
    const view = await mountAppRoutes('/admin/inventario/solicitudes')
    expect(view.currentPath()).toBe('/unauthorized')
    await view.cleanup()
  })

  it('deniega el panel administrativo a Abonado', async () => {
    loginAsRole('Abonado')
    const view = await mountAppRoutes('/admin/inventario/solicitudes')
    expect(view.currentPath()).toBe('/unauthorized')
    await view.cleanup()
  })

  it('permite la revisión a la Administradora', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [], total: 0, page: 1, limit: 10, totalPages: 0 }),
    } as Response))
    const view = await mountAppRoutes('/admin/inventario/solicitudes')
    expect(view.currentPath()).toBe('/admin/inventario/solicitudes')
    expect(view.container.textContent).toContain('Revisión de solicitudes de materiales')
    await view.cleanup()
  })
})
