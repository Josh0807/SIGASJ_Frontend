import { beforeEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAccessToken } from '../../modules/auth/utils/authStorage'
import { fetchWithAuth } from './httpClient'

describe('httpClient (fetchWithAuth)', () => {
  beforeEach(() => {
    clearAccessToken()
    vi.restoreAllMocks()
  })

  it('adjunta la cabecera Authorization: Bearer <token> cuando hay un token en storage', async () => {
    setAccessToken('mi-token-secreto')

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ status: 'ok' }),
    })
    vi.stubGlobal('fetch', mockFetch)

    const data = await fetchWithAuth<{ status: string }>('/test-endpoint')

    expect(data).toEqual({ status: 'ok' })
    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers.Authorization).toBe('Bearer mi-token-secreto')
  })

  it('no adjunta la cabecera Authorization cuando no existe un token de sesión', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ public: true }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchWithAuth('/public-endpoint')

    const [, options] = mockFetch.mock.calls[0]
    expect(options.headers.Authorization).toBeUndefined()
  })

  it('lanza un error claro cuando la respuesta no es OK (HTTP status >= 400)', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => '',
    })
    vi.stubGlobal('fetch', mockFetch)

    await expect(fetchWithAuth('/error-endpoint')).rejects.toThrow(
      'HTTP 500: Internal Server Error',
    )
  })

  it('serializa activo=false en la query y no lo omite', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    })
    vi.stubGlobal('fetch', mockFetch)

    await fetchWithAuth('/v1/admin/proyectos', {
      params: { activo: false, page: 1 },
    })

    const [url] = mockFetch.mock.calls[0] as [string]
    expect(url).toContain('activo=false')
    expect(url).toContain('page=1')
  })
})
