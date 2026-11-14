import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearAuthSession,
  consumeAuthSessionEndReason,
  getAccessToken,
  getAuthUser,
  isAuthenticated,
  setAuthSession,
} from '../../modules/auth/utils/authStorage'
import { fetchWithAuth } from '../../services/http/httpClient'

const EXPIRED_TEST_JWT =
  'eyJhbGciOiJub25lIn0.eyJzdWIiOiJkZW1vIiwiZXhwIjoxfQ.invalid'

describe('seguridad - JWT vencido', () => {
  beforeEach(() => {
    clearAuthSession()
  })

  afterEach(() => {
    clearAuthSession()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('delega la validez del token al backend', () => {
    setAuthSession({
      accessToken: EXPIRED_TEST_JWT,
      user: { id: '1', role: 'Administradora' },
    })

    expect(isAuthenticated()).toBe(true)
  })

  it('un 401 del backend elimina token, usuario y acceso local', async () => {
    setAuthSession({
      accessToken: EXPIRED_TEST_JWT,
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

    expect(getAccessToken()).toBeNull()
    expect(getAuthUser()).toBeNull()
    expect(isAuthenticated()).toBe(false)
    expect(consumeAuthSessionEndReason()).toBe('expired')
  })

  it('respuestas 401 concurrentes no crean reintentos ni avisos repetidos', async () => {
    setAuthSession({
      accessToken: EXPIRED_TEST_JWT,
      user: { id: '1', role: 'Administradora' },
    })
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: async () => '',
    })
    vi.stubGlobal('fetch', fetchMock)

    const results = await Promise.allSettled([
      fetchWithAuth('/privado-a'),
      fetchWithAuth('/privado-b'),
    ])

    expect(results.every((result) => result.status === 'rejected')).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(isAuthenticated()).toBe(false)
    expect(consumeAuthSessionEndReason()).toBe('expired')
    expect(consumeAuthSessionEndReason()).toBeNull()
  })
})
