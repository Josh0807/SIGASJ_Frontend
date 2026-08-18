import { describe, expect, it } from 'vitest'
import {
  formatAuthUserRole,
  getAuthUserAvatarUrl,
  getAuthUserDisplayName,
  getAuthUserInitials,
  getAuthUserRoleLabel,
} from './authUserDisplay'

describe('authUserDisplay', () => {
  it('prioriza nombre completo y formatea rol', () => {
    expect(
      getAuthUserDisplayName({
        name: 'María',
        lastName: 'Solís',
        role: 'ADMINISTRADORA',
      }),
    ).toBe('María Solís')

    expect(getAuthUserRoleLabel({ role: 'ADMINISTRADORA' })).toBe('Administradora')
    expect(formatAuthUserRole('SECRETARIA')).toBe('Secretaria')
  })

  it('usa correo cuando no hay nombre', () => {
    expect(getAuthUserDisplayName({ email: 'admin@sigasj.local' })).toBe(
      'admin@sigasj.local',
    )
  })

  it('tolera campos ausentes', () => {
    expect(getAuthUserDisplayName(null)).toBeUndefined()
    expect(getAuthUserRoleLabel({ name: 'Ana' })).toBeUndefined()
    expect(getAuthUserAvatarUrl({ avatar: '   ' })).toBeUndefined()
    expect(getAuthUserInitials('')).toBe('SG')
  })

  it('acepta avatar válido', () => {
    expect(getAuthUserAvatarUrl({ avatar: '/avatar.png' })).toBe('/avatar.png')
  })
})
