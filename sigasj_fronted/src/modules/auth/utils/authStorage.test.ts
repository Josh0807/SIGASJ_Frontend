import { afterEach, describe, expect, it } from 'vitest'
import {
  clearAccessToken,
  getAccessToken,
  isAuthenticated,
  setAccessToken,
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
    expect(isAuthenticated()).toBe(false)
  })
})
