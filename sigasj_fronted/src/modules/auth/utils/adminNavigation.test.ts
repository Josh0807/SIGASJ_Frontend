import { describe, expect, it } from 'vitest'
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

  it('Administradora accede a todos los modulos administrativos visibles', () => {
    const items = getAdminNavItemsForUser(administradora)
    expect(items.length).toBe(12)
    expect(items.map((item) => item.path)).toContain('/admin/abonados')
    expect(canAccessAdminRoute(administradora, '/admin/abonados')).toBe(true)
    expect(canAccessAdminRoute(administradora, '/admin/usuarios')).toBe(true)
    expect(canAccessAdminRoute(administradora, '/admin/reportes')).toBe(true)
  })

  it('Secretaria no ve usuarios ni reportes', () => {
    const items = getAdminNavItemsForUser(secretaria)
    expect(items.map((item) => item.path)).not.toContain('/admin/usuarios')
    expect(items.map((item) => item.path)).not.toContain('/admin/reportes')
    expect(canAccessAdminRoute(secretaria, '/admin/usuarios')).toBe(false)
    expect(canAccessAdminRoute(secretaria, '/admin/abonados')).toBe(true)
  })

  it('Fontanero solo ve dashboard y averias', () => {
    const items = getAdminNavItemsForUser(fontanero)
    expect(items.map((item) => item.path)).toEqual([
      '/admin/dashboard',
      '/admin/averias',
    ])
    expect(canAccessAdminRoute(fontanero, '/admin/averias')).toBe(true)
    expect(canAccessAdminRoute(fontanero, '/admin/abonados')).toBe(false)
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

  it('un sufijo en la URL no abre Gestión de Abonados a Fontanero ni Abonado', () => {
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

  it('reconoce el rol Administradora del backend y abre Gestión de abonados', () => {
    const fromBackend = { role: 'ADMINISTRADORA', id: '10' }

    expect(canAccessAdminRoute(fromBackend, '/admin/abonados')).toBe(true)
    expect(
      getAdminNavItemsForUser(fromBackend).map((item) => item.path),
    ).toContain('/admin/abonados')
  })

  it('muestra Gestión de Abonados en el menú solo a roles con permiso definido', () => {
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

  it(
    'sigue resolviendo rutas administrativas después de cargar el árbol de pantallas',
    async () => {
      await import('../../../app/router/AppRoutes')

      expect(getAllowedRolesForAdminPath('/admin/dashboard')).toEqual([
        'Administradora',
        'Secretaria',
        'Fontanero',
      ])
      expect(canAccessAdminRoute(administradora, '/admin/abonados')).toBe(true)
      expect(getAbonadosNavItemsForUser(administradora).map((item) => item.path)).toEqual([
        '/admin/abonados',
      ])
    },
    15000,
  )
})
