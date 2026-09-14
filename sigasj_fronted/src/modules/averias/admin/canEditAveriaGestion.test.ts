import { describe, expect, it } from 'vitest'
import { InternalAdminRoleName } from '../../auth/utils/internalRoles'
import type { AuthUser } from '../../auth/types/authUser'
import { canEditAveriaGestion } from './canEditAveriaGestion'

const userWithRole = (role: string): AuthUser => ({
  id: '1',
  email: 'u@asadasanjuan.cr',
  name: 'U',
  role,
})

describe('canEditAveriaGestion', () => {
  it('permite Administradora y Secretaria', () => {
    expect(
      canEditAveriaGestion(userWithRole(InternalAdminRoleName.Administradora)),
    ).toBe(true)
    expect(
      canEditAveriaGestion(userWithRole(InternalAdminRoleName.Secretaria)),
    ).toBe(true)
  })

  it('deniega Fontanero aunque tenga fault_reports.update_status', () => {
    expect(
      canEditAveriaGestion(userWithRole(InternalAdminRoleName.Fontanero)),
    ).toBe(false)
  })

  it('deniega sin usuario', () => {
    expect(canEditAveriaGestion(null)).toBe(false)
  })
})
