import { afterEach, describe, expect, it } from 'vitest'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAccessToken,
  setAuthSession,
} from './authStorage'

describe('authStorage', () => {
  afterEach(() => {
    clearAccessToken()
  })

  it('guarda y recupera el token', () => {
    setAccessToken('token-demo')

    expect(getAccessToken()).toBe('token-demo')
    expect(isAuthenticated()).toBe(true)
  })

  it('limpia el token al cerrar sesión', () => {
    setAccessToken('token-demo')
    clearAccessToken()

    expect(getAccessToken()).toBeNull()
    expect(getAuthUser()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })

  it('guarda token y usuario con rol interno', () => {
    setAuthSession({
      accessToken: 'token-demo',
      user: { rol: 'Secretaria', idUsuario: 42 },
    })

    expect(getAccessToken()).toBe('token-demo')
    expect(getAuthUser()).toEqual({ rol: 'Secretaria', idUsuario: 42 })
    expect(isAuthenticated()).toBe(true)
  })
})
