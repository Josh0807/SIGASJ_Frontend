import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../ApiError'
import { fetchJson } from '../http'
import { getPublicTransparencia } from './getPublicTransparencia'

vi.mock('../http', () => ({
  fetchJson: vi.fn(),
}))

const fetchJsonMock = vi.mocked(fetchJson)

describe('getPublicTransparencia', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    fetchJsonMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('devuelve publicaciones activas desde { data, total }', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [
        {
          id: 1,
          nombre: 'Informe 2025',
          descripcion: 'Resultados trimestrales',
          archivoUrl: '/uploads/transparencia/informe.pdf',
          tipo: 'pdf',
        },
      ],
      total: 1,
    })

    await expect(getPublicTransparencia()).resolves.toEqual({
      publications: [
        {
          id: '1',
          name: 'Informe 2025',
          description: 'Resultados trimestrales',
          fileUrl: '/uploads/transparencia/informe.pdf',
          fileType: 'pdf',
        },
      ],
      total: 1,
    })
  })

  it('devuelve lista vacía cuando no hay publicaciones', async () => {
    fetchJsonMock.mockResolvedValue({ data: [], total: 0 })

    await expect(getPublicTransparencia()).resolves.toEqual({
      publications: [],
      total: 0,
    })
  })

  it('descarta registros incompletos del payload', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [
        {
          id: 2,
          nombre: 'Imagen válida',
          descripcion: 'Resumen',
          archivoUrl: '/uploads/transparencia/foto.jpg',
          tipo: 'jpg',
        },
        {
          id: 3,
          nombre: 'Sin tipo',
          descripcion: 'Resumen',
          archivoUrl: '/uploads/transparencia/foto.jpg',
        },
      ],
      total: 2,
    })

    const result = await getPublicTransparencia()

    expect(result.publications).toHaveLength(1)
    expect(result.publications[0]?.id).toBe('2')
    expect(result.publications[0]?.fileType).toBe('jpg')
  })

  it('conserva el orden recibido del backend', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [
        {
          id: 1,
          nombre: 'Primera',
          descripcion: 'A',
          archivoUrl: '/uploads/transparencia/a.pdf',
          tipo: 'pdf',
        },
        {
          id: 2,
          nombre: 'Segunda',
          descripcion: 'B',
          archivoUrl: '/uploads/transparencia/b.jpg',
          tipo: 'jpg',
        },
      ],
      total: 2,
    })

    const result = await getPublicTransparencia()

    expect(result.publications.map((item) => item.name)).toEqual([
      'Primera',
      'Segunda',
    ])
  })

  it('lanza ApiError cuando la respuesta HTTP falla', async () => {
    fetchJsonMock.mockRejectedValue(new ApiError('fail', 'HTTP', 500))

    await expect(getPublicTransparencia()).rejects.toBeInstanceOf(ApiError)
  })

  it('lanza ApiError cuando el payload no es un objeto', async () => {
    fetchJsonMock.mockResolvedValue(null)

    await expect(getPublicTransparencia()).rejects.toMatchObject({
      code: 'PARSE',
    })
  })
})
