import { describe, expect, it } from 'vitest'
import {
  ADMIN_BASE_PATH,
  ADMIN_CHILD_ROUTES,
  ADMIN_HOME_PATH,
  ADMIN_NAV_ITEMS,
  PRIVATE_ROUTE_PATHS,
} from './privateRoutes'
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
        '/admin/dashboard',
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

  it('usa /admin como ruta base de los módulos administrativos', () => {
    expect(ADMIN_BASE_PATH).toBe('/admin')
    expect(ADMIN_CHILD_ROUTES.every((route) => route.path.startsWith('/admin/'))).toBe(
      true,
    )
  })

  it('usa el dashboard existente como destino inicial de /admin', () => {
    expect(ADMIN_HOME_PATH).toBe('/admin/dashboard')
    expect(PRIVATE_ROUTE_PATHS).toContain(ADMIN_HOME_PATH)
  })

  it('deriva la navegación del sidebar desde las rutas hijas existentes', () => {
    expect(ADMIN_NAV_ITEMS).toEqual(
      ADMIN_CHILD_ROUTES.map(({ path, title }) => ({ path, title })),
    )
    expect(
      ADMIN_CHILD_ROUTES.every(
        (route) => route.path === `${ADMIN_BASE_PATH}/${route.segment}`,
      ),
    ).toBe(true)
  })

  it('no duplica segmentos ni rutas administrativas', () => {
    const segments = ADMIN_CHILD_ROUTES.map(({ segment }) => segment)
    const paths = ADMIN_CHILD_ROUTES.map(({ path }) => path)

    expect(new Set(segments).size).toBe(segments.length)
    expect(new Set(paths).size).toBe(paths.length)
    expect(paths).not.toContain('/admin/comunicados')
    expect(segments).not.toContain('comunicados')
  })
})
