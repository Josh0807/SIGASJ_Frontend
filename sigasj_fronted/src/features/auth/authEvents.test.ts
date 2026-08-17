import { describe, expect, it } from 'vitest'
import { notifyAuthChanged, subscribeToAuthChanges } from './authEvents'
import {
  clearAccessToken,
  getAuthUser,
  setAuthSession,
} from './authStorage'

describe('authEvents', () => {
  it('notifica cambios de sesión a los suscriptores', () => {
    let updates = 0
    const unsubscribe = subscribeToAuthChanges(() => {
      updates += 1
    })

    try {
      setAuthSession({
        accessToken: 'token-1',
        user: { rol: 'Secretaria', idUsuario: 2 },
      })
      expect(updates).toBe(1)
      expect(getAuthUser()?.rol).toBe('Secretaria')

      clearAccessToken()
      expect(updates).toBe(2)
      expect(getAuthUser()).toBeNull()

      notifyAuthChanged()
      expect(updates).toBe(3)
    } finally {
      unsubscribe()
      clearAccessToken()
    }
  })
})
