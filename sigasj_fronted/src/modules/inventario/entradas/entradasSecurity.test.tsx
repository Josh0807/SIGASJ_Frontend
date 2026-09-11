import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'

describe('seguridad de la ruta de entradas', () => {
  afterEach(() => { localStorage.clear(); document.body.innerHTML = '' })
  it('redirige al login sin sesión', async () => { const view = await mountAppRoutes('/admin/inventario/entradas'); expect(view.currentPath()).toBe('/login'); await view.cleanup() })
  it.each(['Secretaria', 'Fontanero'])('deniega el acceso directo a %s', async (role) => { loginAsRole(role); const view = await mountAppRoutes('/admin/inventario/entradas'); expect(view.currentPath()).toBe('/unauthorized'); await view.cleanup() })
  it('deniega el panel administrativo a Abonado', async () => { loginAsRole('Abonado'); const view = await mountAppRoutes('/admin/inventario/entradas'); expect(view.currentPath()).toBe('/unauthorized'); await view.cleanup() })
  it('permite el formulario a Administradora', async () => {
    loginAsRole('Administradora')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ data: [], total: 0, page: 1, limit: 100, totalPages: 0 }) } as Response))
    const view = await mountAppRoutes('/admin/inventario/entradas')
    expect(view.currentPath()).toBe('/admin/inventario/entradas')
    expect(view.container.textContent).toContain('Registrar entrada de materiales')
    await view.cleanup()
    vi.unstubAllGlobals()
  })
})
