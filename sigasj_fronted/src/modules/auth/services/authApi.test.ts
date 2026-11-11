import { afterEach, describe, expect, it, vi } from 'vitest'
import { AUTH_LOGIN_ENDPOINT, loginWithCredentials } from './authApi'

describe('authApi.loginWithCredentials', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('envía POST /auth/login con body LoginDto (email + password) sin campos extra', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        accessToken: 'jwt-real',
        user: {
          id: 1,
          email: 'admin@asadasanjuan.cr',
          role: 'ADMINISTRADORA',
          name: 'Admin',
        },
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await loginWithCredentials({
      email: 'admin@asadasanjuan.cr',
      password: 'Password123!',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain(AUTH_LOGIN_ENDPOINT)
    expect(url).toContain('/api/v1/auth/login')
    expect(options.method).toBe('POST')
    expect(JSON.parse(String(options.body))).toEqual({
      email: 'admin@asadasanjuan.cr',
      password: 'Password123!',
    })
    expect(String(options.body)).not.toContain('role')
    expect(String(options.body)).not.toContain('passwordHash')
  })
})
