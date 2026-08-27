import { describe, expect, it } from 'vitest'
import {
  ADMIN_BASE_PATH,
  ADMIN_CHILD_ROUTES,
  ADMIN_HOME_PATH,
  ADMIN_NAV_ITEMS,
  ADMIN_PROFILE_PATH,
  PRIVATE_ROUTE_PATHS,
} from './privateRoutes'
import { LANDING_ROUTE, LANDING_ROUTE_PATH, PUBLIC_ROUTE_PATHS, PUBLIC_VISITOR_FORM_PATHS } from './publicRoutes'

describe('route configuration', () => {
  it('expone la landing y formularios públicos sin autenticación', () => {
    expect(LANDING_ROUTE_PATH).toBe('/')
    expect(LANDING_ROUTE?.path).toBe('/')
    expect(PUBLIC_ROUTE_PATHS).toEqual([
      '/',
      '/consulta-recibo',
      '/reportar-averia',
      '/solicitudes/constancia-servicio',
      '/solicitudes/afiliacion',
      '/solicitudes/arreglo-pago',
      '/solicitudes/cambio-titular',
      '/login',
      '/unauthorized',
    ])
    expect(PUBLIC_ROUTE_PATHS).not.toContain('/comunicados')
    expect(PUBLIC_ROUTE_PATHS).not.toContain('/dashboard')
    expect(PUBLIC_ROUTE_PATHS).not.toContain(ADMIN_BASE_PATH)
  })

  it('no incluye rutas privadas entre las públicas', () => {
    const overlap = PUBLIC_ROUTE_PATHS.filter((path) =>
      PRIVATE_ROUTE_PATHS.includes(path),
    )

    expect(overlap).toEqual([])
  })

  it('mantiene las rutas públicas fuera del prefijo administrativo', () => {
    expect(
      PUBLIC_ROUTE_PATHS.every(
        (path) => path === '/' || !path.startsWith(`${ADMIN_BASE_PATH}/`),
      ),
    ).toBe(true)
    expect(PUBLIC_ROUTE_PATHS).not.toContain(ADMIN_BASE_PATH)
  })

  it('expone los formularios públicos de visitante fuera de /admin', () => {
    expect(PUBLIC_VISITOR_FORM_PATHS).toEqual([
      '/consulta-recibo',
      '/reportar-averia',
      '/solicitudes/constancia-servicio',
      '/solicitudes/afiliacion',
      '/solicitudes/arreglo-pago',
      '/solicitudes/cambio-titular',
    ])
    expect(
      PUBLIC_VISITOR_FORM_PATHS.every((path) => !path.startsWith(`${ADMIN_BASE_PATH}/`)),
    ).toBe(true)
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
        '/admin/proyectos',
        '/admin/galeria',
        '/admin/comunicados',
        '/admin/contacto',
        '/admin/transparencia',
        ADMIN_PROFILE_PATH,
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

  it('expone la ruta de perfil como módulo administrativo protegido', () => {
    expect(ADMIN_PROFILE_PATH).toBe('/admin/perfil')
    expect(PRIVATE_ROUTE_PATHS).toContain(ADMIN_PROFILE_PATH)
    expect(ADMIN_NAV_ITEMS.some((item) => item.path === ADMIN_PROFILE_PATH)).toBe(
      false,
    )
  })

  it('deriva la navegación del sidebar desde las rutas hijas disponibles', () => {
    expect(ADMIN_NAV_ITEMS).toEqual(
      ADMIN_CHILD_ROUTES.filter(({ availableInNav }) => availableInNav).map(
        ({ path, title, icon }) => ({ path, title, icon }),
      ),
    )
    expect(
      ADMIN_CHILD_ROUTES.every(
        (route) => route.path === `${ADMIN_BASE_PATH}/${route.segment}`,
      ),
    ).toBe(true)
  })

  it('centraliza nombre, ruta e icono de cada opcion visible', () => {
    expect(ADMIN_NAV_ITEMS.length).toBeGreaterThan(1)
    for (const item of ADMIN_NAV_ITEMS) {
      expect(item.path.startsWith(`${ADMIN_BASE_PATH}/`)).toBe(true)
      expect(item.title.trim().length).toBeGreaterThan(0)
      expect(item.icon).toBeTruthy()
    }
  })

  it('no duplica segmentos ni rutas administrativas', () => {
    const segments = ADMIN_CHILD_ROUTES.map(({ segment }) => segment)
    const paths = ADMIN_CHILD_ROUTES.map(({ path }) => path)
    const navPaths = ADMIN_NAV_ITEMS.map(({ path }) => path)

    expect(new Set(segments).size).toBe(segments.length)
    expect(new Set(paths).size).toBe(paths.length)
    expect(new Set(navPaths).size).toBe(navPaths.length)
    expect(paths).toContain('/admin/comunicados')
    expect(navPaths).toContain('/admin/comunicados')
    expect(segments).toContain('comunicados')
    expect(paths).toContain('/admin/proyectos')
    expect(navPaths).toContain('/admin/proyectos')
    expect(segments).toContain('proyectos')
    expect(paths).toContain('/admin/contacto')
    expect(paths).not.toContain('/admin/abonados/:id')
    expect(paths).not.toContain('/admin/abonados/me')
    expect(PRIVATE_ROUTE_PATHS.every((path) => !path.includes(':id'))).toBe(true)
  })

  it('omite del menu los módulos marcados como no disponibles', () => {
    expect(
      ADMIN_CHILD_ROUTES.filter(({ availableInNav }) => !availableInNav).every(
        (route) => !ADMIN_NAV_ITEMS.some((item) => item.path === route.path),
      ),
    ).toBe(true)
  })

  it('Gestión de asociados autoriza por rol en la ruta, no solo por visibilidad de menú', () => {
    const abonados = ADMIN_CHILD_ROUTES.find((route) => route.segment === 'abonados')

    expect(abonados).toBeDefined()
    expect(abonados?.path).toBe('/admin/abonados')
    expect(abonados?.allowedRoles).toEqual(['Administradora', 'Secretaria'])
    expect(abonados?.allowedRoles).not.toContain('Abonado')
    expect(abonados?.allowedRoles).not.toContain('Fontanero')
    expect(PUBLIC_ROUTE_PATHS).not.toContain('/admin/abonados')
    expect(PRIVATE_ROUTE_PATHS).toContain('/admin/abonados')
  })
})
