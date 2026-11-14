import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AUTH_LOGIN_ENDPOINT,
  AUTH_ME_ENDPOINT,
  fetchCurrentUser,
  loginWithCredentials,
} from './authApi'

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

describe('authApi.fetchCurrentUser', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.clear()
  })

  it('consulta GET /auth/me con Authorization Bearer', async () => {
    localStorage.setItem('sigasj_access_token', 'jwt-sesion')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        id: 3,
        email: 'fontanero@asadasanjuan.cr',
        role: 'FONTANERO',
        name: 'Fontanero',
      }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const me = await fetchCurrentUser()

    expect(me.role).toBe('FONTANERO')
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    expect(url).toContain(AUTH_ME_ENDPOINT)
    expect(url).toContain('/api/v1/auth/me')
    expect(options.method).toBe('GET')
    expect((options.headers as Record<string, string>).Authorization).toBe(
      'Bearer jwt-sesion',
    )
  })
})
