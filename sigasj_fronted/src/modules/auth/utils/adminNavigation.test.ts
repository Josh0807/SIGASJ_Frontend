import { describe, expect, it } from 'vitest'
import '../../../app/router/privateRoutes'
import {
  canAccessAdminRoute,
  getAbonadosNavItemsForUser,
  getAdminNavItemsForUser,
  getAllowedRolesForAdminPath,
  getDefaultAdminHomePath,
  hasAnyAdminAccess,
  isAbonadoRole,
  isInternalAdminRole,
  resolvePostLoginAdminPath,
  userHasAllowedRole,
} from './adminNavigation'

describe('adminNavigation helpers', () => {
  const administradora = { role: 'Administradora', id: '1' }
  const secretaria = { role: 'Secretaria', id: '2' }
  const fontanero = { role: 'Fontanero', id: '3' }
  const abonado = { role: 'Abonado', id: '4' }

  it('userHasAllowedRole usa la lista declarada y no compara rol por rol en pantallas', () => {
    expect(userHasAllowedRole(administradora, ['Administradora', 'Secretaria'])).toBe(
      true,
    )
    expect(userHasAllowedRole({ role: 'ADMINISTRADORA', id: '10' }, ['Administradora'])).toBe(
      true,
    )
    expect(userHasAllowedRole(secretaria, ['Administradora', 'Secretaria'])).toBe(true)
    expect(userHasAllowedRole(fontanero, ['Administradora', 'Secretaria'])).toBe(false)
    expect(userHasAllowedRole(abonado, ['Administradora', 'Secretaria'])).toBe(false)
    expect(getAllowedRolesForAdminPath('/admin/abonados')).toEqual([
      'Administradora',
      'Secretaria',
    ])
    expect(getAllowedRolesForAdminPath('/admin/abonados/11')).toEqual([
      'Administradora',
      'Secretaria',
    ])
  })

  it('identifica roles internos validos', () => {
    expect(isInternalAdminRole('Administradora')).toBe(true)
    expect(isInternalAdminRole('Abonado')).toBe(false)
    expect(isAbonadoRole('Abonado')).toBe(true)
    expect(isAbonadoRole('ABONADO')).toBe(true)
    expect(isAbonadoRole('Administradora')).toBe(false)
  })

  it('Administradora accede a los módulos visibles de su rol (no a operativos exclusivos del Fontanero)', () => {
    const items = getAdminNavItemsForUser(administradora)
    const paths = items.map((item) => item.path)
    expect(paths).toContain('/admin/abonados')
    expect(paths).toContain('/admin/proyectos')
    expect(paths).toContain('/admin/actividades-fontanero')
    expect(paths).not.toContain('/fontanero/mi-saldo-vacaciones')
    expect(paths).not.toContain('/admin/actividades')
    expect(paths).not.toContain('/admin/usuarios')
    expect(paths).not.toContain('/admin/reportes')
    expect(canAccessAdminRoute(administradora, '/fontanero/mi-saldo-vacaciones')).toBe(
      false,
    )
    expect(canAccessAdminRoute(administradora, '/admin/abonados')).toBe(true)
    expect(canAccessAdminRoute(administradora, '/admin/usuarios')).toBe(false)
    expect(canAccessAdminRoute(administradora, '/admin/reportes')).toBe(false)
    expect(canAccessAdminRoute(administradora, '/admin/proyectos')).toBe(true)
    expect(canAccessAdminRoute(administradora, '/admin/actividades-fontanero')).toBe(
      true,
    )
    expect(canAccessAdminRoute(administradora, '/admin/actividades')).toBe(false)
  })

  it('Secretaria no ve usuarios ni reportes y sí Recursos Humanos', () => {
    const items = getAdminNavItemsForUser(secretaria)
    expect(items.map((item) => item.path)).not.toContain('/admin/usuarios')
    expect(items.map((item) => item.path)).not.toContain('/admin/reportes')
    expect(items.map((item) => item.path)).toContain('/admin/rrhh')
    expect(canAccessAdminRoute(secretaria, '/admin/usuarios')).toBe(false)
    expect(canAccessAdminRoute(secretaria, '/admin/abonados')).toBe(true)
    expect(canAccessAdminRoute(secretaria, '/admin/rrhh')).toBe(true)
  })

  it('Fontanero solo ve dashboard e inventario operativo, no el listado admin de averías', () => {
    const items = getAdminNavItemsForUser(fontanero)
    expect(items.map((item) => item.path)).toEqual([
      '/admin/dashboard',
      '/admin/inventario',
      '/admin/solicitudes',
      '/admin/actividades',
      '/fontanero/averias',
      '/fontanero/solicitar-permiso',
      '/fontanero/solicitar-vacaciones',
      '/fontanero/mis-solicitudes',
      '/fontanero/mi-saldo-vacaciones',
    ])
    expect(canAccessAdminRoute(fontanero, '/admin/averias')).toBe(false)
    expect(canAccessAdminRoute(fontanero, '/fontanero/averias')).toBe(true)
    expect(canAccessAdminRoute(fontanero, '/fontanero/averias/25')).toBe(true)
    expect(canAccessAdminRoute(fontanero, '/fontanero/solicitar-ausencia')).toBe(true)
    expect(canAccessAdminRoute(fontanero, '/fontanero/solicitar-permiso')).toBe(true)
    expect(canAccessAdminRoute(fontanero, '/fontanero/solicitar-vacaciones')).toBe(
      true,
    )
    expect(
      items.find((item) => item.path === '/fontanero/solicitar-permiso')?.title,
    ).toBe('Solicitar permiso')
    expect(
      items.find((item) => item.path === '/fontanero/solicitar-vacaciones')?.title,
    ).toBe('Solicitar vacaciones')
    expect(canAccessAdminRoute(fontanero, '/fontanero/mis-solicitudes')).toBe(true)
    expect(canAccessAdminRoute(fontanero, '/fontanero/mis-solicitudes/12')).toBe(
      true,
    )
    expect(
      items.find((item) => item.path === '/fontanero/mis-solicitudes')?.title,
    ).toBe('Mis solicitudes')
    expect(canAccessAdminRoute(fontanero, '/fontanero/mi-saldo-vacaciones')).toBe(
      true,
    )
    expect(
      items.find((item) => item.path === '/fontanero/mi-saldo-vacaciones')?.title,
    ).toBe('Mi saldo de vacaciones')
    expect(canAccessAdminRoute(fontanero, '/admin/actividades')).toBe(true)
    expect(canAccessAdminRoute(fontanero, '/admin/actividades/nueva')).toBe(true)
    expect(canAccessAdminRoute(fontanero, '/admin/actividades-fontanero')).toBe(
      false,
    )
    expect(canAccessAdminRoute(fontanero, '/admin/abonados')).toBe(false)
    expect(
      canAccessAdminRoute(fontanero, '/admin/inventario/alertas-reposicion'),
    ).toBe(false)
    expect(canAccessAdminRoute(fontanero, '/admin/inventario/salidas')).toBe(
      true,
    )
    expect(
      canAccessAdminRoute(fontanero, '/admin/inventario/solicitudes-materiales'),
    ).toBe(true)
  })

  it('Secretaria no accede a alertas de reposición admin del inventario', () => {
    expect(
      canAccessAdminRoute(secretaria, '/admin/inventario/alertas-reposicion'),
    ).toBe(false)
    expect(canAccessAdminRoute(secretaria, '/admin/inventario/materiales')).toBe(
      true,
    )
  })

  it('rol invalido no obtiene acceso administrativo', () => {
    expect(hasAnyAdminAccess(abonado)).toBe(false)
    expect(getAdminNavItemsForUser(abonado)).toEqual([])
    expect(getDefaultAdminHomePath(abonado)).toBeNull()
    expect(canAccessAdminRoute(abonado, '/admin/abonados')).toBe(false)
    expect(canAccessAdminRoute({ role: 'ABONADO', id: '5' }, '/admin/abonados')).toBe(
      false,
    )
    expect(canAccessAdminRoute(abonado, '/admin/abonados/11')).toBe(false)
    expect(canAccessAdminRoute(abonado, '/admin/perfil')).toBe(false)
  })

  it('un sufijo en la URL no abre Gestión de asociados a Fontanero ni Abonado', () => {
    expect(canAccessAdminRoute(fontanero, '/admin/abonados/11')).toBe(false)
    expect(canAccessAdminRoute(abonado, '/admin/abonados/11')).toBe(false)
  })

  it('resuelve destino seguro tras login segun permisos', () => {
    expect(
      resolvePostLoginAdminPath(secretaria, '/admin/usuarios'),
    ).toBe('/admin/dashboard')
    expect(
      resolvePostLoginAdminPath(secretaria, '/admin/abonados'),
    ).toBe('/admin/abonados')
    expect(
      resolvePostLoginAdminPath(administradora, '/admin/abonados'),
    ).toBe('/admin/abonados')
    expect(
      resolvePostLoginAdminPath(fontanero, '/admin/abonados'),
    ).toBe('/admin/dashboard')
    expect(resolvePostLoginAdminPath(abonado, '/admin/abonados')).toBe(
      '/',
    )
    expect(resolvePostLoginAdminPath(abonado, '/admin/abonados/11')).toBe(
      '/',
    )
    expect(resolvePostLoginAdminPath(abonado)).toBe('/')
  })

  it('reconoce el rol Administradora del backend y abre Gestión de asociados', () => {
    const fromBackend = { role: 'ADMINISTRADORA', id: '10' }

    expect(canAccessAdminRoute(fromBackend, '/admin/abonados')).toBe(true)
    expect(
      getAdminNavItemsForUser(fromBackend).map((item) => item.path),
    ).toContain('/admin/abonados')
  })

  it('muestra Gestión de asociados en el menú solo a roles con permiso definido', () => {
    expect(getAbonadosNavItemsForUser(administradora).map((item) => item.path)).toEqual([
      '/admin/abonados',
    ])
    expect(getAbonadosNavItemsForUser(secretaria).map((item) => item.path)).toEqual([
      '/admin/abonados',
    ])
    expect(getAbonadosNavItemsForUser(fontanero)).toEqual([])
    expect(getAbonadosNavItemsForUser(abonado)).toEqual([])
    expect(getAdminNavItemsForUser(fontanero).map((item) => item.path)).not.toContain(
      '/admin/abonados',
    )
    expect(getAdminNavItemsForUser(abonado)).toEqual([])
  })

  it('sigue resolviendo rutas administrativas después de cargar el árbol de pantallas', () => {
    expect(getAllowedRolesForAdminPath('/admin/dashboard')).toEqual([
      'Administradora',
      'Secretaria',
      'Fontanero',
    ])
    expect(canAccessAdminRoute(administradora, '/admin/abonados')).toBe(true)
    expect(getAbonadosNavItemsForUser(administradora).map((item) => item.path)).toEqual([
      '/admin/abonados',
    ])
  })
})
