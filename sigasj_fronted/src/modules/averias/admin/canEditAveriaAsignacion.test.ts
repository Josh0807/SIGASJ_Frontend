import { describe, expect, it } from 'vitest'
import { InternalAdminRoleName } from '../../auth/utils/internalRoles'
import type { AuthUser } from '../../auth/types/authUser'
import { canEditAveriaAsignacion } from './canEditAveriaAsignacion'

const userWithRole = (role: string): AuthUser => ({
  id: '1',
  email: 'u@asadasanjuan.cr',
  name: 'U',
  role,
})

describe('canEditAveriaAsignacion', () => {
  it('permite Administradora y Secretaria con fault_reports.assign', () => {
    expect(
      canEditAveriaAsignacion(userWithRole(InternalAdminRoleName.Administradora)),
    ).toBe(true)
    expect(
      canEditAveriaAsignacion(userWithRole(InternalAdminRoleName.Secretaria)),
    ).toBe(true)
  })

  it('deniega Fontanero', () => {
    expect(
      canEditAveriaAsignacion(userWithRole(InternalAdminRoleName.Fontanero)),
    ).toBe(false)
  })
})
