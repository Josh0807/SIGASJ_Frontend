import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../shared/api/ApiError'
import { requestJson } from '../../shared/api/http'
import { ROLE_PERMISSIONS } from './adminNavigation.config'

describe('contrato de autorización con Backend (11.4.5)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('propaga respuesta HTTP 403 como ApiError (rechazo del Backend)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () =>
          JSON.stringify({
            statusCode: 403,
            message: 'Forbidden resource',
          }),
      }),
    )

    await expect(
      requestJson('/api/admin/usuarios', {
        method: 'GET',
        token: 'token-fontanero',
      }),
    ).rejects.toMatchObject({
      message: 'Forbidden resource',
      code: 'HTTP',
      status: 403,
    } satisfies Partial<ApiError>)
  })

  it('Fontanero no posee permisos para operaciones de usuarios en el contrato SIGASJ', () => {
    const fontaneroPermissions = new Set(ROLE_PERMISSIONS.Fontanero)

    expect(fontaneroPermissions.has('users.manage')).toBe(false)
    expect(fontaneroPermissions.has('subscribers.read')).toBe(false)
    expect(fontaneroPermissions.has('audit.read')).toBe(false)
    expect(fontaneroPermissions.has('fault_reports.read')).toBe(true)
  })

  it('Secretaria Ejecutiva no posee permisos de auditoría ni roles', () => {
    const secretariaPermissions = new Set(ROLE_PERMISSIONS.Secretaria)

    expect(secretariaPermissions.has('audit.read')).toBe(false)
    expect(secretariaPermissions.has('roles.manage')).toBe(false)
    expect(secretariaPermissions.has('subscribers.read')).toBe(true)
    expect(secretariaPermissions.has('institutional_content.manage')).toBe(true)
  })

  it('Administradora posee permisos de administración completa', () => {
    const adminPermissions = new Set(ROLE_PERMISSIONS.Administradora)

    expect(adminPermissions.has('users.manage')).toBe(true)
    expect(adminPermissions.has('roles.manage')).toBe(true)
    expect(adminPermissions.has('audit.read')).toBe(true)
  })
})
