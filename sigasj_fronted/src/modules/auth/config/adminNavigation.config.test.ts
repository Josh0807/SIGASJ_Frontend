import { describe, expect, it } from 'vitest'
import { ADMIN_MODULE_ACCESS, ROLE_PERMISSIONS } from './adminNavigation.config'
import { INTERNAL_ADMIN_ROLES } from '../utils/internalRoles'

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

  it('restringe usuarios y reportes a Administradora', () => {
    const usuarios = ADMIN_MODULE_ACCESS.find((module) => module.segment === 'usuarios')
    const reportes = ADMIN_MODULE_ACCESS.find((module) => module.segment === 'reportes')

    expect(usuarios?.allowedRoles).toEqual(['Administradora'])
    expect(reportes?.allowedRoles).toEqual(['Administradora'])
  })
})
