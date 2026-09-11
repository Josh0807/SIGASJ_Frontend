import { afterEach, describe, expect, it, vi } from 'vitest'
import { loginAsRole } from '../../../test/authTestHelpers'
import { mountAppRoutes } from '../../../test/render-app-routes'

describe('seguridad de rutas de proveedores', () => {
  afterEach(() => { vi.unstubAllGlobals(); localStorage.clear(); document.body.innerHTML = '' })

  it('redirige al login cuando no hay sesión', async () => {
    const view = await mountAppRoutes('/admin/inventario/proveedores/nuevo')
    expect(view.currentPath()).toBe('/login')
    await view.cleanup()
  })

  it.each(['Fontanero', 'Secretaria'])('deniega creación directa al rol %s', async (role) => {
    loginAsRole(role)
    const view = await mountAppRoutes('/admin/inventario/proveedores/nuevo')
    expect(view.currentPath()).toBe('/unauthorized')
    await view.cleanup()
  })

  it('permite crear a la Administradora', async () => {
    loginAsRole('Administradora')
    const view = await mountAppRoutes('/admin/inventario/proveedores/nuevo')
    expect(view.currentPath()).toBe('/admin/inventario/proveedores/nuevo')
    expect(view.container.textContent).toContain('Registrar proveedor')
    await view.cleanup()
  })
})
