import { describe, expect, it } from 'vitest'
import { ROLE_PERMISSIONS } from '../config/adminNavigation.config'
import { canAccessAdminRoute, getAdminNavItemsForUser } from './adminNavigation'
import type { InternalAdminRole } from './internalRoles'
import {
  ALL_ADMIN_MODULE_PATHS,
  EXPECTED_BLOCKED_PATHS,
  EXPECTED_NAV_PATHS,
  INTERNAL_ROLES_UNDER_TEST,
  ROLE_TASK_LABELS,
} from '../../../test/roleAccessFixtures'

describe('matriz de acceso por rol interno (11.4.5)', () => {
  const userFor = (role: InternalAdminRole) => ({ role, id: '1' })

  describe.each(
    INTERNAL_ROLES_UNDER_TEST.map((role) => [role, ROLE_TASK_LABELS[role]] as const),
  )('rol $0 ($1)', (role) => {
    it(`expone en menú únicamente las opciones del rol`, () => {
      const navPaths = getAdminNavItemsForUser(userFor(role)).map(
        (item) => item.path,
      )

      expect(navPaths).toEqual([...EXPECTED_NAV_PATHS[role]])
    })

    it.each([...EXPECTED_NAV_PATHS[role]])(
      'permite acceso directo a %s',
      (path) => {
        expect(canAccessAdminRoute(userFor(role), path)).toBe(true)
      },
    )

    it.each([...EXPECTED_BLOCKED_PATHS[role]])(
      'rechaza acceso directo a %s',
      (path) => {
        expect(canAccessAdminRoute(userFor(role), path)).toBe(false)
      },
    )
  })

  it('cubre los módulos administrativos configurados', () => {
    expect(ALL_ADMIN_MODULE_PATHS).toHaveLength(11)
  })

  it('Secretaria Ejecutiva no incluye usuarios ni reportes', () => {
    expect(EXPECTED_NAV_PATHS.Secretaria).not.toContain('/admin/usuarios')
    expect(EXPECTED_NAV_PATHS.Secretaria).not.toContain('/admin/reportes')
    expect(EXPECTED_NAV_PATHS.Secretaria).toContain('/admin/galeria')
    expect(EXPECTED_NAV_PATHS.Secretaria).toContain('/admin/transparencia')
  })

  it('Fontanero solo accede a dashboard y averías', () => {
    expect(EXPECTED_NAV_PATHS.Fontanero).toEqual([
      '/admin/dashboard',
      '/admin/averias',
    ])
  })

  it('Gestión de Abonados aparece en el menú solo con permiso definido', () => {
    expect(EXPECTED_NAV_PATHS.Administradora).toContain('/admin/abonados')
    expect(EXPECTED_NAV_PATHS.Secretaria).toContain('/admin/abonados')
    expect(EXPECTED_NAV_PATHS.Fontanero).not.toContain('/admin/abonados')
    expect(canAccessAdminRoute(userFor('Fontanero'), '/admin/abonados')).toBe(false)
    expect(getAdminNavItemsForUser({ role: 'Abonado', id: '4' })).toEqual([])
  })

  it('permisos backend alineados: Fontanero sin users.manage ni audit.read', () => {
    expect(ROLE_PERMISSIONS.Fontanero).not.toContain('users.manage')
    expect(ROLE_PERMISSIONS.Fontanero).not.toContain('audit.read')
  })

  it('permisos backend alineados: Secretaria sin audit.read', () => {
    expect(ROLE_PERMISSIONS.Secretaria).not.toContain('audit.read')
    expect(ROLE_PERMISSIONS.Secretaria).not.toContain('roles.manage')
  })

  it('permisos backend alineados: Administradora incluye control total', () => {
    expect(ROLE_PERMISSIONS.Administradora).toContain('users.manage')
    expect(ROLE_PERMISSIONS.Administradora).toContain('audit.read')
    expect(ROLE_PERMISSIONS.Administradora).toContain('roles.manage')
  })
})
