import { describe, expect, it } from 'vitest'
import {
  formatAuthUserRole,
  getAuthUserAvatarUrl,
  getAuthUserDisplayName,
  getAuthUserHeaderAvatarUrl,
  getAuthUserHeaderName,
  getAuthUserInitials,
  getAuthUserRoleLabel,
  resolveAuthUserDisplayName,
  resolveAuthUserHeaderName,
  AUTH_USER_DISPLAY_NAME_FALLBACK,
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
    expect(formatAuthUserRole('SECRETARIA_EJECUTIVA')).toBe('Secretaria Ejecutiva')
    expect(formatAuthUserRole('FONTANERO')).toBe('Fontanero')
    expect(formatAuthUserRole('ABONADO')).toBe('Abonado')
  })

  it('combina nombre y apellido de forma segura', () => {
    expect(getAuthUserDisplayName({ name: 'Ana', lastName: 'López' })).toBe('Ana López')
    expect(getAuthUserDisplayName({ name: 'Ana' })).toBe('Ana')
    expect(getAuthUserDisplayName({ lastName: 'López' })).toBe('López')
    expect(getAuthUserDisplayName({ name: '  Ana  ', lastName: '   ' })).toBe('Ana')
    expect(getAuthUserDisplayName({ name: ' ', lastName: 'López' })).toBe('López')
  })

  it('usa fallback neutral cuando no hay nombre utilizable', () => {
    expect(resolveAuthUserDisplayName(null)).toBe(AUTH_USER_DISPLAY_NAME_FALLBACK)
    expect(resolveAuthUserDisplayName({ role: 'ADMINISTRADORA' })).toBe(
      AUTH_USER_DISPLAY_NAME_FALLBACK,
    )
  })

  it('usa correo cuando no hay nombre', () => {
    expect(getAuthUserDisplayName({ email: 'admin@sigasj.local' })).toBe(
      'admin@sigasj.local',
    )
  })

  it('tolera campos ausentes', () => {
    expect(getAuthUserDisplayName(null)).toBeUndefined()
    expect(getAuthUserDisplayName(undefined)).toBeUndefined()
    expect(getAuthUserRoleLabel({ name: 'Ana' })).toBeUndefined()
    expect(getAuthUserRoleLabel(undefined)).toBeUndefined()
    expect(getAuthUserAvatarUrl({ avatar: '   ' })).toBeUndefined()
    expect(getAuthUserInitials('')).toBe('US')
    expect(getAuthUserInitials(AUTH_USER_DISPLAY_NAME_FALLBACK)).toBe('US')
  })

  it('ignora valores técnicos inválidos en campos opcionales', () => {
    expect(getAuthUserDisplayName({ name: 'undefined', lastName: 'null' })).toBeUndefined()
    expect(getAuthUserDisplayName({ email: 'undefined' })).toBeUndefined()
    expect(getAuthUserRoleLabel({ role: 'undefined' })).toBeUndefined()
    expect(getAuthUserRoleLabel({ role: 'null' })).toBeUndefined()
    expect(getAuthUserAvatarUrl({ avatar: 'undefined' })).toBeUndefined()
    expect(resolveAuthUserDisplayName({ name: 'null', role: 'ADMINISTRADORA' })).toBe(
      AUTH_USER_DISPLAY_NAME_FALLBACK,
    )
  })

  it('acepta avatar válido', () => {
    expect(getAuthUserAvatarUrl({ avatar: '/avatar.png' })).toBe('/avatar.png')
  })

  it('limita la identidad del header a nombre y apellido', () => {
    expect(
      getAuthUserHeaderName({
        name: 'María',
        lastName: 'Solís',
        email: 'maria@sigasj.local',
        id: 'user-id-interno',
      }),
    ).toBe('María Solís')
    expect(
      resolveAuthUserHeaderName({
        email: 'admin@sigasj.local',
        id: 'user-id-interno',
      }),
    ).toBe(AUTH_USER_DISPLAY_NAME_FALLBACK)
  })

  it('bloquea avatares con indicios de credenciales en AdminHeader', () => {
    expect(getAuthUserHeaderAvatarUrl({ avatar: '/avatar.png' })).toBe('/avatar.png')
    expect(
      getAuthUserHeaderAvatarUrl({
        avatar: 'https://cdn.example.com/avatar.jpg?accessToken=secreto',
      }),
    ).toBeUndefined()
    expect(
      getAuthUserHeaderAvatarUrl({
        avatar: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.payload.signature',
      }),
    ).toBeUndefined()
    expect(getAuthUserHeaderAvatarUrl({ avatar: 'data:image/png;base64,abc' })).toBeUndefined()
  })
})
