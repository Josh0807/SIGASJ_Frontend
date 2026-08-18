import { afterEach, describe, expect, it } from 'vitest'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAccessToken,
  setAuthSession,
  setAuthUser,
  subscribeAuthUser,
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
      role: 'Administradora',
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

  it('guarda sesión completa con setAuthSession', () => {
    setAuthSession({
      accessToken: 'token-demo',
      user: { role: 'Secretaria', id: '42', name: 'Ana' },
    })

    expect(getAccessToken()).toBe('token-demo')
    expect(getAuthUser()).toEqual({
      role: 'Secretaria',
      id: '42',
      name: 'Ana',
    })
  })

  it('notifica cambios del usuario autenticado a los suscriptores', () => {
    let notifications = 0
    const unsubscribe = subscribeAuthUser(() => {
      notifications += 1
    })

    setAuthUser({ name: 'Ana' })
    clearAccessToken()
    unsubscribe()

    expect(notifications).toBe(2)
  })
})
