import { afterEach, describe, expect, it } from 'vitest'
import {
  clearAccessToken,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAccessToken,
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

  it('invalida por completo la sesión persistida sin usar localStorage.clear()', () => {
    localStorage.setItem('otra-funcionalidad', 'valor-persistente')
    setAccessToken('token-demo')
    setAuthUser({
      name: 'María',
      lastName: 'Solís',
      role: 'ADMINISTRADORA',
    })

    clearAccessToken()

    expect(localStorage.getItem('sigasj_access_token')).toBeNull()
    expect(localStorage.getItem('sigasj_auth_user')).toBeNull()
    expect(localStorage.getItem('otra-funcionalidad')).toBe('valor-persistente')
    expect(getAccessToken()).toBeNull()
    expect(getAuthUser()).toBeNull()
    expect(isAuthenticated()).toBe(false)
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

  it('notifica cambios de sesión al establecer el token', () => {
    let notifications = 0
    const unsubscribe = subscribeAuthUser(() => {
      notifications += 1
    })

    setAccessToken('token-demo')
    unsubscribe()

    expect(notifications).toBe(1)
    expect(isAuthenticated()).toBe(true)
  })
})
