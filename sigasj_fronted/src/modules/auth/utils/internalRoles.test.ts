import { describe, expect, it } from 'vitest'
import {
  InternalAdminRoleName,
  isInternalAdminRole,
  normalizeInternalRole,
} from './internalRoles'
import { buildAuthSessionFromLoginResponse } from '../services/loginSession'

describe('normalizeInternalRole — Super Admin', () => {
  it('acepta SuperAdmin y alias JWT SUPER_ADMIN', () => {
    expect(normalizeInternalRole('SuperAdmin')).toBe(
      InternalAdminRoleName.SuperAdmin,
    )
    expect(normalizeInternalRole('SUPER_ADMIN')).toBe(
      InternalAdminRoleName.SuperAdmin,
    )
    expect(normalizeInternalRole('super_admin')).toBe(
      InternalAdminRoleName.SuperAdmin,
    )
    expect(isInternalAdminRole('SUPER_ADMIN')).toBe(true)
  })

  it('loginSession acepta SUPER_ADMIN del backend', () => {
    const session = buildAuthSessionFromLoginResponse({
      accessToken: 'token-super',
      user: {
        id: 1,
        email: 'superadmin@asadasanjuan.cr',
        role: 'SUPER_ADMIN',
        name: 'Super Admin',
      },
    })
    expect(session.user.role).toBe('SuperAdmin')
  })
})
