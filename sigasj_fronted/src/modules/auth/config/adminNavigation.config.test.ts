import { describe, expect, it } from 'vitest'
import { ADMIN_MODULE_ACCESS, ROLE_PERMISSIONS, ABONADOS_ALLOWED_ROLES } from './adminNavigation.config'
import { INTERNAL_ADMIN_ROLES, InternalAdminRoleName, ABONADO_ROLE } from '../utils/internalRoles'

describe('adminNavigation.config', () => {
  it('centraliza segmento, titulo, roles y permisos por modulo', () => {
    expect(ADMIN_MODULE_ACCESS.length).toBeGreaterThan(5)

    for (const module of ADMIN_MODULE_ACCESS) {
      expect(module.segment).toBeTruthy()
      expect(module.title.trim().length).toBeGreaterThan(0)
      expect(module.allowedRoles.length).toBeGreaterThan(0)
      expect(
        module.allowedRoles.every((role) => INTERNAL_ADMIN_ROLES.includes(role)),
      ).toBe(true)
    }
  })

  it('no duplica segmentos administrativos', () => {
    const segments = ADMIN_MODULE_ACCESS.map((module) => module.segment)
    expect(new Set(segments).size).toBe(segments.length)
  })

  it('asigna permisos de SIGASJ coherentes con cada rol interno', () => {
    for (const role of INTERNAL_ADMIN_ROLES) {
      expect(ROLE_PERMISSIONS[role].length).toBeGreaterThan(0)
    }

    expect(ROLE_PERMISSIONS.Administradora).toContain('users.manage')
    expect(ROLE_PERMISSIONS.Administradora).toContain('audit.read')
    expect(ROLE_PERMISSIONS.Secretaria).not.toContain('roles.manage')
    expect(ROLE_PERMISSIONS.Fontanero).toContain('fault_reports.read')
    expect(ROLE_PERMISSIONS.Fontanero).not.toContain('users.manage')
  })

  it('restringe usuarios, reportes y proyectos a Administradora', () => {
    const usuarios = ADMIN_MODULE_ACCESS.find((module) => module.segment === 'usuarios')
    const reportes = ADMIN_MODULE_ACCESS.find((module) => module.segment === 'reportes')
    const proyectos = ADMIN_MODULE_ACCESS.find((module) => module.segment === 'proyectos')

    expect(usuarios?.allowedRoles).toEqual(['Administradora'])
    expect(reportes?.allowedRoles).toEqual(['Administradora'])
    expect(proyectos?.allowedRoles).toEqual(['Administradora'])
    expect(proyectos?.requiredPermissions).toEqual(['projects.manage'])
  })

  it('autoriza a Administradora en Gestión de abonados (ruta y menú)', () => {
    const abonados = ADMIN_MODULE_ACCESS.find((module) => module.segment === 'abonados')

    expect(abonados?.title).toBe('Gestión de abonados')
    expect(abonados?.allowedRoles).toContain(InternalAdminRoleName.Administradora)
    expect(abonados?.availableInNav).toBe(true)
    expect(abonados?.requiredPermissions).toContain('subscribers.read')
    expect(ROLE_PERMISSIONS[InternalAdminRoleName.Administradora]).toEqual(
      expect.arrayContaining([
        'subscribers.read',
        'subscribers.create',
        'subscribers.update',
        'subscribers.deactivate',
      ]),
    )
    expect(abonados?.allowedRoles).not.toContain(ABONADO_ROLE)
    expect(abonados?.allowedRoles).not.toContain('ABONADO')
    expect(abonados?.allowedRoles).not.toContain(InternalAdminRoleName.Fontanero)
    expect(abonados?.allowedRoles).toContain(InternalAdminRoleName.Secretaria)
  })

  it('no otorga al Abonado pantallas administrativas del módulo', () => {
    const abonados = ADMIN_MODULE_ACCESS.find((module) => module.segment === 'abonados')

    expect(abonados?.allowedRoles).toEqual(ABONADOS_ALLOWED_ROLES)
    expect(ROLE_PERMISSIONS).not.toHaveProperty(ABONADO_ROLE)
  })
})
