import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../../../shared/api/ApiError'
import { getPublicGallery } from './getPublicGallery'

describe('getPublicGallery', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('devuelve fotografías activas ordenadas desde { data, total }', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          JSON.stringify({
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
          }),
      }),
    )

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
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify({ data: [], total: 0 }),
      }),
    )

    await expect(getPublicGallery()).resolves.toEqual({
      photos: [],
      total: 0,
    })
  })

  it('descarta registros incompletos del payload', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () =>
          JSON.stringify({
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
          }),
      }),
    )

    const result = await getPublicGallery()

    expect(result.photos).toHaveLength(1)
    expect(result.photos[0]?.id).toBe('2')
  })

  it('lanza ApiError cuando la respuesta HTTP falla', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => '',
      }),
    )

    await expect(getPublicGallery()).rejects.toBeInstanceOf(ApiError)
  })

  it('lanza ApiError cuando el payload no es un objeto', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => JSON.stringify(null),
      }),
    )

    await expect(getPublicGallery()).rejects.toMatchObject({
      code: 'PARSE',
    })
  })
})
