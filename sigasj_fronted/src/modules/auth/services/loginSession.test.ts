import { describe, expect, it } from 'vitest'
import {
  buildAuthSessionFromLoginResponse,
  LoginResponseSecurityError,
} from './loginSession'

describe('buildAuthSessionFromLoginResponse', () => {
  it('arma sesión con accessToken y rol normalizado del Backend', () => {
    const session = buildAuthSessionFromLoginResponse({
      accessToken: ' jwt-token ',
      user: {
        id: 7,
        email: 'admin@asadasanjuan.cr',
        role: 'ADMINISTRADORA',
        name: 'Ana',
      },
    })

    expect(session).toEqual({
      accessToken: 'jwt-token',
      user: {
        id: '7',
        email: 'admin@asadasanjuan.cr',
        role: 'Administradora',
        name: 'Ana',
      },
    })
    expect(JSON.stringify(session)).not.toContain('password')
    expect(JSON.stringify(session)).not.toContain('passwordHash')
  })

  it('normaliza SECRETARIA y FONTANERO a roles internos', () => {
    expect(
      buildAuthSessionFromLoginResponse({
        accessToken: 't1',
        user: { id: 1, email: 's@test.local', role: 'SECRETARIA', name: 'S' },
      }).user.role,
    ).toBe('Secretaria')

    expect(
      buildAuthSessionFromLoginResponse({
        accessToken: 't2',
        user: { id: 2, email: 'f@test.local', role: 'FONTANERO', name: 'F' },
      }).user.role,
    ).toBe('Fontanero')
  })

  it('rechaza respuesta sin accessToken real (no inventa token)', () => {
    expect(() =>
      buildAuthSessionFromLoginResponse({
        accessToken: '   ',
        user: { id: 1, email: 'a@test.local', role: 'ADMINISTRADORA' },
      }),
    ).toThrow()
  })

  it('rechaza passwordHash en la respuesta (BUG DE SEGURIDAD BACKEND)', () => {
    expect(() =>
      buildAuthSessionFromLoginResponse({
        accessToken: 'jwt',
        user: {
          id: 1,
          email: 'a@test.local',
          role: 'ADMINISTRADORA',
          passwordHash: '$2b$10$abc',
        } as never,
      }),
    ).toThrow(LoginResponseSecurityError)
  })
})
