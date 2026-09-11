import { afterEach, describe, expect, it, vi } from 'vitest'
import { clearAccessToken, setAccessToken } from '../../auth/utils/authStorage'
import { PUBLIC_AVERIA_ADMIN_PAYLOAD_KEYS } from '../types/publicAveriaApi'
import { createPublicAveria, PUBLIC_AVERIAS_ENDPOINT } from './averiasApi'

const successBody = {
  message: 'Avería registrada correctamente.',
  data: {
    codigoSeguimiento: 'AV-2026-0001',
    fechaReporte: '2026-09-11T20:15:00.000Z',
    estado: 'Recibida',
  },
}

const payload = {
  nombreReportante: 'María Rodríguez',
  telefonoReportante: '8888-8888',
  ubicacion: 'Frente a la escuela',
  sectorComunidad: 'San Juan',
  descripcion: 'Fuga visible en la tubería.',
}

const jsonResponse = (status: number, body: unknown) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 201 ? 'Created' : 'Error',
    json: async () => body,
    text: async () => JSON.stringify(body),
  }) as Response

describe('createPublicAveria', () => {
  afterEach(() => {
    clearAccessToken()
    vi.unstubAllGlobals()
  })

  it('hace POST JSON a /api/v1/public/averias sin JWT ni campos administrativos', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, successBody))
    vi.stubGlobal('fetch', fetchMock)

    const result = await createPublicAveria(payload)
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit]
    const headers = options.headers as Record<string, string>
    const body = JSON.parse(String(options.body)) as Record<string, unknown>

    expect(url).toMatch(/\/api\/v1\/public\/averias$/)
    expect(url).toContain(PUBLIC_AVERIAS_ENDPOINT)
    expect(options.method).toBe('POST')
    expect(headers['Content-Type']).toBe('application/json')
    expect(headers.Authorization).toBeUndefined()
    expect(body).toEqual(payload)
    expect(String(options.body)).not.toContain('multipart')

    for (const key of PUBLIC_AVERIA_ADMIN_PAYLOAD_KEYS) {
      expect(body).not.toHaveProperty(key)
    }

    expect(result).toEqual({
      message: 'Avería registrada correctamente.',
      codigoSeguimiento: 'AV-2026-0001',
      fechaReporte: '2026-09-11T20:15:00.000Z',
      estado: 'Recibida',
    })
  })

  it('no exige token aunque exista una sesión residual', async () => {
    setAccessToken('sesion-residual')
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(201, successBody))
    vi.stubGlobal('fetch', fetchMock)

    await createPublicAveria(payload)
    const headers = fetchMock.mock.calls[0][1].headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer sesion-residual')
  })

  it('rechaza una respuesta 201 sin codigoSeguimiento', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        jsonResponse(201, { message: 'ok', data: { fechaReporte: 'x', estado: 'Recibida' } }),
      ),
    )

    await expect(createPublicAveria(payload)).rejects.toThrow('HTTP 500: Respuesta incompleta del servidor')
  })
})
