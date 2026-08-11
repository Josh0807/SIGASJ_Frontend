import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/api/ApiError'
import { fetchJson } from '../../../shared/api/http'
import { getPublicGallery } from './getPublicGallery'

vi.mock('../../../shared/api/http', () => ({
  fetchJson: vi.fn(),
}))

const fetchJsonMock = vi.mocked(fetchJson)

describe('getPublicGallery', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', '')
    fetchJsonMock.mockReset()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('devuelve fotografías activas ordenadas desde { data, total }', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [
        {
          idFotografiaGaleria: 1,
          titulo: 'Primera',
          descripcion: 'Detalle',
          imagenUrl: '/uploads/galeria/1.png',
          textoAlternativo: 'Foto 1',
        },
      ],
      total: 1,
    })

    await expect(getPublicGallery()).resolves.toEqual({
      photos: [
        {
          id: '1',
          title: 'Primera',
          description: 'Detalle',
          imageUrl: '/uploads/galeria/1.png',
          altText: 'Foto 1',
        },
      ],
      total: 1,
    })
  })

  it('devuelve lista vacía cuando no hay fotografías', async () => {
    fetchJsonMock.mockResolvedValue({ data: [], total: 0 })

    await expect(getPublicGallery()).resolves.toEqual({
      photos: [],
      total: 0,
    })
  })

  it('descarta registros incompletos del payload', async () => {
    fetchJsonMock.mockResolvedValue({
      data: [
        {
          idFotografiaGaleria: 2,
          imagenUrl: '/uploads/galeria/2.png',
          textoAlternativo: 'Válida',
        },
        {
          idFotografiaGaleria: 3,
          imagenUrl: '/uploads/galeria/3.png',
        },
      ],
      total: 2,
    })

    const result = await getPublicGallery()

    expect(result.photos).toHaveLength(1)
    expect(result.photos[0]?.id).toBe('2')
  })

  it('lanza ApiError cuando la respuesta HTTP falla', async () => {
    fetchJsonMock.mockRejectedValue(new ApiError('fail', 'HTTP', 500))

    await expect(getPublicGallery()).rejects.toBeInstanceOf(ApiError)
  })

  it('lanza ApiError cuando el payload no es un objeto', async () => {
    fetchJsonMock.mockResolvedValue(null)

    await expect(getPublicGallery()).rejects.toMatchObject({
      code: 'PARSE',
    })
  })
})
