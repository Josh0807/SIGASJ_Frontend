import { afterEach, describe, expect, it } from 'vitest'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAccessToken,
  setAuthUser,
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

  it('guarda y recupera el usuario autenticado', () => {
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
      email: 'maria@sigasj.local',
    })

    expect(getAuthUser()).toEqual({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
      email: 'maria@sigasj.local',
    })
  })

  it('limpia token y usuario al cerrar sesión', () => {
    setAccessToken('token-demo')
    setAuthUser({ name: 'Ana' })
    clearAccessToken()

    expect(getAccessToken()).toBeNull()
    expect(getAuthUser()).toBeNull()
    expect(isAuthenticated()).toBe(false)
  })
})
