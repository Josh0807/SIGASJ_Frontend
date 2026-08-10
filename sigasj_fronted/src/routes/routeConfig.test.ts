import { describe, expect, it } from 'vitest'
import { PRIVATE_ROUTE_PATHS } from './privateRoutes'
import { PUBLIC_ROUTE_PATHS } from './publicRoutes'

describe('route configuration', () => {
  it('expone la landing y formularios públicos sin autenticación', () => {
    expect(PUBLIC_ROUTE_PATHS).toContain('/')
    expect(PUBLIC_ROUTE_PATHS).toContain('/login')
    expect(PUBLIC_ROUTE_PATHS).toContain('/reportar-averia')
    expect(PUBLIC_ROUTE_PATHS).toContain('/solicitudes/afiliacion')
  })

  it('no incluye rutas privadas entre las públicas', () => {
    const overlap = PUBLIC_ROUTE_PATHS.filter((path) =>
      PRIVATE_ROUTE_PATHS.includes(path),
    )

    expect(overlap).toEqual([])
  })

  it('protege los módulos administrativos principales', () => {
    expect(PRIVATE_ROUTE_PATHS).toEqual(
      expect.arrayContaining([
        '/dashboard',
        '/admin/usuarios',
        '/admin/abonados',
        '/admin/inventario',
        '/admin/solicitudes',
        '/admin/lecturas',
        '/admin/averias',
        '/admin/reportes',
        '/admin/galeria',
        '/admin/transparencia',
      ]),
    )
  })
})
