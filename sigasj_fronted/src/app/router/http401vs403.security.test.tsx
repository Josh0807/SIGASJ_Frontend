import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAuthSession,
  consumeAuthSessionEndReason,
  isAuthenticated,
  setAuthSession,
} from '../../modules/auth/utils/authStorage'
import { fetchWithAuth } from '../../services/http/httpClient'

describe('frontend - distincion 401 vs 403', () => {
  beforeEach(() => {
    clearAuthSession()
  })

  afterEach(() => {
    clearAuthSession()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('401 finaliza la sesion y registra expiracion', async () => {
    setAuthSession({
      accessToken: 'token-vencido',
      user: { id: '1', role: 'Administradora' },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        text: async () => '',
      }),
    )

    await expect(fetchWithAuth('/usuarios')).rejects.toThrow(/HTTP 401/)
    expect(isAuthenticated()).toBe(false)
    expect(consumeAuthSessionEndReason()).toBe('expired')
  })

  it('403 informa falta de permiso sin cerrar la sesion', async () => {
    setAuthSession({
      accessToken: 'token-vigente',
      user: { id: '2', role: 'Secretaria' },
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
        text: async () => '',
      }),
    )

    await expect(fetchWithAuth('/usuarios')).rejects.toThrow(/HTTP 403/)
    expect(isAuthenticated()).toBe(true)
    expect(consumeAuthSessionEndReason()).toBeNull()
  })
})
